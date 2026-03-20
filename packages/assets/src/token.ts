import {
  formatUnits,
  getAddress,
  isAddress,
  isHash,
  parseUnits,
} from "viem";
import type { Address, FeedId, TokenDefinition } from "./types.js";

export class Token {
  public readonly chainId: number;
  public readonly symbol: string;
  public readonly name: string;
  public readonly decimals: number;
  public readonly tokenClass: TokenDefinition["tokenClass"];
  public readonly assetClass: TokenDefinition["assetClass"];
  public readonly address?: Address;
  public readonly icon?: string;
  public readonly feedId?: FeedId;

  constructor(definition: TokenDefinition) {
    this.chainId = definition.chainId;
    this.symbol = definition.symbol;
    this.name = definition.name;
    this.decimals = definition.decimals;
    this.tokenClass = definition.tokenClass;
    this.assetClass = definition.assetClass;
    this.icon = definition.icon;
    this.address = definition.address ? getAddress(definition.address) : undefined;
    this.feedId = definition.feedId;

    if (this.address && !isAddress(this.address)) {
      throw new Error(`Invalid token address for ${this.symbol}: ${this.address}`);
    }
    if (this.feedId && !isHash(this.feedId)) {
      throw new Error(`Invalid feed id for ${this.symbol}: ${this.feedId}`);
    }
  }

  public equals(other: Token): boolean {
    if (this.chainId !== other.chainId) return false;
    if (!this.address || !other.address) return this.symbol === other.symbol;
    return this.address.toLowerCase() === other.address.toLowerCase();
  }

  public formatAmount(amount: bigint): string {
    return formatUnits(amount, this.decimals);
  }

  public parseAmount(amount: string): bigint {
    return parseUnits(amount, this.decimals);
  }

  public static fromJSON(definition: TokenDefinition): Token {
    return new Token(definition);
  }

  public static isToken(other: unknown): other is Token {
    return other instanceof Token;
  }

  public sortsBefore(other: Token): boolean {
    if (this.chainId !== other.chainId) {
      throw new Error("Cannot compare tokens on different chains");
    }
    if (!this.address || !other.address) {
      return this.symbol.toLowerCase() < other.symbol.toLowerCase();
    }
    return this.address.toLowerCase() < other.address.toLowerCase();
  }

  public toJSON(): TokenDefinition {
    return {
      chainId: this.chainId,
      symbol: this.symbol,
      name: this.name,
      decimals: this.decimals,
      tokenClass: this.tokenClass,
      assetClass: this.assetClass,
      address: this.address,
      icon: this.icon,
      feedId: this.feedId,
    };
  }
}
