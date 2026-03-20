
import { AlpacaService } from "../services/alpaca.service";
import { AlpacaAPIError } from "../utils/axios";
import { logger } from "../utils/logger";
import type { AccountActivity } from "../types/alpaca.types";

export async function exampleGetAllActivities(env: Env) {
	const alpacaService = new AlpacaService(env);

	try {
		const activities = await alpacaService.getAccountActivities();

		logger.info("All account activities", {
			count: activities.length,
			sample: activities.slice(0, 3).map((a) => ({
				id: a.id,
				type: a.activity_type,
				date: a.date,
				netAmount: a.net_amount,
				status: a.status,
			})),
		});

		return activities;
	} catch (error) {
		logger.error("Failed to get activities", {
			error: error instanceof AlpacaAPIError ? error.message : String(error),
		});
		throw error;
	}
}

export async function exampleGetTradeActivities(env: Env) {
	const alpacaService = new AlpacaService(env);

	try {
		const trades = await alpacaService.getTradeActivities({
			page_size: 50,
			direction: "desc",
		});

		logger.info("Trade activities", {
			count: trades.length,
			trades: trades.map((t) => ({
				id: t.id,
				type: t.activity_type,
				date: t.date,
				netAmount: t.net_amount,
				description: t.description,
			})),
		});

		return trades;
	} catch (error) {
		logger.error("Failed to get trade activities", {
			error: error instanceof AlpacaAPIError ? error.message : String(error),
		});
		throw error;
	}
}

export async function exampleGetNonTradeActivities(env: Env) {
	const alpacaService = new AlpacaService(env);

	try {
		const nonTrades = await alpacaService.getNonTradeActivities({
			page_size: 50,
		});

		logger.info("Non-trade activities", {
			count: nonTrades.length,
			activities: nonTrades.map((a) => ({
				type: a.activity_type,
				date: a.date,
				netAmount: a.net_amount,
				description: a.description,
			})),
		});

		return nonTrades;
	} catch (error) {
		logger.error("Failed to get non-trade activities", {
			error: error instanceof AlpacaAPIError ? error.message : String(error),
		});
		throw error;
	}
}

export async function exampleGetSpecificActivityTypes(env: Env) {
	const alpacaService = new AlpacaService(env);

	try {
		const dividendsAndInterest = await alpacaService.getAccountActivities({
			activity_types: ["DIV", "INT"],
			page_size: 100,
		});

		logger.info("Dividends and interest", {
			count: dividendsAndInterest.length,
			total: dividendsAndInterest.reduce(
				(sum, a) => sum + parseFloat(a.net_amount),
				0,
			),
		});

		const journals = await alpacaService.getAccountActivities({
			activity_types: ["JNLC", "JNLS"],
		});

		logger.info("Journal entries", {
			count: journals.length,
		});

		return {
			dividendsAndInterest,
			journals,
		};
	} catch (error) {
		logger.error("Failed to get specific activity types", {
			error: error instanceof AlpacaAPIError ? error.message : String(error),
		});
		throw error;
	}
}

export async function exampleGetActivitiesByDateRange(env: Env) {
	const alpacaService = new AlpacaService(env);

	try {
		const today = new Date();
		const thirtyDaysAgo = new Date(today);
		thirtyDaysAgo.setDate(today.getDate() - 30);

		const recentActivities = await alpacaService.getAccountActivities({
			after: thirtyDaysAgo.toISOString().split("T")[0], // YYYY-MM-DD
			direction: "desc",
		});

		logger.info("Activities from last 30 days", {
			count: recentActivities.length,
			dateRange: {
				from: thirtyDaysAgo.toISOString().split("T")[0],
				to: today.toISOString().split("T")[0],
			},
		});

		const todayActivities = await alpacaService.getAccountActivities({
			date: today.toISOString().split("T")[0],
		});

		logger.info("Activities for today", {
			count: todayActivities.length,
		});

		return {
			recentActivities,
			todayActivities,
		};
	} catch (error) {
		logger.error("Failed to get activities by date range", {
			error: error instanceof AlpacaAPIError ? error.message : String(error),
		});
		throw error;
	}
}

export async function examplePaginateActivities(env: Env) {
	const alpacaService = new AlpacaService(env);

	try {
		const allActivities: AccountActivity[] = [];
		let pageToken: string | null = null;
		let pageCount = 0;

		do {
			const { activities, nextPageToken } =
				await alpacaService.getActivitiesPage({
					page_size: 100,
					page_token: pageToken || undefined,
					direction: "desc",
				});

			allActivities.push(...activities);
			pageToken = nextPageToken;
			pageCount++;

			logger.info(`Fetched page ${pageCount}`, {
				activitiesInPage: activities.length,
				totalSoFar: allActivities.length,
				hasMore: !!nextPageToken,
			});

			if (pageCount >= 10) break;
		} while (pageToken);

		logger.info("All activities fetched", {
			totalActivities: allActivities.length,
			pages: pageCount,
		});

		return allActivities;
	} catch (error) {
		logger.error("Failed to paginate activities", {
			error: error instanceof AlpacaAPIError ? error.message : String(error),
		});
		throw error;
	}
}

export async function exampleCalculateDividends(env: Env) {
	const alpacaService = new AlpacaService(env);

	try {
		const dividends = await alpacaService.getAccountActivities({
			activity_types: ["DIV", "DIVFEE", "DIVFT", "DIVNRA", "DIVROC", "DIVTXEX"],
		});

		const totalDividends = dividends.reduce((sum, div) => {
			return sum + parseFloat(div.net_amount);
		}, 0);

		const bySymbol: Record<string, number> = {};
		dividends.forEach((div) => {
			const symbol = (div as any).symbol || "UNKNOWN";
			bySymbol[symbol] = (bySymbol[symbol] || 0) + parseFloat(div.net_amount);
		});

		logger.info("Dividend summary", {
			totalDividends: totalDividends.toFixed(2),
			count: dividends.length,
			bySymbol,
		});

		return {
			totalDividends,
			dividendCount: dividends.length,
			bySymbol,
			dividends,
		};
	} catch (error) {
		logger.error("Failed to calculate dividends", {
			error: error instanceof AlpacaAPIError ? error.message : String(error),
		});
		throw error;
	}
}

export async function exampleGetActivitySummary(env: Env) {
	const alpacaService = new AlpacaService(env);

	try {
		const activities = await alpacaService.getAccountActivities({
			page_size: 100,
		});

		const typeCount: Record<string, number> = {};
		const typeAmount: Record<string, number> = {};

		activities.forEach((activity) => {
			const type = activity.activity_type;
			typeCount[type] = (typeCount[type] || 0) + 1;
			typeAmount[type] =
				(typeAmount[type] || 0) + parseFloat(activity.net_amount);
		});

		const totalNetAmount = activities.reduce(
			(sum, a) => sum + parseFloat(a.net_amount),
			0,
		);

		logger.info("Activity summary", {
			totalActivities: activities.length,
			totalNetAmount: totalNetAmount.toFixed(2),
			byType: Object.entries(typeCount).map(([type, count]) => ({
				type,
				count,
				totalAmount: typeAmount[type].toFixed(2),
			})),
		});

		return {
			totalActivities: activities.length,
			totalNetAmount,
			typeCount,
			typeAmount,
		};
	} catch (error) {
		logger.error("Failed to get activity summary", {
			error: error instanceof AlpacaAPIError ? error.message : String(error),
		});
		throw error;
	}
}

export async function exampleMonitorRecentActivities(env: Env) {
	const alpacaService = new AlpacaService(env);

	try {
		let lastActivityId: string | null = null;

		const initialActivities = await alpacaService.getAccountActivities({
			page_size: 10,
			direction: "desc",
		});

		if (initialActivities.length > 0) {
			lastActivityId = initialActivities[0].id;
		}

		logger.info("Initial activities", {
			count: initialActivities.length,
			lastId: lastActivityId,
		});

		await new Promise((resolve) => setTimeout(resolve, 5000));

		const newActivities = await alpacaService.getAccountActivities({
			page_size: 100,
			direction: "desc",
		});

		const recentActivities = lastActivityId
			? newActivities.filter((a) => a.id > lastActivityId!)
			: newActivities;

		logger.info("New activities found", {
			count: recentActivities.length,
			activities: recentActivities.map((a) => ({
				id: a.id,
				type: a.activity_type,
				netAmount: a.net_amount,
			})),
		});

		return recentActivities;
	} catch (error) {
		logger.error("Failed to monitor activities", {
			error: error instanceof AlpacaAPIError ? error.message : String(error),
		});
		throw error;
	}
}
