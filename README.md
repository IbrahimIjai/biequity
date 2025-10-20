<div align="center">

# Biequity

Buy Fully Backed Stocks with Crypto

</div>

## Overview

Biequity is a protocol to issue fully backed “stocks” as ERC‑20 tokens on Base. Users deposit stablecoins as collateral to mint, trade, and redeem tokenized equities with transparent, onchain backing.

- Fully collateralized ERC‑20 “stock” tokens
- Mint/Redeem against stablecoin collateral
- Built on Base, using wagmi + viem
- Farcaster Mini App–ready (local MiniKit provider)

> Note: This repository currently contains the app/mini-app frontend scaffolding and integrations. Smart contracts will be added or linked as they are finalized.

## Tech Stack

- Next.js 15, React 19
- wagmi 2, viem 2, Reown AppKit (WalletConnect)
- Tailwind CSS 4, @tanstack/react-query 5
- Base network

## Quick Start

Install dependencies:

```bash
pnpm install
```

Run the dev server:

```bash
pnpm dev
```

Open http://localhost:3000 in your browser.

## Configuration

Environment variables (create `.env.local`):

- `NEXT_PUBLIC_URL` – Public URL of the app (e.g. https://yourapp.xyz). Defaults to http://localhost:3000.
- WalletConnect / Reown Project ID – Configure in `config/web3.ts` (required for wallet connections).

Mini App manifest values live in `minikit.config.ts` (name, subtitle, tagline, OG fields, screenshots, etc.).

## Project Structure

- `app/(marketing)/page.tsx` – Marketing landing page
- `providers/root-provider.tsx` – App providers (wagmi, MiniKit, theme)
- `providers/minikit-provider.tsx` – Local MiniKit provider, hooks, SafeArea
- `providers/reown-wagmi.tsx` – Reown AppKit + wagmi integration
- `app/.well-known/farcaster.json/route.ts` – Mini App manifest route

## Repository Indexing (Crypto/DeFi)

For better discoverability on platforms (e.g. Talent Protocol, GitHub topics), consider adding these topics to your repository:

`defi`, `erc20`, `tokenized-assets`, `stablecoins`, `onchain-collateral`, `base-chain`, `wagmi`, `viem`, `walletconnect`, `reown`, `farcaster`, `mini-app`, `nextjs`, `typescript`

You may also add keywords in `package.json` for additional indexing.

## License

MIT
