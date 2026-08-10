import type { AuthenticatedUser } from "../../schemas";

declare global {
	namespace Express {
		interface Request {
			user?: AuthenticatedUser;
		}
	}
}
