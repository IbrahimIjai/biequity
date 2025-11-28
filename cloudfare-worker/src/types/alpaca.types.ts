/**
 * Alpaca API Types for Order Management
 */

export type OrderSide = "buy" | "sell";

export type OrderType =
	| "market"
	| "limit"
	| "stop"
	| "stop_limit"
	| "trailing_stop";

export type TimeInForce = "day" | "gtc" | "opg" | "cls" | "ioc" | "fok";

export type OrderClass = "" | "simple" | "bracket" | "oco" | "oto" | "mleg";

export type PositionIntent =
	| "buy_to_open"
	| "buy_to_close"
	| "sell_to_open"
	| "sell_to_close";

export type OrderStatus =
	| "new"
	| "partially_filled"
	| "filled"
	| "done_for_day"
	| "canceled"
	| "expired"
	| "replaced"
	| "pending_cancel"
	| "pending_replace"
	| "accepted"
	| "pending_new"
	| "accepted_for_bidding"
	| "stopped"
	| "rejected"
	| "suspended"
	| "calculated";

/**
 * Request payload for creating a market order
 */
export interface CreateMarketOrderRequest {
	symbol: string;
	qty?: string;
	notional?: string;
	side: OrderSide;
	type: "market";
	time_in_force: TimeInForce;
	extended_hours?: boolean;
	client_order_id?: string;
	order_class?: OrderClass;
	position_intent?: PositionIntent;
}

/**
 * Request payload for creating a limit order
 */
export interface CreateLimitOrderRequest {
	symbol: string;
	qty?: string;
	notional?: string;
	side: OrderSide;
	type: "limit";
	time_in_force: TimeInForce;
	limit_price: string;
	extended_hours?: boolean;
	client_order_id?: string;
	order_class?: OrderClass;
	position_intent?: PositionIntent;
}

/**
 * General order request (union of all order types)
 */
export type CreateOrderRequest =
	| CreateMarketOrderRequest
	| CreateLimitOrderRequest;

/**
 * Response from Alpaca API when creating an order
 */
export interface OrderResponse {
	id: string;
	client_order_id: string;
	created_at: string;
	updated_at: string;
	submitted_at: string;
	filled_at: string | null;
	expired_at: string | null;
	canceled_at: string | null;
	failed_at: string | null;
	replaced_at: string | null;
	replaced_by: string | null;
	replaces: string | null;
	asset_id: string;
	symbol: string;
	asset_class: string;
	notional: string | null;
	qty: string;
	filled_qty: string;
	filled_avg_price: string | null;
	order_class: string;
	order_type: OrderType;
	type: OrderType;
	side: OrderSide;
	position_intent: PositionIntent | null;
	time_in_force: TimeInForce;
	limit_price: string | null;
	stop_price: string | null;
	status: OrderStatus;
	extended_hours: boolean;
	legs: any[] | null;
	trail_percent: string | null;
	trail_price: string | null;
	hwm: string | null;
	subtag: string | null;
	source: string | null;
	expires_at: string | null;
}

/**
 * Alpaca Account information
 * Complete response from GET /v2/account
 */
export interface AlpacaAccount {
	/** Account UUID */
	id: string;
	/** Account number */
	account_number: string;
	/** Account status (e.g., "ACTIVE") */
	status: string;
	/** Crypto trading status (e.g., "ACTIVE") */
	crypto_status: string;
	/** Account currency (e.g., "USD") */
	currency: string;
	/** Current buying power available for trading */
	buying_power: string;
	/** Regulation T buying power */
	regt_buying_power: string;
	/** Day trading buying power */
	daytrading_buying_power: string;
	/** Effective buying power */
	effective_buying_power: string;
	/** Non-marginable buying power */
	non_marginable_buying_power: string;
	/** Options buying power */
	options_buying_power: string;
	/** Beginning of day day trading buying power */
	bod_dtbp: string;
	/** Cash balance */
	cash: string;
	/** Accrued fees */
	accrued_fees: string;
	/** Total portfolio value (cash + positions) */
	portfolio_value: string;
	/** Whether account is flagged as pattern day trader */
	pattern_day_trader: boolean;
	/** Whether trading is blocked */
	trading_blocked: boolean;
	/** Whether transfers are blocked */
	transfers_blocked: boolean;
	/** Whether account is blocked */
	account_blocked: boolean;
	/** Account creation timestamp */
	created_at: string;
	/** Whether trading is suspended by user */
	trade_suspended_by_user: boolean;
	/** Multiplier for margin accounts */
	multiplier: string;
	/** Whether shorting is enabled */
	shorting_enabled: boolean;
	/** Current equity value */
	equity: string;
	/** Previous day's equity */
	last_equity: string;
	/** Current long market value */
	long_market_value: string;
	/** Current short market value */
	short_market_value: string;
	/** Total position market value */
	position_market_value: string;
	/** Initial margin requirement */
	initial_margin: string;
	/** Maintenance margin requirement */
	maintenance_margin: string;
	/** Last maintenance margin */
	last_maintenance_margin: string;
	/** Special Memorandum Account balance */
	sma: string;
	/** Number of day trades in the last 5 trading days */
	daytrade_count: number;
	/** Date of the balance snapshot */
	balance_asof: string;
	/** Crypto tier level */
	crypto_tier: number;
	/** Intraday adjustments */
	intraday_adjustments: string;
	/** Pending regulatory TAF fees */
	pending_reg_taf_fees: string;
	/** Options approved level */
	options_approved_level: number;
	/** Options trading level */
	options_trading_level: number;
	/** Admin configurations object */
	admin_configurations: Record<string, any>;
	/** User configurations object (nullable) */
	user_configurations: Record<string, any> | null;
}

/**
 * Alpaca Position information
 */
export interface AlpacaPosition {
	asset_id: string;
	symbol: string;
	exchange: string;
	asset_class: string;
	avg_entry_price: string;
	qty: string;
	side: "long" | "short";
	market_value: string;
	cost_basis: string;
	unrealized_pl: string;
	unrealized_plpc: string;
	unrealized_intraday_pl: string;
	unrealized_intraday_plpc: string;
	current_price: string;
	lastday_price: string;
	change_today: string;
}
