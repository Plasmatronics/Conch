export type HealthCheck = {
	service: string;
	isHealthy: boolean;
	requestTime: number;
	message?: string;
};

export interface ServicesHealthCheckResponse {
	healthy: HealthCheck[];
	unhealthy: HealthCheck[];
}
