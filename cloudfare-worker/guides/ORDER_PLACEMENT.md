# Alpaca Order Placement System

This document explains the order placement system integrated with Alpaca Trading API for the Biequity Cloudflare Worker.

## Architecture Overview

The order placement system consists of the following components:

1. **Axios Instance** (`utils/axios.ts`) - Configured HTTP client with interceptors
2. **Type Definitions** (`types/alpaca.types.ts`) - TypeScript types for orders and API responses
3. **Alpaca Service** (`services/alpaca.service.ts`) - Service layer for Alpaca API interactions
4. **Web3 Service** (`services/web3.service.ts`) - Integration between blockchain events and Alpaca orders

## Components

### 1. Axios Configuration (`utils/axios.ts`)

The axios instance is configured with:

- **Base URL**: Points to Alpaca paper trading API
- **Request Interceptor**: Automatically adds authentication headers
- **Response Interceptor**: Handles errors consistently and provides detailed error messages
- **Custom Error Class**: `AlpacaAPIError` for structured error handling

```typescript
const alpacaClient = createAlpacaAxiosInstance(apiKey, secretKey);
```

### 2. Type System (`types/alpaca.types.ts`)

Comprehensive TypeScript types for:

- Order requests (market, limit, etc.)
- Order responses
- Account information
- Position data
- Order statuses and enums

### 3. AlpacaService (`services/alpaca.service.ts`)

Main service class providing methods:

#### `placeMarketOrder(symbol, qty, side, timeInForce, extendedHours)`

Places a market order with validation and error handling.

**Parameters:**

- `symbol` (string): Stock symbol (e.g., 'AAPL')
- `qty` (string): Quantity of shares
- `side` ('buy' | 'sell'): Order side
- `timeInForce` (TimeInForce): Default 'day'
- `extendedHours` (boolean): Default false

**Returns:** `OrderResponse` object

**Example:**

```typescript
const order = await alpacaService.placeMarketOrder(
	"AAPL",
	"1",
	"buy",
	"day",
	false,
);
```

#### Other Methods:

- `getAccount()` - Get account information
- `getPosition(symbol)` - Get position for a symbol
- `getAllPositions()` - Get all positions
- `getOrder(orderId)` - Get order by ID
- `getAllOrders(status)` - Get all orders
- `cancelOrder(orderId)` - Cancel an order
- `getAssets()` - Get active tradable assets

## Order Types

Currently, the system supports **MARKET ORDERS ONLY** with the following properties:

```typescript
{
  symbol: 'AAPL',
  qty: '1',
  side: 'buy' | 'sell',
  type: 'market',
  time_in_force: 'day',
  extended_hours: false
}
```

### Time In Force Options

- `day` - Valid for the trading day (default)
- `gtc` - Good till canceled
- `opg` - Market on open
- `cls` - Market on close
- `ioc` - Immediate or cancel
- `fok` - Fill or kill

## Error Handling

The system provides comprehensive error handling:

### Error Types

1. **AlpacaAPIError** - Custom error class with:
   - `statusCode` - HTTP status code
   - `message` - Error message
   - `code` - Error code
   - `data` - Additional error data

### Common Error Scenarios

#### 403 Forbidden

- Insufficient buying power
- Account restrictions
- Trading blocked

**Handling:**

```typescript
catch (error) {
  if (error instanceof AlpacaAPIError && error.statusCode === 403) {
    console.error('Insufficient buying power');
  }
}
```

#### 422 Unprocessable Entity

- Invalid order parameters
- Invalid symbol
- Invalid quantity

#### 429 Too Many Requests

- Rate limit exceeded
- Need to retry later

#### 404 Not Found

- Position doesn't exist
- Order not found

### Error Response Example

```typescript
{
  statusCode: 403,
  message: "Forbidden: Insufficient buying power. This may be due to insufficient buying power or account restrictions.",
  code: "INSUFFICIENT_BUYING_POWER",
  data: { /* original error data */ }
}
```

## Integration with Web3

The `Web3Service` processes blockchain events and places corresponding Alpaca orders:

### Buy Flow (processBuyQueue)

1. Listen for `TokensMinted` events
2. Extract symbol and amount
3. Place market buy order on Alpaca
4. Settle tokens on blockchain

### Sell Flow (processSellQueue)

1. Listen for `TokensRedeemed` events
2. Extract symbol and amount
3. Place market sell order on Alpaca
4. Process USD withdrawal (future implementation)

### Error Handling in Web3 Service

Both flows return structured results:

```typescript
{
  success: true,
  event: { /* blockchain event data */ },
  order: {
    id: "order-id",
    symbol: "AAPL",
    qty: "1",
    status: "accepted",
    side: "buy"
  },
  tx: "transaction-hash"
}
```

Or on error:

```typescript
{
  success: false,
  event: { /* blockchain event data */ },
  error: {
    type: 'ALPACA_API_ERROR',
    statusCode: 403,
    message: "Insufficient buying power",
    code: "INSUFFICIENT_BUYING_POWER"
  }
}
```

## Logging

All operations are logged using the `logger` utility:

- Request details (method, URL, data)
- Response details (status, data)
- Errors (with full context)

## Examples

See `examples/order-placement-example.ts` for comprehensive usage examples:

- Basic buy/sell orders
- Account information retrieval
- Position checking
- Order validation
- Order status tracking

## Environment Variables

Required environment variables:

- `ALPACA_API_KEY` - Your Alpaca API key
- `ALPACA_SECRET_KEY` - Your Alpaca secret key

## Testing

For testing, the system uses Alpaca's paper trading environment:

- Base URL: `https://paper-api.alpaca.markets/v2`
- No real money is involved
- Simulated market conditions

## Future Enhancements

Potential improvements:

1. Support for limit orders
2. Support for stop-loss and take-profit orders
3. Order status webhooks
4. Retry mechanism for failed orders
5. Order batching for efficiency
6. Position management strategies
7. Risk management features

## API Response Example

Successful order placement response:

```json
{
	"id": "c7c5bfc0-bd52-4025-8d7f-31ef39778b73",
	"client_order_id": "d8ce935b-52c3-432b-85f8-098acfff02ec",
	"created_at": "2025-11-28T07:43:41.793657157Z",
	"updated_at": "2025-11-28T07:43:41.829199232Z",
	"submitted_at": "2025-11-28T07:43:41.793657157Z",
	"filled_at": null,
	"symbol": "AAPL",
	"qty": "1",
	"filled_qty": "0",
	"order_type": "market",
	"type": "market",
	"side": "buy",
	"time_in_force": "day",
	"status": "accepted",
	"extended_hours": false
}
```

## Best Practices

1. **Always validate inputs** before placing orders
2. **Check account status** before trading
3. **Verify positions** before selling
4. **Use string types for quantities** to avoid floating-point precision issues
5. **Handle all error cases** appropriately
6. **Log all operations** for debugging
7. **Use idempotency** to prevent duplicate orders
8. **Monitor order status** after placement

## Troubleshooting

### Order rejected with 403

- Check account buying power
- Verify account is not restricted
- Ensure market is open (for non-extended hours)

### Order rejected with 422

- Verify symbol is valid and tradable
- Check quantity is positive
- Ensure all required fields are provided

### No response from API

- Check network connectivity
- Verify API credentials
- Check Alpaca service status

## Resources

- [Alpaca API Documentation](https://alpaca.markets/docs/api-references/trading-api/)
- [Alpaca Paper Trading](https://alpaca.markets/docs/trading/paper-trading/)
- [Order Types Guide](https://alpaca.markets/docs/trading/orders/)
