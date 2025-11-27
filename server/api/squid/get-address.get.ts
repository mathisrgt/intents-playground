import { ethers } from "ethers";
import { Wallet } from "xrpl";

export default defineEventHandler(async () => {
  try {
    const runtimeConfig = useRuntimeConfig();

    if (!runtimeConfig.evmPrivateKey) {
      throw new Error('EVM private key not configured');
    }

    if (!runtimeConfig.xrplSeed) {
      throw new Error('XRPL seed not configured');
    }

    const evmWallet = new ethers.Wallet(runtimeConfig.evmPrivateKey);
    const evmAddress = evmWallet.address;

    const xrplWallet = Wallet.fromSeed(runtimeConfig.xrplSeed);
    const xrplAddress = xrplWallet.address;

    return {
      success: true,
      evmAddress,
      xrplAddress,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to get addresses',
    });
  }
});
