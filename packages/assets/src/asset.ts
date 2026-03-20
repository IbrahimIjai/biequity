import { getAddress, isAddress, isHash } from "viem";
import type { Address, AssetDefinition, FeedId } from "./types.js";

export class Asset {
  public readonly id: string;
  public readonly symbol: string;
  public readonly name: string;
  public readonly chainId: number;
  public readonly decimals: number;
  public readonly tokenClass: AssetDefinition["tokenClass"];
  public readonly assetClass: AssetDefinition["assetClass"];
  public readonly status: AssetDefinition["status"];
  public readonly exchange?: string;
  public readonly address?: Address;
  public readonly icon?: string;
  public readonly feedId?: FeedId;

  constructor(definition: AssetDefinition) {
    this.id = definition.id;
    this.symbol = definition.symbol;
    this.name = definition.name;
    this.chainId = definition.chainId;
    this.decimals = definition.decimals;
    this.tokenClass = definition.tokenClass;
    this.assetClass = definition.assetClass;
    this.status = definition.status;
    this.exchange = definition.exchange;
    this.address = definition.address ? getAddress(definition.address) : undefined;
    this.icon = definition.icon;
    this.feedId = definition.feedId;

    if (this.address && !isAddress(this.address)) {
      throw new Error(`Invalid asset address for ${this.symbol}: ${this.address}`);
    }
    if (this.feedId && !isHash(this.feedId)) {
      throw new Error(`Invalid feed id for ${this.symbol}: ${this.feedId}`);
    }
  }

  public toJSON(): AssetDefinition {
    return {
      id: this.id,
      symbol: this.symbol,
      name: this.name,
      chainId: this.chainId,
      decimals: this.decimals,
      tokenClass: this.tokenClass,
      assetClass: this.assetClass,
      status: this.status,
      exchange: this.exchange,
      address: this.address,
      icon: this.icon,
      feedId: this.feedId,
    };
  }

  public static fromJSON(definition: AssetDefinition): Asset {
    return new Asset(definition);
  }
}
