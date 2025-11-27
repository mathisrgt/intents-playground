import { Squid } from "@0xsquid/sdk";
import { ethers } from "ethers";

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

  const squid = new Squid({
    baseUrl: "https://v2.api.squidrouter.com",
    integratorId: runtimeConfig.squidIntegratorId,
  });

  await squid.init();

  let retries = 3;
  while (retries > 0) {
    try {
      const { route, requestId } = await squid.getRoute({
        fromAddress,
        fromChain: fromChainId,
        fromToken,
        fromAmount,
        toChain: toChainId,
        toToken,
        toAddress,
      });

      return { route, requestId };
    } catch (error: any) {
      if (error.response?.status === 429 && retries > 1) {
        console.log(`Rate limited, waiting 3s... (${retries - 1} retries left)`);
        await delay(3000);
        retries--;
      } else {
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

  const provider = new ethers.JsonRpcProvider("https://rpc.xrplevm.org");
  const signer = new ethers.Wallet(runtimeConfig.evmPrivateKey, provider);

  if (!route.transactionRequest) {
    throw new Error("No transaction request in route");
  }

  const target = route.transactionRequest.target;
  const fromToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  const fromAmount = route.params.fromAmount;

  // Approve if not native token
  if (fromToken !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
    const tokenContract = new ethers.Contract(
      fromToken,
      ["function approve(address spender, uint256 amount) public returns (bool)"],
      signer
    );
    const approveTx = await tokenContract.approve(target, fromAmount);
    await approveTx.wait();
  }

  const squid = new Squid({
    baseUrl: "https://v2.api.squidrouter.com",
    integratorId: runtimeConfig.squidIntegratorId,
  });

  await squid.init();

  const txResponse = await squid.executeRoute({
    signer: signer as any,
    route,
  });

  const txHash = txResponse.hash || txResponse.transactionHash || 'unknown';

  return {
    hash: txHash,
    axelarScanLink: `https://axelarscan.io/gmp/${txHash}`,
  };
}

export async function getSquidStatus(
  transactionId: string,
  requestId: string,
  quoteId: string,
) {
  const runtimeConfig = useRuntimeConfig();

  const squid = new Squid({
    baseUrl: "https://v2.api.squidrouter.com",
    integratorId: runtimeConfig.squidIntegratorId,
  });

  await squid.init();

  return await squid.getStatus({
    transactionId,
    requestId,
    integratorId: runtimeConfig.squidIntegratorId,
    quoteId
  });
}

export async function pollSquidStatus(
  transactionId: string,
  requestId: string,
  quoteId: string
) {
  const completedStatuses = ["success", "partial_success", "needs_gas", "not_found"];
  let status = await getSquidStatus(transactionId, requestId, quoteId);

  while (status.squidTransactionStatus && !completedStatuses.includes(status.squidTransactionStatus)) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    status = await getSquidStatus(transactionId, requestId, quoteId);
  }

  return status;
}
