export class AppError extends Error {
	statusCode: number;

	constructor(
		message: string,
		statusCode: number,
		errorOptions?: ErrorOptions,
	) {
		super(message, errorOptions);
		this.statusCode = statusCode;
	}
}
