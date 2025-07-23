import { Document, Query } from "mongoose";
import { AppError } from "./AppError";

interface QueryString {
	page?: string;
	limit?: string;
	sort?: string;
	fields?: string;
	[key: string]: unknown;
}

/** Exposes paginate, sort, filter, limitFields, and limitQuantity methods on accepted query using acceped queryString. */
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
		["fields", "sort", "page", "limit"].forEach((queryParam) => {
			delete queryObj[queryParam];
		});

		//finds all comparison operators and return them in mongoose notation
		const filterJSON = JSON.stringify(queryObj).replace(
			/\b(gte|gt|lte|lt|ne)\b/g,
			(match) => `$${match}`,
		);

		try {
			const filterStr = JSON.parse(filterJSON);
			this.query = this.query.find(filterStr);
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
}
