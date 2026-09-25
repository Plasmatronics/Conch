import {
	CreateQueryBuilder,
	DeleteQueryBuilder,
	ReadQueryBuilder,
	ReadQueryParams,
	UpdateQueryBuilder,
} from "./QueryBuilders";
import { BuildQuery } from "./QueryBuilders/QueryBuilder";

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

	generateGetAll(
		readQueryParams: ReadQueryParams,
		conchId?: number,
	): BuildQuery {
		return new ReadQueryBuilder(this.tableName, conchId ?? null)
			.applyQueryParams(readQueryParams)
			.build();
	}

	generateGetOne(resourceId: number, conchId?: number): BuildQuery {
		return new ReadQueryBuilder(this.tableName, conchId ?? null)
			.addConditions([
				{ key: this.idColumnName, operator: "=", value: resourceId },
			])
			.build();
	}

	generateUpdateOne(
		valueMap: Record<string, unknown>,
		resourceId: number,
		conchId?: number,
	): BuildQuery {
		const entries = Object.entries(valueMap);
		if (!entries.length)
			throw new Error("No columns for updates were entered.");

		return new UpdateQueryBuilder(this.tableName, conchId ?? null)
			.addUpdateFields(entries.map(([key, value]) => ({ key, value })))
			.addConditions([
				{ key: this.idColumnName, operator: "=", value: resourceId },
			])
			.addReturning(["*"])
			.build();
	}

	generateDeleteOne(resourceId: number, conchId?: number): BuildQuery {
		return new DeleteQueryBuilder(this.tableName, conchId ?? null)
			.addConditions([
				{ key: this.idColumnName, operator: "=", value: resourceId },
			])
			.addReturning(["*"])
			.build();
	}

	generateCreateOne(
		valueMap: Record<string, unknown>,
		conchId?: number,
	): BuildQuery {
		const entries = Object.entries(valueMap);
		if (!entries.length && conchId === undefined)
			throw new Error("No columns for creation were entered.");

		return new CreateQueryBuilder(this.tableName, conchId ?? null)
			.addCreateFields(entries.map(([key, value]) => ({ key, value })))
			.addReturning(["*"])
			.build();
	}
}
