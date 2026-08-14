import { Router } from "express";
import { ConchService } from "../types";
import { conductServicesHealthCheck } from "../controller";

export const createHealthRoutes = (services: ConchService[]): Router => {
	const healthRoutes = Router();

	healthRoutes.get("/", conductServicesHealthCheck(services));

	return healthRoutes;
};
