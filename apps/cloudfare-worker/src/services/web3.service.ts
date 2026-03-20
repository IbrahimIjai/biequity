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
		const currentBlock = await this.contractHelper[
			"publicClient"
		].getBlockNumber();
		const fromBlock = currentBlock - 100n;

		const events = await this.contractHelper.getEvents(
			"TokensMinted",
			fromBlock,
		);

		const results = [];
		for (const event of events) {
			const { symbol, amount } = event.args;
			const netUsdc = "netUsdc" in event.args ? event.args.netUsdc : undefined;
			if (!symbol || !amount) continue;

			try {
				const qty = Number(amount) / 1e18;

				logger.info(`Processing Buy: ${qty} ${symbol}`, {
					symbol,
					qty,
					amount: amount.toString(),
					...(netUsdc && { netUsdc: netUsdc.toString() }),
				});

				const order = await this.alpacaService.placeMarketOrder(
					symbol,
					qty.toString(),
					"buy",
					"day",
					false,
				);

				logger.info(`Buy order placed successfully`, {
					orderId: order.id,
					symbol: order.symbol,
					qty: order.qty,
					status: order.status,
				});

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

				const order = await this.alpacaService.placeMarketOrder(
					symbol,
					qty.toString(),
					"sell",
					"day",
					false,
				);

				logger.info(`Sell order placed successfully`, {
					orderId: order.id,
					symbol: order.symbol,
					qty: order.qty,
					status: order.status,
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
