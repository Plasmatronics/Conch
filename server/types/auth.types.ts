export type RouteAccess = "public" | "authenticated" | "admin" | "member";

export interface RouteAccessConfig {
	getAll: RouteAccess;
	get: RouteAccess;
	post: RouteAccess;
	patch: RouteAccess;
	delete: RouteAccess;
}
