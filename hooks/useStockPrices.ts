"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { readContracts } from "@wagmi/core";
import { formatUnits, isAddress, type Address } from "viem";
import { useChainId, useConfig, usePublicClient } from "wagmi";
import { STOCKS, STABLECOINS, type Token } from "@/lib/tokens-list";
import { usePricesStore } from "@/store/prices-store";
import { BIEQUITY_CORE_ABI } from "@/config/abi/biequity_core";
import { BIEQUITY_CORE_CONTRACT_ADDRESS } from "@/config/biequity-core-contract";

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
function hasResult(value: unknown): value is { result: unknown } {
	return isObject(value) && "result" in value;
}
function hasError(value: unknown): value is { error: unknown } {
	return isObject(value) && "error" in value;
}

export function useStockPrices(tokens: readonly Token[] = STOCKS) {
	const symbols = useMemo(
		() => tokens.map((t) => t.symbol.toUpperCase()),
		[tokens],
	);

	const { setPrices } = usePricesStore();
	const config = useConfig();
	const chainId = useChainId();
	const publicClient = usePublicClient();

	const coreAddress = BIEQUITY_CORE_CONTRACT_ADDRESS as Address;
	const coreAddressValid = isAddress(coreAddress);
	const USDC_DECIMALS =
		STABLECOINS.find((t) => t.symbol === "USDC")?.decimals ?? 6;
	const oneUSDC = BigInt(10 ** USDC_DECIMALS);

	const query = useQuery({
		queryKey: [
			"stock-prices",
			chainId,
			coreAddressValid ? coreAddress : "invalid",
			symbols,
		],
		enabled: coreAddressValid && symbols.length > 0,
		refetchOnWindowFocus: false,
		refetchInterval: 30_000, // 30 seconds
		queryFn: async () => {
			const contracts = symbols.map((symbol) => ({
				address: coreAddress,
				abi: BIEQUITY_CORE_ABI,
				functionName: "getStockAmtFromUSD" as const,
				args: [symbol, oneUSDC],
				chainId,
			}));

			const results = await readContracts(config, {
				contracts,
				allowFailure: true,
			});

			const updatedAt = Date.now();
			const entries = results.map((res, i) => {
				const sym = symbols[i]!;
				let priceUsd = 0;
				if (hasResult(res) && typeof res.result === "bigint") {
					const tokensPer1Usdc = Number(formatUnits(res.result, 18));
					if (tokensPer1Usdc > 0) {
						priceUsd = 1 / tokensPer1Usdc; // assuming USDC ~= $1
					}
				} else if (hasError(res)) {
					console.debug("getStockAmtFromUSD failed for", sym, res.error);
				}
				return { symbol: sym, priceUsd, updatedAt };
			});
			return entries;
		},
	});

	useEffect(() => {
		if (query.data) setPrices(query.data);
	}, [query.data, setPrices]);

	useEffect(() => {
		if (!publicClient || !coreAddressValid) return;
		const unwatch = publicClient.watchBlocks({
			includeTransactions: false,
			onBlock: () => {
				query.refetch();
			},
		});
		return () => unwatch();
	}, [publicClient, coreAddressValid, chainId, symbols.join(",")]);

	return query;
}
