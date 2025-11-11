import { Wallet } from 'xrpl';
import { privateKeyToAccount } from 'viem/accounts';
import { getQuote } from '../../controllers/near.controller';
import { getTokenId } from '~~/server/constants/tokens';

export default defineEventHandler(async (event) => {
  try {
    const runtimeConfig = useRuntimeConfig();

    const body = await readBody(event);
    const { smallestUnitAmount, originChain, originTokenName, destChain, destTokenName } = body;

    // Validate minimum amounts
    if (originChain === 'xrpl' && originTokenName === 'XRP') {
      const minDrops = 2_000_000;
      if (Number(smallestUnitAmount) < minDrops) {
        throw createError({
          statusCode: 400,
          message: 'Minimum amount is 2 XRP',
        });
      }
    } else if (originChain === 'base' && originTokenName === 'USDC') {
      const minAmount = 5_000_000; // 5 USDC with 6 decimals
      if (Number(smallestUnitAmount) < minAmount) {
        throw createError({
          statusCode: 400,
          message: 'Minimum amount is 5 USDC',
        });
      }
    }

    // Validate EVM private key is configured
    if (!runtimeConfig.evmPrivateKey) {
      throw createError({
        statusCode: 500,
        message: 'EVM private key not configured. Please set NUXT_EVM_PRIVATE_KEY in your .env file',
      });
    }

    // Ensure private key has 0x prefix
    let evmPrivateKey = runtimeConfig.evmPrivateKey;
    if (!evmPrivateKey.startsWith('0x')) {
      evmPrivateKey = `0x${evmPrivateKey}`;
    }

    // Get sender and recipient addresses based on chains
    let senderAddress: string;
    let recipientAddress: string;

    if (originChain === 'xrpl') {
      // Sending from XRPL, receiving on Base
      senderAddress = Wallet.fromSeed(runtimeConfig.xrplSeed).address;
      const evmAccount = privateKeyToAccount(evmPrivateKey as `0x${string}`);
      recipientAddress = evmAccount.address;
    } else {
      // Sending from Base, receiving on XRPL
      const evmAccount = privateKeyToAccount(evmPrivateKey as `0x${string}`);
      senderAddress = evmAccount.address;
      recipientAddress = Wallet.fromSeed(runtimeConfig.xrplSeed).address;
    }

    const originAsset = getTokenId(originChain, originTokenName);
    const destinationAsset = getTokenId(destChain, destTokenName);

    const quote = await getQuote(
      false,
      senderAddress,
      recipientAddress,
      originAsset,
      destinationAsset,
      smallestUnitAmount
    );

    console.log('Quote received:', JSON.stringify(quote, null, 2));
    console.log('Quote.quote structure:', JSON.stringify(quote.quote, null, 2));

    return {
      success: true,
      quote: quote.quote,
      senderAddress,
      recipientAddress,
    };
  } catch (error: any) {
    console.error('Quote API error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to get quote',
    });
  }
});
