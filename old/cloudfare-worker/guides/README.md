# Biequity Cloudflare Worker - Documentation

This folder contains comprehensive guides for working with the Alpaca Trading API integration in the Biequity Cloudflare Worker.

## 📚 Available Guides

### [Order Placement Guide](./ORDER_PLACEMENT.md)

Complete guide to placing orders using the Alpaca Trading API.

**Topics covered:**

- Market order placement
- Order types and time-in-force options
- Error handling for orders
- Order validation
- Order status tracking
- Integration with blockchain events

**Key methods:**

- `placeMarketOrder()`
- `getOrder()`
- `getAllOrders()`
- `cancelOrder()`

---

### [Account Information Guide](./ACCOUNT_INFO_GUIDE.md)

Detailed explanation of account information and buying power.

**Topics covered:**

- All 37 account fields explained
- Understanding buying power
- Account status and restrictions
- Trading eligibility checking
- Margin account information
- Pattern day trading rules

**Key methods:**

- `getAccount()`
- `checkTradingEligibility()`

---

### [Assets API Guide](./ASSETS_API_GUIDE.md)

Master list of tradable assets and filtering options.

**Topics covered:**

- Retrieving asset lists
- Filtering by exchange, status, and attributes
- Asset properties (tradable, marginable, shortable, fractionable)
- Validating symbols before trading
- Finding fractional shares
- Options-enabled stocks

**Key methods:**

- `getAssets()`
- `getAsset()`
- `getTradableAssets()`

---

### [Activities API Guide](./ACTIVITIES_API_GUIDE.md)

Complete account activity history and transaction tracking.

**Topics covered:**

- Retrieving account activities
- Trade activities (fills)
- Non-trade activities (dividends, transfers, fees)
- Filtering by type, date, and category
- Pagination for large datasets
- Calculating dividends and cash flow
- Activity monitoring

**Key methods:**

- `getAccountActivities()`
- `getTradeActivities()`
- `getNonTradeActivities()`
- `getActivitiesPage()`

---

## 🚀 Quick Start

### Installation

```bash
pnpm add axios
```

### Basic Usage

```typescript
import { AlpacaService } from "./services/alpaca.service";

const alpacaService = new AlpacaService(env);

// Get account info
const account = await alpacaService.getAccount();
console.log(`Buying power: $${account.buying_power}`);

// Place an order
const order = await alpacaService.placeMarketOrder("AAPL", "1", "buy");
console.log(`Order placed: ${order.id}`);

// Get assets
const assets = await alpacaService.getTradableAssets();
console.log(`${assets.length} tradable assets`);

// Get activities
const activities = await alpacaService.getAccountActivities();
console.log(`${activities.length} recent activities`);
```

## 📖 Documentation Structure

Each guide follows this structure:

1. **Overview** - What the API does
2. **Basic Usage** - Simple examples to get started
3. **Filtering Options** - All available filters
4. **Common Use Cases** - Real-world scenarios
5. **Best Practices** - Performance tips and patterns
6. **Error Handling** - How to handle failures
7. **Common Pitfalls** - What to avoid

## 🛠️ Code Examples

All guides include extensive code examples. You can also find complete example implementations in:

- `src/examples/order-placement-example.ts`
- `src/examples/activities-example.ts`

## 🔑 Key Concepts

### Authentication

All API calls automatically include authentication headers via the axios interceptor:

```typescript
// Configured automatically in createAlpacaAxiosInstance()
headers: {
  'APCA-API-KEY-ID': env.ALPACA_API_KEY,
  'APCA-API-SECRET-KEY': env.ALPACA_SECRET_KEY
}
```

### Error Handling

All API methods use the custom `AlpacaAPIError` class:

```typescript
try {
	const account = await alpacaService.getAccount();
} catch (error) {
	if (error instanceof AlpacaAPIError) {
		console.error(`Error ${error.statusCode}: ${error.message}`);
	}
}
```

### Logging

All operations are logged using the logger utility:

```typescript
logger.info("Operation completed", { data });
logger.error("Operation failed", { error });
```

## 🔗 API Reference

### AlpacaService Methods

**Account:**

- `getAccount()` - Get account information
- `checkTradingEligibility()` - Check if account can trade

**Orders:**

- `placeMarketOrder()` - Place a market order
- `getOrder()` - Get order by ID
- `getAllOrders()` - Get all orders
- `cancelOrder()` - Cancel an order

**Positions:**

- `getPosition()` - Get position for symbol
- `getAllPositions()` - Get all positions

**Assets:**

- `getAssets()` - Get assets with filtering
- `getAsset()` - Get specific asset
- `getTradableAssets()` - Get tradable assets only

**Activities:**

- `getAccountActivities()` - Get activities with filtering
- `getTradeActivities()` - Get trade activities only
- `getNonTradeActivities()` - Get non-trade activities
- `getActivitiesPage()` - Get activities with pagination support

## 📊 Type Definitions

All types are defined in `src/types/alpaca.types.ts`:

- `AlpacaAccount` - Account information
- `OrderResponse` - Order details
- `AlpacaAsset` - Asset information
- `AlpacaPosition` - Position details
- `AccountActivity` - Activity information
- Request/response types for all operations

## 🧪 Testing

The codebase uses Alpaca's **paper trading environment**:

- Base URL: `https://paper-api.alpaca.markets/v2`
- No real money involved
- Full market simulation

## 🔧 Configuration

Required environment variables:

```typescript
interface Env {
	ALPACA_API_KEY: string;
	ALPACA_SECRET_KEY: string;
	// ... other vars
}
```

## 📚 Additional Resources

- [Alpaca API Documentation](https://alpaca.markets/docs/api-references/trading-api/)
- [Alpaca Paper Trading](https://alpaca.markets/docs/trading/paper-trading/)
- [Order Types Guide](https://alpaca.markets/docs/trading/orders/)

## 🤝 Contributing

When adding new API endpoints:

1. Add types to `src/types/alpaca.types.ts`
2. Add methods to `src/services/alpaca.service.ts`
3. Add examples to `src/examples/`
4. Create a guide in `guides/`
5. Update this README

## 📝 Notes

- All dollar amounts are returned as strings to preserve precision
- Dates support both `YYYY-MM-DD` and ISO 8601 formats
- Pagination uses the ID of the last item as the page token
- All methods include comprehensive error handling and logging
