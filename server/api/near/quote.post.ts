import { Wallet, xrpToDrops } from 'xrpl';
import { getQuote } from '../../controllers/near.controller';
import { getTokenId } from '~~/server/constants/tokens';

export default defineEventHandler(async (event) => {
  try {
    const runtimeConfig = useRuntimeConfig();
    
    const body = await readBody(event);
    const { recipientAddress, smallestUnitAmount, originChain, originTokenName, destChain, destTokenName } = body;

    const senderAddress = Wallet.fromSeed(runtimeConfig.xrplSeed).address;
    
    const originAsset = getTokenId(originChain, originTokenName);
    const destinationAsset = getTokenId(destChain, destTokenName);

    const quote = await getQuote(
      false,
      senderAddress,
      recipientAddress,
      originAsset,
      destinationAsset,
      smallestUnitAmount
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
