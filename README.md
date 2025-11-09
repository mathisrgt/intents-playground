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
- Cross-chain swaps (XRP → USDC on Base)
- Quote retrieval
- Deposit address generation

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
  - XRPL SDK
  - Future: Across Protocol, 1inch APIs

## API Endpoints

### NEAR Intents

#### POST `/api/near/quote`
Get a quote for cross-chain swap.

**Request:**
```json
{
  "recipientAddress": "0x...",
  "amount": "0.5"
}
```

**Response:**
```json
{
  "success": true,
  "quote": {
    "amountInFormatted": "0.5 XRP",
    "amountOutFormatted": "1.234 USDC",
    "depositAddress": "r...",
    "protocolFeeFormatted": "0.001 XRP",
    "gasFeeFormatted": "0.0001 XRP"
  },
  "senderAddress": "r..."
}
```

## Roadmap

- [x] Project setup with Nuxt UI
- [x] Dashboard with protocol cards
- [x] NEAR Intents integration
  - [x] Quote retrieval
  - [x] Token/network selection modal
  - [ ] Transaction submission
  - [ ] Status tracking
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
