import { getSquidStatus, pollSquidStatus } from '../../controllers/squid.controller';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log('Squid check status - Received body:', JSON.stringify(body, null, 2));

    const { transactionId, requestId, fromChainId, toChainId, quoteId, poll } = body;

    // Validate required parameters
    if (!transactionId || !requestId || !fromChainId || !toChainId) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameters: transactionId, requestId, fromChainId, toChainId',
      });
    }

    let status;
    if (poll) {
      // Poll until completion
      status = await pollSquidStatus(transactionId, requestId, fromChainId, toChainId, quoteId);
    } else {
      // Get status once
      status = await getSquidStatus(transactionId, requestId, fromChainId, toChainId, quoteId);
    }

    return {
      success: true,
      status,
    };

  } catch (error: any) {
    console.error('Squid check status error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to check Squid status',
    });
  }
});
