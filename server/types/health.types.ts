export interface HealthCheck {
	service: string;
	isHealthy: boolean;
	requestTime: number;
	message?: string;
}
