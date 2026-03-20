import { Context } from "hono";
import { AlpacaService } from "../services/alpaca.service";
import { logger } from "../utils/logger";
import type {
	AssetStatus,
	AssetClass,
	Exchange,
	AlpacaAsset,
} from "../types/alpaca.types";

const SUPPORTED_STOCK_SYMBOLS = ["AAPL", "TSLA", "MSFT"] as const;

const MOCK_ASSETS: AlpacaAsset[] = [
	{
		id: "mock-aapl",
		class: "us_equity",
		exchange: "NASDAQ",
		symbol: "AAPL",
		name: "Apple Inc.",
		status: "active",
		tradable: true,
		marginable: true,
		maintenance_margin_requirement: 30,
		margin_requirement_long: "30",
		margin_requirement_short: "30",
		shortable: true,
		easy_to_borrow: true,
		fractionable: true,
		attributes: [],
	},
	{
		id: "mock-tsla",
		class: "us_equity",
		exchange: "NASDAQ",
		symbol: "TSLA",
		name: "Tesla Inc.",
		status: "active",
		tradable: true,
		marginable: true,
		maintenance_margin_requirement: 30,
		margin_requirement_long: "30",
		margin_requirement_short: "30",
		shortable: true,
		easy_to_borrow: true,
		fractionable: true,
		attributes: [],
	},
	{
		id: "mock-msft",
		class: "us_equity",
		exchange: "NASDAQ",
		symbol: "MSFT",
		name: "Microsoft Corp.",
		status: "active",
		tradable: true,
		marginable: true,
		maintenance_margin_requirement: 30,
		margin_requirement_long: "30",
		margin_requirement_short: "30",
		shortable: true,
		easy_to_borrow: true,
		fractionable: true,
		attributes: [],
	},
];

export class AssetsController {
	private static isMockMode(c: Context): boolean {
		return String((c.env as Record<string, unknown>).MOCK_MODE) === "true";
	}

	static async getSupportedStocks(c: Context) {
		try {
			logger.info("Fetching supported stocks", {
				supportedSymbols: SUPPORTED_STOCK_SYMBOLS,
			});

			if (AssetsController.isMockMode(c)) {
				const supportedAssets = MOCK_ASSETS.filter((asset) =>
					SUPPORTED_STOCK_SYMBOLS.includes(
						asset.symbol as (typeof SUPPORTED_STOCK_SYMBOLS)[number],
					),
				);
				return c.json(supportedAssets);
			}

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

	static async getAllAssets(c: Context) {
		try {
			const status = c.req.query("status") as AssetStatus | undefined;
			const assetClass = c.req.query("asset_class") as AssetClass | undefined;
			const exchange = c.req.query("exchange") as Exchange | undefined;

			logger.info("Fetching all assets", { status, assetClass, exchange });

			if (AssetsController.isMockMode(c)) {
				const assets = MOCK_ASSETS.filter((asset) => {
					if (status && asset.status !== status) return false;
					if (assetClass && asset.class !== assetClass) return false;
					if (exchange && asset.exchange !== exchange) return false;
					return true;
				});
				return c.json(assets);
			}

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
