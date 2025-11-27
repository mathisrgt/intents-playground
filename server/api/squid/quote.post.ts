import { getSquidRoute } from '../../controllers/squid.controller';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log('Squid quote - Received body:', JSON.stringify(body, null, 2));

    const {
      fromChainId,
      toChainId,
      fromToken,
      toToken,
      fromAmount,
      fromAddress,
      toAddress
    } = body;

    // Validate required parameters
    if (!fromChainId || !toChainId || !fromToken || !toToken || !fromAmount || !fromAddress) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameters: fromChainId, toChainId, fromToken, toToken, fromAmount, fromAddress',
      });
    }

    const result = await getSquidRoute(
      fromChainId,
      toChainId,
      fromToken,
      toToken,
      fromAmount,
      fromAddress,
      toAddress
    );

    return {
      success: true,
      ...result,
    };

  } catch (error: any) {
    console.error('Squid quote error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to get Squid quote',
    });
  }
});
