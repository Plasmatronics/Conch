import { HealthCheck } from "./index";

export interface ConchService {
	health: () => Promise<HealthCheck>;
}
