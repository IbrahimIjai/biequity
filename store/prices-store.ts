import { create } from "zustand";
import { STOCKS, type Token } from "@/lib/tokens-list";

export type StockPriceEntry = {
	symbol: string;
	priceUsd: number; // price per 1 token in USD (human units)
	updatedAt: number;
};

type PricesState = {
	pricesBySymbol: Record<string, StockPriceEntry>;
	isLoading: boolean;
	error?: string;
	setPrices: (entries: StockPriceEntry[]) => void;
	setLoading: (value: boolean) => void;
	setError: (message?: string) => void;
	getPrice: (symbol: string) => StockPriceEntry | undefined;
	getStockAmtFromUSD: (
		symbol: string,
		usdAmount: number | string,
	) => { human: string; wei: string } | undefined;
};

function formatNumber(n: number, maxDecimals = 8): string {
	if (!Number.isFinite(n)) return "0";
	return n.toLocaleString(undefined, {
		maximumFractionDigits: maxDecimals,
	});
}

export const usePricesStore = create<PricesState>((set, get) => ({
	pricesBySymbol: {},
	isLoading: false,
	error: undefined,
	setPrices: (entries) =>
		set((state) => {
			const map: Record<string, StockPriceEntry> = { ...state.pricesBySymbol };
			for (const entry of entries) {
				map[entry.symbol.toUpperCase()] = entry;
			}
			return { pricesBySymbol: map, error: undefined };
		}),
	setLoading: (value) => set({ isLoading: value }),
	setError: (message) => set({ error: message }),
	getPrice: (symbol) => get().pricesBySymbol[symbol.toUpperCase()],
	getStockAmtFromUSD: (symbol, usdAmount) => {
		const price = get().getPrice(symbol);
		if (!price || price.priceUsd <= 0) return undefined;
		const token: Token | undefined = STOCKS.find(
			(t) => t.symbol.toUpperCase() === symbol.toUpperCase(),
		);
		const decimals = token?.decimals ?? 18;
		const usd = typeof usdAmount === "string" ? Number(usdAmount) : usdAmount;
		if (!Number.isFinite(usd)) return undefined;
		const human = usd / price.priceUsd; // amount in token human units
		const wei = BigInt(Math.floor(human * 10 ** Math.min(decimals, 18))) // cap to 18 to avoid overflow on 10 **
			.toString();
		return { human: formatNumber(human, 8), wei };
	},
}));
