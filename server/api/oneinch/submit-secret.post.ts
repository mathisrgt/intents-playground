import { submitSecret } from '../../controllers/oneinch.controller';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { orderHash, secret } = body;

    // Validate required parameters
    if (!orderHash || !secret) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameters: orderHash or secret',
      });
    }

    // Submit the secret
    const result = await submitSecret(orderHash, secret);

    return {
      success: true,
      result,
    };
  } catch (error: any) {
    console.error('Error submitting secret:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to submit secret',
    });
  }
});
