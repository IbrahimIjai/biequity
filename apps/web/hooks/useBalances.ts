"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { readContracts } from "@wagmi/core";
import { erc20Abi, formatUnits, isAddress, type Address } from "viem";
import { useAccount, useChainId, useConfig, usePublicClient } from "wagmi";
import { ALL_TOKENS, type Token } from "@/lib/tokens-list";
import { useBalancesStore } from "@/store/balances-store";
import { BIEQUITY_CORE_ABI } from "@/config/abi/biequity_core";
import { BIEQUITY_CORE_CONTRACT_ADDRESS } from "@/config/biequity-core-contract";

function toAddress(addr?: string): Address | undefined {
	if (!addr) return undefined;
	return addr as Address;
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function hasResult(value: unknown): value is { result: unknown } {
	return isObject(value) && "result" in value;
}

function hasError(value: unknown): value is { error: unknown } {
	return isObject(value) && "error" in value;
}

export function useBalances(tokens: readonly Token[] = ALL_TOKENS) {
	const { address } = useAccount();
	const chainId = useChainId();
	const config = useConfig();
	const publicClient = usePublicClient();
	const { setBalances } = useBalancesStore();
	const coreAddress = BIEQUITY_CORE_CONTRACT_ADDRESS as Address;

	const tokenAddressList = useMemo(
		() => tokens.filter((t) => !!t.address && isAddress(t.address as Address)),
		[tokens],
	);

	const query = useQuery({
		queryKey: [
			"balances",
			chainId,
			address,
			tokens.map((t) => t.symbol),
			tokenAddressList.map((t) => t.address?.toLowerCase()),
		],
		enabled: Boolean(address && tokens.length > 0),
		refetchOnWindowFocus: false,
		queryFn: async () => {
			const tokensWithoutAddress = tokens.filter(
				(t) => !t.address || !isAddress(t.address as Address),
			);

			let resolvedBySymbol: Record<string, Address> = {};

			if (
				tokensWithoutAddress.length > 0 &&
				isAddress(coreAddress)
			) {
				const symbolLookupResults = await readContracts(config, {
					contracts: tokensWithoutAddress.map((t) => ({
						address: coreAddress,
						abi: BIEQUITY_CORE_ABI,
						functionName: "tokenBySymbol" as const,
						args: [t.symbol],
						chainId,
					})),
					allowFailure: true,
				});

				resolvedBySymbol = symbolLookupResults.reduce<Record<string, Address>>(
					(acc, result, index) => {
						const symbol = tokensWithoutAddress[index]?.symbol;
						if (!symbol) return acc;
						if (hasResult(result) && typeof result.result === "string") {
							const candidate = result.result as Address;
							if (
								isAddress(candidate) &&
								candidate.toLowerCase() !==
									"0x0000000000000000000000000000000000000000"
							) {
								acc[symbol] = candidate;
							}
						}
						return acc;
					},
					{},
				);
			}

			const resolvedTokens = tokens
				.map((token) => {
					const directAddress = token.address;
					const resolvedAddress = resolvedBySymbol[token.symbol];
					const finalAddress = directAddress ?? resolvedAddress;
					if (!finalAddress || !isAddress(finalAddress as Address)) {
						return undefined;
					}
					return {
						...token,
						address: finalAddress,
					};
				})
				.filter((token): token is Token & { address: Address } => !!token);

			const contracts = resolvedTokens.map((t) => ({
				address: toAddress(t.address!)!,
				abi: erc20Abi,
				functionName: "balanceOf" as const,
				args: [address as Address],
				chainId,
			}));

			const results = await readContracts(config, {
				contracts,
				allowFailure: true,
			});

			const now = Date.now();
			const entries = results.map((res, i) => {
				const token = resolvedTokens[i]!;
				let raw: bigint | undefined;
				if (hasResult(res) && typeof res.result === "bigint") {
					raw = res.result;
				}
				if (raw === undefined && hasError(res)) {
					console.debug(
						"balanceOf failed for",
						token.symbol,
						token.address,
						res.error,
					);
				}
				const formatted =
					raw !== undefined ? formatUnits(raw, token.decimals) : "0";
				return {
					token,
					address: token.address!,
					raw,
					formatted,
					updatedAt: now,
				};
			});
			return entries;
		},
	});

	const { refetch } = query;

	useEffect(() => {
		if (query.data) setBalances(query.data);
	}, [query.data, setBalances]);

	useEffect(() => {
		if (!publicClient || !address) return;
		const unwatch = publicClient.watchBlocks({
			includeTransactions: false,
			onBlock: () => {
				refetch();
			},
		});
		return () => unwatch();
	}, [publicClient, address, chainId, tokenAddressList, refetch]);

	return query;
}
