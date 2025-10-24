"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { readContracts } from "@wagmi/core";
import { erc20Abi, formatUnits, type Address } from "viem";
import { useAccount, useChainId, useConfig, usePublicClient } from "wagmi";
import { ALL_TOKENS, type Token } from "@/lib/tokens-list";
import { useBalancesStore } from "@/store/balances-store";

function toAddress(addr?: string): Address | undefined {
  if (!addr) return undefined;
  return addr as Address;
}

export function useBalances(tokens: readonly Token[] = ALL_TOKENS) {
  const { address } = useAccount();
  const chainId = useChainId();
  const config = useConfig();
  const publicClient = usePublicClient();
  const { setBalances } = useBalancesStore();

  const tokensWithAddress = useMemo(
    () => tokens.filter((t) => !!t.address && toAddress(t.address)),
    [tokens],
  );

  const query = useQuery({
    queryKey: [
      "balances",
      chainId,
      address,
      tokensWithAddress.map((t) => t.address?.toLowerCase()),
    ],
    enabled: Boolean(address && tokensWithAddress.length > 0),
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const contracts = tokensWithAddress.map((t) => ({
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
        const token = tokensWithAddress[i]!;
        // res can be { result } or { error } depending on allowFailure
        const raw = (res as any)?.result as bigint | undefined;
        const formatted = raw !== undefined ? formatUnits(raw, token.decimals) : "0";
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

  // Sync query data to Zustand store when it changes (v5 removed onSuccess from options)
  useEffect(() => {
    if (query.data) setBalances(query.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  // watch new blocks and refresh balances
  useEffect(() => {
    if (!publicClient || !address) return;
    const unwatch = publicClient.watchBlocks({
      includeTransactions: false,
      onBlock: () => {
        query.refetch();
      },
    });
    return () => unwatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient, address, chainId, tokensWithAddress]);

  // Expose query status for consumers (optional)
  return query;
}
