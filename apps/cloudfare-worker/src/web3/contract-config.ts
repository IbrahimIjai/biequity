import { ChainId } from "./viem-client";

export const BIEQUITY_CORE_CONTRACT_ADDRESS: Record<ChainId, `0x${string}`> = {
	[ChainId.BASE_SEPOLIA]: "0x8B0EF8eD5D6F3ceF0803c26Ea7471ba83CB6cB80",
} as const;
