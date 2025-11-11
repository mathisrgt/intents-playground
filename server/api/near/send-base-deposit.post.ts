import { Address, createWalletClient, erc20Abi, http, parseUnits } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const USDC_ADDRESS = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'; // Base USDC

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log('Base deposit - Received body:', JSON.stringify(body, null, 2));
    const { depositAddress, amount } = body;
    console.log('Base deposit - depositAddress type:', typeof depositAddress, 'value:', depositAddress);
    console.log('Base deposit - amount type:', typeof amount, 'value:', amount);

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

    // Validate EVM private key is configured
    if (!runtimeConfig.evmPrivateKey) {
      throw createError({
        statusCode: 500,
        message: 'EVM private key not configured. Please set NUXT_EVM_PRIVATE_KEY in your .env file',
      });
    }

    // Ensure private key has 0x prefix
    let privateKey = runtimeConfig.evmPrivateKey;
    if (!privateKey.startsWith('0x')) {
      privateKey = `0x${privateKey}`;
    }

    // Create wallet client
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    const client = createWalletClient({
      account,
      chain: base,
      transport: http(),
    });

    try {
      // Convert amount to USDC units (6 decimals)
      const amountInUnits = parseUnits(amount, 6);

      // Send USDC transfer transaction
      const hash = await client.writeContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [depositAddress as Address, amountInUnits],
      });

      return {
        success: true,
        hash,
        explorerUrl: `https://basescan.org/tx/${hash}`,
      };

    } catch (txError: any) {
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
