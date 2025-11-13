# 1inch Fusion+ Integration Guide

This document explains how the 1inch Fusion+ cross-chain swap integration works in the intents-playground project.

## Overview

The 1inch Fusion+ integration enables gasless cross-chain token swaps using atomic swaps with MEV protection. The implementation follows the same pattern as the NEAR intents integration.

## Architecture

### Backend Structure

```
server/
├── controllers/
│   └── oneinch.controller.ts    # 1inch SDK integration logic
└── api/
    └── oneinch/
        ├── quote.post.ts         # Get swap quote
        ├── create-order.post.ts  # Create and submit order
        ├── submit-secret.post.ts # Submit secrets for escrow execution
        ├── check-status.post.ts  # Check order status
        └── get-ready-secrets.post.ts  # Get escrows ready for secrets
```

### Frontend Structure

```
app/
└── pages/
    └── 1inch.vue                 # Complete swap interface
```

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed:
- `@1inch/cross-chain-sdk` - Official 1inch Fusion+ SDK
- `viem` - TypeScript interface for Ethereum (used for RPC calls)

### 2. Environment Variables

Add the following to your `.env` file:

```bash
# EVM Private Key (used for signing transactions)
NUXT_EVM_PRIVATE_KEY=0xyour_private_key_here

# 1inch API Authentication Key
# Get yours at: https://portal.1inch.dev/
NUXT_ONE_INCH_AUTH_KEY=your_1inch_api_key_here
```

**Important:**
- The `NUXT_EVM_PRIVATE_KEY` should start with `0x`
- Get your 1inch API key from the [1inch Developer Portal](https://portal.1inch.dev/)
- Never commit your `.env` file to version control

### 3. Supported Networks and Tokens

The integration currently supports:

**Source Networks:**
- Ethereum (USDC)
- Polygon (USDT)
- Base (USDC)

**Destination Networks:**
- Binance Smart Chain (BNB)
- Ethereum (USDT)
- Base (ETH)

You can easily add more networks by editing the `fromOptions` and `toOptions` arrays in `/app/pages/1inch.vue`.

## How It Works

### User Flow

1. **Get Quote**
   - User selects source and destination tokens/networks
   - Enters amount to swap (minimum 10 tokens)
   - System calls 1inch API to get quote and recommended preset

2. **Create Order**
   - User clicks "Create & Submit Order"
   - Backend generates cryptographic secrets for atomic swap
   - Order is created and submitted to 1inch resolver network
   - Order hash is returned for tracking

3. **Automatic Secret Sharing**
   - Frontend polls for escrows that need secrets
   - When resolvers deploy escrows, secrets are automatically submitted
   - This enables the atomic swap execution

4. **Order Execution**
   - Resolvers execute the cross-chain swap
   - User receives tokens on the destination chain
   - Order status updates to "Executed"

### Technical Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ 1. Get Quote
       ▼
┌─────────────────┐
│  Frontend       │
│  (1inch.vue)    │
└──────┬──────────┘
       │ 2. API Call
       ▼
┌─────────────────────┐
│  Backend API        │
│  /api/oneinch/quote │
└──────┬──────────────┘
       │ 3. SDK Call
       ▼
┌──────────────────────┐
│  1inch Controller    │
│  (SDK Integration)   │
└──────┬───────────────┘
       │ 4. Request
       ▼
┌──────────────────────┐
│  1inch Fusion+ API   │
│  api.1inch.dev       │
└──────┬───────────────┘
       │ 5. Quote Response
       ▼
      User
       │ 6. Create Order
       ▼
┌──────────────────────┐
│  Order Submission    │
│  + Secret Generation │
└──────┬───────────────┘
       │ 7. Monitor
       ▼
┌──────────────────────┐
│  Resolver Network    │
│  (Escrow Deployment) │
└──────┬───────────────┘
       │ 8. Auto Submit Secrets
       ▼
┌──────────────────────┐
│  Swap Execution      │
│  Cross-Chain Transfer│
└──────────────────────┘
```

## Key Concepts

### Atomic Swaps

1inch Fusion+ uses Hash Time-Locked Contracts (HTLCs) to ensure atomic swaps:
- User generates secrets and creates hash locks
- Escrows are deployed on both source and destination chains
- Secrets are revealed to allow resolver to complete the swap
- If swap fails, funds are automatically refunded

### Presets

Presets define swap parameters:
- **fast**: Quick execution, higher fees
- **medium**: Balanced speed and cost
- **slow**: Lower fees, longer execution time

The system automatically recommends the best preset based on current conditions.

### Secrets Management

- Secrets are cryptographic values used for atomic swaps
- Generated client-side and never shared until escrows are deployed
- Multiple secrets may be required for partial fills
- Automatic submission ensures smooth execution

## API Endpoints

### POST /api/oneinch/quote

Get a quote for cross-chain swap.

**Request:**
```json
{
  "walletAddress": "0x...",
  "srcChainId": 137,
  "dstChainId": 56,
  "srcTokenAddress": "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  "dstTokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  "amount": "10000000"
}
```

**Response:**
```json
{
  "success": true,
  "quote": {
    "recommendedPreset": "fast",
    "presets": {
      "fast": {
        "dstTokenAmount": "0.123",
        "secretsCount": 1
      }
    }
  }
}
```

### POST /api/oneinch/create-order

Create and submit order to resolver network.

**Request:**
```json
{
  "walletAddress": "0x...",
  "quote": { /* quote object */ },
  "preset": "fast"
}
```

**Response:**
```json
{
  "success": true,
  "orderHash": "0xabc123...",
  "secrets": ["0xsecret1...", "0xsecret2..."],
  "order": { /* order object */ }
}
```

### POST /api/oneinch/check-status

Check order execution status.

**Request:**
```json
{
  "orderHash": "0xabc123..."
}
```

**Response:**
```json
{
  "success": true,
  "status": "Executed",
  "fills": []
}
```

## Troubleshooting

### "Failed to get quote"
- Check that your `NUXT_ONE_INCH_AUTH_KEY` is valid
- Ensure the token addresses are correct for the selected networks
- Verify minimum amount requirements (10 tokens)

### "Failed to create order"
- Check that your `NUXT_EVM_PRIVATE_KEY` is valid and has 0x prefix
- Ensure wallet has sufficient token balance and allowance
- Verify the quote hasn't expired (quotes expire after a few minutes)

### "Order stuck in Pending"
- Secrets may not be submitting automatically
- Check browser console for errors
- Verify that the resolver network is operational

### "Network not supported"
- Add the desired network to NetworkEnum in the controller
- Add corresponding RPC URL in getRpcUrl() function
- Add token options in the frontend

## Adding New Networks

To add support for a new network:

1. Add the network to `NetworkEnum` in `1inch.vue`:
```typescript
const NetworkEnum = {
  // ... existing networks
  OPTIMISM: 10,
}
```

2. Add RPC URL in `oneinch.controller.ts`:
```typescript
function getRpcUrl(chainId: NetworkEnum): string {
  const rpcUrls: Record<number, string> = {
    // ... existing RPCs
    [NetworkEnum.OPTIMISM]: 'https://optimism-rpc.publicnode.com',
  };
  return rpcUrls[chainId] || 'https://ethereum-rpc.publicnode.com';
}
```

3. Add token options in `1inch.vue`:
```typescript
const fromOptions = [
  // ... existing options
  {
    network: { label: 'Optimism', value: NetworkEnum.OPTIMISM },
    token: {
      label: 'USDC',
      value: 'usdc-optimism',
      symbol: 'USDC',
      logo: 'usdc.png',
      address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
      decimals: 6
    }
  }
]
```

## Resources

- [1inch Fusion+ Documentation](https://portal.1inch.dev/documentation/apis/swap/fusion-plus/introduction)
- [1inch Cross-Chain SDK GitHub](https://github.com/1inch/cross-chain-sdk)
- [1inch Developer Portal](https://portal.1inch.dev/)
- [Technical Whitepaper](https://1inch.io/assets/1inch-fusion-plus.pdf)

## Security Notes

- Private keys are stored securely in environment variables
- Secrets are generated client-side and only shared when escrows are deployed
- Atomic swaps ensure either both sides complete or both are refunded
- MEV protection prevents front-running and sandwich attacks
- Always verify escrow addresses before submitting secrets (in production)

## License

Same as the main project.
