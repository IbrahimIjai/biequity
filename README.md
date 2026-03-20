# Biequity

**Tokenized real-world equity on Base.** Deposit USDC, receive on-chain stock tokens backed 1:1 by real shares — transferable, composable in DeFi, ERC-3643 compliant.

> ⚠️ This is a portfolio/research project. Provider integrations run in simulated mode. Not production-ready or financial advice.

---

## What It Does

Biequity bridges traditional equities and on-chain DeFi. A user deposits USDC and receives tokenized stock (e.g. `bieAAPL`) representing a fractional share of the underlying security. Under the hood, a Cloudflare Worker listens for on-chain mint events, purchases the real shares via Alpaca's brokerage API, and calls `settleTokens()` on the contract once the position is confirmed.

```
User deposits USDC
        │
        ▼
BiequityCore.buy("AAPL", amount)
  ├─ Fees to treasury (3%)
  ├─ Mints bieAAPL tokens to user
  └─ Emits TokensMinted event
        │
        ▼
Cloudflare Worker (cron / webhook)
  ├─ Reads TokensMinted events
  ├─ Places market buy on Alpaca
  └─ Calls settleTokens() on-chain
        │
        ▼
bieAAPL tokens are now fully backed
(ERC-3643 compliant, transferable between KYC-verified addresses)
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        apps/web                          │
│   Next.js 14 · wagmi · Reown · Zustand · shadcn/ui       │
│   Neobrutalist design · Dark mode · PWA manifest         │
└──────────────────────┬───────────────────────────────────┘
                       │  contract calls (viem)
┌──────────────────────▼───────────────────────────────────┐
│              contracts/ (Foundry · Base Sepolia)         │
│                                                          │
│  BiequityCore          — buy / redeem / settle           │
│  BiequityToken         — ERC-3643 compliant ERC-20       │
│  IdentityRegistry      — on-chain KYC whitelist          │
│  BiequityTokenFactory  — deploys one token per stock     │
│  Pyth oracle           — real-time price feeds           │
└──────────────────────┬───────────────────────────────────┘
                       │  reads events / calls settleTokens
┌──────────────────────▼───────────────────────────────────┐
│          apps/cloudfare-worker (Hono · Cloudflare)       │
│                                                          │
│  AlpacaService         — brokerage API (buy/sell)        │
│  MockProviderService   — simulated provider (dev mode)   │
│  TokenizationController — REST API for mint/redeem       │
│  Web3Service           — reads on-chain events           │
│  Cron trigger          — processes buy/sell queues       │
└──────────────────────────────────────────────────────────┘
```

---

## Token Standard: ERC-3643 (T-REX)

`BiequityToken` implements a simplified ERC-3643 compliance layer. Every transfer is validated against an on-chain `IdentityRegistry` — only KYC-verified addresses can hold or transfer tokens.

```solidity
function _update(address from, address to, uint256 value) internal override {
    bool isMint = from == address(0);
    bool isBurn = to == address(0);

    if (!isMint && !isBurn) {
        if (!identityRegistry.isVerified(from)) revert TransferNotCompliant(from, to);
        if (!identityRegistry.isVerified(to))   revert TransferNotCompliant(from, to);
    }

    super._update(from, to, value);
}
```

This means `bieAAPL` tokens are **not** freely tradeable on Uniswap — transfers only succeed between whitelisted addresses. In a production system, the registry would be backed by an on-chain KYC oracle (Fractal, Quadrata, etc.).

**ERC-3643 components implemented:**
- `IIdentityRegistry` — interface
- `IdentityRegistry` — ownable whitelist with batch operations
- Transfer hook in `BiequityToken._update`
- `setIdentityRegistry()` — allows rotating the registry without redeploying tokens

**Not implemented (out of scope for portfolio):**
- `ClaimTopicsRegistry`
- `TrustedIssuersRegistry`
- Full ONCHAINID identity model

---

## Contracts

Deployed on **Base Sepolia** testnet.

| Contract | Description |
|---|---|
| `BiequityCore` | Protocol entry point. Handles buy, redeem, settle, fee collection. |
| `BiequityToken` | Per-stock ERC-20 token with ERC-3643 transfer compliance. |
| `BiequityTokenFactory` | Deploys one `BiequityToken` per registered stock. |
| `IdentityRegistry` | On-chain KYC whitelist. Owner can add/remove investors. |

### Key Functions

```solidity
// Register a new stock (owner only)
registerStock(string symbol, string name, bytes32 pythFeedId, uint256 minBackedRatio)

// User buys stock tokens with USDC
buy(string symbol, uint256 usdcAmount)

// User redeems tokens for USDC
redeem(string symbol, uint256 tokenAmount)

// Worker calls this after purchasing real shares
settleTokens(string symbol, uint256 amount)

// Whitelist a user for KYC (proxies to IdentityRegistry)
whitelistInvestor(address investor)
```

### Price Oracle

Uses [Pyth Network](https://pyth.network/) price feeds. Prices are fetched via `getPriceUnsafe()` — in production you'd want `getPrice()` with a max staleness check.

---

## Worker API

The Cloudflare Worker exposes a REST API and runs a cron job to process settlement.

Base URL: `https://your-worker.workers.dev`

### Endpoints

#### `GET /`
Health check. Returns `200 OK`.

---

#### `GET /api/stocks/prices`
Returns current prices for supported stocks.

**Response:**
```json
{
  "prices": [
    { "symbol": "AAPL", "price": 214.29, "currency": "USD" },
    { "symbol": "TSLA", "price": 247.15, "currency": "USD" },
    { "symbol": "MSFT", "price": 415.82, "currency": "USD" }
  ],
  "timestamp": "2026-03-20T12:00:00.000Z"
}
```

---

#### `GET /api/assets/supported`
Returns the list of stocks supported by the protocol.

---

#### `POST /api/tokenization/mint`
Initiates a mint (buy underlying shares + request token issuance).

**Request body:**
```json
{
  "symbol": "AAPL",
  "qty": "0.5",
  "wallet_address": "0xYourWalletAddress"
}
```

**Response:**
```json
{
  "success": true,
  "mode": "simulated",
  "alpaca_order": {
    "id": "14d484e3-...",
    "symbol": "AAPL",
    "qty": "0.5",
    "filled_avg_price": "214.29",
    "side": "buy",
    "status": "filled"
  },
  "tokenization_request": {
    "tokenization_request_id": "abc123...",
    "status": "pending",
    "underlying_symbol": "AAPL",
    "token_symbol": "AAPLx",
    "qty": "0.5",
    "issuer": "xstocks",
    "network": "base-sepolia",
    "fees": "0.000500"
  }
}
```

---

#### `POST /api/tokenization/redeem`
Initiates a redemption (burn tokens + sell underlying shares).

**Request body:**
```json
{
  "symbol": "AAPL",
  "qty": "0.5",
  "wallet_address": "0xYourWalletAddress"
}
```

---

#### `GET /api/tokenization/requests`
Lists all tokenization requests.

---

#### `GET /api/tokenization/requests/:id`
Gets a single request by ID.

---

#### `POST /process-events`
Manually triggers the settlement queue. Normally called by Cloudflare Cron.

---

### Cron Schedule

The worker runs on a schedule (configurable in `wrangler.jsonc`) to process pending settlement events:

```
processBuyQueue()  — reads TokensMinted events, buys shares on Alpaca, calls settleTokens()
processSellQueue() — reads TokensRedeemed events, sells shares on Alpaca
```

---

## Setup & Development

### Prerequisites

- Node.js 18+
- [Bun](https://bun.sh/) (used as package manager)
- [Foundry](https://getfoundry.sh/) (for contracts)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) (for the worker)

### Install

```bash
git clone https://github.com/IbrahimIjai/biequity
cd biequity
bun install
```

### Run the web app

```bash
cd apps/web
bun dev
```

### Run the worker locally

```bash
cd apps/cloudfare-worker
wrangler dev
```

The worker runs in `MOCK_MODE=true` by default — no real API keys needed.

### Run contract tests

```bash
cd contracts
forge test -vv
```

### Deploy contracts

```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url base-sepolia --broadcast
```

---

## Environment Variables

### Cloudflare Worker (`wrangler.jsonc` vars or Cloudflare secrets)

| Variable | Required | Description |
|---|---|---|
| `MOCK_MODE` | No (defaults `true`) | Set to `"false"` for live Alpaca integration |
| `ALPACA_API_KEY` | Production only | Alpaca brokerage API key |
| `ALPACA_SECRET_KEY` | Production only | Alpaca brokerage secret |
| `OPERATOR_PRIVATE_KEY` | Production only | Private key of the operator wallet (calls `settleTokens`) |
| `RPC_URL` | Production only | Base Sepolia RPC URL |
| `BIEQUITY_CORE_ADDRESS` | Production only | Deployed `BiequityCore` contract address |

### Web App (`.env.local`)

```bash
NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id
NEXT_PUBLIC_WORKER_URL=http://localhost:8787
```

---

## Design Decisions & Trade-offs

**Why ERC-3643 instead of plain ERC-20?**
Tokenized securities require compliance-aware transfers. ERC-3643 bakes the identity check into the token itself — there's no separate compliance contract to opt into. This is how Backed (xStocks) and Ondo structure their tokens.

**Why Cloudflare Worker instead of a traditional backend?**
Workers are stateless, globally distributed, and free to run on a cron — perfect for an event listener that needs to be always-on without infrastructure overhead.

**Why Pyth instead of Chainlink?**
Pyth has tighter update frequency (~400ms) and supports a larger set of equities. For tokenized stocks where price accuracy matters, this is the right call.

**Why simulated providers instead of real ones?**
Alpaca ITN requires a business relationship and is not open to individual developers. The mock layer lets the project run end-to-end in a portfolio context without real credentials, while being architecturally identical to the production path.

**Why Base (not Ethereum mainnet)?**
Lower gas costs and faster finality make fractional equity trades economically viable. Base is where the existing RWA ecosystem (Coinbase, xStocks) is already building.

---

## Roadmap (If This Were Production)

- [ ] Replace `IdentityRegistry` with Fractal/Quadrata oracle integration
- [ ] Multi-issuer support (Ondo, Dinari alongside xStocks)
- [ ] ERC-20 wrapper for DeFi composability (compliant holding → permissionless wrapped token)
- [ ] Dividend distribution to token holders
- [ ] Corporate action handling (splits, mergers)
- [ ] Nigeria/Africa go-to-market with NGN/USDC on-ramp

---

## License

MIT
