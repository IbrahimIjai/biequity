import axios, {
	AxiosInstance,
	AxiosError,
	InternalAxiosRequestConfig,
} from "axios";
import { ALPACA_V2_API_URL } from "./api-config";
import { logger } from "./logger";

export class AlpacaAPIError extends Error {
	constructor(
		public statusCode: number,
		public message: string,
		public data?: any,
		public code?: string,
	) {
		super(message);
		this.name = "AlpacaAPIError";
	}
}

export function createAlpacaAxiosInstance(
	apiKey: string,
	secretKey: string,
): AxiosInstance {
	const instance = axios.create({
		baseURL: ALPACA_V2_API_URL,
		timeout: 30000,
		headers: {
			accept: "application/json",
			"content-type": "application/json",
		},
	});

	instance.interceptors.request.use(
		(config: InternalAxiosRequestConfig) => {
			config.headers["APCA-API-KEY-ID"] = apiKey;
			config.headers["APCA-API-SECRET-KEY"] = secretKey;

			logger.info("Alpaca API Request", {
				method: config.method?.toUpperCase(),
				url: config.url,
				data: config.data,
			});

			return config;
		},
		(error) => {
			logger.error("Request interceptor error", error);
			return Promise.reject(error);
		},
	);

	instance.interceptors.response.use(
		(response) => {
			logger.info("Alpaca API Response", {
				status: response.status,
				url: response.config.url,
				data: response.data,
			});
			return response;
		},
		(error: AxiosError) => {
			if (error.response) {
				const status = error.response.status;
				const data = error.response.data as any;

				let message = "Unknown error occurred";
				let code = "UNKNOWN_ERROR";

				if (data) {
					if (typeof data === "string") {
						message = data;
					} else if (data.message) {
						message = data.message;
					} else if (data.error) {
						message = data.error;
					}
					code = data.code || code;
				}

				logger.error("Alpaca API Error Response", {
					status,
					message,
					code,
					url: error.config?.url,
					data: error.response.data,
				});

				const alpacaError = new AlpacaAPIError(status, message, data, code);

				if (status === 403) {
					alpacaError.message = `Forbidden: ${message}. This may be due to insufficient buying power or account restrictions.`;
				} else if (status === 422) {
					alpacaError.message = `Invalid request: ${message}. Please check your order parameters.`;
				} else if (status === 404) {
					alpacaError.message = `Not found: ${message}`;
				} else if (status === 429) {
					alpacaError.message = `Rate limit exceeded: ${message}. Please try again later.`;
				} else if (status >= 500) {
					alpacaError.message = `Server error: ${message}. Please try again later.`;
				}

				return Promise.reject(alpacaError);
			} else if (error.request) {
				logger.error("No response received from Alpaca API", {
					url: error.config?.url,
					error: error.message,
				});

				return Promise.reject(
					new AlpacaAPIError(
						0,
						"No response received from Alpaca API. Please check your network connection.",
						null,
						"NO_RESPONSE",
					),
				);
			} else {
				logger.error("Error setting up Alpaca API request", {
					error: error.message,
				});

				return Promise.reject(
					new AlpacaAPIError(
						0,
						`Request setup error: ${error.message}`,
						null,
						"REQUEST_SETUP_ERROR",
					),
				);
			}
		},
	);

	return instance;
}
