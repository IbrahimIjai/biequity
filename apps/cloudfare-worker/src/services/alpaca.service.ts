import { logger } from "../utils/logger";
import type {
	AlpacaAccount,
	AlpacaAsset,
	AlpacaPosition,
	AccountActivity,
	GetActivitiesParams,
	GetAssetsParams,
	OrderResponse,
	OrderSide,
	TimeInForce,
} from "../types/alpaca.types";

const DUMMY_ASSETS: AlpacaAsset[] = [
	{
		id: "dummy-aapl",
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
		id: "dummy-tsla",
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
		id: "dummy-msft",
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

const DUMMY_ACCOUNT: AlpacaAccount = {
	id: "dummy-account-id",
	account_number: "DUMMY-0001",
	status: "ACTIVE",
	crypto_status: "ACTIVE",
	currency: "USD",
	buying_power: "1000000",
	regt_buying_power: "1000000",
	daytrading_buying_power: "1000000",
	effective_buying_power: "1000000",
	non_marginable_buying_power: "1000000",
	options_buying_power: "1000000",
	bod_dtbp: "1000000",
	cash: "1000000",
	accrued_fees: "0",
	portfolio_value: "1000000",
	pattern_day_trader: false,
	trading_blocked: false,
	transfers_blocked: false,
	account_blocked: false,
	created_at: new Date().toISOString(),
	trade_suspended_by_user: false,
	multiplier: "1",
	shorting_enabled: true,
	equity: "1000000",
	last_equity: "1000000",
	long_market_value: "0",
	short_market_value: "0",
	position_market_value: "0",
	initial_margin: "0",
	maintenance_margin: "0",
	last_maintenance_margin: "0",
	sma: "0",
	daytrade_count: 0,
	balance_asof: new Date().toISOString(),
	crypto_tier: 1,
	intraday_adjustments: "0",
	pending_reg_taf_fees: "0",
	options_approved_level: 0,
	options_trading_level: 0,
	admin_configurations: {},
	user_configurations: {},
};

const ordersByClientOrderId = new Map<string, OrderResponse>();

function makeId(prefix: string) {
	return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

function makeOrder(params: {
	symbol: string;
	qty: string;
	side: OrderSide;
	clientOrderId?: string;
	timeInForce: TimeInForce;
}): OrderResponse {
	const now = new Date().toISOString();
	return {
		id: makeId("order"),
		client_order_id: params.clientOrderId ?? makeId("client"),
		created_at: now,
		updated_at: now,
		submitted_at: now,
		filled_at: now,
		expired_at: null,
		canceled_at: null,
		failed_at: null,
		replaced_at: null,
		replaced_by: null,
		replaces: null,
		asset_id: makeId("asset"),
		symbol: params.symbol.toUpperCase(),
		asset_class: "us_equity",
		notional: null,
		qty: params.qty,
		filled_qty: params.qty,
		filled_avg_price: "100.00",
		order_class: "simple",
		order_type: "market",
		type: "market",
		side: params.side,
		position_intent: null,
		time_in_force: params.timeInForce,
		limit_price: null,
		stop_price: null,
		status: "filled",
		extended_hours: false,
		legs: null,
		trail_percent: null,
		trail_price: null,
		hwm: null,
		subtag: null,
		source: "dummy",
		expires_at: null,
	};
}

export class AlpacaService {
	constructor(_env: Env) {}

	async getAccount(): Promise<AlpacaAccount> {
		logger.info("[DUMMY ALPACA] getAccount");
		return DUMMY_ACCOUNT;
	}

	async checkTradingEligibility(): Promise<{
		canTrade: boolean;
		reasons: string[];
		account: AlpacaAccount;
	}> {
		logger.info("[DUMMY ALPACA] checkTradingEligibility");
		return {
			canTrade: true,
			reasons: [],
			account: DUMMY_ACCOUNT,
		};
	}

	async placeMarketOrder(
		symbol: string,
		qty: string,
		side: OrderSide,
		timeInForce: TimeInForce = "day",
		_extendedHours = false,
		clientOrderId?: string,
	): Promise<OrderResponse> {
		const order = makeOrder({
			symbol,
			qty,
			side,
			clientOrderId,
			timeInForce,
		});

		ordersByClientOrderId.set(order.client_order_id, order);
		logger.info("[DUMMY ALPACA] placeMarketOrder", {
			symbol,
			qty,
			side,
			clientOrderId: order.client_order_id,
		});

		return order;
	}

	async getOrderByClientOrderId(
		clientOrderId: string,
	): Promise<OrderResponse | null> {
		logger.info("[DUMMY ALPACA] getOrderByClientOrderId", { clientOrderId });
		return ordersByClientOrderId.get(clientOrderId) ?? null;
	}

	async getPosition(symbol: string): Promise<AlpacaPosition | null> {
		logger.info("[DUMMY ALPACA] getPosition", { symbol });
		return {
			asset_id: makeId("asset"),
			symbol: symbol.toUpperCase(),
			exchange: "NASDAQ",
			asset_class: "us_equity",
			avg_entry_price: "100.00",
			qty: "0",
			side: "long",
			market_value: "0",
			cost_basis: "0",
			unrealized_pl: "0",
			unrealized_plpc: "0",
			unrealized_intraday_pl: "0",
			unrealized_intraday_plpc: "0",
			current_price: "100.00",
			lastday_price: "100.00",
			change_today: "0",
		};
	}

	async getAllPositions(): Promise<AlpacaPosition[]> {
		logger.info("[DUMMY ALPACA] getAllPositions");
		return [];
	}

	async getAssets(params?: GetAssetsParams): Promise<AlpacaAsset[]> {
		logger.info("[DUMMY ALPACA] getAssets", { params });
		return DUMMY_ASSETS.filter((asset) => {
			if (params?.status && asset.status !== params.status) return false;
			if (params?.asset_class && asset.class !== params.asset_class) return false;
			if (params?.exchange && asset.exchange !== params.exchange) return false;
			return true;
		});
	}

	async getAccountActivities(
		_params?: GetActivitiesParams,
	): Promise<AccountActivity[]> {
		logger.info("[DUMMY ALPACA] getAccountActivities");
		return [];
	}

	async getTradeActivities(
		_params?: Omit<GetActivitiesParams, "category" | "activity_types">,
	): Promise<AccountActivity[]> {
		logger.info("[DUMMY ALPACA] getTradeActivities");
		return [];
	}

	async getNonTradeActivities(
		_params?: Omit<GetActivitiesParams, "category" | "activity_types">,
	): Promise<AccountActivity[]> {
		logger.info("[DUMMY ALPACA] getNonTradeActivities");
		return [];
	}

	async getActivitiesPage(_params?: GetActivitiesParams): Promise<{
		activities: AccountActivity[];
		nextPageToken: string | null;
	}> {
		logger.info("[DUMMY ALPACA] getActivitiesPage");
		return {
			activities: [],
			nextPageToken: null,
		};
	}
}
