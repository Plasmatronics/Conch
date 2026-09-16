import { Request, Response, NextFunction } from "express";
import { RouteAccess } from "../../types";
import { idSchema } from "../../schemas";

const unauthorized = (res: Response) => {
	return res.status(401).json({ message: "Unauthorized" });
};

const forbidden = (res: Response) => {
	return res.status(403).json({ message: "Forbidden" });
};

export const auth = (access: RouteAccess) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (access === "public") return next();

		const user = req.user;
		if (!user) return unauthorized(res);

		if (user.app_role !== "admin") {
			if (access === "admin") return forbidden(res);

			const conchId = req.params.conchId;
			const parsedConchId = idSchema.parse(conchId);
			if (access === "member" && !user.serverIds.includes(parsedConchId))
				return forbidden(res);
		}

		return next();
	};
};
