export type Token = {
	symbol: string;
	name: string;
	icon: string; 
	decimals: number;
	address?: string;
};

export const STABLECOINS = [
	{
		symbol: "USDC",
		name: "USD Coin",
		icon: "/tokens/usdc.png",
		decimals: 6,
		address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
	},
] satisfies readonly Token[];

export const STOCKS = [
	{
		symbol: "AAPL",
		name: "Apple Stock",
		icon: "/tokens/AAPL.png",
		decimals: 18,
		address: "0x0000000000000000000000000000000000000000AAPL",
	},
	{
		symbol: "TSLA",
		name: "Tesla Stock",
		icon: "/tokens/TSLA.png",
		decimals: 18,

		address: "0x0000000000000000000000000000000000000000TSLA",
	},
	{
		symbol: "MSFT",
		name: "Microsoft Stock",
		icon: "/tokens/MSFT.png",
		decimals: 18,

		address: "0x0000000000000000000000000000000000000000AAPL",
	},
] satisfies readonly Token[];

export const ALL_TOKENS = [...STABLECOINS, ...STOCKS] as const;
export type TokenSymbol = (typeof ALL_TOKENS)[number]["symbol"];
