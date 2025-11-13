import { createOrder, submitOrder } from '../../controllers/oneinch.controller';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { walletAddress, quote, preset } = body;

    // Validate required parameters
    if (!walletAddress || !quote || !preset) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameters: walletAddress, quote, or preset',
      });
    }

    // Create the order
    const orderData = await createOrder(walletAddress, quote, preset);

    // Submit the order to the relayer network
    const submissionResult = await submitOrder(
      quote.srcChainId,
      orderData.order,
      orderData.quoteId,
      orderData.secretHashes
    );

    return {
      success: true,
      orderHash: orderData.hash,
      secrets: orderData.secrets,
      order: orderData.order,
      submissionResult,
    };
  } catch (error: any) {
    console.error('Error creating/submitting 1inch order:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create/submit order',
    });
  }
});
