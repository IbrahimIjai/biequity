# Alpaca Account Activities API Guide

Complete guide to retrieving and working with account activities (trades, transfers, dividends, etc.).

## Overview

The Account Activities API provides a complete history of all account events including:

- **Trade Activities**: Order fills, executions
- **Non-Trade Activities**: Transfers, dividends, interest, fees, corporate actions

## Basic Usage

### Get All Activities

```typescript
const alpacaService = new AlpacaService(env);

// Get recent activities (default: 100, descending order)
const activities = await alpacaService.getAccountActivities();

console.log(`Total activities: ${activities.length}`);
```

### Get Trade Activities Only

```typescript
// Convenience method for trade-related activities
const trades = await alpacaService.getTradeActivities();

trades.forEach((trade) => {
	console.log(`${trade.activity_type} - ${trade.net_amount}`);
});
```

### Get Non-Trade Activities

```typescript
// Dividends, transfers, fees, etc.
const nonTrades = await alpacaService.getNonTradeActivities();

console.log(`Non-trade activities: ${nonTrades.length}`);
```

## Filtering Options

### By Activity Category

```typescript
// Trade activities (fills only)
const trades = await alpacaService.getAccountActivities({
	category: "trade_activity",
});

// Non-trade activities (everything else)
const nonTrades = await alpacaService.getAccountActivities({
	category: "non_trade_activity",
});
```

### By Specific Activity Types

```typescript
// Get only dividends
const dividends = await alpacaService.getAccountActivities({
	activity_types: ["DIV"],
});

// Get dividends and interest
const income = await alpacaService.getAccountActivities({
	activity_types: ["DIV", "INT"],
});

// Get journal entries
const journals = await alpacaService.getAccountActivities({
	activity_types: ["JNLC", "JNLS"],
});
```

**Available Activity Types:**

**Trade Activities:**

- `FILL` - Order fill/execution

**Transfer Activities:**

- `TRANS` - Cash transfer
- `ACATC` - ACAT transfer (cash)
- `ACATS` - ACAT transfer (securities)
- `JNLC` - Journal entry (cash)
- `JNLS` - Journal entry (securities)

**Dividend Activities:**

- `DIV` - Dividend
- `DIVCGL` - Dividend (capital gains - long term)
- `DIVCGS` - Dividend (capital gains - short term)
- `DIVFEE` - Dividend fee
- `DIVFT` - Dividend (foreign tax)
- `DIVNRA` - Dividend (non-resident alien tax)
- `DIVROC` - Dividend (return of capital)
- `DIVTW` - Dividend (tax-free)
- `DIVTXEX` - Dividend (tax-exempt)

**Interest:**

- `INT` - Interest

**Corporate Actions:**

- `REORG` - Reorganization
- `SPIN` - Spinoff
- `SPLIT` - Stock split

**Options:**

- `OPASN` - Option assignment
- `OPEXP` - Option expiration
- `OPXRC` - Option exercise

**Fees:**

- `MISC` - Miscellaneous
- `FEE` - Fee

**Margin:**

- `MA` - Margin interest
- `NC` - Name change
- `PTC` - Pass-through charge
- `PTR` - Pass-through rebate

**Other:**

- `CSD` - Cash disbursement
- `CSR` - Cash receipt

### By Date Range

```typescript
// Activities from last 30 days
const recentActivities = await alpacaService.getAccountActivities({
	after: "2025-10-29", // YYYY-MM-DD format
	direction: "desc",
});

// Activities before a specific date
const oldActivities = await alpacaService.getAccountActivities({
	until: "2025-01-01",
});

// Activities between dates
const rangeActivities = await alpacaService.getAccountActivities({
	after: "2025-01-01",
	until: "2025-12-31",
});

// Activities for specific date
const todayActivities = await alpacaService.getAccountActivities({
	date: "2025-11-28",
});
```

**Date Format Options:**

- `YYYY-MM-DD` - Date only (e.g., "2025-11-28")
- `YYYY-MM-DDTHH:MM:SSZ` - Full ISO format (e.g., "2025-11-28T12:00:00Z")

### By Direction (Sort Order)

```typescript
// Descending (newest first) - DEFAULT
const newest = await alpacaService.getAccountActivities({
	direction: "desc",
});

// Ascending (oldest first)
const oldest = await alpacaService.getAccountActivities({
	direction: "asc",
});
```

### With Page Size

```typescript
// Get only 10 most recent
const recent = await alpacaService.getAccountActivities({
	page_size: 10,
	direction: "desc",
});

// Get maximum (100)
const max = await alpacaService.getAccountActivities({
	page_size: 100,
});
```

**Page Size:**

- Range: 1-100
- Default: 100

## Pagination

### Manual Pagination

```typescript
// First page
const page1 = await alpacaService.getAccountActivities({
	page_size: 50,
});

// Get last activity ID for next page token
const lastActivityId = page1[page1.length - 1].id;

// Second page
const page2 = await alpacaService.getAccountActivities({
	page_size: 50,
	page_token: lastActivityId,
});
```

### Using Pagination Helper

```typescript
const { activities, nextPageToken } = await alpacaService.getActivitiesPage({
	page_size: 100,
});

console.log(`Got ${activities.length} activities`);
console.log(`Next page token: ${nextPageToken}`);

// Fetch next page
if (nextPageToken) {
	const nextPage = await alpacaService.getActivitiesPage({
		page_size: 100,
		page_token: nextPageToken,
	});
}
```

### Fetch All Activities (Loop)

```typescript
const allActivities = [];
let pageToken = null;

do {
	const { activities, nextPageToken } = await alpacaService.getActivitiesPage({
		page_size: 100,
		page_token: pageToken || undefined,
	});

	allActivities.push(...activities);
	pageToken = nextPageToken;

	console.log(`Fetched ${activities.length}, total: ${allActivities.length}`);
} while (pageToken);

console.log(`Total activities: ${allActivities.length}`);
```

## Activity Properties

Each activity includes:

```typescript
interface AccountActivity {
	id: string; // Activity ID (used for pagination)
	activity_type: ActivityType; // Type of activity
	date: string; // Date (YYYY-MM-DD)
	created_at: string; // Timestamp (ISO format)
	net_amount: string; // Net dollar amount
	description: string; // Activity description
	status: ActivityStatus; // executed | pending | canceled | rejected
}
```

**Trade Activities** (FILL type) have additional fields:

```typescript
interface TradeActivity extends AccountActivity {
	symbol: string; // Stock symbol
	qty: string; // Quantity traded
	price: string; // Price per share
	side: "buy" | "sell"; // Trade side
	order_id: string; // Related order ID
	transaction_type: string; // Transaction type
}
```

## Common Use Cases

### 1. Calculate Total Dividends

```typescript
const dividends = await alpacaService.getAccountActivities({
	activity_types: ["DIV", "DIVFEE", "DIVFT", "DIVNRA"],
});

const totalDividends = dividends.reduce((sum, div) => {
	return sum + parseFloat(div.net_amount);
}, 0);

console.log(`Total dividends: $${totalDividends.toFixed(2)}`);
```

### 2. Get Today's Trade Summary

```typescript
const today = new Date().toISOString().split("T")[0];

const todayTrades = await alpacaService.getTradeActivities({
	date: today,
});

const tradesCount = todayTrades.length;
const totalVolume = todayTrades.reduce((sum, t) => {
	return sum + Math.abs(parseFloat(t.net_amount));
}, 0);

console.log(`Today: ${tradesCount} trades, $${totalVolume.toFixed(2)} volume`);
```

### 3. Track Account Cash Flow

```typescript
// Get all cash movements
const cashActivities = await alpacaService.getAccountActivities({
	activity_types: ["TRANS", "JNLC", "DIV", "INT"],
});

const deposits = cashActivities.filter((a) => parseFloat(a.net_amount) > 0);
const withdrawals = cashActivities.filter((a) => parseFloat(a.net_amount) < 0);

const totalDeposits = deposits.reduce(
	(sum, d) => sum + parseFloat(d.net_amount),
	0,
);
const totalWithdrawals = withdrawals.reduce(
	(sum, w) => sum + parseFloat(w.net_amount),
	0,
);

console.log(`Deposits: $${totalDeposits.toFixed(2)}`);
console.log(`Withdrawals: $${Math.abs(totalWithdrawals).toFixed(2)}`);
```

### 4. Monitor Recent Activity

```typescript
// Poll for new activities every 30 seconds
setInterval(async () => {
	const activities = await alpacaService.getAccountActivities({
		page_size: 10,
		direction: "desc",
	});

	// Check for new activities since last check
	activities.forEach((activity) => {
		console.log(
			`New activity: ${activity.activity_type} - ${activity.net_amount}`,
		);
	});
}, 30000);
```

### 5. Generate Activity Report

```typescript
const activities = await alpacaService.getAccountActivities({
	after: "2025-01-01",
	page_size: 100,
});

// Group by type
const byType = activities.reduce((acc, activity) => {
	const type = activity.activity_type;
	acc[type] = acc[type] || [];
	acc[type].push(activity);
	return acc;
}, {});

// Generate report
Object.entries(byType).forEach(([type, activities]) => {
	const total = activities.reduce(
		(sum, a) => sum + parseFloat(a.net_amount),
		0,
	);
	console.log(`${type}: ${activities.length} activities, $${total.toFixed(2)}`);
});
```

## Real API Response Example

```json
[
	{
		"id": "20250924000000000::81f95331-f38b-4cf7-a579-b3397cc00e4d",
		"activity_type": "JNLC",
		"date": "2025-09-24",
		"created_at": "2025-09-25T08:21:08.58241Z",
		"net_amount": "100000",
		"description": "",
		"status": "executed"
	}
]
```

## Error Handling

```typescript
try {
	const activities = await alpacaService.getAccountActivities();
} catch (error) {
	if (error instanceof AlpacaAPIError) {
		if (error.statusCode === 401 || error.statusCode === 403) {
			console.error("Authentication failed");
		} else if (error.statusCode === 422) {
			console.error("Invalid parameters:", error.message);
		} else {
			console.error("API error:", error.message);
		}
	}
}
```

## Best Practices

### 1. Use Pagination for Large Datasets

```typescript
// DON'T: Try to fetch all at once (may be thousands)
const allActivities = await alpacaService.getAccountActivities();

// DO: Paginate through results
let activities = [];
let pageToken = null;
do {
	const page = await alpacaService.getActivitiesPage({
		page_size: 100,
		page_token: pageToken,
	});
	activities.push(...page.activities);
	pageToken = page.nextPageToken;
} while (pageToken && activities.length < 1000); // Limit to prevent infinite loops
```

### 2. Filter Early

```typescript
// DON'T: Fetch all then filter in code
const all = await alpacaService.getAccountActivities();
const dividends = all.filter((a) => a.activity_type === "DIV");

// DO: Filter via API
const dividends = await alpacaService.getAccountActivities({
	activity_types: ["DIV"],
});
```

### 3. Use Date Ranges

```typescript
// DON'T: Fetch entire history
const activities = await alpacaService.getAccountActivities();

// DO: Limit to relevant period
const activities = await alpacaService.getAccountActivities({
	after: "2025-11-01",
	until: "2025-11-30",
});
```

### 4. Cache Results

```typescript
let activitiesCache = null;
let cacheTime = 0;
const CACHE_DURATION = 60000; // 1 minute

async function getActivitiesCached() {
	const now = Date.now();

	if (!activitiesCache || now - cacheTime > CACHE_DURATION) {
		activitiesCache = await alpacaService.getAccountActivities();
		cacheTime = now;
	}

	return activitiesCache;
}
```

## Performance Tips

1. **Use specific activity types** - Reduces payload size
2. **Limit page size** - Only fetch what you need
3. **Use date filters** - Especially for old accounts with lots of history
4. **Cache frequently accessed data** - Activities don't change retroactively
5. **Use category filter** - Faster than multiple activity types

## Common Pitfalls

### ❌ Mixing category and activity_types

```typescript
// BAD - Cannot use both
const activities = await alpacaService.getAccountActivities({
	category: "trade_activity",
	activity_types: ["DIV"], // Ignored!
});
```

### ❌ Not handling pagination

```typescript
// BAD - Only gets first 100
const activities = await alpacaService.getAccountActivities();
// Might be missing thousands of activities!
```

### ❌ Forgetting to parse net_amount

```typescript
// BAD - Treating string as number
const total = activities.reduce((sum, a) => sum + a.net_amount, 0);

// GOOD - Parse string to number
const total = activities.reduce((sum, a) => sum + parseFloat(a.net_amount), 0);
```

## Integration Example

```typescript
async function generateMonthlyReport(year: number, month: number) {
	const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
	const endDate = new Date(year, month, 0).toISOString().split("T")[0];

	// Fetch all activities for the month
	const activities = await alpacaService.getAccountActivities({
		after: startDate,
		until: endDate,
	});

	// Calculate metrics
	const trades = activities.filter((a) => a.activity_type === "FILL");
	const dividends = activities.filter((a) => a.activity_type.startsWith("DIV"));
	const transfers = activities.filter((a) =>
		["TRANS", "JNLC"].includes(a.activity_type),
	);

	const totalTrades = trades.length;
	const totalDividends = dividends.reduce(
		(s, d) => s + parseFloat(d.net_amount),
		0,
	);
	const netTransfers = transfers.reduce(
		(s, t) => s + parseFloat(t.net_amount),
		0,
	);

	return {
		period: `${year}-${month}`,
		totalActivities: activities.length,
		totalTrades,
		totalDividends,
		netTransfers,
	};
}
```

## Additional Resources

- [Alpaca Activities API Documentation](https://alpaca.markets/docs/api-references/trading-api/account-activities/)
- [Understanding Activity Types](https://alpaca.markets/docs/api-references/trading-api/account-activities/#activity-types)
