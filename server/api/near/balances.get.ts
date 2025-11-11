import { Client, Wallet } from 'xrpl';
import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  }
] as const;

export default defineEventHandler(async (event) => {
  try {
    const runtimeConfig = useRuntimeConfig();

    // Get XRPL balance
    let xrpBalance = 0;
    try {
      const client = new Client('wss://s1.ripple.com');
      await client.connect();

      const wallet = Wallet.fromSeed(runtimeConfig.xrplSeed);
      const balance = await client.getXrpBalance(wallet.address);
      xrpBalance = balance;

      await client.disconnect();
    } catch (err) {
      console.error('Error fetching XRP balance:', err);
    }

    // Get Base USDC balance
    let usdcBalance = '0';
    let evmAddress = '';
    try {
      // Check if EVM private key is configured
      if (!runtimeConfig.evmPrivateKey) {
        console.warn('EVM private key not configured, skipping USDC balance fetch');
        usdcBalance = 'Not configured';
      } else {
        // Ensure private key has 0x prefix
        let privateKey = runtimeConfig.evmPrivateKey;
        if (!privateKey.startsWith('0x')) {
          privateKey = `0x${privateKey}`;
        }

        const account = privateKeyToAccount(privateKey as `0x${string}`);
        evmAddress = account.address;
        console.log('Base address:', evmAddress);

        const publicClient = createPublicClient({
          chain: base,
          transport: http('https://mainnet.base.org'),
        });

        console.log('Fetching USDC balance for:', evmAddress);
        const balance = await publicClient.readContract({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [account.address],
        }) as bigint;

        console.log('Raw USDC balance:', balance.toString());
        usdcBalance = formatUnits(balance, 6);
        console.log('Formatted USDC balance:', usdcBalance);
      }
    } catch (err: any) {
      console.error('Error fetching USDC balance:', err);
      console.error('Error details:', {
        message: err.message,
        cause: err.cause,
        stack: err.stack
      });
    }

    return {
      success: true,
      balances: {
        xrpl: {
          XRP: xrpBalance
        },
        base: {
          USDC: usdcBalance
        }
      }
    };
  } catch (error: any) {
    console.error('Balance fetch error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch balances',
    });
  }
});
