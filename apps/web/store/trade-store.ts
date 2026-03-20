import { create } from "zustand";
import { STABLECOINS, STOCKS } from "@/lib/tokens-list";
import type { Token } from "@/lib/tokens-list";

export interface TradeState {
	token0: Token;
	token1: Token;
	amount0: string;
	amount1: string;
	setToken0: (token: Token) => void;
	setToken1: (token: Token) => void;
	setAmount0: (amount: string) => void;
	setAmount1: (amount: string) => void;
	swapTokens: () => void;
}
const DEFAULT_STABLE: Token =
	STABLECOINS.find((t) => t.symbol === "USDT") ??
	STABLECOINS.find((t) => t.symbol === "USDC") ??
	STABLECOINS[0];
const DEFAULT_STOCK: Token =
	STOCKS.find((t) => t.symbol === "AAPL") ?? STOCKS[0];

export const useTradeStore = create<TradeState>((set) => ({
	token0: DEFAULT_STABLE,
	token1: DEFAULT_STOCK,
	amount0: "",
	amount1: "",
	setToken0: (token) => set({ token0: token }),
	setToken1: (token) => set({ token1: token }),
	setAmount0: (amount) => set({ amount0: amount }),
	setAmount1: (amount) => set({ amount1: amount }),
	swapTokens: () =>
		set((state) => ({
			token0: state.token1,
			token1: state.token0,
			amount0: state.amount1,
			amount1: state.amount0,
		})),
}));
