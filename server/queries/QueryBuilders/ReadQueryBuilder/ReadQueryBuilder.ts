import { BuildQuery, QueryBuilder } from "../QueryBuilder";
import { SortDirection } from "../../../types";
import {
	CursorOptions,
	ExistsCondition,
	Join,
	JoinCondition,
	ReadCondition,
	ReadQueryParams,
	SelectField,
	SetCondition,
} from "./ReadQueryBuilder.types";
import { compileReadQuery } from "./queryCompiler";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export class ReadQueryBuilder extends QueryBuilder {
	private conditions: ReadCondition[] = [];
	private correlationConditions: JoinCondition[] = [];
	private existsConditions: ExistsCondition[] = [];
	private inConditions: SetCondition[] = [];
	private anyConditions: SetCondition[] = [];
	private selectFields: SelectField[] = [];
	private joins: Join[] = [];
	private tableAlias: string | null = null;
	private pagination: CursorOptions | null = null;
	private limit: number | null = null;
	private sortDirection: SortDirection = "DESC";

	constructor(tableName: string, conchId: string | null | number = null) {
		super(tableName, conchId);
	}

	applyQueryParams(queryParams: ReadQueryParams) {
		const { filters, fields, pagination, limit, sortDir } = queryParams;

		if (fields.length) this.addSelectFields([...fields]);
		if (filters.length) this.addConditions([...filters]);
		if (pagination.keys.length) this.paginate(pagination, sortDir);
		this.addLimit(limit);

		return this;
	}

	addAlias(alias: string) {
		if (this.tableAlias)
			throw new Error("A table alias has already been configured");
		this.tableAlias = alias;
		return this;
	}

	addSelectFields(fields: SelectField[]) {
		this.selectFields.push(...fields);
		return this;
	}

	addJoin(join: Join) {
		if (!join.on.length)
			throw new Error("A join must include at least one condition");
		this.joins.push(join);
		return this;
	}

	paginate(options: CursorOptions, sortDir: SortDirection) {
		if (this.pagination)
			throw new Error("Pagination has already been configured");
		this.pagination = options;
		this.sortDirection = sortDir;
		return this;
	}

	addConditions(options: ReadCondition[]) {
		this.conditions.push(...options);
		return this;
	}

	addExistsConditions(conditions: ExistsCondition[]) {
		this.existsConditions.push(...conditions);
		return this;
	}

	addInConditions(conditions: SetCondition[]) {
		this.inConditions.push(...conditions);
		return this;
	}

	addAnyConditions(conditions: SetCondition[]) {
		this.anyConditions.push(...conditions);
		return this;
	}

	addLimit(limitAmt: number = DEFAULT_LIMIT) {
		if (limitAmt > MAX_LIMIT) this.limit = MAX_LIMIT;
		else if (limitAmt <= 0) this.limit = DEFAULT_LIMIT;
		else this.limit = limitAmt;
		return this;
	}

	build(valueOffset = 0): BuildQuery {
		return compileReadQuery(
			{
				tableName: this.tableName,
				conchId: this.conchId,
				conditions: this.conditions,
				correlationConditions: this.correlationConditions,
				existsConditions: this.existsConditions,
				inConditions: this.inConditions,
				anyConditions: this.anyConditions,
				selectFields: this.selectFields,
				joins: this.joins,
				tableAlias: this.tableAlias,
				pagination: this.pagination,
				limit: this.limit,
				sortDirection: this.sortDirection,
			},
			valueOffset,
		);
	}
}
