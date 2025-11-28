import { Context } from "hono";
import { AlpacaService } from "../services/alpaca.service";
import { logger } from "../utils/logger";
import type { AssetStatus, AssetClass, Exchange } from "../types/alpaca.types";

/**
 * Supported stock symbols that we allow on the platform
 * This list should match the SUPPORTED_STOCK_SYMBOLS in the frontend
 */
const SUPPORTED_STOCK_SYMBOLS = ["AAPL", "TSLA", "MSFT"] as const;

/**
 * Controller for handling asset-related requests
 */
export class AssetsController {
	/**
	 * Get list of supported stocks from Alpaca API
	 * Filters assets to only return stocks that are in SUPPORTED_STOCK_SYMBOLS
	 */
	static async getSupportedStocks(c: Context) {
		try {
			logger.info("Fetching supported stocks", {
				supportedSymbols: SUPPORTED_STOCK_SYMBOLS,
			});

			const alpacaService = new AlpacaService(c.env);

			const allAssets = await alpacaService.getAssets({
				status: "active",
				asset_class: "us_equity",
			});

			const supportedAssets = allAssets.filter(
				(asset) =>
					asset.tradable &&
					SUPPORTED_STOCK_SYMBOLS.includes(
						asset.symbol as (typeof SUPPORTED_STOCK_SYMBOLS)[number],
					),
			);

			logger.info("Supported stocks filtered successfully", {
				totalAssets: allAssets.length,
				supportedAssets: supportedAssets.length,
				symbols: supportedAssets.map((a) => a.symbol),
			});

			return c.json(supportedAssets);
		} catch (error) {
			logger.error("Failed to fetch supported stocks", {
				error: error instanceof Error ? error.message : String(error),
			});

			return c.json(
				{
					error: "Failed to fetch supported stocks",
					message: error instanceof Error ? error.message : String(error),
				},
				500,
			);
		}
	}

	/**
	 * Get all assets with optional filtering (for admin/debugging)
	 */
	static async getAllAssets(c: Context) {
		try {
			const status = c.req.query("status") as AssetStatus | undefined;
			const assetClass = c.req.query("asset_class") as AssetClass | undefined;
			const exchange = c.req.query("exchange") as Exchange | undefined;

			logger.info("Fetching all assets", { status, assetClass, exchange });

			const alpacaService = new AlpacaService(c.env);

			const assets = await alpacaService.getAssets({
				status,
				asset_class: assetClass,
				exchange,
			});

			logger.info("Assets fetched successfully", {
				count: assets.length,
			});
			return c.json(assets);
		} catch (error) {
			logger.error("Failed to fetch assets", {
				error: error instanceof Error ? error.message : String(error),
			});

			return c.json(
				{
					error: "Failed to fetch assets",
					message: error instanceof Error ? error.message : String(error),
				},
				500,
			);
		}
	}
}
