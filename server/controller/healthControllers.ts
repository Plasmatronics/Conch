import { NextFunction, Request, Response } from "express";
import { healthCheck } from "../services";
import { ConchService } from "../types";
import { AppError } from "../errors";

export const conductServicesHealthCheck =
	(services: ConchService[]) =>
	async (_req: Request, res: Response, next: NextFunction) => {
		try {
			const { unhealthy } = await healthCheck(services);

			if (unhealthy.length) {
				const errorMessage = unhealthy
					.map(
						(res) => `${res.service} failed the health check: ${res.message}`,
					)
					.join(";");
				return res.status(500).json({ message: errorMessage });
			}

			res.status(200).json({ message: "All services healthy" });
		} catch (error: unknown) {
			return next(
				new AppError(
					`${error instanceof Error ? error.message : "Unknown error has occurred."}`,
					503,
				),
			);
		}
	};
