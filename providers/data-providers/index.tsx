"use client";

import * as React from "react";
import { useBalances } from "@/hooks/useBalances";
import { useStockPrices } from "@/hooks/useStockPrices";

export function DataProviders({ children }: { children: React.ReactNode }) {
	// kick off background data sync globally
	useBalances();
	useStockPrices();
	return <>{children}</>;
}
