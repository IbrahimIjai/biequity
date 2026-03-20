import {
	PublicClient,
	WalletClient,
	Account,
	decodeEventLog,
	type Hash,
} from "viem";
import { BIEQUITY_CORE_ABI } from "./abi";
import { BIEQUITY_CORE_CONTRACT_ADDRESS } from "./contract-config";
import { ChainId } from "./viem-client";

export class ContractHelper {
	private publicClient: PublicClient;
	private walletClient: WalletClient;
	private account: Account;
	private contractAddress: `0x${string}`;

	constructor(
		publicClient: PublicClient,
		walletClient: WalletClient,
		account: Account,
	) {
		this.publicClient = publicClient;
		this.walletClient = walletClient;
		this.account = account;
		this.contractAddress = BIEQUITY_CORE_CONTRACT_ADDRESS[ChainId.BASE_SEPOLIA];
	}

	async getEvents(
		eventName: "TokensMinted" | "TokensRedeemed",
		fromBlock: bigint,
	) {
		return this.publicClient.getContractEvents({
			address: this.contractAddress,
			abi: BIEQUITY_CORE_ABI,
			eventName: eventName,
			fromBlock: fromBlock,
		});
	}

	async getTransactionReceipt(txHash: Hash) {
		return this.publicClient.getTransactionReceipt({ hash: txHash });
	}

	async getMintEventFromTx(txHash: Hash) {
		const receipt = await this.getTransactionReceipt(txHash);
		if (receipt.status !== "success") {
			throw new Error(`Transaction ${txHash} was not successful`);
		}

		for (const log of receipt.logs) {
			if (log.address.toLowerCase() !== this.contractAddress.toLowerCase()) {
				continue;
			}
			try {
				const decoded = decodeEventLog({
					abi: BIEQUITY_CORE_ABI,
					data: log.data,
					topics: log.topics,
					eventName: "TokensMinted",
				});
				const { symbol, amount, netUsdc } = decoded.args;
				if (!symbol || !amount) continue;
				return {
					txHash,
					blockNumber: receipt.blockNumber,
					symbol,
					amount,
					netUsdc,
				};
			} catch {
				continue;
			}
		}

		throw new Error(`No TokensMinted event found in tx ${txHash}`);
	}

	async settleTokens(symbol: string, amount: bigint) {
		const { request } = await this.publicClient.simulateContract({
			account: this.account,
			address: this.contractAddress,
			abi: BIEQUITY_CORE_ABI,
			functionName: "settleTokens",
			args: [symbol, amount],
		});
		return this.walletClient.writeContract(request);
	}

	async withdrawUsdcFromStock(tokenAddr: `0x${string}`, amount: bigint) {
		const { request } = await this.publicClient.simulateContract({
			account: this.account,
			address: this.contractAddress,
			abi: BIEQUITY_CORE_ABI,
			functionName: "withdrawUsdcFromStock",
			args: [tokenAddr, amount],
		});
		return this.walletClient.writeContract(request);
	}
}
