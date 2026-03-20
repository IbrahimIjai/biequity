import { PublicClient, WalletClient, Account, parseAbiItem } from "viem";
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
		// Assuming Base Sepolia for now, or we could pass chainId
		this.contractAddress = BIEQUITY_CORE_CONTRACT_ADDRESS[ChainId.BASE_SEPOLIA];
	}

	async getEvents(
		eventName: "TokensMinted" | "TokensRedeemed",
		fromBlock: bigint,
	) {
		// We need to find the event in the ABI to get the signature or just use parseAbiItem if we know it
		// But we have the ABI object.

		// For simplicity with Viem's getContractEvents or getLogs:
		return this.publicClient.getContractEvents({
			address: this.contractAddress,
			abi: BIEQUITY_CORE_ABI,
			eventName: eventName,
			fromBlock: fromBlock,
		});
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
