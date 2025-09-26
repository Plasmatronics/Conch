import { UserDoc } from "packages/shared";

declare global {
	namespace Express {
		interface Request {
			user?: UserDoc;
		}
	}
}
