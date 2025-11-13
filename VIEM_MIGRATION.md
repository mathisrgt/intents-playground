# Migration from Ethers to Viem

This document describes the migration from ethers to viem in the 1inch Fusion+ integration.

## Why Viem?

1. **Consistency**: The project already uses viem for the NEAR intents swap (Base chain interactions)
2. **Modern TypeScript**: Viem is designed with TypeScript-first approach
3. **Better DX**: More intuitive API and better error messages
4. **Tree-shakeable**: Smaller bundle sizes
5. **Type Safety**: Strong type inference and compile-time safety

## Changes Made

### 1. Controller Updates

**File**: `/server/controllers/oneinch.controller.ts`

**Before (ethers)**:
```typescript
import { JsonRpcProvider } from 'ethers';

const ethersRpcProvider = new JsonRpcProvider(rpcUrl);

const ethersProviderConnector = {
  eth: {
    call(transactionConfig: any): Promise<string> {
      return ethersRpcProvider.call(transactionConfig);
    }
  },
  extend(): void {}
};
```

**After (viem)**:
```typescript
import { createPublicClient, http } from 'viem';

const viemClient = createPublicClient({
  transport: http(rpcUrl),
});

const viemProviderConnector = {
  eth: {
    async call(transactionConfig: any): Promise<string> {
      const result = await viemClient.call({
        to: transactionConfig.to,
        data: transactionConfig.data,
        from: transactionConfig.from,
        value: transactionConfig.value ? BigInt(transactionConfig.value) : undefined,
        gas: transactionConfig.gas ? BigInt(transactionConfig.gas) : undefined,
        gasPrice: transactionConfig.gasPrice ? BigInt(transactionConfig.gasPrice) : undefined,
      });
      return result.data || '0x';
    }
  },
  extend(): void {}
};
```

### 2. Dependencies Update

**File**: `package.json`

**Removed**:
- ~~`ethers: ^6.15.0`~~ (no longer needed as direct dependency)

**Using**:
- `viem: ^2.38.6` (already installed, now used consistently across project)

Note: The `@1inch/cross-chain-sdk` still includes ethers internally, but we no longer use it directly.

### 3. Key Differences

| Feature | Ethers | Viem |
|---------|--------|------|
| Provider Creation | `new JsonRpcProvider(url)` | `createPublicClient({ transport: http(url) })` |
| Call Method | `provider.call(config)` | `client.call({ to, data, ... })` |
| BigInt Handling | Automatic | Explicit conversion with `BigInt()` |
| Return Type | `string` | `{ data: string }` |

## Benefits

1. ✅ **Unified Codebase**: Both NEAR intents and 1inch now use viem
2. ✅ **Type Safety**: Better TypeScript inference
3. ✅ **Smaller Bundle**: Removed unused ethers dependency
4. ✅ **Modern API**: More intuitive method signatures
5. ✅ **Better Errors**: Clearer error messages for debugging

## Testing

The migration has been tested and verified:
- ✅ Server starts without errors
- ✅ All API endpoints compile successfully
- ✅ Provider connector properly adapts viem to 1inch SDK expectations

## Usage

No changes required for API consumers. The migration is internal only:

```typescript
// API usage remains the same
const quote = await $fetch('/api/oneinch/quote', {
  method: 'POST',
  body: { /* ... */ }
});
```

## Future Improvements

Consider these enhancements:

1. **Chain-Specific Clients**: Use viem's chain definitions for better type safety
   ```typescript
   import { mainnet, polygon, bsc } from 'viem/chains';

   const viemClient = createPublicClient({
     chain: polygon, // Type-safe chain config
     transport: http(rpcUrl),
   });
   ```

2. **Error Handling**: Leverage viem's specific error types
   ```typescript
   import { ContractFunctionExecutionError } from 'viem';

   try {
     await client.call(config);
   } catch (error) {
     if (error instanceof ContractFunctionExecutionError) {
       // Handle contract errors specifically
     }
   }
   ```

3. **Batch Requests**: Use viem's multicall for efficiency
   ```typescript
   const results = await client.multicall({
     contracts: [/* ... */]
   });
   ```

## Rollback Plan

If needed, rollback is straightforward:

1. Add ethers back: `npm install ethers@^6.15.0`
2. Revert controller changes to use `JsonRpcProvider`
3. Update imports from `viem` back to `ethers`

## References

- [Viem Documentation](https://viem.sh/)
- [Ethers to Viem Migration Guide](https://viem.sh/docs/ethers-migration.html)
- [1inch Cross-Chain SDK](https://github.com/1inch/cross-chain-sdk)

## Conclusion

The migration to viem improves code quality, consistency, and developer experience without affecting the public API or functionality.
