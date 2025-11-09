import { OpenAPI, OneClickService, QuoteRequest } from '@defuse-protocol/one-click-sdk-typescript';

/**
 *  Get Quote for cross-chain token swaps
 *
 *  This function retrieves a quote for cross-chain token swaps.
 *  It calculates the expected output and fees for a given swap configuration.
 *  Will provide a quote and unique deposit address to send the funds to.
 */

export async function getQuote(
  dry: boolean,
  senderAddress: string,
  recipientAddress: string,
  originAsset: string,
  destinationAsset: string,
  amount: string
) {
  try {
    // Initialize the API client
    OpenAPI.BASE = 'https://1click.chaindefuser.com';

    // Configure JWT token from runtime config
    const runtimeConfig = useRuntimeConfig();
    if (runtimeConfig.oneClickJwt) {
      OpenAPI.TOKEN = runtimeConfig.oneClickJwt;
    }

    const quoteRequest: QuoteRequest = {
      // Testing Mode : set to true for quote estimation / testing, false for actual execution
      dry,

      // Swap execution type - determines whether input or output amount is the basis of the swap
      swapType: QuoteRequest.swapType.EXACT_INPUT,

      // Maximum acceptable slippage as basis points (100 = 1.00%)
      slippageTolerance: 100,

      // Source token identifier
      originAsset,

      // Type of deposit address
      depositType: QuoteRequest.depositType.ORIGIN_CHAIN,

      // Target token identifier
      destinationAsset,

      // Amount to swap (in token's smallest unit/decimals)
      amount,

      // Address to receive refunds if swap fails
      refundTo: senderAddress,

      // Type of refund address
      refundType: QuoteRequest.refundType.ORIGIN_CHAIN,

      // Final recipient address for the swapped tokens
      recipient: recipientAddress,

      // Type of recipient address
      recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,

      // Quote expiration timestamp (3 minutes from now)
      deadline: new Date(Date.now() + 3 * 60 * 1000).toISOString(),

      // Referral identifier
      referral: "referral",

      // Maximum time to wait for quote response
      quoteWaitingTimeMs: 3000,
    };

    // Fetch quote from 1-Click API
    const quote = await OneClickService.getQuote(quoteRequest);
    return quote;
  } catch (error) {
    console.error('Error fetching quote:', error);
    throw error;
  }
}
