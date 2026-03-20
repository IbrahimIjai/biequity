import { Asset } from "./asset.js";
import { Token } from "./token.js";
import type { AssetDefinition, TokenDefinition } from "./types.js";

export const BASE_SEPOLIA_CHAIN_ID = 84532;

export const TOKEN_CLASSES = ["stablecoin", "stock"] as const;
export const ASSET_CLASSES = ["fiat", "us_equity"] as const;

const STABLECOIN_DEFINITIONS: readonly TokenDefinition[] = [
  {
    chainId: BASE_SEPOLIA_CHAIN_ID,
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    decimals: 6,
    symbol: "USDC",
    name: "USD Coin",
    icon: "/tokens/usdc.png",
    feedId: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
    tokenClass: "stablecoin",
    assetClass: "fiat",
  },
];

const STOCK_DEFINITIONS: readonly TokenDefinition[] = [
  {
    chainId: BASE_SEPOLIA_CHAIN_ID,
    decimals: 18,
    symbol: "AAPL",
    name: "Apple Stock",
    icon: "/tokens/AAPL.png",
    feedId: "0x49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688",
    tokenClass: "stock",
    assetClass: "us_equity",
  },
  {
    chainId: BASE_SEPOLIA_CHAIN_ID,
    decimals: 18,
    symbol: "TSLA",
    name: "Tesla Stock",
    icon: "/tokens/TSLA.png",
    feedId: "0x16dad506d7db8da01c87581c87ca897a012a153557d4d578c3b9c9e1bc0632f1",
    tokenClass: "stock",
    assetClass: "us_equity",
  },
  {
    chainId: BASE_SEPOLIA_CHAIN_ID,
    decimals: 18,
    symbol: "MSFT",
    name: "Microsoft Stock",
    icon: "/tokens/MSFT.png",
    feedId: "0xd0ca23c1cc005e004ccf1db5bf76aeb6a49218f43dac3d4b275e92de12ded4d1",
    tokenClass: "stock",
    assetClass: "us_equity",
  },
];

export const STABLECOINS_LIST = STABLECOIN_DEFINITIONS.map((token) =>
  Token.fromJSON(token)
) as readonly Token[];

export const STOCKS_LIST = STOCK_DEFINITIONS.map((token) =>
  Token.fromJSON(token)
) as readonly Token[];

export const ALL_TOKENS_LIST = [...STABLECOINS_LIST, ...STOCKS_LIST] as const;

export const STABLECOINS_JSON = STABLECOINS_LIST.map((token) => token.toJSON()) as readonly TokenDefinition[];
export const STOCKS_JSON = STOCKS_LIST.map((token) => token.toJSON()) as readonly TokenDefinition[];
export const TOKEN_LIST_JSON = [...STABLECOINS_JSON, ...STOCKS_JSON] as const;

export const ASSET_LIST_JSON: readonly AssetDefinition[] = [
  {
    id: "alpaca:AAPL",
    symbol: "AAPL",
    name: "Apple Inc.",
    chainId: BASE_SEPOLIA_CHAIN_ID,
    decimals: 18,
    tokenClass: "stock",
    assetClass: "us_equity",
    exchange: "NASDAQ",
    status: "active",
    icon: "/tokens/AAPL.png",
    feedId: "0x49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688",
  },
  {
    id: "alpaca:TSLA",
    symbol: "TSLA",
    name: "Tesla Inc.",
    chainId: BASE_SEPOLIA_CHAIN_ID,
    decimals: 18,
    tokenClass: "stock",
    assetClass: "us_equity",
    exchange: "NASDAQ",
    status: "active",
    icon: "/tokens/TSLA.png",
    feedId: "0x16dad506d7db8da01c87581c87ca897a012a153557d4d578c3b9c9e1bc0632f1",
  },
  {
    id: "alpaca:MSFT",
    symbol: "MSFT",
    name: "Microsoft Corp.",
    chainId: BASE_SEPOLIA_CHAIN_ID,
    decimals: 18,
    tokenClass: "stock",
    assetClass: "us_equity",
    exchange: "NASDAQ",
    status: "active",
    icon: "/tokens/MSFT.png",
    feedId: "0xd0ca23c1cc005e004ccf1db5bf76aeb6a49218f43dac3d4b275e92de12ded4d1",
  },
];

export const ASSETS_LIST = ASSET_LIST_JSON.map((asset) => Asset.fromJSON(asset)) as readonly Asset[];

export const SUPPORTED_STOCK_SYMBOLS = STOCKS_JSON.map((stock) => stock.symbol) as readonly string[];
