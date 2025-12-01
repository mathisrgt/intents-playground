import { executeSquidSwap } from '../../controllers/squid.controller';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log('Squid execute swap - Received body:', JSON.stringify(body, null, 2));

    const { route } = body;

    // Validate required parameters
    if (!route) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameter: route',
      });
    }

    const result = await executeSquidSwap(route);

    return {
      success: true,
      ...result,
    };

  } catch (error: any) {
    console.error('Squid execute swap error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to execute Squid swap',
    });
  }
});
