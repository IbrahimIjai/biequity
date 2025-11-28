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
 */
export interface AlpacaAccount {
	id: string;
	account_number: string;
	status: string;
	crypto_status: string;
	currency: string;
	buying_power: string;
	regt_buying_power: string;
	daytrading_buying_power: string;
	cash: string;
	portfolio_value: string;
	pattern_day_trader: boolean;
	trading_blocked: boolean;
	transfers_blocked: boolean;
	account_blocked: boolean;
	created_at: string;
	trade_suspended_by_user: boolean;
	multiplier: string;
	shorting_enabled: boolean;
	equity: string;
	last_equity: string;
	long_market_value: string;
	short_market_value: string;
	initial_margin: string;
	maintenance_margin: string;
	last_maintenance_margin: string;
	sma: string;
	daytrade_count: number;
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
