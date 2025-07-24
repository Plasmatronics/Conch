import { IUser } from "../src/models";

declare global {
	namespace Express {
		interface Request {
			user?: IUser;
		}
	}
}
