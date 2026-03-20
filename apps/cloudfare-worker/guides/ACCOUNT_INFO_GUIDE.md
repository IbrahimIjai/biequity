# Alpaca Account Information Guide

This guide explains the `getAccount()` method and all the fields returned by the Alpaca API.

## Usage

```typescript
const alpacaService = new AlpacaService(env);
const account = await alpacaService.getAccount();
```

## Account Fields Reference

### Identity & Status

| Field            | Type   | Description                            |
| ---------------- | ------ | -------------------------------------- |
| `id`             | string | Account UUID                           |
| `account_number` | string | Account number (e.g., "PA3PV4WUCNCC")  |
| `status`         | string | Account status (e.g., "ACTIVE")        |
| `crypto_status`  | string | Crypto trading status (e.g., "ACTIVE") |
| `currency`       | string | Account currency (e.g., "USD")         |
| `created_at`     | string | Account creation timestamp             |

### Account Restrictions

| Field                     | Type    | Description                    |
| ------------------------- | ------- | ------------------------------ |
| `trading_blocked`         | boolean | Whether trading is blocked     |
| `transfers_blocked`       | boolean | Whether transfers are blocked  |
| `account_blocked`         | boolean | Whether account is blocked     |
| `trade_suspended_by_user` | boolean | Whether user suspended trading |

### Cash & Balances

| Field             | Type   | Description                             |
| ----------------- | ------ | --------------------------------------- |
| `cash`            | string | Cash balance available                  |
| `equity`          | string | Current equity value (cash + positions) |
| `last_equity`     | string | Previous day's equity                   |
| `portfolio_value` | string | Total portfolio value                   |
| `accrued_fees`    | string | Accrued fees                            |
| `balance_asof`    | string | Date of the balance snapshot            |

### Buying Power

| Field                         | Type   | Description                                    |
| ----------------------------- | ------ | ---------------------------------------------- |
| `buying_power`                | string | **Current buying power available for trading** |
| `regt_buying_power`           | string | Regulation T buying power                      |
| `daytrading_buying_power`     | string | Day trading buying power                       |
| `effective_buying_power`      | string | Effective buying power                         |
| `non_marginable_buying_power` | string | Non-marginable buying power                    |
| `options_buying_power`        | string | Options buying power                           |
| `bod_dtbp`                    | string | Beginning of day day trading buying power      |

### Position Values

| Field                   | Type   | Description                          |
| ----------------------- | ------ | ------------------------------------ |
| `long_market_value`     | string | Current long positions market value  |
| `short_market_value`    | string | Current short positions market value |
| `position_market_value` | string | Total position market value          |

### Margin Information

| Field                     | Type    | Description                                       |
| ------------------------- | ------- | ------------------------------------------------- |
| `initial_margin`          | string  | Initial margin requirement                        |
| `maintenance_margin`      | string  | Maintenance margin requirement                    |
| `last_maintenance_margin` | string  | Last maintenance margin                           |
| `multiplier`              | string  | Multiplier for margin accounts (e.g., "2" for 2x) |
| `sma`                     | string  | Special Memorandum Account balance                |
| `shorting_enabled`        | boolean | Whether shorting is enabled                       |

### Pattern Day Trading

| Field                | Type    | Description                                 |
| -------------------- | ------- | ------------------------------------------- |
| `pattern_day_trader` | boolean | Whether flagged as pattern day trader       |
| `daytrade_count`     | number  | Number of day trades in last 5 trading days |

### Options Trading

| Field                    | Type   | Description                  |
| ------------------------ | ------ | ---------------------------- |
| `options_approved_level` | number | Options approval level (0-3) |
| `options_trading_level`  | number | Options trading level (0-3)  |

### Crypto Trading

| Field         | Type   | Description       |
| ------------- | ------ | ----------------- |
| `crypto_tier` | number | Crypto tier level |

### Adjustments & Fees

| Field                  | Type   | Description                 |
| ---------------------- | ------ | --------------------------- |
| `intraday_adjustments` | string | Intraday adjustments        |
| `pending_reg_taf_fees` | string | Pending regulatory TAF fees |

### Configurations

| Field                  | Type         | Description                    |
| ---------------------- | ------------ | ------------------------------ |
| `admin_configurations` | object       | Admin configurations           |
| `user_configurations`  | object\|null | User configurations (nullable) |

## Key Fields for Trading

When checking if you can place an order, focus on these fields:

1. **`buying_power`** - Most important! This tells you how much you can spend
2. **`status`** - Should be "ACTIVE"
3. **`trading_blocked`** - Should be false
4. **`account_blocked`** - Should be false
5. **`cash`** - Available cash for non-margin trades

## Example: Check Before Trading

```typescript
const account = await alpacaService.getAccount();

// Check if account can trade
if (account.status !== "ACTIVE") {
	throw new Error(`Account status is ${account.status}`);
}

if (account.trading_blocked) {
	throw new Error("Trading is blocked");
}

if (parseFloat(account.buying_power) <= 0) {
	throw new Error("Insufficient buying power");
}

// Ready to trade!
console.log(`Available buying power: $${account.buying_power}`);
```

## Using the Trading Eligibility Helper

The service includes a helper method that does all the checks for you:

```typescript
const result = await alpacaService.checkTradingEligibility();

if (result.canTrade) {
	console.log("Ready to trade!");
	console.log(`Buying power: $${result.account.buying_power}`);
} else {
	console.error("Cannot trade:", result.reasons);
}
```

This method checks:

- ✅ Account status is ACTIVE
- ✅ Trading is not blocked
- ✅ Account is not blocked
- ✅ Buying power > 0

## Real API Response Example

```json
{
	"id": "bccb1e64-823c-4330-bc91-7ff5410c1eed",
	"account_number": "PA3PV4WUCNCC",
	"status": "ACTIVE",
	"crypto_status": "ACTIVE",
	"currency": "USD",
	"buying_power": "199722.04",
	"cash": "100000",
	"portfolio_value": "100000",
	"equity": "100000",
	"pattern_day_trader": false,
	"trading_blocked": false,
	"account_blocked": false,
	"multiplier": "2",
	"daytrade_count": 0
}
```

## Understanding Buying Power

**Buying Power** varies based on account type:

### Cash Account

- `buying_power` = `cash`
- No margin, no leverage
- Must have cash to buy

### Margin Account (2x)

- `buying_power` = `equity` × 2
- Can borrow up to equity value
- `multiplier` = "2"

### Pattern Day Trader (4x)

- `daytrading_buying_power` available
- Can use 4x leverage for day trades
- Must maintain minimum equity

## Common Scenarios

### Scenario 1: New Account

```json
{
	"cash": "100000",
	"buying_power": "200000",
	"equity": "100000",
	"multiplier": "2"
}
```

**Interpretation**: Cash account with $100k deposited. With 2x margin, can buy up to $200k worth of stock.

### Scenario 2: Active Trading

```json
{
	"cash": "50000",
	"buying_power": "75000",
	"equity": "150000",
	"long_market_value": "100000",
	"position_market_value": "100000"
}
```

**Interpretation**: $50k cash, $100k in positions, $150k total equity. Can still buy $75k more.

### Scenario 3: Restricted Account

```json
{
	"trading_blocked": true,
	"buying_power": "0",
	"status": "ACTIVE"
}
```

**Interpretation**: Account exists but trading is blocked. Cannot place orders.

## Error Handling

```typescript
try {
	const account = await alpacaService.getAccount();
} catch (error) {
	if (error instanceof AlpacaAPIError) {
		if (error.statusCode === 401 || error.statusCode === 403) {
			// Authentication issue
			console.error("Invalid API credentials");
		} else {
			console.error("API error:", error.message);
		}
	}
}
```

## Best Practices

1. **Cache account info** - Don't call on every order. Cache for 1-5 minutes.
2. **Check before trading** - Always verify buying power before placing orders
3. **Monitor restrictions** - Check `trading_blocked` and `account_blocked`
4. **Track day trades** - Monitor `daytrade_count` if under $25k equity
5. **Use the helper** - `checkTradingEligibility()` does validation for you

## Additional Resources

- [Alpaca Account API Docs](https://alpaca.markets/docs/api-references/trading-api/account/)
- [Understanding Buying Power](https://alpaca.markets/docs/trading/user-protections/#buying-power)
- [Pattern Day Trading](https://alpaca.markets/docs/trading/user-protections/#pattern-day-trading)
