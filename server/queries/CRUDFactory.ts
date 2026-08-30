import { QueryConfig } from "pg";
import {
	CreateQueryBuilder,
	DeleteQueryBuilder,
	ReadQueryBuilder,
	UpdateQueryBuilder,
} from "./QueryBuilders";

interface CRUDFactoryConfig {
	tableName: string;
	idColumnName: string;
}

export class CRUDFactory {
	private tableName: string;
	private idColumnName: string;

	constructor({ tableName, idColumnName }: CRUDFactoryConfig) {
		this.tableName = tableName;
		this.idColumnName = idColumnName;
	}

	private toQueryConfig({
		query: text,
		values,
	}: {
		query: string;
		values: unknown[];
	}): QueryConfig {
		return { text: text.replace(/\s+/g, " ").trim(), values };
	}

	generateGetAll(conchId?: number): QueryConfig {
		return this.toQueryConfig(
			new ReadQueryBuilder(this.tableName, conchId ?? null).build(),
		);
	}

	generateGetOne(resourceId: number, conchId?: number): QueryConfig {
		return this.toQueryConfig(
			new ReadQueryBuilder(this.tableName, conchId ?? null)
				.addConditions([
					{ key: this.idColumnName, operator: "=", value: resourceId },
				])
				.build(),
		);
	}

	generateUpdateOne(
		valueMap: Record<string, unknown>,
		resourceId: number,
		conchId?: number,
	): QueryConfig {
		const entries = Object.entries(valueMap);
		if (!entries.length)
			throw new Error("No columns for updates were entered.");

		return this.toQueryConfig(
			new UpdateQueryBuilder(this.tableName, conchId ?? null)
				.addUpdateFields(entries.map(([key, value]) => ({ key, value })))
				.addConditions([
					{ key: this.idColumnName, operator: "=", value: resourceId },
				])
				.addReturning(["*"])
				.build(),
		);
	}

	generateDeleteOne(resourceId: number, conchId?: number): QueryConfig {
		return this.toQueryConfig(
			new DeleteQueryBuilder(this.tableName, conchId ?? null)
				.addConditions([
					{ key: this.idColumnName, operator: "=", value: resourceId },
				])
				.addReturning(["*"])
				.build(),
		);
	}

	generateCreateOne(
		valueMap: Record<string, unknown>,
		conchId?: number,
	): QueryConfig {
		const entries = Object.entries(valueMap);
		if (!entries.length && conchId === undefined)
			throw new Error("No columns for creation were entered.");

		return this.toQueryConfig(
			new CreateQueryBuilder(this.tableName, conchId ?? null)
				.addCreateFields(entries.map(([key, value]) => ({ key, value })))
				.addReturning(["*"])
				.build(),
		);
	}
}
