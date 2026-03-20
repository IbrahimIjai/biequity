"use client";

import { useBalances } from "@/hooks/useBalances";

export function BalancesProvider() {
	useBalances();
	return null;
}
