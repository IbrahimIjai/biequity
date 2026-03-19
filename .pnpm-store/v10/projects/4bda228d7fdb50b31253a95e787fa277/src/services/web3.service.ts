import { ContractHelper } from "../web3/contract-helper";
import { getViemClients } from "../web3/viem-client";
import { AlpacaService } from "./alpaca.service";
import { AlpacaAPIError } from "../utils/axios";
import { logger } from "../utils/logger";

export class Web3Service {
	private contractHelper: ContractHelper;
	private alpacaService: AlpacaService;

	constructor(env: Env) {
		const { publicClient, walletClient, account } = getViemClients(env);
		this.contractHelper = new ContractHelper(
			publicClient,
			walletClient,
			account,
		);
		this.alpacaService = new AlpacaService(env);
	}

	async processBuyQueue() {
		// In a real app, store lastProcessedBlock in KV
		const currentBlock = await this.contractHelper[
			"publicClient"
		].getBlockNumber();
		const fromBlock = currentBlock - 100n; // Look back 100 blocks

		const events = await this.contractHelper.getEvents(
			"TokensMinted",
			fromBlock,
		);

		const results = [];
		for (const event of events) {
			const { symbol, amount } = event.args;
			const netUsdc = "netUsdc" in event.args ? event.args.netUsdc : undefined;
			if (!symbol || !amount) continue;

			// TODO: Check if this event was already processed (idempotency)

			try {
				// 1. Withdraw USDC (Operator needs to do this, or we assume Operator has funds)
				// For this hackathon, we might skip the actual withdrawal step if the operator wallet
				// is already funded or if we just want to prove the Alpaca integration.
				// But let's try to follow the flow.
				// The contract function `withdrawUsdcFromStock` sends USDC to the caller (Operator).
				// We need the token address for the symbol.
				// The event gives us the symbol. We might need a helper to get token address from symbol
				// or just trust the symbol mapping if we had it off-chain.
				// For now, let's assume we just place the order on Alpaca to "back" the tokens.

				// 2. Place Buy Order on Alpaca
				// Convert BigInt amount to number (be careful with decimals)
				// Assuming 18 decimals for the token and we want to buy 'amount' qty?
				// Or is 'amount' the number of tokens?
				// If 1 token = 1 stock share, then:
				const qty = Number(amount) / 1e18;

				logger.info(`Processing Buy: ${qty} ${symbol}`, {
					symbol,
					qty,
					amount: amount.toString(),
					...(netUsdc && { netUsdc: netUsdc.toString() }),
				});

				// Place market order with proper error handling
				const order = await this.alpacaService.placeMarketOrder(
					symbol,
					qty.toString(),
					"buy",
					"day", // time_in_force
					false, // extended_hours
				);

				logger.info(`Buy order placed successfully`, {
					orderId: order.id,
					symbol: order.symbol,
					qty: order.qty,
					status: order.status,
				});

				// 3. Settle Tokens on Chain
				// Once order is filled (or immediately if we trust it will fill), we mark tokens as backed.
				// In a real system, we'd wait for order fill confirmation (webhook).
				// Here, we'll optimistically settle.
				const tx = await this.contractHelper.settleTokens(symbol, amount);

				logger.info(`Tokens settled on chain`, {
					symbol,
					amount: amount.toString(),
					txHash: tx,
				});

				results.push({
					success: true,
					event,
					order: {
						id: order.id,
						symbol: order.symbol,
						qty: order.qty,
						status: order.status,
						side: order.side,
					},
					tx,
				});
			} catch (error) {
				if (error instanceof AlpacaAPIError) {
					logger.error(`Alpaca API error processing buy for ${symbol}`, {
						symbol,
						statusCode: error.statusCode,
						message: error.message,
						code: error.code,
						data: error.data,
					});

					results.push({
						success: false,
						event,
						error: {
							type: "ALPACA_API_ERROR",
							statusCode: error.statusCode,
							message: error.message,
							code: error.code,
						},
					});
				} else {
					logger.error(`Failed to process buy for ${symbol}`, {
						symbol,
						error: error instanceof Error ? error.message : String(error),
					});

					results.push({
						success: false,
						event,
						error: {
							type: "UNKNOWN_ERROR",
							message: error instanceof Error ? error.message : String(error),
						},
					});
				}
			}
		}
		return results;
	}

	async processSellQueue() {
		const currentBlock = await this.contractHelper[
			"publicClient"
		].getBlockNumber();
		const fromBlock = currentBlock - 100n;

		const events = await this.contractHelper.getEvents(
			"TokensRedeemed",
			fromBlock,
		);

		const results = [];
		for (const event of events) {
			const { symbol, amount } = event.args;
			if (!symbol || !amount) continue;

			try {
				const qty = Number(amount) / 1e18;

				logger.info(`Processing Sell: ${qty} ${symbol}`, {
					symbol,
					qty,
					amount: amount.toString(),
				});

				// 1. Place Sell Order on Alpaca using market order
				const order = await this.alpacaService.placeMarketOrder(
					symbol,
					qty.toString(),
					"sell",
					"day", // time_in_force
					false, // extended_hours
				);

				logger.info(`Sell order placed successfully`, {
					orderId: order.id,
					symbol: order.symbol,
					qty: order.qty,
					status: order.status,
				});

				// 2. Withdraw USD and bridge back to USDC (Manual/Complex step)
				// For this demo, we just place the sell order to unback the tokens.

				results.push({
					success: true,
					event,
					order: {
						id: order.id,
						symbol: order.symbol,
						qty: order.qty,
						status: order.status,
						side: order.side,
					},
				});
			} catch (error) {
				if (error instanceof AlpacaAPIError) {
					logger.error(`Alpaca API error processing sell for ${symbol}`, {
						symbol,
						statusCode: error.statusCode,
						message: error.message,
						code: error.code,
						data: error.data,
					});

					results.push({
						success: false,
						event,
						error: {
							type: "ALPACA_API_ERROR",
							statusCode: error.statusCode,
							message: error.message,
							code: error.code,
						},
					});
				} else {
					logger.error(`Failed to process sell for ${symbol}`, {
						symbol,
						error: error instanceof Error ? error.message : String(error),
					});

					results.push({
						success: false,
						event,
						error: {
							type: "UNKNOWN_ERROR",
							message: error instanceof Error ? error.message : String(error),
						},
					});
				}
			}
		}
		return results;
	}
}
