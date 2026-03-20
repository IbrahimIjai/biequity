import { ChainId } from "./viem-client";

export const BIEQUITY_CORE_CONTRACT_ADDRESS: Record<ChainId, `0x${string}`> = {
	[ChainId.BASE_SEPOLIA]: "0x5558A1F92192f1941fa0B965FC6715195f9221f0",
} as const;
