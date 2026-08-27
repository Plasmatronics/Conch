import format from "pg-format";
import { conchesIdColumnName, tableNameToIdColumnMap } from "../schemas";

type SortDirection = "ASC" | "DESC";

type CursorTuple = [string] | [string, string];

type CursorValues<T extends CursorTuple> = {
	[K in keyof T]: unknown;
};

type CursorOptions =
	| {
			keys: [string];
			values?: undefined;
			lastSeenId?: undefined;
	  }
	| {
			keys: [string];
			values: [unknown];
			lastSeenId: number;
	  }
	| {
			keys: [string, string];
			values?: undefined;
			lastSeenId?: undefined;
	  }
	| {
			keys: [string, string];
			values: [unknown, unknown];
			lastSeenId: number;
	  };

export type FilterOptions = {
	column: string;
	value: unknown;
};

type BuildQuery = {
	query: string;
	values: unknown[];
};

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export class ReadQueryBuilder {
	private filters: FilterOptions[] = [];
	private pagination: CursorOptions | null = null;

	constructor(
		private tableName: string,
		private conchId: string | null = null,
		private clampedLimit: number = DEFAULT_LIMIT,
		private sortDirection: SortDirection = "DESC",
	) {
		if (this.clampedLimit > MAX_LIMIT) this.clampedLimit = MAX_LIMIT;
		else if (this.clampedLimit <= 0) this.clampedLimit = DEFAULT_LIMIT;
	}

	paginate(options: CursorOptions) {
		if (this.pagination)
			throw new Error(`Pagination has already been configured`);
		this.pagination = options;
		return this;
	}

	filter(options: FilterOptions[]) {
		this.filters.push(...options);
		return this;
	}

	private buildCursorCondition(cursor: [string, unknown][], index = 0): string {
		const [key, value] = cursor[index];

		const operator = this.sortDirection === "ASC" ? ">" : "<";

		if (index === cursor.length - 1) {
			return format("%I %s %L", key, operator, value);
		}

		return format(
			"(%I %s %L OR (%I = %L AND %s))",
			key,
			operator,
			value,
			key,
			value,
			this.buildCursorCondition(cursor, index + 1),
		);
	}

	build(): BuildQuery {
		const queryArr: string[] = [];
		const values: unknown[] = [];
		let curPlaceholder = 1;

		queryArr.push(format(`SELECT * FROM %I`, this.tableName));

		const conditions: string[] = [];

		this.filters.forEach((filter) => {
			conditions.push(format(`%I = $${curPlaceholder++}`, filter.column));
			values.push(filter.value);
		});

		if (this.conchId !== null) {
			conditions.push(`${conchesIdColumnName} = $${curPlaceholder++}`);
			values.push(this.conchId);
		}

		const orderArr: string[] = [];
		if (this.pagination) {
			const cursorKeys = [...this.pagination.keys];
			const cursorValues = this.pagination.values
				? [...this.pagination.values]
				: undefined;

			const idKey = tableNameToIdColumnMap[this.tableName];

			if (!idKey) {
				throw new Error(
					`No ID column configured for table "${this.tableName}"`,
				);
			}

			if (!cursorKeys.includes(idKey)) {
				cursorKeys.push(idKey);

				if (cursorValues) {
					cursorValues.push(this.pagination.lastSeenId);
				}
			}

			if (cursorValues) {
				const cursor = cursorKeys.map(
					(key, index) => [key, cursorValues[index]] as [string, unknown],
				);

				conditions.push(this.buildCursorCondition(cursor));
			}

			for (const key of cursorKeys) {
				orderArr.push(format("%I %s", key, this.sortDirection));
			}
		}

		if (conditions.length) {
			queryArr.push(`WHERE ${conditions.join(" AND ")}`);
		}

		if (orderArr.length) {
			queryArr.push(`ORDER BY ${orderArr.join(", ")}`);
		}

		queryArr.push(`LIMIT ${this.clampedLimit}`);

		return { query: queryArr.join(" "), values };
	}
}
