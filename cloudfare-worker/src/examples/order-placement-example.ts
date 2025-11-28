/**
 * Example usage of AlpacaService for placing orders
 *
 * This file demonstrates how to use the AlpacaService to place market orders
 * with proper error handling.
 */

import { AlpacaService } from "../services/alpaca.service";
import { AlpacaAPIError } from "../utils/axios";
import { logger } from "../utils/logger";

/**
 * Example: Place a market buy order
 */
export async function exampleBuyOrder(env: Env) {
	const alpacaService = new AlpacaService(env);

	try {
		// Place a market buy order for 1 share of AAPL
		const order = await alpacaService.placeMarketOrder(
			"AAPL", // symbol
			"1", // qty (as string to avoid float precision issues)
			"buy", // side
			"day", // time_in_force
			false, // extended_hours
		);

		logger.info("Order placed successfully", {
			orderId: order.id,
			symbol: order.symbol,
			qty: order.qty,
			side: order.side,
			status: order.status,
			type: order.type,
		});

		return order;
	} catch (error) {
		if (error instanceof AlpacaAPIError) {
			// Handle Alpaca-specific errors
			logger.error("Alpaca API Error", {
				statusCode: error.statusCode,
				message: error.message,
				code: error.code,
				data: error.data,
			});

			// You can handle specific error codes
			if (error.statusCode === 403) {
				// Insufficient buying power
				logger.error("Insufficient buying power or account restrictions");
			} else if (error.statusCode === 422) {
				// Invalid parameters
				logger.error("Invalid order parameters");
			} else if (error.statusCode === 429) {
				// Rate limit
				logger.error("Rate limit exceeded");
			}
		} else {
			// Handle unexpected errors
			logger.error("Unexpected error", {
				error: error instanceof Error ? error.message : String(error),
			});
		}

		throw error;
	}
}

/**
 * Example: Place a market sell order
 */
export async function exampleSellOrder(env: Env) {
	const alpacaService = new AlpacaService(env);

	try {
		// Place a market sell order for 1 share of AAPL
		const order = await alpacaService.placeMarketOrder(
			"AAPL", // symbol
			"1", // qty
			"sell", // side
			"day", // time_in_force
			false, // extended_hours
		);

		logger.info("Sell order placed successfully", {
			orderId: order.id,
			symbol: order.symbol,
			qty: order.qty,
			side: order.side,
			status: order.status,
		});

		return order;
	} catch (error) {
		if (error instanceof AlpacaAPIError) {
			logger.error("Failed to place sell order", {
				statusCode: error.statusCode,
				message: error.message,
			});
		}
		throw error;
	}
}

/**
 * Example: Get account information
 */
export async function exampleGetAccount(env: Env) {
	const alpacaService = new AlpacaService(env);

	try {
		const account = await alpacaService.getAccount();

		logger.info("Complete account information", {
			// Identity
			id: account.id,
			accountNumber: account.account_number,

			// Status
			status: account.status,
			cryptoStatus: account.crypto_status,
			tradingBlocked: account.trading_blocked,
			accountBlocked: account.account_blocked,
			transfersBlocked: account.transfers_blocked,

			// Balances
			cash: account.cash,
			equity: account.equity,
			portfolioValue: account.portfolio_value,

			// Buying Power
			buyingPower: account.buying_power,
			regtBuyingPower: account.regt_buying_power,
			daytradingBuyingPower: account.daytrading_buying_power,
			effectiveBuyingPower: account.effective_buying_power,
			nonMarginableBuyingPower: account.non_marginable_buying_power,
			optionsBuyingPower: account.options_buying_power,

			// Market Values
			longMarketValue: account.long_market_value,
			shortMarketValue: account.short_market_value,
			positionMarketValue: account.position_market_value,

			// Margin Info
			initialMargin: account.initial_margin,
			maintenanceMargin: account.maintenance_margin,
			multiplier: account.multiplier,

			// Trading Rules
			patternDayTrader: account.pattern_day_trader,
			daytradeCount: account.daytrade_count,

			// Options
			optionsApprovedLevel: account.options_approved_level,
			optionsTradingLevel: account.options_trading_level,

			// Other
			shortingEnabled: account.shorting_enabled,
			cryptoTier: account.crypto_tier,
			createdAt: account.created_at,
			balanceAsof: account.balance_asof,
		});

		return account;
	} catch (error) {
		logger.error("Failed to get account information", {
			error: error instanceof AlpacaAPIError ? error.message : String(error),
		});
		throw error;
	}
}

/**
 * Example: Check if account is ready for trading
 */
export async function exampleCheckTradingEligibility(env: Env) {
	const alpacaService = new AlpacaService(env);

	try {
		const result = await alpacaService.checkTradingEligibility();

		if (result.canTrade) {
			logger.info("Account is ready for trading", {
				buyingPower: result.account.buying_power,
				cash: result.account.cash,
				portfolioValue: result.account.portfolio_value,
			});
		} else {
			logger.warn("Account cannot trade", {
				reasons: result.reasons,
				status: result.account.status,
				tradingBlocked: result.account.trading_blocked,
			});
		}

		return result;
	} catch (error) {
		logger.error("Failed to check trading eligibility", {
			error: error instanceof AlpacaAPIError ? error.message : String(error),
		});
		throw error;
	}
}

/**
 * Example: Get position for a symbol
 */
export async function exampleGetPosition(env: Env, symbol: string) {
	const alpacaService = new AlpacaService(env);

	try {
		const position = await alpacaService.getPosition(symbol);

		if (position) {
			logger.info("Position found", {
				symbol: position.symbol,
				qty: position.qty,
				avgEntryPrice: position.avg_entry_price,
				marketValue: position.market_value,
				unrealizedPl: position.unrealized_pl,
			});
		} else {
			logger.info("No position found", { symbol });
		}

		return position;
	} catch (error) {
		logger.error("Failed to get position", {
			symbol,
			error: error instanceof AlpacaAPIError ? error.message : String(error),
		});
		throw error;
	}
}

/**
 * Example: Place order with validation
 */
export async function examplePlaceOrderWithValidation(
	env: Env,
	symbol: string,
	qty: string,
	side: "buy" | "sell",
) {
	const alpacaService = new AlpacaService(env);

	try {
		// 1. First check account status and buying power
		const account = await alpacaService.getAccount();

		if (account.trading_blocked) {
			throw new Error("Trading is blocked on this account");
		}

		// 2. Check if we have an existing position (for sell orders)
		if (side === "sell") {
			const position = await alpacaService.getPosition(symbol);
			if (!position) {
				throw new Error(`No position found for ${symbol}. Cannot sell.`);
			}

			const positionQty = parseFloat(position.qty);
			const orderQty = parseFloat(qty);

			if (orderQty > positionQty) {
				throw new Error(
					`Insufficient position. You have ${positionQty} shares but trying to sell ${orderQty}`,
				);
			}
		}

		// 3. Place the order
		const order = await alpacaService.placeMarketOrder(
			symbol,
			qty,
			side,
			"day",
			false,
		);

		logger.info("Order placed with validation", {
			orderId: order.id,
			symbol: order.symbol,
			qty: order.qty,
			side: order.side,
			status: order.status,
		});

		return order;
	} catch (error) {
		if (error instanceof AlpacaAPIError) {
			logger.error("Failed to place order", {
				symbol,
				qty,
				side,
				statusCode: error.statusCode,
				message: error.message,
				code: error.code,
			});
		} else {
			logger.error("Validation or other error", {
				symbol,
				qty,
				side,
				error: error instanceof Error ? error.message : String(error),
			});
		}
		throw error;
	}
}

/**
 * Example: Track order status
 */
export async function exampleTrackOrder(env: Env, orderId: string) {
	const alpacaService = new AlpacaService(env);

	try {
		const order = await alpacaService.getOrder(orderId);

		logger.info("Order status", {
			orderId: order.id,
			symbol: order.symbol,
			qty: order.qty,
			side: order.side,
			status: order.status,
			filledQty: order.filled_qty,
			filledAvgPrice: order.filled_avg_price,
			createdAt: order.created_at,
			submittedAt: order.submitted_at,
			filledAt: order.filled_at,
		});

		return order;
	} catch (error) {
		logger.error("Failed to get order status", {
			orderId,
			error: error instanceof AlpacaAPIError ? error.message : String(error),
		});
		throw error;
	}
}
