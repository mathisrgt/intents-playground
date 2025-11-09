import { xrpToDrops } from 'xrpl';
import { getQuote } from '../../controllers/near.controller';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { recipientAddress, amount } = body;

    if (!recipientAddress) {
      throw createError({
        statusCode: 400,
        message: 'Recipient EVM address is required',
      });
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw createError({
        statusCode: 400,
        message: 'Valid amount is required',
      });
    }

    const runtimeConfig = useRuntimeConfig();
    const { Wallet } = await import('xrpl');

    const senderAddress = Wallet.fromSeed(runtimeConfig.xrplSeed).address;
    const originAsset = "nep141:xrp.omft.near"; // XRP on XRPL
    const destinationAsset = "nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near"; // USDC on Base

    const amountInDrops = xrpToDrops(amount);

    const quote = await getQuote(
      false, // dry = false for actual quote with deposit address
      senderAddress,
      recipientAddress,
      originAsset,
      destinationAsset,
      amountInDrops
    );

    return {
      success: true,
      quote: quote.quote,
      senderAddress,
    };
  } catch (error: any) {
    console.error('Quote API error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to get quote',
    });
  }
});
