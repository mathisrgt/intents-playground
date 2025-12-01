import { ethers } from "ethers";
import axios from "axios";

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to get the correct token address format
function getTokenAddress(chainId: string, tokenAddress: string): string {
  // For XRPL mainnet, use 'xrp' for native XRP instead of 0xEee...
  if (chainId === 'xrpl-mainnet') {
    if (tokenAddress.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      return 'xrp';
    }
  }

  // For XRPL-EVM (1440000), keep the 0xEee... format for native token
  return tokenAddress;
}


export async function getSquidRoute(
  fromChainId: string,
  toChainId: string,
  fromToken: string,
  toToken: string,
  fromAmount: string,
  fromAddress: string,
  toAddress?: string
) {
  const runtimeConfig = useRuntimeConfig();

  // Convert token addresses to the correct format for each chain
  const formattedFromToken = getTokenAddress(fromChainId, fromToken);
  const formattedToToken = getTokenAddress(toChainId, toToken);

  const params = {
    fromAddress,
    fromChain: fromChainId,
    fromToken: formattedFromToken,
    fromAmount,
    toChain: toChainId,
    toToken: formattedToToken,
    toAddress: toAddress || fromAddress,
    quoteOnly: false
  };

  let retries = 3;
  while (retries > 0) {
    try {
      const result = await axios.post(
        "https://v2.api.squidrouter.com/v2/route",
        params,
        {
          headers: {
            "x-integrator-id": runtimeConfig.squidIntegratorId,
            "Content-Type": "application/json",
          },
        }
      );

      const requestId = result.headers["x-request-id"];
      return {
        route: result.data.route,
        requestId
      };
    } catch (error: any) {
      if (error.response?.status === 429 && retries > 1) {
        console.log(`Rate limited, waiting 3s... (${retries - 1} retries left)`);
        await delay(3000);
        retries--;
      } else {
        if (error.response) {
          console.error("Squid API error:", error.response.data);
        }
        throw error;
      }
    }
  }

  throw new Error('Failed after retries');
}

export async function executeSquidSwap(
  route: any
) {
  const runtimeConfig = useRuntimeConfig();

  if (!route.transactionRequest) {
    throw new Error("No transaction request in route");
  }

  // Check if this is from XRPL mainnet (non-EVM)
  const fromChain = route.params?.fromChain || route.estimate?.fromChain;

  if (fromChain === 'xrpl-mainnet') {
    // Execute XRPL transaction on server
    const { Client, Wallet } = await import('xrpl');

    const client = new Client('wss://s1.ripple.com');
    await client.connect();

    try {
      const wallet = Wallet.fromSeed(runtimeConfig.xrplSeed);

      // Get the payment transaction from the route
      const payment = route.transactionRequest.data;

      console.log('Executing XRPL transaction:', JSON.stringify(payment, null, 2));

      // Sign and submit transaction
      const prepared = await client.autofill(payment);
      const signed = wallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);

      await client.disconnect();

      if (result.result.meta && typeof result.result.meta === 'object' && 'TransactionResult' in result.result.meta) {
        const txResult = result.result.meta.TransactionResult;

        if (txResult === 'tesSUCCESS') {
          return {
            hash: result.result.hash,
            axelarScanLink: `https://axelarscan.io/gmp/${result.result.hash}`,
            explorerUrl: `https://livenet.xrpl.org/transactions/${result.result.hash}`,
          };
        } else {
          throw new Error(`XRPL transaction failed: ${txResult}`);
        }
      }

      throw new Error('XRPL transaction result unavailable');

    } catch (txError: any) {
      await client.disconnect();
      throw new Error(txError.message || 'XRPL transaction failed');
    }
  }

  // Execute XRPL-EVM swap directly
  const provider = new ethers.JsonRpcProvider("https://rpc.xrplevm.org");
  const signer = new ethers.Wallet(runtimeConfig.evmPrivateKey, provider);

  const target = route.transactionRequest.target;
  const data = route.transactionRequest.data;
  const value = route.transactionRequest.value;
  const fromToken = route.params?.fromToken || "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  const fromAmount = route.params?.fromAmount || value;

  // Approve if not native token (and not 'xrp' for XRPL)
  if (fromToken !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" && fromToken !== "xrp") {
    const tokenContract = new ethers.Contract(
      fromToken,
      ["function approve(address spender, uint256 amount) public returns (bool)"],
      signer
    );
    const approveTx = await tokenContract.approve(target, fromAmount);
    await approveTx.wait();
  }

  // Execute the transaction
  const tx = await signer.sendTransaction({
    to: target,
    data: data,
    value: value || "0",
    gasLimit: route.transactionRequest.gasLimit,
  });

  await tx.wait();

  return {
    hash: tx.hash,
    axelarScanLink: `https://axelarscan.io/gmp/${tx.hash}`,
  };
}

export async function getSquidStatus(
  transactionId: string,
  requestId: string,
  fromChainId: string,
  toChainId: string,
  quoteId?: string,
) {
  const runtimeConfig = useRuntimeConfig();

  try {
    console.log('Getting Squid status with params:', {
      transactionId,
      fromChainId,
      toChainId,
      requestId,
      quoteId
    });

    const result = await axios.get("https://v2.api.squidrouter.com/v2/status", {
      params: {
        transactionId,
        fromChainId,
        toChainId,
        requestId,
        ...(quoteId && { quoteId })
      },
      headers: {
        "x-integrator-id": runtimeConfig.squidIntegratorId,
      },
    });

    console.log('Squid status response:', JSON.stringify(result.data, null, 2));
    return result.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Squid status API error:", error.response.data);
      // Return error info instead of throwing for 404s
      if (error.response.status === 404) {
        return {
          squidTransactionStatus: "not_found",
          error: "Transaction not found"
        };
      }
    }
    throw error;
  }
}

export async function pollSquidStatus(
  transactionId: string,
  requestId: string,
  fromChainId: string,
  toChainId: string,
  quoteId?: string
) {
  const completedStatuses = ["success", "partial_success", "needs_gas", "not_found"];
  const maxRetries = 20;
  let retryCount = 0;

  let status = await getSquidStatus(transactionId, requestId, fromChainId, toChainId, quoteId);

  while (status.squidTransactionStatus && !completedStatuses.includes(status.squidTransactionStatus)) {
    if (retryCount >= maxRetries) {
      console.log("Max retries reached for polling");
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
    status = await getSquidStatus(transactionId, requestId, fromChainId, toChainId, quoteId);
    retryCount++;
  }

  return status;
}
