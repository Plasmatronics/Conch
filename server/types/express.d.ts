import { IUser } from "packages/shared";

declare global {
	namespace Express {
		interface Request {
			user?: IUser;
		}
	}
}
