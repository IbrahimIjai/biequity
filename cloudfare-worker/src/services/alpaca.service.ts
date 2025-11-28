import { AxiosInstance } from "axios";
import { createAlpacaAxiosInstance, AlpacaAPIError } from "../utils/axios";
import { logger } from "../utils/logger";
import type {
	CreateMarketOrderRequest,
	OrderResponse,
	AlpacaAccount,
	AlpacaPosition,
	OrderSide,
	TimeInForce,
} from "../types/alpaca.types";

/**
 * Service class for interacting with Alpaca Trading API
 */
export class AlpacaService {
	private axiosInstance: AxiosInstance;

	constructor(env: Env) {
		this.axiosInstance = createAlpacaAxiosInstance(
			env.ALPACA_API_KEY,
			env.ALPACA_SECRET_KEY,
		);
	}

	/**
	 * Get account information
	 */
	async getAccount(): Promise<AlpacaAccount> {
		try {
			const response = await this.axiosInstance.get<AlpacaAccount>("/account");
			return response.data;
		} catch (error) {
			if (error instanceof AlpacaAPIError) {
				logger.error("Failed to get account information", {
					statusCode: error.statusCode,
					message: error.message,
					code: error.code,
				});
			}
			throw error;
		}
	}

	/**
	 * Place a market order
	 * @param symbol - Stock symbol (e.g., 'AAPL')
	 * @param qty - Quantity of shares to trade
	 * @param side - 'buy' or 'sell'
	 * @param timeInForce - Time in force (default: 'day')
	 * @param extendedHours - Enable extended hours trading (default: false)
	 */
	async placeMarketOrder(
		symbol: string,
		qty: string,
		side: OrderSide,
		timeInForce: TimeInForce = "day",
		extendedHours: boolean = false,
	): Promise<OrderResponse> {
		try {
			// Validate inputs
			if (!symbol || symbol.trim() === "") {
				throw new AlpacaAPIError(
					400,
					"Symbol is required",
					null,
					"INVALID_SYMBOL",
				);
			}

			const qtyNum = parseFloat(qty);
			if (isNaN(qtyNum) || qtyNum <= 0) {
				throw new AlpacaAPIError(
					400,
					"Quantity must be a positive number",
					null,
					"INVALID_QUANTITY",
				);
			}

			if (!["buy", "sell"].includes(side)) {
				throw new AlpacaAPIError(
					400,
					'Side must be either "buy" or "sell"',
					null,
					"INVALID_SIDE",
				);
			}

			const orderRequest: CreateMarketOrderRequest = {
				symbol: symbol.trim().toUpperCase(),
				qty: qty.toString(),
				side,
				type: "market",
				time_in_force: timeInForce,
				extended_hours: extendedHours,
			};

			logger.info("Placing market order", orderRequest);

			const response = await this.axiosInstance.post<OrderResponse>(
				"/orders",
				orderRequest,
			);

			logger.info("Market order placed successfully", {
				orderId: response.data.id,
				symbol: response.data.symbol,
				qty: response.data.qty,
				side: response.data.side,
				status: response.data.status,
			});

			return response.data;
		} catch (error) {
			if (error instanceof AlpacaAPIError) {
				logger.error("Failed to place market order", {
					symbol,
					qty,
					side,
					statusCode: error.statusCode,
					message: error.message,
					code: error.code,
					data: error.data,
				});

				// Re-throw with additional context
				throw new AlpacaAPIError(
					error.statusCode,
					`Failed to place ${side} order for ${qty} shares of ${symbol}: ${error.message}`,
					error.data,
					error.code,
				);
			}

			// Handle unexpected errors
			logger.error("Unexpected error placing market order", {
				symbol,
				qty,
				side,
				error: error instanceof Error ? error.message : String(error),
			});

			throw new AlpacaAPIError(
				500,
				`Unexpected error placing order: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
				null,
				"UNEXPECTED_ERROR",
			);
		}
	}

	/**
	 * Get position for a specific symbol
	 * @param symbol - Stock symbol
	 * @returns Position data or null if no position exists
	 */
	async getPosition(symbol: string): Promise<AlpacaPosition | null> {
		try {
			const response = await this.axiosInstance.get<AlpacaPosition>(
				`/positions/${symbol.trim().toUpperCase()}`,
			);
			return response.data;
		} catch (error) {
			if (error instanceof AlpacaAPIError && error.statusCode === 404) {
				// No position exists for this symbol
				logger.info("No position found", { symbol });
				return null;
			}

			logger.error("Failed to get position", {
				symbol,
				error: error instanceof AlpacaAPIError ? error.message : String(error),
			});

			throw error;
		}
	}

	/**
	 * Get all positions
	 */
	async getAllPositions(): Promise<AlpacaPosition[]> {
		try {
			const response = await this.axiosInstance.get<AlpacaPosition[]>(
				"/positions",
			);
			return response.data;
		} catch (error) {
			logger.error("Failed to get all positions", {
				error: error instanceof AlpacaAPIError ? error.message : String(error),
			});
			throw error;
		}
	}

	/**
	 * Get order by ID
	 */
	async getOrder(orderId: string): Promise<OrderResponse> {
		try {
			const response = await this.axiosInstance.get<OrderResponse>(
				`/orders/${orderId}`,
			);
			return response.data;
		} catch (error) {
			logger.error("Failed to get order", {
				orderId,
				error: error instanceof AlpacaAPIError ? error.message : String(error),
			});
			throw error;
		}
	}

	/**
	 * Get all orders
	 */
	async getAllOrders(
		status?: "open" | "closed" | "all",
	): Promise<OrderResponse[]> {
		try {
			const params = status ? { status } : {};
			const response = await this.axiosInstance.get<OrderResponse[]>(
				"/orders",
				{
					params,
				},
			);
			return response.data;
		} catch (error) {
			logger.error("Failed to get orders", {
				status,
				error: error instanceof AlpacaAPIError ? error.message : String(error),
			});
			throw error;
		}
	}

	/**
	 * Cancel an order
	 */
	async cancelOrder(orderId: string): Promise<void> {
		try {
			await this.axiosInstance.delete(`/orders/${orderId}`);
			logger.info("Order cancelled successfully", { orderId });
		} catch (error) {
			logger.error("Failed to cancel order", {
				orderId,
				error: error instanceof AlpacaAPIError ? error.message : String(error),
			});
			throw error;
		}
	}

	/**
	 * Get active assets
	 */
	async getAssets(): Promise<any[]> {
		try {
			const response = await this.axiosInstance.get("/assets", {
				params: { status: "active" },
			});
			return response.data;
		} catch (error) {
			logger.error("Failed to get assets", {
				error: error instanceof AlpacaAPIError ? error.message : String(error),
			});
			throw error;
		}
	}
}
