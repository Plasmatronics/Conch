import type { Users } from "../../schemas";

declare global {
	namespace Express {
		interface Request {
			user?: Users;
		}
	}
}
