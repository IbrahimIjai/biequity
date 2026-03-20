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
	AccountActivity,
	TradeActivity,
	NonTradeActivity,
	GetActivitiesParams,
} from "../types/alpaca.types";

export class AlpacaService {
	private axiosInstance: AxiosInstance;

	constructor(env: Env) {
		this.axiosInstance = createAlpacaAxiosInstance(
			env.ALPACA_API_KEY,
			env.ALPACA_SECRET,
		);
	}

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

	async placeMarketOrder(
		symbol: string,
		qty: string,
		side: OrderSide,
		timeInForce: TimeInForce = "day",
		extendedHours: boolean = false,
	): Promise<OrderResponse> {
		try {
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

				throw new AlpacaAPIError(
					error.statusCode,
					`Failed to place ${side} order for ${qty} shares of ${symbol}: ${error.message}`,
					error.data,
					error.code,
				);
			}

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

	async getPosition(symbol: string): Promise<AlpacaPosition | null> {
		try {
			const response = await this.axiosInstance.get<AlpacaPosition>(
				`/positions/${symbol.trim().toUpperCase()}`,
			);
			return response.data;
		} catch (error) {
			if (error instanceof AlpacaAPIError && error.statusCode === 404) {
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

	async getAssets(params?: GetAssetsParams): Promise<AlpacaAsset[]> {
		try {
			const queryParams: Record<string, string> = {};

			if (params?.status) {
				queryParams.status = params.status;
			}

			if (params?.asset_class) {
				queryParams.asset_class = params.asset_class;
			}

			if (params?.exchange) {
				queryParams.exchange = params.exchange;
			}

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

	async getAccountActivities(
		params?: GetActivitiesParams,
	): Promise<AccountActivity[]> {
		try {
			const queryParams: Record<string, string> = {};

			if (params?.activity_types && params.activity_types.length > 0) {
				queryParams.activity_types = params.activity_types.join(",");
			}

			if (params?.category && !params?.activity_types) {
				queryParams.category = params.category;
			}

			if (params?.date) {
				queryParams.date = params.date;
			}

			if (params?.until) {
				queryParams.until = params.until;
			}

			if (params?.after) {
				queryParams.after = params.after;
			}

			if (params?.direction) {
				queryParams.direction = params.direction;
			}

			if (params?.page_size) {
				queryParams.page_size = params.page_size.toString();
			}

			if (params?.page_token) {
				queryParams.page_token = params.page_token;
			}

			logger.info("Fetching account activities", queryParams);

			const response = await this.axiosInstance.get<AccountActivity[]>(
				"/account/activities",
				{
					params: queryParams,
				},
			);

			logger.info("Account activities retrieved successfully", {
				count: response.data.length,
				filters: queryParams,
			});

			return response.data;
		} catch (error) {
			logger.error("Failed to get account activities", {
				params,
				error: error instanceof AlpacaAPIError ? error.message : String(error),
			});
			throw error;
		}
	}

	async getTradeActivities(
		params?: Omit<GetActivitiesParams, "category" | "activity_types">,
	): Promise<AccountActivity[]> {
		return await this.getAccountActivities({
			...params,
			category: "trade_activity",
		});
	}

	async getNonTradeActivities(
		params?: Omit<GetActivitiesParams, "category" | "activity_types">,
	): Promise<AccountActivity[]> {
		return await this.getAccountActivities({
			...params,
			category: "non_trade_activity",
		});
	}

	async getActivitiesPage(params?: GetActivitiesParams): Promise<{
		activities: AccountActivity[];
		nextPageToken: string | null;
	}> {
		const activities = await this.getAccountActivities(params);

		const nextPageToken =
			activities.length > 0 && activities.length === (params?.page_size || 100)
				? activities[activities.length - 1].id
				: null;

		return {
			activities,
			nextPageToken,
		};
	}
}
