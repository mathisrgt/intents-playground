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
          src="/icons/near.png"
          alt="NEAR"
          class="w-8 h-8 object-contain"
        />
        <h1 class="text-2xl font-bold">NEAR Intents</h1>
      </div>
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
            <div class="flex items-center gap-2">
              <span class="text-gray-500">
                Balance: {{ getBalance(fromNetwork.value, fromToken.symbol) }} {{ fromToken.symbol }}
              </span>
              <UButton
                size="xs"
                variant="ghost"
                icon="i-heroicons-arrow-path"
                :loading="loadingBalances"
                @click="fetchBalances"
                class="text-gray-500"
              />
            </div>
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
                {{ quoteResult?.quote?.amountOutFormatted ? formatAmount(quoteResult.quote.amountOutFormatted) : '0.0' }}
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

    <!-- 2. Deposit -->
    <UCard v-if="quoteResult" class="mb-6">
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">2. Deposit</h3>
      </template>
      <div class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">Rate</span>
          <span class="font-medium">1 {{ fromToken.symbol }} ≈ {{ quoteResult ? calculateRate() : '0' }} {{ toToken.symbol }}</span>
        </div>

        <!-- Send Deposit Button -->
        <div class="pt-3">
          <UButton
            color="primary"
            size="lg"
            block
            :loading="sendingDeposit"
            :disabled="transactionHash !== null"
            @click="handleSendDeposit"
          >
            {{ transactionHash ? 'Deposit Sent ✓' : (sendingDeposit ? 'Sending...' : 'Send Deposit') }}
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- 3. Submitted -->
    <UCard v-if="transactionHash" class="mb-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
      <template #header>
        <h3 class="text-lg font-semibold text-green-900 dark:text-green-100">3. Submitted</h3>
      </template>
      <div class="space-y-3">
        <div class="flex items-start gap-2">
          <UIcon name="i-heroicons-check-circle" class="text-green-600 text-xl mt-0.5" />
          <div class="flex-1">
            <h4 class="font-semibold text-green-900 dark:text-green-100 mb-1">Transaction Confirmed</h4>
            <p class="text-sm text-green-800 dark:text-green-200 mb-2">
              Your {{ fromToken.symbol }} deposit has been sent successfully!
            </p>
            <div class="flex items-center gap-2">
              <code class="text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded border border-green-200 dark:border-green-800">
                {{ transactionHash }}
              </code>
              <UButton
                size="xs"
                color="primary"
                variant="soft"
                icon="i-heroicons-arrow-top-right-on-square"
                :to="transactionExplorerUrl"
                target="_blank"
              >
                View
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Intent Status Progress -->
    <UCard v-if="intentStatus" class="mb-6">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100">Intent Progress</h4>
          <div
            class="px-3 py-1 rounded-full text-sm font-medium"
            :class="{
              'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200': intentStatus === 'PENDING',
              'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200': intentStatus === 'SUCCESS',
              'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200': intentStatus === 'REFUNDED'
            }"
          >
            {{ intentStatus }}
          </div>
        </div>

        <div class="space-y-2">
          <!-- Step 1: Deposit Sent -->
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <UIcon name="i-heroicons-check" class="text-white text-sm" />
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">Deposit Sent</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ fromToken.symbol }} deposited to intent address</div>
            </div>
          </div>

          <!-- Step 2: Processing -->
          <div class="flex items-center gap-3">
            <div
              class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
              :class="{
                'bg-orange-500': intentStatus === 'PENDING',
                'bg-green-500': intentStatus === 'SUCCESS',
                'bg-red-500': intentStatus === 'REFUNDED'
              }"
            >
              <UIcon
                v-if="intentStatus === 'PENDING'"
                name="i-heroicons-arrow-path"
                class="text-white text-sm animate-spin"
              />
              <UIcon
                v-else-if="intentStatus === 'SUCCESS'"
                name="i-heroicons-check"
                class="text-white text-sm"
              />
              <UIcon
                v-else-if="intentStatus === 'REFUNDED'"
                name="i-heroicons-x-mark"
                class="text-white text-sm"
              />
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ intentStatus === 'PENDING' ? 'Processing Swap' : intentStatus === 'SUCCESS' ? 'Swap Completed' : 'Swap Failed' }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ intentStatus === 'PENDING' ? 'Executing cross-chain swap' : intentStatus === 'SUCCESS' ? 'Tokens delivered to recipient' : 'Transaction refunded' }}
              </div>
            </div>
          </div>

          <!-- Step 3: Delivery -->
          <div class="flex items-center gap-3">
            <div
              class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
              :class="{
                'bg-green-500': intentStatus === 'SUCCESS',
                'bg-orange-500': intentStatus === 'PENDING',
                'bg-gray-300 dark:bg-gray-700': intentStatus === 'REFUNDED'
              }"
            >
              <UIcon
                v-if="intentStatus === 'SUCCESS'"
                name="i-heroicons-check"
                class="text-white text-sm"
              />
              <UIcon
                v-else-if="intentStatus === 'PENDING'"
                name="i-heroicons-arrow-path"
                class="text-white text-sm animate-spin"
              />
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium" :class="intentStatus === 'SUCCESS' ? 'text-gray-900 dark:text-gray-100' : intentStatus === 'PENDING' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'">
                {{ toToken.symbol }} Delivered
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ intentStatus === 'SUCCESS' ? `Tokens received on ${toNetwork.label}` : intentStatus === 'PENDING' ? 'Awaiting completion' : 'Not delivered' }}
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
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Select Token & Network</h3>
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
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Select Token & Network</h3>
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
const sendingDeposit = ref(false)
const error = ref('')
const quoteResult = ref<any>(null)
const transactionHash = ref<string | null>(null)
const transactionExplorerUrl = ref<string>('')
const showFromModal = ref(false)
const showToModal = ref(false)
const intentStatus = ref<string | null>(null)
const checkingStatus = ref(false)
let statusInterval: NodeJS.Timeout | null = null
const balances = ref<any>({
  xrpl: { XRP: '--' },
  base: { USDC: '--' }
})
const loadingBalances = ref(false)

const fromOptions = [
  {
    network: { label: 'XRPL', value: 'xrpl' },
    token: { label: 'XRP', value: 'xrp', symbol: 'XRP', logo: 'xrp.png' }
  },
  {
    network: { label: 'Base', value: 'base' },
    token: { label: 'USDC', value: 'usdc', symbol: 'USDC', logo: 'usdc.png' }
  }
]

const toOptions = [
  {
    network: { label: 'Base', value: 'base' },
    token: { label: 'USDC', value: 'usdc', symbol: 'USDC', logo: 'usdc.png' }
  },
  {
    network: { label: 'XRPL', value: 'xrpl' },
    token: { label: 'XRP', value: 'xrp', symbol: 'XRP', logo: 'xrp.png' }
  }
]

const fromNetwork = ref(fromOptions[0].network)
const fromToken = ref(fromOptions[0].token)
const toNetwork = ref(toOptions[0].network)
const toToken = ref(toOptions[0].token)

const fetchBalances = async () => {
  loadingBalances.value = true
  try {
    const response = await $fetch('/api/near/balances')
    if (response.success) {
      balances.value = response.balances
    }
  } catch (err) {
    console.error('Error fetching balances:', err)
  } finally {
    loadingBalances.value = false
  }
}

const getBalance = (network: string, token: string) => {
  try {
    const balance = balances.value[network]?.[token]
    if (balance === undefined || balance === null) return '--'
    const num = parseFloat(String(balance))
    return isNaN(num) ? String(balance) : num.toFixed(2)
  } catch (err) {
    console.error('Error getting balance:', err)
    return '--'
  }
}

const selectFrom = (option: any) => {
  fromNetwork.value = option.network
  fromToken.value = option.token
  showFromModal.value = false
  quoteResult.value = null
  transactionHash.value = null
}

const selectTo = (option: any) => {
  toNetwork.value = option.network
  toToken.value = option.token
  showToModal.value = false
  quoteResult.value = null
  transactionHash.value = null
}

// Fetch balances on mount
onMounted(() => {
  fetchBalances()
})

const getMinimumAmount = () => {
  if (fromNetwork.value.value === 'xrpl' && fromToken.value.symbol === 'XRP') {
    return 2
  } else if (fromNetwork.value.value === 'base' && fromToken.value.symbol === 'USDC') {
    return 5
  }
  return 1
}

const convertToSmallestUnit = (amount: string) => {
  if (fromNetwork.value.value === 'xrpl' && fromToken.value.symbol === 'XRP') {
    // Convert XRP to drops (1 XRP = 1,000,000 drops)
    return Math.floor(Number(amount) * 1_000_000).toString()
  } else if (fromNetwork.value.value === 'base' && fromToken.value.symbol === 'USDC') {
    // Convert USDC to smallest unit (1 USDC = 1,000,000 units, 6 decimals)
    return Math.floor(Number(amount) * 1_000_000).toString()
  }
  return amount
}

const handleGetQuote = async () => {
  loading.value = true
  error.value = ''
  quoteResult.value = null
  transactionHash.value = null

  try {
    const smallestUnitAmount = convertToSmallestUnit(amount.value)

    const response = await $fetch('/api/near/quote', {
      method: 'POST',
      body: {
        smallestUnitAmount,
        originChain: fromNetwork.value.value,
        originTokenName: fromToken.value.symbol,
        destChain: toNetwork.value.value,
        destTokenName: toToken.value.symbol,
      },
    })

    console.log('Quote response:', response)
    console.log('Quote details:', response.quote)

    // Validate quote structure
    if (!response.quote || !response.quote.depositAddress) {
      throw new Error('Invalid quote response: missing required fields')
    }

    quoteResult.value = response
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to get quote'
    console.error('Error getting quote:', err)
  } finally {
    loading.value = false
  }
}

const handleSendDeposit = async () => {
  if (!quoteResult.value?.quote?.depositAddress) {
    error.value = 'No deposit address available'
    return
  }

  sendingDeposit.value = true
  error.value = ''

  try {
    const depositAddr = String(quoteResult.value.quote.depositAddress)
    const amountStr = String(amount.value)

    console.log('Sending deposit:', { depositAddr, amountStr, network: fromNetwork.value.value })

    let response;

    if (fromNetwork.value.value === 'xrpl') {
      response = await $fetch('/api/near/send-deposit', {
        method: 'POST',
        body: {
          depositAddress: depositAddr,
          amount: amountStr,
        },
      })
    } else if (fromNetwork.value.value === 'base') {
      response = await $fetch('/api/near/send-base-deposit', {
        method: 'POST',
        body: {
          depositAddress: depositAddr,
          amount: amountStr,
        },
      })
    }

    if (response?.success) {
      transactionHash.value = String(response.hash)
      transactionExplorerUrl.value = String(response.explorerUrl)
      startStatusPolling()
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to send deposit'
    console.error('Error sending deposit:', err)
    console.error('Full error:', JSON.stringify(err, null, 2))
  } finally {
    sendingDeposit.value = false
  }
}

const checkStatus = async () => {
  if (!quoteResult.value?.quote?.depositAddress) return

  try {
    const response = await $fetch('/api/near/check-status', {
      method: 'POST',
      body: {
        depositAddress: quoteResult.value.quote.depositAddress,
      },
    })

    if (response.success && response.status) {
      intentStatus.value = response.status.status

      // Stop polling if status is final
      if (intentStatus.value === 'SUCCESS' || intentStatus.value === 'REFUNDED') {
        stopStatusPolling()
      }
    }
  } catch (err: any) {
    console.error('Error checking status:', err)
  }
}

const startStatusPolling = () => {
  checkingStatus.value = true
  intentStatus.value = 'PENDING'

  // Check immediately
  checkStatus()

  // Then check every 5 seconds
  statusInterval = setInterval(() => {
    checkStatus()
  }, 5000)
}

const stopStatusPolling = () => {
  if (statusInterval) {
    clearInterval(statusInterval)
    statusInterval = null
  }
  checkingStatus.value = false
}

// Cleanup on unmount
onUnmounted(() => {
  stopStatusPolling()
})

const calculateRate = () => {
  try {
    if (!quoteResult.value?.quote) return '0'

    const quote = quoteResult.value.quote
    const amountIn = parseFloat(String(quote.amountInFormatted || quote.amountIn || 0))
    const amountOut = parseFloat(String(quote.amountOutFormatted || quote.amountOut || 0))

    if (isNaN(amountIn) || isNaN(amountOut) || amountIn === 0) return '0'
    return (amountOut / amountIn).toFixed(4)
  } catch (err) {
    console.error('Error calculating rate:', err)
    return '0'
  }
}

const formatAmount = (formatted: any) => {
  try {
    if (!formatted) return '0.0'
    const str = String(formatted)
    const match = str.match(/[\d.]+/)
    return match ? match[0] : '0.0'
  } catch (err) {
    console.error('Error formatting amount:', err)
    return '0.0'
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

useHead({
  title: 'NEAR Intents Swap - Blockchain Intents Playground',
})
</script>
