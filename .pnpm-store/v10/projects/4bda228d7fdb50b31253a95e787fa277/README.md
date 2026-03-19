# Alpaca Trading API Integration Guides

Comprehensive documentation for the Biequity Cloudflare Worker's integration with Alpaca Trading API.

## 📚 Available Guides

### [Order Placement Guide](./ORDER_PLACEMENT.md)

Complete guide to placing market orders through Alpaca API.

**Topics Covered:**

- Axios configuration with interceptors
- Order placement with validation
- Error handling patterns
- Integration with blockchain events
- Best practices for trading

**Key Features:**

- ✅ Market orders only (as designed)
- ✅ Comprehensive error handling
- ✅ Automatic authentication
- ✅ Detailed logging

### [Account Information Guide](./ACCOUNT_INFO_GUIDE.md)

Detailed reference for Alpaca account information and trading eligibility.

**Topics Covered:**

- All 37 account fields explained
- Understanding buying power
- Account status and restrictions
- Margin requirements
- Pattern day trading rules

**Key Features:**

- ✅ Complete field reference
- ✅ Trading eligibility checker
- ✅ Real-world examples
- ✅ Common scenarios explained

### [Assets API Guide](./ASSETS_API_GUIDE.md)

Master reference for querying and filtering tradable assets.

**Topics Covered:**

- Getting asset lists with filters
- Individual asset lookup
- Asset properties and attributes
- Validation before trading
- Performance optimization

**Key Features:**

- ✅ Filter by exchange, status, attributes
- ✅ Check tradability and features
- ✅ Support for fractional shares
- ✅ Short selling validation

## 🚀 Quick Start

### 1. Place a Market Order

```typescript
import { AlpacaService } from "./services/alpaca.service";

const alpacaService = new AlpacaService(env);

// Place a buy order
const order = await alpacaService.placeMarketOrder(
	"AAPL", // symbol
	"1", // quantity
	"buy", // side
	"day", // time_in_force
	false, // extended_hours
);

console.log(`Order placed: ${order.id}`);
```

### 2. Check Account Status

```typescript
// Get account information
const account = await alpacaService.getAccount();

console.log(`Buying Power: $${account.buying_power}`);
console.log(`Cash: $${account.cash}`);
console.log(`Status: ${account.status}`);

// Check if ready to trade
const { canTrade, reasons } = await alpacaService.checkTradingEligibility();

if (canTrade) {
	console.log("Ready to trade!");
} else {
	console.error("Cannot trade:", reasons);
}
```

### 3. Validate an Asset

```typescript
// Get asset details
const asset = await alpacaService.getAsset("TSLA");

console.log(`Name: ${asset.name}`);
console.log(`Tradable: ${asset.tradable}`);
console.log(`Fractionable: ${asset.fractionable}`);
console.log(`Shortable: ${asset.shortable}`);

// Get all tradable assets
const tradableAssets = await alpacaService.getTradableAssets();
console.log(`${tradableAssets.length} tradable assets available`);
```

## 🔧 Architecture Overview

```
cloudfare-worker/
├── src/
│   ├── services/
│   │   ├── alpaca.service.ts      # Main trading service
│   │   └── web3.service.ts        # Blockchain integration
│   ├── utils/
│   │   ├── axios.ts               # Configured HTTP client with interceptors
│   │   └── logger.ts              # Logging utility
│   ├── types/
│   │   └── alpaca.types.ts        # Complete TypeScript types
│   └── examples/
│       └── order-placement-example.ts  # Usage examples
└── guides/                         # 📖 You are here!
    ├── ORDER_PLACEMENT.md
    ├── ACCOUNT_INFO_GUIDE.md
    └── ASSETS_API_GUIDE.md
```

## 📖 Guide Selection Helper

**I want to...**

| Goal                      | Guide to Read                                        |
| ------------------------- | ---------------------------------------------------- |
| Place orders              | [Order Placement Guide](./ORDER_PLACEMENT.md)        |
| Check buying power        | [Account Information Guide](./ACCOUNT_INFO_GUIDE.md) |
| Validate symbols          | [Assets API Guide](./ASSETS_API_GUIDE.md)            |
| Handle errors             | [Order Placement Guide](./ORDER_PLACEMENT.md)        |
| Filter stocks             | [Assets API Guide](./ASSETS_API_GUIDE.md)            |
| Check margin requirements | [Account Information Guide](./ACCOUNT_INFO_GUIDE.md) |
| Find fractional shares    | [Assets API Guide](./ASSETS_API_GUIDE.md)            |
| Understand account status | [Account Information Guide](./ACCOUNT_INFO_GUIDE.md) |

## 🔑 Key Concepts

### Authentication

All API calls are automatically authenticated using axios interceptors. No need to manually add headers.

### Error Handling

Custom `AlpacaAPIError` class provides structured error information:

- Status code
- Error message
- Error code
- Additional data

### Logging

All operations are logged with detailed context for debugging and monitoring.

### Type Safety

Complete TypeScript types for all API requests and responses.

## 🌟 Features

- ✅ **Market Orders** - Place buy/sell orders instantly
- ✅ **Account Management** - Get balances, buying power, restrictions
- ✅ **Asset Discovery** - Search and filter tradable securities
- ✅ **Position Tracking** - Monitor open positions
- ✅ **Order Management** - Track, cancel, and query orders
- ✅ **Blockchain Integration** - Automatically trade based on smart contract events
- ✅ **Error Recovery** - Comprehensive error handling and logging
- ✅ **Type Safety** - Full TypeScript support

## 🔐 Environment Variables

Required in your `.env` or Cloudflare Worker secrets:

```env
ALPACA_API_KEY=your_api_key_here
ALPACA_SECRET_KEY=your_secret_key_here
```

## 🧪 Testing

The system uses Alpaca's paper trading environment by default:

- Base URL: `https://paper-api.alpaca.markets/v2`
- No real money involved
- Simulated market conditions
- Perfect for testing and development

## 📚 Additional Resources

### Alpaca Documentation

- [Trading API Reference](https://alpaca.markets/docs/api-references/trading-api/)
- [Paper Trading](https://alpaca.markets/docs/trading/paper-trading/)
- [Order Types](https://alpaca.markets/docs/trading/orders/)
- [Account API](https://alpaca.markets/docs/api-references/trading-api/account/)
- [Assets API](https://alpaca.markets/docs/api-references/trading-api/assets/)

### Code Examples

See `src/examples/order-placement-example.ts` for comprehensive code examples covering all use cases.

## 🐛 Troubleshooting

### Orders Being Rejected (403)

- Check account buying power
- Verify account is not restricted
- Ensure market is open (or extended hours is enabled)

### Orders Invalid (422)

- Verify symbol exists and is tradable
- Check quantity is positive
- Ensure all required fields are provided

### Authentication Errors (401)

- Verify API key and secret are correct
- Check keys are for paper trading if using paper API
- Ensure keys haven't expired

### Asset Not Found (404)

- Verify symbol spelling
- Check if asset is listed on Alpaca
- Try searching with `getAssets()` first

## 💡 Tips

1. **Always validate** symbols before placing orders
2. **Check account status** before trading
3. **Use tradable filter** when searching assets
4. **Cache asset lists** to reduce API calls
5. **Monitor logs** for debugging issues
6. **Test in paper** before going live

## 🤝 Contributing

When adding new features:

1. Update relevant guide documentation
2. Add examples to `order-placement-example.ts`
3. Include proper TypeScript types
4. Add comprehensive error handling
5. Include logging statements

## 📝 License

Part of the Biequity project.

---

**Need Help?** Check the specific guides for detailed information, or review the code examples in `src/examples/`.
