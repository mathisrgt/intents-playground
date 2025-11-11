import { getExecutionStatus } from '../../controllers/near.controller';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { depositAddress } = body;

    if (!depositAddress) {
      throw createError({
        statusCode: 400,
        message: 'Deposit address is required',
      });
    }

    const status = await getExecutionStatus(depositAddress);

    return {
      success: true,
      status,
    };
  } catch (error: any) {
    console.error('Status check error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to check status',
    });
  }
});
