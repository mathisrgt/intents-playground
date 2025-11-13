import { getQuote, NetworkEnum } from '../../controllers/oneinch.controller';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      walletAddress,
      srcChainId,
      dstChainId,
      srcTokenAddress,
      dstTokenAddress,
      amount,
    } = body;

    // Validate required parameters
    if (!walletAddress || !srcChainId || !dstChainId || !srcTokenAddress || !dstTokenAddress || !amount) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameters',
      });
    }

    // Get quote from 1inch SDK
    const quote = await getQuote(
      walletAddress,
      srcChainId,
      dstChainId,
      srcTokenAddress,
      dstTokenAddress,
      amount
    );

    return {
      success: true,
      quote,
    };
  } catch (error: any) {
    console.error('Error getting 1inch quote:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to get quote from 1inch',
    });
  }
});
