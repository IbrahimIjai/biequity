import { ContractHelper } from "../web3/contract-helper";
import { getViemClients } from "../web3/viem-client";
import { AlpacaService } from "./alpaca.service";
import { MockProviderService } from "./mock-provider.service";
import { TX_SETTLEMENT_CONFIG } from "../config/tx-settlement";
import { logger } from "../utils/logger";
import type { Hash } from "viem";

export class Web3Service {
	private contractHelper?: ContractHelper;
	private alpacaService?: AlpacaService;
	private mockProviderService: MockProviderService;
	private isMockMode: boolean;

	constructor(env: Env) {
		this.isMockMode = env.MOCK_MODE === "true";
		this.mockProviderService = new MockProviderService();

		// In mock mode, never initialize wallet/private key clients.
		if (!this.isMockMode) {
			const { publicClient, walletClient, account } = getViemClients(env);
			this.contractHelper = new ContractHelper(
				publicClient,
				walletClient,
				account,
			);
			this.alpacaService = new AlpacaService(env);
		}
	}

	private getContractHelper(): ContractHelper {
		if (!this.contractHelper) {
			throw new Error("Contract helper unavailable in MOCK_MODE");
		}
		return this.contractHelper;
	}

	private getAlpacaService(): AlpacaService {
		if (!this.alpacaService) {
			throw new Error("Alpaca service unavailable in MOCK_MODE");
		}
		return this.alpacaService;
	}

	private async sleep(ms: number) {
		if (ms <= 0) return;
		await new Promise((resolve) => setTimeout(resolve, ms));
	}

	async executeSettlementByTxHash(txHashInput: string) {
		const txHash = txHashInput as Hash;

		// Mock mode: always succeed quickly and avoid any on-chain signing requirements.
		if (this.isMockMode) {
			const order = await this.mockProviderService.placeMarketOrder(
				"MOCK",
				"1",
				"buy",
			);
			return {
				success: true,
				status: "settled_mock" as const,
				txHash,
				attempt: 1,
				order,
				settleTx: `mock-settle-${Date.now()}`,
			};
		}

		let lastError: unknown = null;
		const helper = this.getContractHelper();
		const mintEvent = await helper.getMintEventFromTx(txHash);
		const currentBlock = await helper["publicClient"].getBlockNumber();
		const confirmations = Number(currentBlock - mintEvent.blockNumber) + 1;

		if (confirmations < TX_SETTLEMENT_CONFIG.requiredConfirmations) {
			return {
				success: false,
				status: "pending_confirmations" as const,
				confirmations,
				requiredConfirmations: TX_SETTLEMENT_CONFIG.requiredConfirmations,
				txHash,
			};
		}

		const qty = (Number(mintEvent.amount) / 1e18).toString();
		const clientOrderId = `buy-${txHash.toLowerCase()}`;

		for (let i = 0; i < TX_SETTLEMENT_CONFIG.maxAttempts; i++) {
			const attempt = i + 1;
			const delayMs = TX_SETTLEMENT_CONFIG.retryIntervalsMs[i] ?? 0;
			if (delayMs > 0) await this.sleep(delayMs);

			try {
				const alpaca = this.getAlpacaService();
				let order = await alpaca.getOrderByClientOrderId(clientOrderId);
				if (!order) {
					order = await alpaca.placeMarketOrder(
						mintEvent.symbol,
						qty,
						"buy",
						"day",
						false,
						clientOrderId,
					);
				}

				const settleTx = await helper.settleTokens(
					mintEvent.symbol,
					mintEvent.amount,
				);
				return {
					success: true,
					status: "settled" as const,
					txHash,
					attempt,
					order,
					settleTx,
				};
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				if (message.includes("Exceeds pending")) {
					return {
						success: true,
						status: "already_settled" as const,
						txHash,
						attempt,
					};
				}

				lastError = error;
				logger.error("Settlement attempt failed", {
					txHash,
					attempt,
					error: message,
				});
			}
		}

		return {
			success: false,
			status: "pending_or_retry_exhausted" as const,
			txHash,
			attempts: TX_SETTLEMENT_CONFIG.maxAttempts,
			error: lastError instanceof Error ? lastError.message : String(lastError),
		};
	}

	async processBuyQueue() {
		if (this.isMockMode) {
			return [{ success: true, mode: "mock", message: "No-op in mock mode" }];
		}

		const helper = this.getContractHelper();
		const alpaca = this.getAlpacaService();
		const currentBlock = await helper["publicClient"].getBlockNumber();
		const fromBlock = currentBlock - 100n;
		const events = await helper.getEvents("TokensMinted", fromBlock);

		const results = [];
		for (const event of events) {
			const { symbol, amount } = event.args;
			if (!symbol || !amount) continue;

			try {
				const qty = (Number(amount) / 1e18).toString();
				const order = await alpaca.placeMarketOrder(symbol, qty, "buy", "day", false);
				const tx = await helper.settleTokens(symbol, amount);
				results.push({ success: true, event, order, tx });
			} catch (error) {
				results.push({
					success: false,
					event,
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}

		return results;
	}

	async processSellQueue() {
		if (this.isMockMode) {
			return [{ success: true, mode: "mock", message: "No-op in mock mode" }];
		}

		const helper = this.getContractHelper();
		const alpaca = this.getAlpacaService();
		const currentBlock = await helper["publicClient"].getBlockNumber();
		const fromBlock = currentBlock - 100n;
		const events = await helper.getEvents("TokensRedeemed", fromBlock);

		const results = [];
		for (const event of events) {
			const { symbol, amount } = event.args;
			if (!symbol || !amount) continue;

			try {
				const qty = (Number(amount) / 1e18).toString();
				const order = await alpaca.placeMarketOrder(symbol, qty, "sell", "day", false);
				results.push({ success: true, event, order });
			} catch (error) {
				results.push({
					success: false,
					event,
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}

		return results;
	}
}
