/**
 * Token References for 1click API
 *
 * Structure: tokensReferences[chain][tokenSymbol] = assetId
 * AssetId format: nep141:{contract_address}.omft.near or nep141:wrap.near for native tokens
 */

export type Chain = 'xrpl' | 'base' | 'ethereum' | 'arbitrum';
export type TokenSymbol = 'XRP' | 'USDC' | 'ETH';

export const tokenIds: Record<Chain, Partial<Record<TokenSymbol, string>>> = {
  xrpl: {
    XRP: 'nep141:xrp.omft.near',
  },
  base: {
    USDC: 'nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near',
    ETH: 'nep141:base-0x4200000000000000000000000000000000000006.omft.near',
  },
  ethereum: {
    ETH: 'nep141:eth.bridge.near',
    USDC: 'nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near',
  },
  arbitrum: {
    USDC: 'nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near',
  }
};

/**
 * Get token ID on a specific chain
 */
export function getTokenId(chain: Chain, token: TokenSymbol): string {
  const tokenId = tokenIds[chain]?.[token];

  if (!tokenId) {
    throw new Error(`Token ${token} not found on chain ${chain}`);
  }

  return tokenId;
}