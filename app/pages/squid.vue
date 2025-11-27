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
      <h1 class="text-2xl font-bold">XRPL Bridge</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Bridge XRP between XRPL EVM and XRPL Mainnet</p>
    </div>

    <!-- Address Display -->
    <UCard class="mb-6">
      <template #header>
        <h3 class="text-lg font-semibold">Your Addresses</h3>
      </template>
      <div class="space-y-3">
        <div>
          <div class="text-sm text-gray-500 mb-1">EVM Address</div>
          <code class="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded block break-all">
            {{ evmAddress || 'Loading...' }}
          </code>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">XRPL Address</div>
          <code class="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded block break-all">
            {{ xrplAddress || 'Loading...' }}
          </code>
        </div>
      </div>
    </UCard>

    <!-- Bridge Card -->
    <UCard class="mb-6">
      <template #header>
        <h3 class="text-lg font-semibold">Bridge XRP</h3>
      </template>

      <form @submit.prevent="handleGetRoute" class="space-y-6">
        <!-- Direction -->
        <div class="space-y-3">
          <label class="text-sm font-medium">Direction</label>
          <div class="flex gap-3">
            <UButton
              :variant="direction === 'toXRPL' ? 'solid' : 'outline'"
              @click="direction = 'toXRPL'"
              block
            >
              XRPL EVM → XRPL
            </UButton>
            <UButton
              :variant="direction === 'fromXRPL' ? 'solid' : 'outline'"
              @click="direction = 'fromXRPL'"
              block
            >
              XRPL → XRPL EVM
            </UButton>
          </div>
        </div>

        <!-- Amount -->
        <div class="space-y-3">
          <label class="text-sm font-medium">Amount (XRP)</label>
          <UInput
            v-model="amount"
            type="number"
            step="0.01"
            min="3"
            placeholder="3.0"
            size="xl"
            :disabled="loading"
            class="w-full"
          />
          <p class="text-xs text-gray-500">Minimum: 3 XRP</p>
        </div>

        <!-- Get Route Button -->
        <UButton
          type="submit"
          color="primary"
          size="xl"
          block
          :loading="loading"
          :disabled="!amount || Number(amount) < 3"
        >
          {{ loading ? 'Getting Route...' : 'Get Route' }}
        </UButton>
      </form>
    </UCard>

    <!-- Route Details -->
    <UCard v-if="route" class="mb-6">
      <template #header>
        <h3 class="text-lg font-semibold">Route Details</h3>
      </template>

      <div class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">From</span>
          <span class="font-medium">{{ direction === 'toXRPL' ? 'XRPL EVM' : 'XRPL' }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">To</span>
          <span class="font-medium">{{ direction === 'toXRPL' ? 'XRPL' : 'XRPL EVM' }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">Amount</span>
          <span class="font-medium">{{ amount }} XRP</span>
        </div>

        <UButton
          color="primary"
          size="lg"
          block
          :loading="executing"
          @click="handleExecute"
          :disabled="!route || executing || txHash !== null"
        >
          {{ txHash ? 'Bridge Executed ✓' : (executing ? 'Executing...' : 'Execute Bridge') }}
        </UButton>
      </div>
    </UCard>

    <!-- Transaction Status -->
    <UCard v-if="txHash" class="mb-6">
      <template #header>
        <h3 class="text-lg font-semibold">Transaction Status</h3>
      </template>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-400">Status</span>
          <div
            class="px-3 py-1 rounded-full text-sm font-medium"
            :class="getStatusClass()"
          >
            {{ status || 'Pending' }}
          </div>
        </div>

        <div class="space-y-2">
          <div class="text-sm">
            <span class="text-gray-600 dark:text-gray-400">Transaction Hash:</span>
            <code class="block mt-1 text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded break-all">
              {{ txHash }}
            </code>
          </div>

          <a
            :href="`https://axelarscan.io/gmp/${txHash}`"
            target="_blank"
            class="block text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            View on Axelarscan →
          </a>
        </div>

        <!-- Progress Steps -->
        <div class="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <UIcon name="i-heroicons-check" class="text-white text-sm" />
            </div>
            <span class="text-sm">Transaction Submitted</span>
          </div>

          <div class="flex items-center gap-3">
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center"
              :class="status === 'success' || status === 'partial_success' ? 'bg-green-500' : 'bg-orange-500'"
            >
              <UIcon
                v-if="status === 'success' || status === 'partial_success'"
                name="i-heroicons-check"
                class="text-white text-sm"
              />
              <UIcon
                v-else
                name="i-heroicons-arrow-path"
                class="text-white text-sm animate-spin"
              />
            </div>
            <span class="text-sm">Bridge Completed</span>
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
  </UContainer>
</template>

<script setup lang="ts">
const amount = ref('')
const direction = ref<'toXRPL' | 'fromXRPL'>('toXRPL')
const loading = ref(false)
const executing = ref(false)
const error = ref('')
const route = ref<any>(null)
const txHash = ref<string | null>(null)
const status = ref<string | null>(null)
const evmAddress = ref('')
const xrplAddress = ref('')
const requestId = ref('')

let statusInterval: NodeJS.Timeout | null = null

onMounted(async () => {
  try {
    const response = await $fetch('/api/squid/get-address')
    if (response.success) {
      evmAddress.value = response.evmAddress
      xrplAddress.value = response.xrplAddress
    }
  } catch (err) {
    console.error('Error getting address:', err)
  }
})

const handleGetRoute = async () => {
  if (Number(amount.value) < 3) {
    error.value = 'Minimum amount is 3 XRP'
    return
  }

  loading.value = true
  error.value = ''
  route.value = null
  txHash.value = null
  status.value = null

  try {
    const fromChainId = direction.value === 'toXRPL' ? '1440000' : 'xrpl-mainnet'
    const toChainId = direction.value === 'toXRPL' ? 'xrpl-mainnet' : '1440000'
    const decimals = direction.value === 'toXRPL' ? 18 : 6
    const fromAmount = (Number(amount.value) * Math.pow(10, decimals)).toString()

    const fromAddress = direction.value === 'toXRPL' ? evmAddress.value : xrplAddress.value
    const toAddress = direction.value === 'toXRPL' ? xrplAddress.value : evmAddress.value

    if (!fromAddress || !toAddress) {
      error.value = 'Addresses not loaded'
      return
    }

    const response = await $fetch('/api/squid/quote', {
      method: 'POST',
      body: {
        fromChainId,
        toChainId,
        fromToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        toToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        fromAmount,
        fromAddress,
        toAddress
      }
    })

    if (response.success) {
      route.value = response.route
      requestId.value = response.requestId
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to get route'
  } finally {
    loading.value = false
  }
}

const handleExecute = async () => {
  if (!route.value) return

  executing.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/squid/execute-swap', {
      method: 'POST',
      body: {
        route: route.value
      }
    })

    if (response.success) {
      txHash.value = response.hash
      startMonitoring()
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to execute bridge'
  } finally {
    executing.value = false
  }
}

const checkStatus = async () => {
  if (!txHash.value || !requestId.value) return

  try {
    const fromChainId = direction.value === 'toXRPL' ? '1440000' : 'xrpl-mainnet'

    const response = await $fetch('/api/squid/check-status', {
      method: 'POST',
      body: {
        transactionId: txHash.value,
        requestId: requestId.value,
        quoteId: fromChainId
      }
    })

    if (response.success && response.status) {
      status.value = response.status.squidTransactionStatus

      if (['success', 'partial_success', 'needs_gas', 'not_found'].includes(status.value)) {
        stopMonitoring()
      }
    }
  } catch (err) {
    console.error('Error checking status:', err)
  }
}

const startMonitoring = () => {
  checkStatus()
  statusInterval = setInterval(() => {
    checkStatus()
  }, 5000)
}

const stopMonitoring = () => {
  if (statusInterval) {
    clearInterval(statusInterval)
    statusInterval = null
  }
}

onUnmounted(() => {
  stopMonitoring()
})

const getStatusClass = () => {
  if (status.value === 'success' || status.value === 'partial_success') {
    return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
  } else if (status.value === 'needs_gas' || status.value === 'not_found') {
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
  }
  return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
}

useHead({
  title: 'XRPL Bridge - Squid Router',
})
</script>
