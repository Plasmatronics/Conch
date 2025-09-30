import { Document, Query } from "mongoose";
import { AppError } from "./AppError";

interface QueryString {
	page?: string;
	limit?: string;
	sort?: string;
	fields?: string;
	[key: string]: unknown;
}
/**
 * QueryBuilder supports chaining exposed methods, including pagination, sorting, filtering,
 * field-limiting, and quantity-limiting.
 */
export class QueryBuilder<T extends Document> {
	public query: Query<T[], T>;
	public queryString: QueryString;

	constructor(query: Query<T[], T>, queryString: QueryString) {
		this.query = query;
		this.queryString = queryString;
	}

	private formatQueryParameters(queryParameter: string) {
		return queryParameter.split(",").join(" ");
	}

	public paginate() {
		const page = Number(this.queryString.page) || 1;
		const limit = Number(this.queryString.limit) || 10;

		this.query = this.query.skip((page - 1) * limit).limit(limit);

		return this;
	}

	public sort() {
		if (this.queryString.sort) {
			const sortedFields = this.formatQueryParameters(this.queryString.sort);
			this.query = this.query.sort(sortedFields);
		}
		return this;
	}

	public filter() {
		const queryObj = { ...this.queryString };
		["fields", "sort", "page", "limit", "include", "count"].forEach(
			(queryParam) => {
				delete queryObj[queryParam];
			},
		);

		const mongoFilter: Record<string, any> = {};

		for (const key in queryObj) {
			const match = key.match(/^(.+)\[(gte|gt|lte|lt|ne)\]$/);

			if (match) {
				const field = match[1];
				const operator = `$${match[2]}`;

				if (!mongoFilter[field]) {
					mongoFilter[field] = {};
				}

				mongoFilter[field][operator] = queryObj[key];
			} else {
				mongoFilter[key] = queryObj[key];
			}
		}
		try {
			this.query = this.query.find(mongoFilter);
		} catch (err) {
			throw new AppError(400, "Invalid filter format in query string.");
		}

		return this;
	}

	public limitFields() {
		if (this.queryString.fields) {
			const includedFields = this.formatQueryParameters(
				this.queryString.fields,
			);
			this.query = this.query.select(includedFields);
		}
		return this;
	}

	public populate() {
		if (this.queryString.include) {
			this.query = this.query.populate(`${this.queryString.include}`);
		}
		return this;
	}
}
