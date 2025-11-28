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
	AlpacaAsset,
	GetAssetsParams,
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
	 * Get account information including balance, buying power, and account status
	 * @returns Complete account information from Alpaca API
	 */
	async getAccount(): Promise<AlpacaAccount> {
		try {
			logger.info("Fetching account information");

			const response = await this.axiosInstance.get<AlpacaAccount>("/account");

			logger.info("Account information retrieved successfully", {
				accountNumber: response.data.account_number,
				status: response.data.status,
				cryptoStatus: response.data.crypto_status,
				buyingPower: response.data.buying_power,
				cash: response.data.cash,
				portfolioValue: response.data.portfolio_value,
				equity: response.data.equity,
				tradingBlocked: response.data.trading_blocked,
				patternDayTrader: response.data.pattern_day_trader,
			});

			return response.data;
		} catch (error) {
			if (error instanceof AlpacaAPIError) {
				logger.error("Failed to get account information", {
					statusCode: error.statusCode,
					message: error.message,
					code: error.code,
					data: error.data,
				});

				// Provide more context for common errors
				if (error.statusCode === 401 || error.statusCode === 403) {
					throw new AlpacaAPIError(
						error.statusCode,
						"Authentication failed. Please check your API credentials.",
						error.data,
						"AUTH_FAILED",
					);
				}
			} else {
				logger.error("Unexpected error fetching account information", {
					error: error instanceof Error ? error.message : String(error),
				});
			}

			throw error;
		}
	}

	/**
	 * Check if account is ready for trading
	 * @returns Object indicating if account can trade and any blocking reasons
	 */
	async checkTradingEligibility(): Promise<{
		canTrade: boolean;
		reasons: string[];
		account: AlpacaAccount;
	}> {
		const account = await this.getAccount();
		const reasons: string[] = [];

		if (account.status !== "ACTIVE") {
			reasons.push(`Account status is ${account.status}, not ACTIVE`);
		}

		if (account.trading_blocked) {
			reasons.push("Trading is blocked on this account");
		}

		if (account.account_blocked) {
			reasons.push("Account is blocked");
		}

		if (parseFloat(account.buying_power) <= 0) {
			reasons.push("Insufficient buying power");
		}

		const canTrade = reasons.length === 0;

		logger.info("Trading eligibility check", {
			canTrade,
			reasons,
			buyingPower: account.buying_power,
			status: account.status,
		});

		return {
			canTrade,
			reasons,
			account,
		};
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
	 * Get assets list with optional filtering
	 * @param params - Optional query parameters to filter assets
	 * @returns Array of assets matching the filter criteria
	 */
	async getAssets(params?: GetAssetsParams): Promise<AlpacaAsset[]> {
		try {
			const queryParams: Record<string, string> = {};

			// Add status filter (default: active)
			if (params?.status) {
				queryParams.status = params.status;
			}

			// Add asset_class filter (default: us_equity)
			if (params?.asset_class) {
				queryParams.asset_class = params.asset_class;
			}

			// Add exchange filter
			if (params?.exchange) {
				queryParams.exchange = params.exchange;
			}

			// Add attributes filter (comma-separated)
			if (params?.attributes && params.attributes.length > 0) {
				queryParams.attributes = params.attributes.join(",");
			}

			logger.info("Fetching assets", queryParams);

			const response = await this.axiosInstance.get<AlpacaAsset[]>("/assets", {
				params: queryParams,
			});

			logger.info("Assets retrieved successfully", {
				count: response.data.length,
				filters: queryParams,
			});

			return response.data;
		} catch (error) {
			logger.error("Failed to get assets", {
				params,
				error: error instanceof AlpacaAPIError ? error.message : String(error),
			});
			throw error;
		}
	}

	/**
	 * Get a specific asset by symbol
	 * @param symbol - The asset symbol to retrieve
	 * @returns Asset information for the specified symbol
	 */
	async getAsset(symbol: string): Promise<AlpacaAsset> {
		try {
			logger.info("Fetching asset by symbol", { symbol });

			const response = await this.axiosInstance.get<AlpacaAsset>(
				`/assets/${symbol.trim().toUpperCase()}`,
			);

			logger.info("Asset retrieved successfully", {
				symbol: response.data.symbol,
				name: response.data.name,
				tradable: response.data.tradable,
				status: response.data.status,
			});

			return response.data;
		} catch (error) {
			if (error instanceof AlpacaAPIError && error.statusCode === 404) {
				logger.error("Asset not found", { symbol });
				throw new AlpacaAPIError(
					404,
					`Asset with symbol '${symbol}' not found`,
					null,
					"ASSET_NOT_FOUND",
				);
			}

			logger.error("Failed to get asset", {
				symbol,
				error: error instanceof AlpacaAPIError ? error.message : String(error),
			});
			throw error;
		}
	}

	/**
	 * Get only tradable assets
	 * Convenience method to filter for assets that can be traded
	 */
	async getTradableAssets(
		params?: Omit<GetAssetsParams, "status">,
	): Promise<AlpacaAsset[]> {
		const assets = await this.getAssets({ ...params, status: "active" });
		return assets.filter((asset) => asset.tradable);
	}
}
