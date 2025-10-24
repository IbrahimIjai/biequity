import { create } from "zustand";

export interface Token {
	symbol: string;
	name: string;
	icon: string;
	decimals: number;
	address?: string;
}

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

const USDC: Token = {
	symbol: "USDC",
	name: "USD Coin",
	icon: "💵",
	decimals: 6,
};

const AAPL: Token = {
	symbol: "AAPL",
	name: "Apple Stock",
	icon: "🍎",
	decimals: 18,
};

export const useTradeStore = create<TradeState>((set) => ({
	token0: USDC,
	token1: AAPL,
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
