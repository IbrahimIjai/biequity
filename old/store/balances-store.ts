import { create } from "zustand";
import type { Token } from "@/lib/tokens-list";

export type BalanceEntry = {
	token: Token;
	address: string;
	raw?: bigint;
	formatted: string;
	updatedAt: number;
};

type BalancesState = {
	balancesByAddress: Record<string, BalanceEntry>;
	isLoading: boolean;
	error?: string;
	setBalances: (entries: BalanceEntry[]) => void;
	setLoading: (value: boolean) => void;
	setError: (message?: string) => void;
	getBalance: (identifier: string) => BalanceEntry | undefined; // address or symbol
};

export const useBalancesStore = create<BalancesState>((set, get) => ({
	balancesByAddress: {},
	isLoading: false,
	error: undefined,
	setBalances: (entries) =>
		set((state) => {
			const map: Record<string, BalanceEntry> = { ...state.balancesByAddress };
			for (const entry of entries) {
				map[entry.address.toLowerCase()] = entry;
			}
			return { balancesByAddress: map, error: undefined };
		}),
	setLoading: (value) => set({ isLoading: value }),
	setError: (message) => set({ error: message }),
	getBalance: (identifier) => {
		const id = identifier.toLowerCase();
		const byAddress = get().balancesByAddress[id];
		if (byAddress) return byAddress;
		// fallback: search by symbol
		const all = Object.values(get().balancesByAddress);
		return all.find((b) => b.token.symbol.toLowerCase() === id);
	},
}));
