export class AppError extends Error {
	public statusCode: number;
	public status: "fail" | "error";
	public isOperational: boolean;

	constructor(statusCode: number, message: string) {
		super(message);

		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}
