# Alpaca Assets API Guide

Complete guide to working with assets using the Alpaca Trading API.

## Overview

The Assets API provides the master list of all tradable securities available on Alpaca. Use this to:

- Validate symbols before placing orders
- Filter assets by exchange, tradability, or special features
- Check asset properties (marginable, shortable, fractionable, etc.)

## Basic Usage

### Get All Assets

```typescript
const alpacaService = new AlpacaService(env);

// Get all assets (defaults to active US equities)
const assets = await alpacaService.getAssets();

console.log(`Total assets: ${assets.length}`);
```

### Get a Specific Asset

```typescript
// Get details for a specific symbol
const appleStock = await alpacaService.getAsset("AAPL");

console.log(appleStock.name); // "Apple Inc"
console.log(appleStock.exchange); // "NASDAQ"
console.log(appleStock.tradable); // true
console.log(appleStock.fractionable); // true
```

### Get Only Tradable Assets

```typescript
// Convenience method - only returns assets you can actually trade
const tradableAssets = await alpacaService.getTradableAssets();

console.log(`Tradable assets: ${tradableAssets.length}`);
```

## Filtering Assets

### By Status

```typescript
// Get active assets (default)
const activeAssets = await alpacaService.getAssets({
	status: "active",
});

// Get inactive assets
const inactiveAssets = await alpacaService.getAssets({
	status: "inactive",
});
```

### By Asset Class

```typescript
// US Equities (default)
const stocks = await alpacaService.getAssets({
	asset_class: "us_equity",
});

// Crypto (if enabled)
const crypto = await alpacaService.getAssets({
	asset_class: "crypto",
});
```

### By Exchange

```typescript
// NYSE only
const nyseStocks = await alpacaService.getAssets({
	exchange: "NYSE",
});

// NASDAQ only
const nasdaqStocks = await alpacaService.getAssets({
	exchange: "NASDAQ",
});

// Other exchanges: 'AMEX', 'ARCA', 'BATS', 'NYSEARCA', 'OTC'
```

### By Attributes

```typescript
// Assets with options available
const optionsAssets = await alpacaService.getAssets({
	attributes: ["has_options"],
});

// Assets with fractional extended hours trading
const fractionalEH = await alpacaService.getAssets({
	attributes: ["fractional_eh_enabled"],
});

// Multiple attributes (assets with ANY of these)
const specialAssets = await alpacaService.getAssets({
	attributes: ["has_options", "ipo"],
});
```

**Available Attributes:**

- `ptp_no_exception` - Pre/post-market trading with no exception
- `ptp_with_exception` - Pre/post-market trading with exception
- `ipo` - Recent IPO
- `has_options` - Options available for this asset
- `options_late_close` - Options close late
- `fractional_eh_enabled` - Fractional shares in extended hours

### Combined Filtering

```typescript
// NYSE stocks with options
const nyseWithOptions = await alpacaService.getAssets({
	status: "active",
	asset_class: "us_equity",
	exchange: "NYSE",
	attributes: ["has_options"],
});
```

## Asset Properties

Each asset includes the following information:

```typescript
interface AlpacaAsset {
	id: string; // UUID
	class: "us_equity" | "crypto"; // Asset class
	exchange: string; // Exchange (NYSE, NASDAQ, etc.)
	symbol: string; // Ticker symbol
	name: string; // Full company name
	status: "active" | "inactive"; // Trading status
	tradable: boolean; // Can be traded on Alpaca
	marginable: boolean; // Can trade on margin
	maintenance_margin_requirement: number; // Margin requirement %
	margin_requirement_long: string; // Long position margin %
	margin_requirement_short: string; // Short position margin %
	shortable: boolean; // Can be shorted
	easy_to_borrow: boolean; // Easy to borrow for shorting
	fractionable: boolean; // Fractional shares allowed
	attributes: string[]; // Special attributes
}
```

## Common Use Cases

### 1. Validate Before Trading

```typescript
async function validateSymbol(symbol: string): Promise<boolean> {
	try {
		const asset = await alpacaService.getAsset(symbol);

		if (asset.status !== "active") {
			console.error(`${symbol} is not active`);
			return false;
		}

		if (!asset.tradable) {
			console.error(`${symbol} is not tradable on Alpaca`);
			return false;
		}

		return true;
	} catch (error) {
		console.error(`Asset ${symbol} not found`);
		return false;
	}
}

// Use before placing order
if (await validateSymbol("AAPL")) {
	await alpacaService.placeMarketOrder("AAPL", "1", "buy");
}
```

### 2. Find Fractional Shares

```typescript
// Get all tradable fractional shares
const tradableAssets = await alpacaService.getTradableAssets();
const fractional = tradableAssets.filter((asset) => asset.fractionable);

console.log(`${fractional.length} fractional shares available`);
```

### 3. Find Shortable Stocks

```typescript
// Easy to borrow stocks for shorting
const tradableAssets = await alpacaService.getTradableAssets();
const easyShorts = tradableAssets.filter(
	(asset) => asset.shortable && asset.easy_to_borrow,
);

console.log(`${easyShorts.length} easy-to-short stocks`);
```

### 4. Filter by Margin Requirements

```typescript
// Find low margin requirement stocks
const tradableAssets = await alpacaService.getTradableAssets();
const lowMargin = tradableAssets.filter(
	(asset) => asset.marginable && asset.maintenance_margin_requirement < 30,
);

console.log(`${lowMargin.length} stocks with <30% margin requirement`);
```

### 5. Get Options-Enabled Stocks

```typescript
// All stocks with options
const withOptions = await alpacaService.getAssets({
	status: "active",
	attributes: ["has_options"],
});

// Filter for tradable ones only
const tradableWithOptions = withOptions.filter((a) => a.tradable);

console.log(`${tradableWithOptions.length} tradable stocks with options`);
```

## Real API Response Example

```json
{
	"id": "b0b6dd9d-8b9b-48a9-ba46-b9d54906e415",
	"class": "us_equity",
	"exchange": "NASDAQ",
	"symbol": "AAPL",
	"name": "Apple Inc.",
	"status": "active",
	"tradable": true,
	"marginable": true,
	"maintenance_margin_requirement": 30,
	"margin_requirement_long": "30",
	"margin_requirement_short": "30",
	"shortable": true,
	"easy_to_borrow": true,
	"fractionable": true,
	"attributes": ["has_options", "fractional_eh_enabled"]
}
```

## Error Handling

```typescript
try {
	const asset = await alpacaService.getAsset("INVALID");
} catch (error) {
	if (error instanceof AlpacaAPIError) {
		if (error.code === "ASSET_NOT_FOUND") {
			console.log("Symbol does not exist");
		} else if (error.statusCode === 401) {
			console.log("Authentication failed");
		} else {
			console.log("API error:", error.message);
		}
	}
}
```

## Best Practices

### 1. Cache Asset Lists

Asset lists don't change frequently. Cache them to reduce API calls:

```typescript
let assetsCache: AlpacaAsset[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function getAssetsCached() {
	const now = Date.now();

	if (!assetsCache || now - cacheTime > CACHE_DURATION) {
		assetsCache = await alpacaService.getAssets();
		cacheTime = now;
	}

	return assetsCache;
}
```

### 2. Validate Symbols

Always validate symbols before placing orders:

```typescript
async function placeOrderSafe(
	symbol: string,
	qty: string,
	side: "buy" | "sell",
) {
	// 1. Check if asset exists and is tradable
	const asset = await alpacaService.getAsset(symbol);

	if (!asset.tradable) {
		throw new Error(`${symbol} is not tradable`);
	}

	// 2. For fractional orders, check if supported
	if (parseFloat(qty) < 1 && !asset.fractionable) {
		throw new Error(`${symbol} does not support fractional shares`);
	}

	// 3. Place the order
	return await alpacaService.placeMarketOrder(symbol, qty, side);
}
```

### 3. Filter Locally

Get the full list once, then filter in your code:

```typescript
// Fetch once
const allAssets = await alpacaService.getTradableAssets();

// Filter multiple times locally (no additional API calls)
const nasdaqStocks = allAssets.filter((a) => a.exchange === "NASDAQ");
const fractional = allAssets.filter((a) => a.fractionable);
const shortable = allAssets.filter((a) => a.shortable && a.easy_to_borrow);
```

### 4. Handle Non-Tradable Assets

Many assets in the response are NOT tradable:

```typescript
const allAssets = await alpacaService.getAssets();
const tradable = allAssets.filter((a) => a.tradable);

console.log(`${allAssets.length} total assets`);
console.log(`${tradable.length} tradable assets`);
// Often shows: 10000+ total, but only ~5000 tradable
```

## Performance Tips

1. **Use `getTradableAssets()`** - Automatically filters for `tradable: true`
2. **Batch lookups** - Get all assets once, then search locally
3. **Cache results** - Assets don't change often
4. **Filter by exchange first** - Reduces dataset size significantly

## Common Pitfalls

### ❌ Not Checking Tradability

```typescript
// BAD - Asset might not be tradable
const asset = await alpacaService.getAsset("SOMESTOCK");
await alpacaService.placeMarketOrder(asset.symbol, "1", "buy");
```

```typescript
// GOOD - Check tradability first
const asset = await alpacaService.getAsset("SOMESTOCK");
if (asset.tradable && asset.status === "active") {
	await alpacaService.placeMarketOrder(asset.symbol, "1", "buy");
}
```

### ❌ Assuming All Assets Support Fractional

```typescript
// BAD - Not all assets support fractional shares
await alpacaService.placeMarketOrder("SOMESTOCK", "0.5", "buy");
```

```typescript
// GOOD - Check fractionable property
const asset = await alpacaService.getAsset("SOMESTOCK");
if (!asset.fractionable && parseFloat(qty) < 1) {
	throw new Error("Fractional shares not supported");
}
```

### ❌ Forgetting Status Check

```typescript
// BAD - Asset might be inactive
const asset = await alpacaService.getAsset("OLDSTOCK");
await alpacaService.placeMarketOrder(asset.symbol, "1", "buy");
```

```typescript
// GOOD - Always check status
const asset = await alpacaService.getAsset("OLDSTOCK");
if (asset.status !== "active") {
	throw new Error("Asset is not active for trading");
}
```

## Integration Example

Complete example with order placement:

```typescript
async function smartOrder(symbol: string, qty: string, side: "buy" | "sell") {
	// 1. Get and validate asset
	const asset = await alpacaService.getAsset(symbol);

	if (asset.status !== "active") {
		throw new Error(`${symbol} is not active`);
	}

	if (!asset.tradable) {
		throw new Error(`${symbol} is not tradable on Alpaca`);
	}

	// 2. Check fractional support
	const qtyNum = parseFloat(qty);
	if (qtyNum < 1 && !asset.fractionable) {
		throw new Error(`${symbol} does not support fractional shares`);
	}

	// 3. For sell orders, check if shortable
	if (side === "sell") {
		// Check if we have a position first
		const position = await alpacaService.getPosition(symbol);

		if (!position && !asset.shortable) {
			throw new Error(`${symbol} cannot be shorted and no position exists`);
		}

		if (!position && !asset.easy_to_borrow) {
			console.warn(`${symbol} may be difficult to borrow for shorting`);
		}
	}

	// 4. Check margin requirements for buy orders
	if (side === "buy" && asset.marginable) {
		console.log(`Margin requirement: ${asset.maintenance_margin_requirement}%`);
	}

	// 5. Place the order
	const order = await alpacaService.placeMarketOrder(symbol, qty, side);

	console.log(`Order placed: ${order.id}`);
	return order;
}
```

## Additional Resources

- [Alpaca Assets API Documentation](https://alpaca.markets/docs/api-references/trading-api/assets/)
- [Understanding Asset Attributes](https://alpaca.markets/docs/trading/orders/#asset-attributes)
- [Fractional Shares Guide](https://alpaca.markets/docs/trading/fractional-trading/)
