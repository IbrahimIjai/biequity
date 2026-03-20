import { logger } from "../utils/logger";

// Simulated stock prices (USD)
const MOCK_PRICES: Record<string, number> = {
  AAPL: 214.29,
  TSLA: 247.15,
  MSFT: 415.82,
};

// In-memory request store — cleared on worker restart (acceptable for portfolio/demo)
const mockRequests: Map<string, MockTokenizationRequest> = new Map();

export interface MockTokenizationRequest {
  tokenization_request_id: string;
  created_at: string;
  updated_at: string;
  type: "mint" | "redeem";
  status: "pending" | "completed" | "rejected";
  underlying_symbol: string;
  token_symbol: string;
  qty: string;
  issuer: string;
  network: string;
  wallet_address: string;
  tx_hash?: string;
  fees: string;
}

/**
 * MockProviderService
 *
 * Simulates the Alpaca Brokerage API and Alpaca Instant Tokenization Network (ITN).
 * Used when MOCK_MODE=true — allows the project to run end-to-end without real credentials.
 *
 * In production, replace this with:
 *   - AlpacaService for brokerage orders
 *   - Direct calls to POST /v2/tokenization/mint on Alpaca's ITN
 *
 * The response shapes are intentionally identical to the real APIs so swapping is trivial.
 */
export class MockProviderService {
  /**
   * Simulate Alpaca market order placement.
   * Mirrors the shape of the real Alpaca /v2/orders response.
   */
  async placeMarketOrder(symbol: string, qty: string, side: "buy" | "sell") {
    await this.delay(120);

    const price = MOCK_PRICES[symbol] ?? 100;
    const orderId = this.uuid();

    logger.info(`[MOCK] Placed ${side} order`, { symbol, qty, orderId });

    return {
      id: orderId,
      client_order_id: this.uuid(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      filled_at: new Date().toISOString(),
      symbol,
      qty,
      filled_qty: qty,
      filled_avg_price: price.toFixed(2),
      side,
      type: "market",
      status: "filled",
      time_in_force: "day",
      extended_hours: false,
    };
  }

  /**
   * Simulate Alpaca ITN POST /v2/tokenization/mint
   * Creates a pending request, then auto-settles after 2s (simulates async ITN settlement).
   */
  async requestMint(
    symbol: string,
    qty: string,
    walletAddress: string
  ): Promise<MockTokenizationRequest> {
    await this.delay(80);

    const requestId = this.uuid();
    const request: MockTokenizationRequest = {
      tokenization_request_id: requestId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      type: "mint",
      status: "pending",
      underlying_symbol: symbol,
      token_symbol: `${symbol}x`,
      qty,
      issuer: "xstocks",
      network: "base-sepolia",
      wallet_address: walletAddress,
      fees: (parseFloat(qty) * 0.001).toFixed(6),
    };

    mockRequests.set(requestId, request);

    // Auto-complete after 2s — mirrors ITN's async settlement
    setTimeout(() => {
      const req = mockRequests.get(requestId);
      if (req) {
        req.status = "completed";
        req.tx_hash = `0x${this.randomHex(64)}`;
        req.updated_at = new Date().toISOString();
        logger.info(`[MOCK] Mint settled`, { requestId, symbol });
      }
    }, 2000);

    logger.info(`[MOCK] Mint request created`, { requestId, symbol, qty });
    return request;
  }

  /**
   * Simulate Alpaca ITN redeem (tokens sent to issuer redemption wallet → shares journaled back).
   */
  async requestRedeem(
    symbol: string,
    qty: string,
    walletAddress: string
  ): Promise<MockTokenizationRequest> {
    await this.delay(80);

    const requestId = this.uuid();
    const request: MockTokenizationRequest = {
      tokenization_request_id: requestId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      type: "redeem",
      status: "pending",
      underlying_symbol: symbol,
      token_symbol: `${symbol}x`,
      qty,
      issuer: "xstocks",
      network: "base-sepolia",
      wallet_address: walletAddress,
      fees: (parseFloat(qty) * 0.001).toFixed(6),
    };

    mockRequests.set(requestId, request);

    setTimeout(() => {
      const req = mockRequests.get(requestId);
      if (req) {
        req.status = "completed";
        req.tx_hash = `0x${this.randomHex(64)}`;
        req.updated_at = new Date().toISOString();
      }
    }, 2000);

    return request;
  }

  /** GET /v2/tokenization/requests equivalent */
  listRequests(): MockTokenizationRequest[] {
    return Array.from(mockRequests.values()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  /** GET /v2/tokenization/requests/:id equivalent */
  getRequest(id: string): MockTokenizationRequest | undefined {
    return mockRequests.get(id);
  }

  /** Mock price feed — returns static prices for AAPL, TSLA, MSFT */
  getStockPrice(symbol: string): {
    symbol: string;
    price: number;
    currency: string;
    change_pct: number;
  } {
    const basePrice = MOCK_PRICES[symbol] ?? 0;
    // Add tiny random noise to make it feel live
    const noise = (Math.random() - 0.5) * 0.5;
    return {
      symbol,
      price: parseFloat((basePrice + noise).toFixed(2)),
      currency: "USD",
      change_pct: parseFloat(((Math.random() - 0.5) * 2).toFixed(2)),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private uuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  private randomHex(length: number): string {
    return Array.from({ length }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  }
}
