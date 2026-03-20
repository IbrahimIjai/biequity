export type FeedId = `0x${string}`;

export type Token = {
	symbol: string;
	name: string;
	icon: string;
	decimals: number;
	address?: string;
	feedId?: FeedId;
};

export const STABLECOINS = [
	{
		symbol: "USDC",
		name: "USD Coin",
		icon: "/tokens/usdc.png",
		decimals: 6,
		address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
		feedId:
			"0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
	},
] satisfies readonly Token[];

export const STOCKS = [
	{
		symbol: "AAPL",
		name: "Apple Stock",
		icon: "/tokens/AAPL.png",
		decimals: 18,
		address: "0x0000000000000000000000000000000000000000AAPL",
		feedId:
			"0x49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688",
	},
	{
		symbol: "TSLA",
		name: "Tesla Stock",
		icon: "/tokens/TSLA.png",
		decimals: 18,

		address: "0x0000000000000000000000000000000000000000TSLA",
		feedId:
			"0x16dad506d7db8da01c87581c87ca897a012a153557d4d578c3b9c9e1bc0632f1",
	},
	{
		symbol: "MSFT",
		name: "Microsoft Stock",
		icon: "/tokens/MSFT.png",
		decimals: 18,

		address: "0x0000000000000000000000000000000000000000AAPL",
		feedId:
			"0xd0ca23c1cc005e004ccf1db5bf76aeb6a49218f43dac3d4b275e92de12ded4d1",
	},
] satisfies readonly Token[];

export const ALL_TOKENS = [...STABLECOINS, ...STOCKS] as const;
export type TokenSymbol = (typeof ALL_TOKENS)[number]["symbol"];

/**
 * Supported stock symbols that we currently support on the platform
 * This list is used to filter the stocks from the Alpaca API
 */
export const SUPPORTED_STOCK_SYMBOLS = ["AAPL", "TSLA", "MSFT"] as const;
export type SupportedStockSymbol = (typeof SUPPORTED_STOCK_SYMBOLS)[number];
