import { Request, Response, NextFunction } from "express";
import { ConchFamilyCache } from "../cache";
import { idSchema } from "../schemas";

export const buildCacheEntry =
	(cache: ConchFamilyCache) =>
	async (req: Request, _res: Response, next: NextFunction) => {
		try {
			const conchId = req.params.conchId;
			const parsedConchId = idSchema.parse(conchId);

			await cache.rebuildCacheEntry(parsedConchId);

			return next();
		} catch (err: unknown) {
			next(err);
		}
	};
