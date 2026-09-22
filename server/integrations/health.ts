import {
	ConchService,
	HealthCheck,
	ServicesHealthCheckResponse,
} from "../types";

export const healthCheck = async (
	services: ConchService[],
): Promise<ServicesHealthCheckResponse> => {
	const healthChecks = services.map((service) => service.health());
	const healthCheckResults = (await Promise.allSettled(healthChecks))
		.filter((res) => res.status === "fulfilled")
		.map((fulfilledVal) => fulfilledVal.value);

	const successfulHealthChecks: HealthCheck[] = [];
	const unsuccessfulHealthChecks: HealthCheck[] = [];

	healthCheckResults.forEach((val) =>
		val.isHealthy
			? successfulHealthChecks.push(val)
			: unsuccessfulHealthChecks.push(val),
	);

	return {
		healthy: successfulHealthChecks,
		unhealthy: unsuccessfulHealthChecks,
	};
};

export const runStartupHealthCheck = async (services: ConchService[]) => {
	const { unhealthy } = await healthCheck(services);

	if (unhealthy.length) {
		const errorMessage = unhealthy
			.map((res) => `${res.service} failed the health check: ${res.message}`)
			.join("; ");

		throw new Error(`Startup health check failed: ${errorMessage}`);
	}

	console.log("All services healthy");
};
