import { getReadyToAcceptSecretFills } from '../../controllers/oneinch.controller';

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

    // Get ready to accept secret fills
    const secretsToShare = await getReadyToAcceptSecretFills(orderHash);

    return {
      success: true,
      fills: secretsToShare.fills || [],
    };
  } catch (error: any) {
    console.error('Error getting ready secrets:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to get ready secret fills',
    });
  }
});
