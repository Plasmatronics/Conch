export type HealthCheck = {
	service: string;
	isHealthy: boolean;
	requestTime: number;
	message?: string;
};
