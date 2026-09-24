import type { AuthenticatedUser } from "../../schemas";
import type { ParsedQueryParams } from "../middleware.types";

declare global {
	namespace Express {
		interface Request {
			user?: AuthenticatedUser;
		}
		interface Locals {
			parsedQueryParams?: ParsedQueryParams;
		}
	}
}
