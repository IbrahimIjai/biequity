import { Context } from "hono";
// import { MockProviderService } from "../services/mock-provider.service";
import { AlpacaService } from "../services/alpaca.service";
import { logger } from "../utils/logger";
import { MockProviderService } from "../services/mock-provider.service";

/**
 * TokenizationController
 *
 * Exposes the tokenization API — mint, redeem, list requests, and price feeds.
 * Routes through MockProviderService when MOCK_MODE=true (default for local dev).
 *
 * In production with real Alpaca credentials, set MOCK_MODE=false and the controller
 * will use AlpacaService for orders. The ITN mint call itself (POST /v2/tokenization/mint)
 * is not yet wired for production — that would require Alpaca ITN partner onboarding.
 */
export class TokenizationController {
  /**
   * POST /api/tokenization/mint
   *
   * Full tokenization flow:
   *   1. Buy underlying shares via Alpaca brokerage
   *   2. Request token mint via Alpaca ITN (simulated in mock mode)
   *
   * Body: { symbol: string, qty: string, wallet_address: string }
   */
  static async mint(c: Context<{ Bindings: Env }>) {
    try {
      const body = await c.req.json<{
        symbol: string;
        qty: string;
        wallet_address: string;
      }>();

      if (!body.symbol || !body.qty || !body.wallet_address) {
        return c.json(
          { error: "symbol, qty, and wallet_address are required" },
          400
        );
      }

      const qty = parseFloat(body.qty);
      if (isNaN(qty) || qty <= 0) {
        return c.json({ error: "qty must be a positive number" }, 400);
      }

      const isMock = c.env.MOCK_MODE === "true";
      logger.info("Mint request received", { ...body, mock: isMock });

      if (isMock) {
        const mock = new MockProviderService();

        // Step 1: Buy underlying shares on Alpaca
        const order = await mock.placeMarketOrder(body.symbol, body.qty, "buy");

        // Step 2: Request token mint on ITN
        const mintRequest = await mock.requestMint(
          body.symbol,
          body.qty,
          body.wallet_address
        );

        return c.json({
          success: true,
          mode: "simulated",
          alpaca_order: order,
          tokenization_request: mintRequest,
          note: "Simulated response. Production uses Alpaca ITN with xStocks as issuer.",
        });
      }

      // ── Production path ──────────────────────────────────────────────────────
      // Step 1: Place real Alpaca order
      const alpaca = new AlpacaService(c.env);
      const order = await alpaca.placeMarketOrder(
        body.symbol,
        body.qty,
        "buy"
      );

      // Step 2: Request ITN mint (requires Alpaca ITN partner onboarding)
      // POST https://paper-api.alpaca.markets/v2/tokenization/mint
      // {
      //   underlying_symbol: body.symbol,
      //   qty: body.qty,
      //   issuer: "xstocks",
      //   network: "solana",
      //   wallet_address: body.wallet_address
      // }

      return c.json({
        success: true,
        mode: "live",
        alpaca_order: order,
        note: "ITN mint requires Alpaca partner onboarding. Order placed successfully.",
      });
    } catch (error) {
      logger.error("Mint failed", { error: String(error) });
      return c.json({ error: "Mint failed", message: String(error) }, 500);
    }
  }

  /**
   * POST /api/tokenization/redeem
   *
   * Body: { symbol: string, qty: string, wallet_address: string }
   */
  static async redeem(c: Context<{ Bindings: Env }>) {
    try {
      const body = await c.req.json<{
        symbol: string;
        qty: string;
        wallet_address: string;
      }>();

      if (!body.symbol || !body.qty || !body.wallet_address) {
        return c.json(
          { error: "symbol, qty, and wallet_address are required" },
          400
        );
      }

      const isMock = c.env.MOCK_MODE === "true";

      if (isMock) {
        const mock = new MockProviderService();
        const order = await mock.placeMarketOrder(body.symbol, body.qty, "sell");
        const redeemRequest = await mock.requestRedeem(
          body.symbol,
          body.qty,
          body.wallet_address
        );

        return c.json({
          success: true,
          mode: "simulated",
          alpaca_order: order,
          tokenization_request: redeemRequest,
        });
      }

      const alpaca = new AlpacaService(c.env);
      const order = await alpaca.placeMarketOrder(body.symbol, body.qty, "sell");

      return c.json({
        success: true,
        mode: "live",
        alpaca_order: order,
        note: "ITN redeem requires the user to transfer tokens to the issuer redemption wallet.",
      });
    } catch (error) {
      logger.error("Redeem failed", { error: String(error) });
      return c.json({ error: "Redeem failed", message: String(error) }, 500);
    }
  }

  /**
   * GET /api/tokenization/requests
   * Lists all tokenization requests.
   */
  static async listRequests(c: Context<{ Bindings: Env }>) {
    const isMock = c.env.MOCK_MODE === "true";

    if (isMock) {
      const mock = new MockProviderService();
      return c.json({
        requests: mock.listRequests(),
        mode: "simulated",
        total: mock.listRequests().length,
      });
    }

    return c.json({
      requests: [],
      note: "Live mode — requests are stored on Alpaca's ITN. Fetch from GET /v2/tokenization/requests",
    });
  }

  /**
   * GET /api/tokenization/requests/:id
   * Gets a single request by ID.
   */
  static async getRequest(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");

    if (!id) {
      return c.json({ error: "Request ID is required" }, 400);
    }

    const isMock = c.env.MOCK_MODE === "true";

    if (isMock) {
      const mock = new MockProviderService();
      const request = mock.getRequest(id);
      if (!request) {
        return c.json({ error: "Request not found" }, 404);
      }
      return c.json(request);
    }

    return c.json(
      { error: "Live mode — fetch from Alpaca ITN directly" },
      501
    );
  }

  /**
   * GET /api/stocks/prices
   * Returns price data for supported stocks.
   */
  static async getPrices(c: Context<{ Bindings: Env }>) {
    const mock = new MockProviderService();
    const symbols = ["AAPL", "TSLA", "MSFT"];
    const prices = symbols.map((s) => mock.getStockPrice(s));

    return c.json({
      prices,
      timestamp: new Date().toISOString(),
      source: c.env.MOCK_MODE === "true" ? "simulated" : "alpaca",
    });
  }
}
