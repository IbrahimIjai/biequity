import { baseSepolia } from "viem/chains";

const SUPPORTED_CHAINS: Chain[] = [baseSepolia];

export const ChainId = {
	BASE_SEPOLIA: baseSepolia.id,
} as const;
export type ChainId = (typeof ChainId)[keyof typeof ChainId];

const RPC_URLS: Record<ChainId, string> = {
	[ChainId.BASE_SEPOLIA]: "https://base-sepolia.publicnode.com",
} as const;

import { Chain, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const createViemPublicClient = (_chain: Chain, _RPC_URL: string) =>
	createPublicClient({
		chain: _chain,
		transport: http(RPC_URLS[_chain.id as ChainId]),
		cacheTime: 10_000,
	});

export function createViemWalletClient(
	_chain: Chain,
	env: Env,
	_RPC_URL: string,
) {
	const account = privateKeyToAccount(
		`0x${env.OPERATOR_PRIVATE_KEY}` as `0x${string}`,
	);
	return createWalletClient({
		account,
		chain: _chain,
		transport: http(RPC_URLS[_chain.id as ChainId]),
	});
}

export const getViemClients = (env: Env) => {
	const rpcUrl = RPC_URLS[ChainId.BASE_SEPOLIA];
	const publicClient = createViemPublicClient(baseSepolia, rpcUrl);
	const walletClient = createViemWalletClient(baseSepolia, env, rpcUrl);
	const account = walletClient.account;
	return { publicClient, walletClient, account };
};
