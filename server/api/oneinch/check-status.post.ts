import { getOrderStatus } from '../../controllers/oneinch.controller';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { orderHash } = body;

    // Validate required parameter
    if (!orderHash) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameter: orderHash',
      });
    }

    // Get order status
    const status = await getOrderStatus(orderHash);

    return {
      success: true,
      status: status.status,
      fills: status.fills || [],
      details: status,
    };
  } catch (error: any) {
    console.error('Error checking order status:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to check order status',
    });
  }
});
