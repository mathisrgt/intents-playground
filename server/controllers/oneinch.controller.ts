import {
  SDK,
  HashLock,
  NetworkEnum,
  OrderStatus,
  PrivateKeyProviderConnector,
} from '@1inch/cross-chain-sdk';
import { createPublicClient, http } from 'viem';
import { randomBytes } from 'crypto';

/**
 * Initialize 1inch SDK instance
 * This function creates and configures the SDK with authentication and blockchain provider
 */
export function initSDK(privateKey: string, rpcUrl: string) {
  const runtimeConfig = useRuntimeConfig();

  // Create viem public client for RPC calls
  const viemClient = createPublicClient({
    transport: http(rpcUrl),
  });

  // Create provider connector compatible with 1inch SDK
  const viemProviderConnector = {
    eth: {
      async call(transactionConfig: any): Promise<string> {
        // Convert transaction config to viem format and make the call
        const result = await viemClient.call({
          to: transactionConfig.to,
          data: transactionConfig.data,
          from: transactionConfig.from,
          value: transactionConfig.value ? BigInt(transactionConfig.value) : undefined,
          gas: transactionConfig.gas ? BigInt(transactionConfig.gas) : undefined,
          gasPrice: transactionConfig.gasPrice ? BigInt(transactionConfig.gasPrice) : undefined,
        });
        return result.data || '0x';
      }
    },
    extend(): void {}
  };

  const connector = new PrivateKeyProviderConnector(
    privateKey,
    viemProviderConnector
  );

  const sdk = new SDK({
    url: 'https://api.1inch.dev/fusion-plus',
    authKey: runtimeConfig.oneInchAuthKey,
    blockchainProvider: connector,
  });

  return sdk;
}

/**
 * Get Quote for 1inch cross-chain swap
 *
 * This function retrieves a quote for cross-chain token swaps using 1inch Fusion+.
 * It calculates the expected output and fees for a given swap configuration.
 */
export async function getQuote(
  walletAddress: string,
  srcChainId: NetworkEnum,
  dstChainId: NetworkEnum,
  srcTokenAddress: string,
  dstTokenAddress: string,
  amount: string
) {
  try {
    const runtimeConfig = useRuntimeConfig();
    const privateKey = runtimeConfig.evmPrivateKey;
    const rpcUrl = getRpcUrl(srcChainId);

    const sdk = initSDK(privateKey, rpcUrl);

    const quote = await sdk.getQuote({
      amount,
      srcChainId,
      dstChainId,
      enableEstimate: true,
      srcTokenAddress,
      dstTokenAddress,
      walletAddress
    });

    return quote;
  } catch (error) {
    console.error('Error fetching 1inch quote:', error);
    throw error;
  }
}

/**
 * Create a cross-chain order
 *
 * This function creates a 1inch Fusion+ order with secrets for atomic swap execution.
 * Returns the order hash, secrets, and order details needed for submission.
 */
export async function createOrder(
  walletAddress: string,
  quote: any,
  preset: string
) {
  try {
    const runtimeConfig = useRuntimeConfig();
    const privateKey = runtimeConfig.evmPrivateKey;
    const rpcUrl = getRpcUrl(quote.srcChainId);

    const sdk = initSDK(privateKey, rpcUrl);

    // Generate secrets based on preset requirements
    const presetData = quote.presets[preset];
    const secrets = Array.from({
      length: presetData.secretsCount
    }).map(() => '0x' + randomBytes(32).toString('hex'));

    // Create hash lock from secrets
    const hashLock = secrets.length === 1
      ? HashLock.forSingleFill(secrets[0])
      : HashLock.forMultipleFills(HashLock.getMerkleLeaves(secrets));

    const secretHashes = secrets.map((s) => HashLock.hashSecret(s));

    // Create the order
    const { hash, quoteId, order } = await sdk.createOrder(quote, {
      walletAddress,
      hashLock,
      preset,
      source: 'intents-playground',
      secretHashes
    });

    return {
      hash,
      quoteId,
      order,
      secrets,
      secretHashes
    };
  } catch (error) {
    console.error('Error creating 1inch order:', error);
    throw error;
  }
}

/**
 * Submit order to the 1inch relayer network
 *
 * This function submits the created order to the resolver network for execution.
 */
export async function submitOrder(
  srcChainId: NetworkEnum,
  order: any,
  quoteId: string,
  secretHashes: string[]
) {
  try {
    const runtimeConfig = useRuntimeConfig();
    const privateKey = runtimeConfig.evmPrivateKey;
    const rpcUrl = getRpcUrl(srcChainId);

    const sdk = initSDK(privateKey, rpcUrl);

    const orderInfo = await sdk.submitOrder(
      srcChainId,
      order,
      quoteId,
      secretHashes
    );

    return orderInfo;
  } catch (error) {
    console.error('Error submitting 1inch order:', error);
    throw error;
  }
}

/**
 * Get fills ready to accept secrets
 *
 * This function checks which escrows are deployed and ready for secret submission.
 */
export async function getReadyToAcceptSecretFills(orderHash: string) {
  try {
    const runtimeConfig = useRuntimeConfig();
    const privateKey = runtimeConfig.evmPrivateKey;
    const rpcUrl = 'https://ethereum-rpc.publicnode.com'; // Default RPC

    const sdk = initSDK(privateKey, rpcUrl);

    const secretsToShare = await sdk.getReadyToAcceptSecretFills(orderHash);

    return secretsToShare;
  } catch (error) {
    console.error('Error getting ready to accept secret fills:', error);
    throw error;
  }
}

/**
 * Submit secret for escrow execution
 *
 * This function submits a secret to allow the resolver to complete the swap.
 */
export async function submitSecret(orderHash: string, secret: string) {
  try {
    const runtimeConfig = useRuntimeConfig();
    const privateKey = runtimeConfig.evmPrivateKey;
    const rpcUrl = 'https://ethereum-rpc.publicnode.com'; // Default RPC

    const sdk = initSDK(privateKey, rpcUrl);

    await sdk.submitSecret(orderHash, secret);

    return { success: true };
  } catch (error) {
    console.error('Error submitting secret:', error);
    throw error;
  }
}

/**
 * Check execution status of an order
 *
 * This function checks the current status of a 1inch Fusion+ order.
 * Possible statuses: Pending, Executed, Expired, Refunded
 */
export async function getOrderStatus(orderHash: string) {
  try {
    const runtimeConfig = useRuntimeConfig();
    const privateKey = runtimeConfig.evmPrivateKey;
    const rpcUrl = 'https://ethereum-rpc.publicnode.com'; // Default RPC

    const sdk = initSDK(privateKey, rpcUrl);

    const status = await sdk.getOrderStatus(orderHash);

    return status;
  } catch (error) {
    console.error('Error checking 1inch order status:', error);
    throw error;
  }
}

/**
 * Helper function to get RPC URL for a given chain
 */
function getRpcUrl(chainId: NetworkEnum): string {
  const rpcUrls: Record<number, string> = {
    [NetworkEnum.ETHEREUM]: 'https://ethereum-rpc.publicnode.com',
    [NetworkEnum.BINANCE]: 'https://bsc-rpc.publicnode.com',
    [NetworkEnum.POLYGON]: 'https://polygon-bor-rpc.publicnode.com',
    [NetworkEnum.AVALANCHE]: 'https://avalanche-c-chain-rpc.publicnode.com',
    [NetworkEnum.ARBITRUM]: 'https://arbitrum-one-rpc.publicnode.com',
    [NetworkEnum.OPTIMISM]: 'https://optimism-rpc.publicnode.com',
    [NetworkEnum.BASE]: 'https://mainnet.base.org',
  };

  return rpcUrls[chainId] || 'https://ethereum-rpc.publicnode.com';
}

/**
 * Export NetworkEnum and OrderStatus for use in API endpoints
 */
export { NetworkEnum, OrderStatus };
