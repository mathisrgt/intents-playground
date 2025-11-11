import { xrpToDrops, Client, Wallet, Payment } from 'xrpl';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log('Received body:', JSON.stringify(body, null, 2));
    const { depositAddress, amount } = body;
    console.log('depositAddress type:', typeof depositAddress, 'value:', depositAddress);
    console.log('amount type:', typeof amount, 'value:', amount);

    if (!depositAddress) {
      throw createError({
        statusCode: 400,
        message: 'Deposit address is required',
      });
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw createError({
        statusCode: 400,
        message: 'Valid amount is required',
      });
    }

    const runtimeConfig = useRuntimeConfig();

    // Initialize XRPL client
    const client = new Client('wss://s1.ripple.com'); // Mainnet
    await client.connect();

    try {
      // Create wallet from seed
      const wallet = Wallet.fromSeed(runtimeConfig.xrplSeed);

      // Prepare payment transaction
      const payment: Payment = {
        TransactionType: 'Payment',
        Account: wallet.address,
        Destination: depositAddress,
        Amount: xrpToDrops(amount),
      };

      // Sign and submit transaction
      const prepared = await client.autofill(payment);
      const signed = wallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);

      await client.disconnect();

      if (result.result.meta && typeof result.result.meta === 'object' && 'TransactionResult' in result.result.meta) {
        const txResult = result.result.meta.TransactionResult;

        if (txResult === 'tesSUCCESS') {
          return {
            success: true,
            hash: result.result.hash,
            explorerUrl: `https://livenet.xrpl.org/transactions/${result.result.hash}`,
            result: result.result,
          };
        } else {
          throw createError({
            statusCode: 500,
            message: `Transaction failed: ${txResult}`,
          });
        }
      }

      throw createError({
        statusCode: 500,
        message: 'Transaction result unavailable',
      });

    } catch (txError: any) {
      await client.disconnect();
      throw createError({
        statusCode: 500,
        message: txError.message || 'Transaction failed',
      });
    }

  } catch (error: any) {
    console.error('Send deposit error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to send deposit',
    });
  }
});
