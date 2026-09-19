import type { NextFunction, Request, Response } from "express";
import type { Pool } from "pg";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

import { normalizeSql } from "../../vitest.setup";
import {
	addRelationship,
	deleteRelationship,
	getAllRelationships,
	getRelationship,
	updateRelationship,
} from "./relationshipController";

const conchId = 7;
const relationshipId = 1;
const sourceMemberId = 11;
const targetMemberId = 22;
const outsideConchMemberId = 99;
const createdAt = "2026-01-01T00:00:00.000Z";

const relationship = {
	relationship_id: relationshipId,
	relationship_type: "friend" as const,
	created_at: createdAt,
	source_member_id: sourceMemberId,
	target_member_id: targetMemberId,
	is_current: true,
};

const parsedRelationship = {
	...relationship,
	created_at: new Date(createdAt),
};

const relationshipBody = {
	relationship_type: relationship.relationship_type,
	source_member_id: sourceMemberId,
	target_member_id: targetMemberId,
	is_current: relationship.is_current,
};

const mockPool = {
	query: vi.fn(),
};

const handlers = {
	add: addRelationship(mockPool as unknown as Pool),
	delete: deleteRelationship(mockPool as unknown as Pool),
	get: getRelationship(mockPool as unknown as Pool),
	getAll: getAllRelationships(mockPool as unknown as Pool),
	update: updateRelationship(mockPool as unknown as Pool),
};

const createRequest = (
	params: Record<string, string> = {
		conchId: conchId.toString(),
		relationshipId: relationshipId.toString(),
	},
	body: unknown = {},
) => ({ params, body }) as unknown as Request;

const createResponse = () => {
	const response = {
		status: vi.fn(),
		json: vi.fn(),
	};
	response.status.mockReturnValue(response);
	response.json.mockReturnValue(response);

	return response as unknown as Response;
};

const createNext = () => vi.fn() as unknown as NextFunction;

beforeEach(() => {
	mockPool.query.mockReset();
});

describe("getAllRelationships", () => {
	test("returns relationships whose members belong to the requested conch", async () => {
		mockPool.query.mockResolvedValueOnce({
			rows: [relationship],
			rowCount: 1,
		});
		const response = createResponse();

		await handlers.getAll(createRequest(), response, createNext());

		const [query, values] = mockPool.query.mock.calls[0];
		expect(normalizeSql(query)).toBe(
			normalizeSql(`
				SELECT r.*
				FROM relationships AS r
				JOIN members AS sm
					ON sm.member_id = r.source_member_id
				JOIN members AS tm
					ON tm.member_id = r.target_member_id
				WHERE sm.conch_id = $1
					AND tm.conch_id = $1;
			`),
		);
		expect(values).toEqual([conchId]);
		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.json).toHaveBeenCalledWith([parsedRelationship]);
	});

	test("excludes relationships whose members belong to another conch", async () => {
		mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
		const response = createResponse();

		await handlers.getAll(createRequest(), response, createNext());

		const [query, values] = mockPool.query.mock.calls[0];
		expect(normalizeSql(query)).toContain(
			"WHERE sm.conch_id = $1 AND tm.conch_id = $1",
		);
		expect(values).toEqual([conchId]);
		expect(response.json).toHaveBeenCalledWith([]);
	});

	test("does not query when the conch ID is invalid", async () => {
		const next = createNext();

		await handlers.getAll(
			createRequest({ conchId: "invalid" }),
			createResponse(),
			next,
		);

		expect(mockPool.query).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalledWith(expect.any(z.ZodError));
	});

	test("forwards database errors", async () => {
		const error = new Error("relationship query failed");
		mockPool.query.mockRejectedValueOnce(error);
		const next = createNext();

		await handlers.getAll(createRequest(), createResponse(), next);

		expect(next).toHaveBeenCalledWith(error);
	});
});

describe("getRelationship", () => {
	test("returns a relationship whose members belong to the requested conch", async () => {
		mockPool.query.mockResolvedValueOnce({
			rows: [relationship],
			rowCount: 1,
		});
		const response = createResponse();

		await handlers.get(createRequest(), response, createNext());

		const [query, values] = mockPool.query.mock.calls[0];
		expect(normalizeSql(query)).toBe(
			normalizeSql(`
				SELECT r.* FROM relationships AS r
				JOIN members AS SM
					ON SM.member_id = r.source_member_id
				JOIN members AS TM
					ON TM.member_id = r.target_member_id
				WHERE r.relationship_id = $1 AND
					TM.conch_id = $2 AND SM.conch_id = $2
			`),
		);
		expect(values).toEqual([relationshipId, conchId]);
		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.json).toHaveBeenCalledWith(parsedRelationship);
	});

	test("forwards a not-found error when the relationship is outside the conch", async () => {
		mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
		const next = createNext();

		await handlers.get(createRequest(), createResponse(), next);

		const [query, values] = mockPool.query.mock.calls[0];
		expect(normalizeSql(query)).toContain(
			"WHERE r.relationship_id = $1 AND TM.conch_id = $2 AND SM.conch_id = $2",
		);
		expect(values).toEqual([relationshipId, conchId]);
		expect(next).toHaveBeenCalledWith(
			expect.objectContaining({
				message: `Relationship ${relationshipId} does not exist in this conch.`,
				statusCode: 404,
			}),
		);
	});

	test("does not query when the relationship ID is invalid", async () => {
		const next = createNext();

		await handlers.get(
			createRequest({
				conchId: conchId.toString(),
				relationshipId: "invalid",
			}),
			createResponse(),
			next,
		);

		expect(mockPool.query).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalledWith(expect.any(z.ZodError));
	});

	test("forwards database errors", async () => {
		const error = new Error("relationship lookup failed");
		mockPool.query.mockRejectedValueOnce(error);
		const next = createNext();

		await handlers.get(createRequest(), createResponse(), next);

		expect(next).toHaveBeenCalledWith(error);
	});
});

describe("addRelationship", () => {
	test("atomically creates a relationship when both members belong to the conch", async () => {
		mockPool.query.mockResolvedValueOnce({
			rows: [relationship],
			rowCount: 1,
		});
		const response = createResponse();

		await handlers.add(
			createRequest({ conchId: conchId.toString() }, relationshipBody),
			response,
			createNext(),
		);

		const [query, values] = mockPool.query.mock.calls[0];
		expect(normalizeSql(query)).toBe(
			normalizeSql(`
				INSERT INTO relationships (
					relationship_type,
					source_member_id,
					target_member_id,
					is_current
				)
				SELECT
					$1,
					source.member_id,
					target.member_id,
					$4
				FROM members AS source
				JOIN members AS target
					ON target.member_id = $3
					AND target.conch_id = $5
				WHERE source.member_id = $2
					AND source.conch_id = $5
				RETURNING *
			`),
		);
		expect(values).toEqual([
			relationship.relationship_type,
			sourceMemberId,
			targetMemberId,
			true,
			conchId,
		]);
		expect(mockPool.query).toHaveBeenCalledOnce();
		expect(response.status).toHaveBeenCalledWith(201);
		expect(response.json).toHaveBeenCalledWith(parsedRelationship);
	});

	test("defaults new relationships to current", async () => {
		mockPool.query.mockResolvedValueOnce({
			rows: [relationship],
			rowCount: 1,
		});
		const bodyWithoutCurrent = {
			relationship_type: relationshipBody.relationship_type,
			source_member_id: relationshipBody.source_member_id,
			target_member_id: relationshipBody.target_member_id,
		};

		await handlers.add(
			createRequest({ conchId: conchId.toString() }, bodyWithoutCurrent),
			createResponse(),
			createNext(),
		);

		expect(mockPool.query.mock.calls[0][1][3]).toBe(true);
	});

	test("rejects creation when a referenced member belongs to another conch", async () => {
		mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
		const next = createNext();
		const bodyWithOutsideMember = {
			...relationshipBody,
			target_member_id: outsideConchMemberId,
		};

		await handlers.add(
			createRequest({ conchId: conchId.toString() }, bodyWithOutsideMember),
			createResponse(),
			next,
		);

		const [query, values] = mockPool.query.mock.calls[0];
		expect(normalizeSql(query)).toContain(
			"ON target.member_id = $3 AND target.conch_id = $5 WHERE source.member_id = $2 AND source.conch_id = $5",
		);
		expect(values).toEqual([
			relationship.relationship_type,
			sourceMemberId,
			outsideConchMemberId,
			true,
			conchId,
		]);
		expect(next).toHaveBeenCalledWith(
			expect.objectContaining({
				message:
					"Source and target members of this relationship are not both a part of this conch.",
				statusCode: 400,
			}),
		);
	});

	test("does not query when the request body is invalid", async () => {
		const next = createNext();

		await handlers.add(
			createRequest(
				{ conchId: conchId.toString() },
				{ ...relationshipBody, source_member_id: "invalid" },
			),
			createResponse(),
			next,
		);

		expect(mockPool.query).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalledWith(expect.any(z.ZodError));
	});

	test("forwards database errors", async () => {
		const error = new Error("relationship creation failed");
		mockPool.query.mockRejectedValueOnce(error);
		const next = createNext();

		await handlers.add(
			createRequest({ conchId: conchId.toString() }, relationshipBody),
			createResponse(),
			next,
		);

		expect(next).toHaveBeenCalledWith(error);
	});
});

describe("deleteRelationship", () => {
	test("deletes a relationship only when both members belong to the conch", async () => {
		mockPool.query.mockResolvedValueOnce({
			rows: [relationship],
			rowCount: 1,
		});
		const response = createResponse();

		await handlers.delete(createRequest(), response, createNext());

		const [query, values] = mockPool.query.mock.calls[0];
		expect(normalizeSql(query)).toBe(
			normalizeSql(`
				DELETE FROM relationships AS r
				USING members AS sm, members AS tm
				WHERE r.source_member_id = sm.member_id
					AND sm.conch_id = $1
					AND r.target_member_id = tm.member_id
					AND tm.conch_id = $1
					AND r.relationship_id = $2
				RETURNING r.*
			`),
		);
		expect(values).toEqual([conchId, relationshipId]);
		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.json).toHaveBeenCalledWith(parsedRelationship);
	});

	test("rejects deletion when the relationship belongs to another conch", async () => {
		mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
		const next = createNext();

		await handlers.delete(createRequest(), createResponse(), next);

		const [query, values] = mockPool.query.mock.calls[0];
		expect(normalizeSql(query)).toContain(
			"AND sm.conch_id = $1 AND r.target_member_id = tm.member_id AND tm.conch_id = $1",
		);
		expect(values).toEqual([conchId, relationshipId]);
		expect(next).toHaveBeenCalledWith(
			expect.objectContaining({
				message: `Resource with ID ${relationshipId} not found.`,
				statusCode: 404,
			}),
		);
	});

	test("does not query when the relationship ID is invalid", async () => {
		const next = createNext();

		await handlers.delete(
			createRequest({
				conchId: conchId.toString(),
				relationshipId: "invalid",
			}),
			createResponse(),
			next,
		);

		expect(mockPool.query).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalledWith(expect.any(z.ZodError));
	});

	test("forwards database errors", async () => {
		const error = new Error("relationship deletion failed");
		mockPool.query.mockRejectedValueOnce(error);
		const next = createNext();

		await handlers.delete(createRequest(), createResponse(), next);

		expect(next).toHaveBeenCalledWith(error);
	});
});

describe("updateRelationship", () => {
	test("updates member IDs after validating old and replacement members against the conch", async () => {
		const updatedRelationship = {
			...relationship,
			source_member_id: 33,
			target_member_id: 44,
		};
		mockPool.query.mockResolvedValueOnce({
			rows: [updatedRelationship],
			rowCount: 1,
		});
		const response = createResponse();

		await handlers.update(
			createRequest(undefined, {
				source_member_id: updatedRelationship.source_member_id,
				target_member_id: updatedRelationship.target_member_id,
			}),
			response,
			createNext(),
		);

		const [query, values] = mockPool.query.mock.calls[0];
		expect(normalizeSql(query)).toBe(
			normalizeSql(`
				UPDATE relationships AS r
				SET (source_member_id, target_member_id) = ($1, $2)
				FROM members AS OLD_SM, members AS OLD_TM
				WHERE r.relationship_id = $3 AND
					OLD_SM.conch_id = $6 AND
					OLD_SM.member_id = r.source_member_id AND
					OLD_TM.member_id = r.target_member_id AND
					OLD_TM.conch_id = $6
				AND ($4::integer IS NULL OR $4 IN (
					SELECT SM.member_id FROM members AS SM
					WHERE SM.conch_id = $6
				))
				AND ($5::integer IS NULL OR $5 IN (
					SELECT TM.member_id FROM members AS TM
					WHERE TM.conch_id = $6
				))
				RETURNING r.*
			`),
		);
		expect(values).toEqual([33, 44, relationshipId, 33, 44, conchId]);
		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.json).toHaveBeenCalledWith({
			...updatedRelationship,
			created_at: new Date(createdAt),
		});
	});

	test("uses null member predicates when no member IDs are updated", async () => {
		mockPool.query.mockResolvedValueOnce({
			rows: [{ ...relationship, is_current: false }],
			rowCount: 1,
		});

		await handlers.update(
			createRequest(undefined, { is_current: false }),
			createResponse(),
			createNext(),
		);

		const [query, values] = mockPool.query.mock.calls[0];
		expect(normalizeSql(query)).toContain(
			"SET (is_current) = ($1) FROM members AS OLD_SM, members AS OLD_TM WHERE r.relationship_id = $2",
		);
		expect(values).toEqual([false, relationshipId, null, null, conchId]);
	});

	test("rejects an update when the relationship belongs to another conch", async () => {
		mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
		const next = createNext();

		await handlers.update(
			createRequest(undefined, { is_current: false }),
			createResponse(),
			next,
		);

		const [query, values] = mockPool.query.mock.calls[0];
		expect(normalizeSql(query)).toContain(
			"OLD_SM.conch_id = $5 AND OLD_SM.member_id = r.source_member_id AND OLD_TM.member_id = r.target_member_id AND OLD_TM.conch_id = $5",
		);
		expect(values).toEqual([false, relationshipId, null, null, conchId]);
		expect(next).toHaveBeenCalledWith(
			expect.objectContaining({
				message: `Resource with ID ${relationshipId} not found, or an illegal update was attempted`,
				statusCode: 404,
			}),
		);
	});

	test("rejects an update that references a member from another conch", async () => {
		mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
		const next = createNext();

		await handlers.update(
			createRequest(undefined, {
				source_member_id: outsideConchMemberId,
			}),
			createResponse(),
			next,
		);

		const [query, values] = mockPool.query.mock.calls[0];
		expect(normalizeSql(query)).toContain(
			"$3 IN (SELECT SM.member_id FROM members AS SM WHERE SM.conch_id = $5)",
		);
		expect(values).toEqual([
			outsideConchMemberId,
			relationshipId,
			outsideConchMemberId,
			null,
			conchId,
		]);
		expect(next).toHaveBeenCalledWith(
			expect.objectContaining({
				message: `Resource with ID ${relationshipId} not found, or an illegal update was attempted`,
				statusCode: 404,
			}),
		);
	});

	test("does not query when the update body is empty", async () => {
		const next = createNext();

		await handlers.update(createRequest(), createResponse(), next);

		expect(mockPool.query).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalledWith(expect.any(z.ZodError));
	});

	test("forwards database errors", async () => {
		const error = new Error("relationship update failed");
		mockPool.query.mockRejectedValueOnce(error);
		const next = createNext();

		await handlers.update(
			createRequest(undefined, { is_current: false }),
			createResponse(),
			next,
		);

		expect(next).toHaveBeenCalledWith(error);
	});
});
