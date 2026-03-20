import {
  BASE_SEPOLIA_CHAIN_ID,
  STABLECOINS_JSON,
  STOCKS_JSON,
  TOKEN_LIST_JSON,
  SUPPORTED_STOCK_SYMBOLS,
  type TokenDefinition,
} from "@workspace/assets";

export type { FeedId } from "@workspace/assets";

export type Token = TokenDefinition;

export { BASE_SEPOLIA_CHAIN_ID, SUPPORTED_STOCK_SYMBOLS };

export const STABLECOINS = [...STABLECOINS_JSON] as Token[];
export const STOCKS = [...STOCKS_JSON] as Token[];
export const ALL_TOKENS = [...TOKEN_LIST_JSON] as Token[];

export type SupportedStockSymbol = (typeof SUPPORTED_STOCK_SYMBOLS)[number];
