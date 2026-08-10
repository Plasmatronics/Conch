export type RouteAccess = "public" | "authenticated" | "admin" | "member";

export interface RouteAccessConfig {
	getAllRoute?: RouteAccess;
	getRoute?: RouteAccess;
	postRoute?: RouteAccess;
	patchRoute?: RouteAccess;
	deleteRoute?: RouteAccess;
}
