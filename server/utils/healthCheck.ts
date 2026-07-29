import { ConchService, HealthCheck } from "../types";

export const healthCheck = async (
	services: ConchService[],
): Promise<HealthCheck[]> => {
	const healthChecks = services.map((service) => service.health());
	const healthCheckResults = (await Promise.allSettled(healthChecks))
		.filter((res) => res.status === "fulfilled")
		.map((fulfilledVal) => fulfilledVal.value);

	return healthCheckResults;
};
