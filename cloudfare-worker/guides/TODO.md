# Cloudflare Worker Architecture & TODO

## 🏗️ Architecture

The Cloudflare Worker acts as the **Operator** (Relayer) between the Biequity Smart Contracts and the Alpaca Brokerage API.

### 📂 Folder Structure

```
src/
├── config/             # Configuration & Environment Variables
│   └── env.ts
├── controllers/        # Request Handlers
│   └── webhook.controller.ts
├── helpers/            # Shared Helper Functions
│   ├── viem-client.ts  # Viem Client Setup
│   └── contract.ts     # Contract Read/Write Functions
├── routes/             # Route Definitions
│   └── index.ts
├── services/           # Business Logic & External APIs
│   ├── alpaca.service.ts
│   └── web3.service.ts
├── types/              # TypeScript Type Definitions
│   └── index.ts
├── utils/              # Utilities
│   └── logger.ts
└── index.ts            # Entry Point (Hono App)
```

## 📝 TODO List

### 1. 🔄 Buy Flow (Minting)

- [ ] **Monitor**: Listen for `TokensMinted` events on `BiequityCore`.
- [ ] **Action**:
  1.  Operator withdraws USDC from contract (`withdrawUsdcFromStock`).
  2.  Operator converts USDC to USD (Off-ramp / Exchange).
  3.  Operator funds Alpaca account.
  4.  Operator places **Buy Order** on Alpaca for the specific stock.
  5.  Once filled, Operator calls `settleTokens` on-chain to back the minted tokens.

### 2. 🔄 Sell Flow (Redemption)

- [ ] **Monitor**: Listen for `TokensRedeemed` events on `BiequityCore`.
- [ ] **Action**:
  1.  Operator places **Sell Order** on Alpaca.
  2.  Operator withdraws USD from Alpaca.
  3.  Operator converts USD to USDC (On-ramp).
  4.  Operator deposits USDC back to contract (Need `depositUsdc` function on contract or similar mechanism).

### 3. 🛠️ Helpers & Services

- [ ] **Alpaca Service**:
  - `getAccount()`
  - `placeOrder(symbol, qty, side, type)`
  - `getPosition(symbol)`
- [ ] **Web3 Service**:
  - `listenForEvents()`
  - `processBuyQueue()`
  - `processSellQueue()`
- [ ] **Contract Helpers**:
  - `readContract`: Get stock config, balances.
  - `writeContract`: `settleTokens`, `withdrawUsdcFromStock`.

## 🔑 Environment Variables

- `ALPACA_API_KEY`
- `ALPACA_SECRET_KEY`
- `OPERATOR_PRIVATE_KEY`
- `RPC_URL`
- `BIEQUITY_CORE_ADDRESS`
