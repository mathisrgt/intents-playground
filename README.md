# Blockchain Intents Playground

A Nuxt-based playground to test, compare, and understand different blockchain intent implementations across various protocols.

## Overview

This project provides a unified interface to interact with multiple blockchain intent solutions, allowing developers and researchers to:
- Compare different intent-based protocols
- Test cross-chain swaps and operations
- Understand implementation differences
- Prototype intent-based applications

## Supported Solutions

### 🟢 NEAR Intents
Chain abstraction solution powered by NEAR Protocol's 1click API.

**Status:** ✅ Implemented
**Features:**
- Bi-directional cross-chain swaps:
  - XRP (XRPL) → USDC (Base)
  - USDC (Base) → XRP (XRPL)
- Quote retrieval with automatic sender/recipient address generation
- Automatic transaction submission (XRPL via xrpl.js, Base via viem)
- Real-time balance display for both networks
- Intent status tracking with progress visualization

**Implementation:** `/app/pages/near-intents.vue`

### 🔵 Across Protocol
Optimistic bridge for fast cross-chain transfers.

**Status:** 🔄 Placeholder
**Planned Features:**
- Cross-chain bridging
- Relayer network interaction
- Fee optimization

**Implementation:** `/app/pages/across-protocol.vue`

### 🔵 1inch Fusion
Intent-based swap protocol with gasless transactions.

**Status:** 🔄 Placeholder
**Planned Features:**
- Gasless token swaps
- MEV protection
- Resolver network integration

**Implementation:** `/app/pages/1inch.vue`

## Architecture

```
intents-playground/
├── app/
│   ├── pages/
│   │   ├── index.vue              # Dashboard with protocol selection
│   │   ├── near-intents.vue       # NEAR Intents implementation
│   │   ├── across-protocol.vue    # Across Protocol (placeholder)
│   │   └── 1inch.vue              # 1inch Fusion (placeholder)
│   └── app.vue                    # Root application component
│
├── server/
│   ├── api/
│   │   └── near/
│   │       └── quote.post.ts      # NEAR quote endpoint
│   └── controllers/
│       └── near.controller.ts     # NEAR 1click integration
│
├── public/
│   └── icons/                     # Protocol and token logos
│
└── nuxt.config.ts                 # Nuxt configuration
```

## Setup

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```bash
# NEAR Intents (1click API)
NUXT_XRPL_SEED=your_xrpl_wallet_seed
NUXT_EVM_PRIVATE_KEY=your_evm_wallet_private_key
NUXT_ONE_CLICK_JWT=your_1click_api_jwt

# Future integrations
# NUXT_ACROSS_API_KEY=
# NUXT_1INCH_API_KEY=
```

**Get your 1click JWT:** [Request Form](https://docs.google.com/forms/d/e/1FAIpQLSdrSrqSkKOMb_a8XhwF0f7N5xZ0Y5CYgyzxiAuoC2g4a2N68g/viewform)

### Development

Start the development server:

```bash
npm run dev
```

Navigate to `http://localhost:3000`

## Technology Stack

- **Framework:** Nuxt 4.2.1
- **UI Library:** Nuxt UI 4.1.0
- **Styling:** Tailwind CSS (via Nuxt UI)
- **Blockchain Integrations:**
  - NEAR 1click SDK (Typescript)
  - XRPL SDK (xrpl.js)
  - Viem (for EVM chains like Base)
  - Future: Across Protocol, 1inch APIs

## API Endpoints

### NEAR Intents

#### POST `/api/near/quote`
Get a quote for cross-chain swap. Automatically generates sender and recipient addresses from configured private keys/seeds.

**Request:**
```json
{
  "smallestUnitAmount": "2000000",
  "originChain": "xrpl",
  "originTokenName": "XRP",
  "destChain": "base",
  "destTokenName": "USDC"
}
```

**Response:**
```json
{
  "success": true,
  "quote": {
    "amountInFormatted": "2.0 XRP",
    "amountOutFormatted": "1.234 USDC",
    "depositAddress": "r...",
    "protocolFeeFormatted": "0.001 XRP",
    "gasFeeFormatted": "0.0001 XRP"
  },
  "senderAddress": "r...",
  "recipientAddress": "0x..."
}
```

#### POST `/api/near/send-deposit`
Send XRP deposit to intent address (XRPL).

#### POST `/api/near/send-base-deposit`
Send USDC deposit to intent address (Base).

#### POST `/api/near/check-status`
Check the execution status of an intent.

#### GET `/api/near/balances`
Fetch XRP and USDC balances for configured wallets.

## Roadmap

- [x] Project setup with Nuxt UI
- [x] Dashboard with protocol cards
- [x] NEAR Intents integration
  - [x] Quote retrieval
  - [x] Token/network selection modal
  - [x] Bi-directional swaps (XRPL ↔ Base)
  - [x] Transaction submission (both chains)
  - [x] Status tracking with progress UI
  - [x] Balance display with refresh
- [ ] Across Protocol integration
  - [ ] Bridge quote
  - [ ] Relayer selection
  - [ ] Transaction execution
- [ ] 1inch Fusion integration
  - [ ] Swap quote
  - [ ] Resolver network
  - [ ] Gasless execution
- [ ] Comparison view
- [ ] Analytics dashboard

## Contributing

This is an educational project for exploring intent-based blockchain architectures. Contributions are welcome!

## Resources

- [NEAR Intents Documentation](https://near.org)
- [1click API Docs](https://1click.chaindefuser.com)
- [Across Protocol](https://across.to)
- [1inch Fusion](https://1inch.io)

## License

MIT
