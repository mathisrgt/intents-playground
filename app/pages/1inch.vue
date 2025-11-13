<template>
  <UContainer class="py-12 min-h-screen max-w-2xl">
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      @click="navigateTo('/')"
      class="mb-8"
    >
      Back
    </UButton>

    <div class="text-center mb-8">
      <div class="flex items-center justify-center gap-3 mb-2">
        <img
          src="/icons/1inch.jpeg"
          alt="1inch"
          class="w-8 h-8 object-contain rounded-lg"
        />
        <h1 class="text-2xl font-bold">1inch Fusion+</h1>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400">Cross-chain atomic swaps with MEV protection</p>
    </div>

    <!-- 1. Swap Card -->
    <UCard class="mb-6">
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">1. Swap</h3>
      </template>
      <form @submit.prevent="handleGetQuote" class="space-y-6">

        <!-- You pay -->
        <div class="space-y-3">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">You pay</label>

          <div class="flex gap-3 items-center">
            <UInput
              v-model="amount"
              type="number"
              step="0.000001"
              :min="getMinimumAmount()"
              :placeholder="getMinimumAmount().toString()"
              size="xl"
              :disabled="loading"
              class="flex-1"
            />

            <UButton
              color="neutral"
              variant="solid"
              size="xl"
              @click="showFromModal = true"
              :disabled="loading"
            >
              <img
                :src="`/icons/${fromToken.logo}`"
                :alt="fromToken.symbol"
                class="w-6 h-6 rounded-full object-cover"
              />
              <span class="ml-2 font-semibold">{{ fromToken.symbol }}</span>
              <UIcon name="i-heroicons-chevron-down" class="ml-2 text-gray-400" />
            </UButton>
          </div>

          <div class="flex justify-between text-sm">
            <span class="text-gray-500">{{ fromNetwork.label }}</span>
          </div>
          <div v-if="amount && Number(amount) < getMinimumAmount()" class="text-sm text-red-600 dark:text-red-400">
            Minimum amount is {{ getMinimumAmount() }} {{ fromToken.symbol }}
          </div>
        </div>

        <!-- Swap Arrow -->
        <div class="flex justify-center">
          <div class="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
            <UIcon name="i-heroicons-arrow-down" class="text-lg text-gray-500" />
          </div>
        </div>

        <!-- You receive -->
        <div class="space-y-3">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">You receive</label>

          <div class="flex gap-3 items-center">
            <div class="flex-1 h-[44px] px-4 flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span class="text-lg font-medium text-gray-900 dark:text-gray-100">
                {{ quoteResult ? formatReceiveAmount() : '0.0' }}
              </span>
            </div>

            <UButton
              color="neutral"
              variant="solid"
              size="xl"
              @click="showToModal = true"
              :disabled="loading"
              class="!px-4"
            >
              <img
                :src="`/icons/${toToken.logo}`"
                :alt="toToken.symbol"
                class="w-6 h-6 rounded-full object-cover"
              />
              <span class="ml-2 font-semibold">{{ toToken.symbol }}</span>
              <UIcon name="i-heroicons-chevron-down" class="ml-2 text-gray-400" />
            </UButton>
          </div>

          <div class="text-sm text-gray-500">
            {{ toNetwork.label }}
          </div>
        </div>

        <!-- Get Quote Button -->
        <UButton
          type="submit"
          color="primary"
          size="xl"
          block
          :loading="loading"
          :disabled="!amount || Number(amount) < getMinimumAmount()"
        >
          {{ loading ? 'Getting Quote...' : 'Get Quote' }}
        </UButton>
      </form>
    </UCard>

    <!-- 2. Order Details & Create -->
    <UCard v-if="quoteResult" class="mb-6">
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">2. Order Details</h3>
      </template>
      <div class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">Rate</span>
          <span class="font-medium">1 {{ fromToken.symbol }} ≈ {{ calculateRate() }} {{ toToken.symbol }}</span>
        </div>

        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">Recommended Preset</span>
          <span class="font-medium">{{ quoteResult.quote.recommendedPreset }}</span>
        </div>

        <!-- Create Order Button -->
        <div class="pt-3">
          <UButton
            color="primary"
            size="lg"
            block
            :loading="creatingOrder"
            :disabled="orderHash !== null"
            @click="handleCreateOrder"
          >
            {{ orderHash ? 'Order Created ✓' : (creatingOrder ? 'Creating Order...' : 'Create & Submit Order') }}
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- 3. Order Submitted -->
    <UCard v-if="orderHash" class="mb-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
      <template #header>
        <h3 class="text-lg font-semibold text-green-900 dark:text-green-100">3. Order Submitted</h3>
      </template>
      <div class="space-y-3">
        <div class="flex items-start gap-2">
          <UIcon name="i-heroicons-check-circle" class="text-green-600 text-xl mt-0.5" />
          <div class="flex-1">
            <h4 class="font-semibold text-green-900 dark:text-green-100 mb-1">Order Created Successfully</h4>
            <p class="text-sm text-green-800 dark:text-green-200 mb-2">
              Your 1inch Fusion+ order has been submitted to the resolver network!
            </p>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-xs text-green-800 dark:text-green-200">Order Hash:</span>
                <code class="text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded border border-green-200 dark:border-green-800 flex-1 truncate">
                  {{ orderHash }}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Order Status Progress -->
    <UCard v-if="orderStatus" class="mb-6">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100">Order Progress</h4>
          <div
            class="px-3 py-1 rounded-full text-sm font-medium"
            :class="getStatusClass()"
          >
            {{ orderStatus }}
          </div>
        </div>

        <div class="space-y-2">
          <!-- Step 1: Order Created -->
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <UIcon name="i-heroicons-check" class="text-white text-sm" />
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">Order Created</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Order submitted to resolver network</div>
            </div>
          </div>

          <!-- Step 2: Escrow Deployment -->
          <div class="flex items-center gap-3">
            <div
              class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
              :class="getStepClass('escrow')"
            >
              <UIcon
                v-if="isStepPending('escrow')"
                name="i-heroicons-arrow-path"
                class="text-white text-sm animate-spin"
              />
              <UIcon
                v-else-if="isStepCompleted('escrow')"
                name="i-heroicons-check"
                class="text-white text-sm"
              />
              <UIcon
                v-else
                name="i-heroicons-x-mark"
                class="text-white text-sm"
              />
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ getEscrowLabel() }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ getEscrowDescription() }}
              </div>
            </div>
          </div>

          <!-- Step 3: Execution -->
          <div class="flex items-center gap-3">
            <div
              class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
              :class="getStepClass('execution')"
            >
              <UIcon
                v-if="orderStatus === 'Executed'"
                name="i-heroicons-check"
                class="text-white text-sm"
              />
              <UIcon
                v-else-if="isStepPending('execution')"
                name="i-heroicons-arrow-path"
                class="text-white text-sm animate-spin"
              />
              <UIcon
                v-else
                name="i-heroicons-clock"
                class="text-white text-sm"
              />
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium" :class="orderStatus === 'Executed' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'">
                {{ toToken.symbol }} Delivered
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ orderStatus === 'Executed' ? `Tokens received on ${toNetwork.label}` : 'Awaiting completion' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Secrets Info (if applicable) -->
        <div v-if="secretsSharedCount > 0" class="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div class="flex items-start gap-2">
            <UIcon name="i-heroicons-key" class="text-blue-600 text-lg mt-0.5" />
            <div class="flex-1">
              <div class="text-sm font-medium text-blue-900 dark:text-blue-100">
                Secrets Shared: {{ secretsSharedCount }}
              </div>
              <div class="text-xs text-blue-800 dark:text-blue-200">
                Secrets are automatically shared with resolvers to complete the swap
              </div>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Error -->
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      :title="error"
      @close="error = ''"
    />

    <!-- From Modal -->
    <UModal v-model:open="showFromModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Select Source Token & Network</h3>
          </template>

          <div class="space-y-1">
            <button
              v-for="option in fromOptions"
              :key="option.token.value"
              @click="selectFrom(option)"
              class="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              :class="{ 'bg-gray-50 dark:bg-gray-800': fromToken.value === option.token.value }"
            >
              <img
                :src="`/icons/${option.token.logo}`"
                :alt="option.token.symbol"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div class="flex-1 text-left">
                <div class="font-semibold text-gray-900 dark:text-white">{{ option.token.symbol }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ option.network.label }}</div>
              </div>
              <UIcon
                v-if="fromToken.value === option.token.value"
                name="i-heroicons-check-circle"
                class="text-green-500 text-xl"
              />
            </button>
          </div>

          <template #footer>
            <div class="flex justify-end">
              <UButton variant="ghost" @click="showFromModal = false">Close</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- To Modal -->
    <UModal v-model:open="showToModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Select Destination Token & Network</h3>
          </template>

          <div class="space-y-1">
            <button
              v-for="option in toOptions"
              :key="option.token.value"
              @click="selectTo(option)"
              class="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              :class="{ 'bg-gray-50 dark:bg-gray-800': toToken.value === option.token.value }"
            >
              <img
                :src="`/icons/${option.token.logo}`"
                :alt="option.token.symbol"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div class="flex-1 text-left">
                <div class="font-semibold text-gray-900 dark:text-white">{{ option.token.symbol }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ option.network.label }}</div>
              </div>
              <UIcon
                v-if="toToken.value === option.token.value"
                name="i-heroicons-check-circle"
                class="text-green-500 text-xl"
              />
            </button>
          </div>

          <template #footer>
            <div class="flex justify-end">
              <UButton variant="ghost" @click="showToModal = false">Close</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </UContainer>
</template>

<script setup lang="ts">
const amount = ref('')
const loading = ref(false)
const creatingOrder = ref(false)
const error = ref('')
const quoteResult = ref<any>(null)
const orderHash = ref<string | null>(null)
const secrets = ref<string[]>([])
const showFromModal = ref(false)
const showToModal = ref(false)
const orderStatus = ref<string | null>(null)
const secretsSharedCount = ref(0)
let statusInterval: NodeJS.Timeout | null = null
let secretInterval: NodeJS.Timeout | null = null

// NetworkEnum values from 1inch SDK
const NetworkEnum = {
  ETHEREUM: 1,
  BINANCE: 56,
  POLYGON: 137,
  AVALANCHE: 43114,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  BASE: 8453,
}

const fromOptions = [
  {
    network: { label: 'Polygon', value: NetworkEnum.POLYGON },
    token: {
      label: 'USDT',
      value: 'usdt',
      symbol: 'USDT',
      logo: 'usdt.png',
      address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
      decimals: 6
    }
  },
  {
    network: { label: 'Ethereum', value: NetworkEnum.ETHEREUM },
    token: {
      label: 'USDC',
      value: 'usdc',
      symbol: 'USDC',
      logo: 'usdc.png',
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: 6
    }
  },
  {
    network: { label: 'Base', value: NetworkEnum.BASE },
    token: {
      label: 'USDC',
      value: 'usdc-base',
      symbol: 'USDC',
      logo: 'usdc.png',
      address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      decimals: 6
    }
  }
]

const toOptions = [
  {
    network: { label: 'Binance', value: NetworkEnum.BINANCE },
    token: {
      label: 'BNB',
      value: 'bnb',
      symbol: 'BNB',
      logo: 'bnb.png',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // Native token
      decimals: 18
    }
  },
  {
    network: { label: 'Ethereum', value: NetworkEnum.ETHEREUM },
    token: {
      label: 'USDT',
      value: 'usdt',
      symbol: 'USDT',
      logo: 'usdt.png',
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      decimals: 6
    }
  },
  {
    network: { label: 'Base', value: NetworkEnum.BASE },
    token: {
      label: 'ETH',
      value: 'eth-base',
      symbol: 'ETH',
      logo: 'eth.png',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      decimals: 18
    }
  }
]

const fromNetwork = ref(fromOptions[0].network)
const fromToken = ref(fromOptions[0].token)
const toNetwork = ref(toOptions[0].network)
const toToken = ref(toOptions[0].token)

const selectFrom = (option: any) => {
  fromNetwork.value = option.network
  fromToken.value = option.token
  showFromModal.value = false
  quoteResult.value = null
  orderHash.value = null
}

const selectTo = (option: any) => {
  toNetwork.value = option.network
  toToken.value = option.token
  showToModal.value = false
  quoteResult.value = null
  orderHash.value = null
}

const getMinimumAmount = () => {
  return 10 // Minimum 10 tokens for 1inch swaps
}

const convertToSmallestUnit = (amount: string, decimals: number) => {
  return Math.floor(Number(amount) * Math.pow(10, decimals)).toString()
}

const handleGetQuote = async () => {
  loading.value = true
  error.value = ''
  quoteResult.value = null
  orderHash.value = null

  try {
    const smallestUnitAmount = convertToSmallestUnit(amount.value, fromToken.value.decimals)

    // Get wallet address from backend (will be derived from private key)
    const walletResponse = await $fetch('/api/oneinch/quote', {
      method: 'POST',
      body: {
        walletAddress: '0x0000000000000000000000000000000000000000', // Placeholder, backend will use actual wallet
        srcChainId: fromNetwork.value.value,
        dstChainId: toNetwork.value.value,
        srcTokenAddress: fromToken.value.address,
        dstTokenAddress: toToken.value.address,
        amount: smallestUnitAmount,
      },
    })

    console.log('Quote response:', walletResponse)

    if (!walletResponse.success || !walletResponse.quote) {
      throw new Error('Invalid quote response')
    }

    quoteResult.value = walletResponse
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to get quote'
    console.error('Error getting quote:', err)
  } finally {
    loading.value = false
  }
}

const handleCreateOrder = async () => {
  if (!quoteResult.value?.quote) {
    error.value = 'No quote available'
    return
  }

  creatingOrder.value = true
  error.value = ''

  try {
    const preset = quoteResult.value.quote.recommendedPreset

    const response = await $fetch('/api/oneinch/create-order', {
      method: 'POST',
      body: {
        walletAddress: '0x0000000000000000000000000000000000000000', // Placeholder
        quote: quoteResult.value.quote,
        preset,
      },
    })

    if (response?.success) {
      orderHash.value = response.orderHash
      secrets.value = response.secrets
      startMonitoring()
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to create order'
    console.error('Error creating order:', err)
  } finally {
    creatingOrder.value = false
  }
}

const checkOrderStatus = async () => {
  if (!orderHash.value) return

  try {
    const response = await $fetch('/api/oneinch/check-status', {
      method: 'POST',
      body: {
        orderHash: orderHash.value,
      },
    })

    if (response.success && response.status) {
      orderStatus.value = response.status

      // Stop polling if status is final
      if (orderStatus.value === 'Executed' || orderStatus.value === 'Expired' || orderStatus.value === 'Refunded') {
        stopMonitoring()
      }
    }
  } catch (err: any) {
    console.error('Error checking status:', err)
  }
}

const checkAndSubmitSecrets = async () => {
  if (!orderHash.value || !secrets.value.length) return

  try {
    const response = await $fetch('/api/oneinch/get-ready-secrets', {
      method: 'POST',
      body: {
        orderHash: orderHash.value,
      },
    })

    if (response.success && response.fills.length > 0) {
      for (const fill of response.fills) {
        const idx = fill.idx
        if (idx < secrets.value.length) {
          try {
            await $fetch('/api/oneinch/submit-secret', {
              method: 'POST',
              body: {
                orderHash: orderHash.value,
                secret: secrets.value[idx],
              },
            })
            secretsSharedCount.value++
            console.log(`Shared secret ${idx}`)
          } catch (err) {
            console.error(`Error submitting secret ${idx}:`, err)
          }
        }
      }
    }
  } catch (err: any) {
    console.error('Error checking/submitting secrets:', err)
  }
}

const startMonitoring = () => {
  orderStatus.value = 'Pending'

  // Check status immediately
  checkOrderStatus()
  checkAndSubmitSecrets()

  // Then check every 5 seconds
  statusInterval = setInterval(() => {
    checkOrderStatus()
  }, 5000)

  secretInterval = setInterval(() => {
    checkAndSubmitSecrets()
  }, 3000)
}

const stopMonitoring = () => {
  if (statusInterval) {
    clearInterval(statusInterval)
    statusInterval = null
  }
  if (secretInterval) {
    clearInterval(secretInterval)
    secretInterval = null
  }
}

// Cleanup on unmount
onUnmounted(() => {
  stopMonitoring()
})

const calculateRate = () => {
  try {
    if (!quoteResult.value?.quote) return '0'

    const quote = quoteResult.value.quote
    // The quote should have recommended preset with amounts
    const preset = quote.presets[quote.recommendedPreset]
    if (!preset) return '0'

    const amountIn = Number(amount.value)
    const amountOut = Number(preset.dstTokenAmount) / Math.pow(10, toToken.value.decimals)

    if (isNaN(amountIn) || isNaN(amountOut) || amountIn === 0) return '0'
    return (amountOut / amountIn).toFixed(4)
  } catch (err) {
    console.error('Error calculating rate:', err)
    return '0'
  }
}

const formatReceiveAmount = () => {
  try {
    if (!quoteResult.value?.quote) return '0.0'

    const preset = quoteResult.value.quote.presets[quoteResult.value.quote.recommendedPreset]
    if (!preset) return '0.0'

    const amountOut = Number(preset.dstTokenAmount) / Math.pow(10, toToken.value.decimals)
    return amountOut.toFixed(6)
  } catch (err) {
    console.error('Error formatting amount:', err)
    return '0.0'
  }
}

const getStatusClass = () => {
  if (orderStatus.value === 'Pending') {
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
  } else if (orderStatus.value === 'Executed') {
    return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
  } else if (orderStatus.value === 'Expired' || orderStatus.value === 'Refunded') {
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
  }
  return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
}

const isStepPending = (step: string) => {
  if (step === 'escrow') {
    return orderStatus.value === 'Pending'
  } else if (step === 'execution') {
    return orderStatus.value === 'Pending'
  }
  return false
}

const isStepCompleted = (step: string) => {
  if (step === 'escrow') {
    return orderStatus.value === 'Executed' || secretsSharedCount.value > 0
  } else if (step === 'execution') {
    return orderStatus.value === 'Executed'
  }
  return false
}

const getStepClass = (step: string) => {
  if (isStepCompleted(step)) {
    return 'bg-green-500'
  } else if (isStepPending(step)) {
    return 'bg-orange-500'
  } else if (orderStatus.value === 'Expired' || orderStatus.value === 'Refunded') {
    return 'bg-red-500'
  }
  return 'bg-gray-300 dark:bg-gray-700'
}

const getEscrowLabel = () => {
  if (isStepCompleted('escrow')) {
    return 'Escrow Deployed'
  } else if (isStepPending('escrow')) {
    return 'Deploying Escrows'
  }
  return 'Escrow Failed'
}

const getEscrowDescription = () => {
  if (isStepCompleted('escrow')) {
    return 'Secrets shared with resolvers'
  } else if (isStepPending('escrow')) {
    return 'Creating atomic swap contracts'
  }
  return 'Contract deployment failed'
}

useHead({
  title: '1inch Fusion+ - Blockchain Intents Playground',
})
</script>
