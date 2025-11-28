import axios, {
	AxiosInstance,
	AxiosError,
	InternalAxiosRequestConfig,
} from "axios";
import { ALPACA_V2_API_URL } from "./api-config";
import { logger } from "./logger";

/**
 * Custom error class for Alpaca API errors
 */
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

/**
 * Create and configure an Axios instance for Alpaca API
 */
export function createAlpacaAxiosInstance(
	apiKey: string,
	secretKey: string,
): AxiosInstance {
	const instance = axios.create({
		baseURL: ALPACA_V2_API_URL,
		timeout: 30000, // 30 seconds
		headers: {
			accept: "application/json",
			"content-type": "application/json",
		},
	});

	// Request interceptor - Add authentication headers
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

	// Response interceptor - Handle errors consistently
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
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
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

				// Create custom error with detailed information
				const alpacaError = new AlpacaAPIError(status, message, data, code);

				// Add specific error messages for common scenarios
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
				// The request was made but no response was received
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
				// Something happened in setting up the request that triggered an Error
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
