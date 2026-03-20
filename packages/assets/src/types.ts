export type Address = `0x${string}`;
export type FeedId = `0x${string}`;

export type TokenClass = "stablecoin" | "stock";
export type AssetClass = "fiat" | "us_equity";

export interface TokenDefinition {
  chainId: number;
  symbol: string;
  name: string;
  decimals: number;
  tokenClass: TokenClass;
  assetClass: AssetClass;
  address?: Address;
  icon?: string;
  feedId?: FeedId;
}

export type AssetStatus = "active" | "inactive";

export interface AssetDefinition {
  id: string;
  symbol: string;
  name: string;
  chainId: number;
  decimals: number;
  tokenClass: TokenClass;
  assetClass: AssetClass;
  status: AssetStatus;
  exchange?: string;
  address?: Address;
  icon?: string;
  feedId?: FeedId;
}
