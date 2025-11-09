<template>
  <UContainer class="py-12 min-h-screen max-w-2xl">
    <UButton
      icon="i-heroicons-arrow-left"
      color="gray"
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

    <!-- Swap Card -->
    <UCard class="mb-6">
      <form @submit.prevent="handleGetQuote" class="space-y-6">
        <!-- You pay -->
        <div class="space-y-3">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">You pay</label>

          <div class="flex gap-3 items-center">
            <UInput
              v-model="amount"
              type="number"
              step="0.000001"
              min="0"
              placeholder="0.0"
              size="xl"
              :disabled="loading"
              class="flex-1"
            />

            <UButton
              color="white"
              variant="solid"
              size="xl"
              @click="showFromModal = true"
              :disabled="loading"
              class="!px-4"
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
            <span class="text-gray-500">Balance: --</span>
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
                {{ quoteResult ? formatAmount(quoteResult.quote.amountOutFormatted) : '0.0' }}
              </span>
            </div>

            <UButton
              color="white"
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

        <!-- Recipient Address -->
        <div class="space-y-3">
          <div class="flex gap-3 items-center">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Recipient Address
            </label>
            <UInput
              v-model="recipientAddress"
              type="text"
              placeholder="0x..."
              :disabled="loading"
              class="flex-1"
            />
          </div>
        </div>

        <!-- Get Quote Button -->
        <UButton
          type="submit"
          color="primary"
          size="xl"
          block
          :loading="loading"
          :disabled="!amount || !recipientAddress"
        >
          {{ loading ? 'Getting Quote...' : 'Get Quote' }}
        </UButton>
      </form>
    </UCard>

    <!-- Quote Details -->
    <UCard v-if="quoteResult" class="mb-6">
      <div class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">Rate</span>
          <span class="font-medium">1 {{ fromToken.symbol }} ≈ {{ calculateRate() }} {{ toToken.symbol }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">Protocol Fee</span>
          <span class="font-medium">{{ quoteResult.quote.protocolFeeFormatted }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">Gas Fee</span>
          <span class="font-medium">{{ quoteResult.quote.gasFeeFormatted }}</span>
        </div>
        <div class="pt-3 border-t space-y-2">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Deposit Address</div>
          <div class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <code class="text-xs flex-1 overflow-x-auto">{{ quoteResult.quote.depositAddress }}</code>
            <UButton
              size="xs"
              color="gray"
              variant="ghost"
              icon="i-heroicons-clipboard-document"
              @click="copyToClipboard(quoteResult.quote.depositAddress)"
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Error -->
    <UAlert
      v-if="error"
      color="red"
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
              <UButton variant="ghost" color="gray" @click="showFromModal = false">Close</UButton>
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
              <UButton variant="ghost" color="gray" @click="showToModal = false">Close</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </UContainer>
</template>

<script setup lang="ts">
const amount = ref('0.5')
const recipientAddress = ref('')
const loading = ref(false)
const error = ref('')
const quoteResult = ref<any>(null)
const showFromModal = ref(false)
const showToModal = ref(false)

const fromOptions = [
  {
    network: { label: 'XRPL', value: 'xrpl' },
    token: { label: 'XRP', value: 'xrp', symbol: 'XRP', logo: 'xrp.png', assetId: 'nep141:xrp.omft.near' }
  }
]

const toOptions = [
  {
    network: { label: 'Base', value: 'base' },
    token: { label: 'USDC', value: 'usdc', symbol: 'USDC', logo: 'usdc.png', assetId: 'nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near' }
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
}

const selectTo = (option: any) => {
  toNetwork.value = option.network
  toToken.value = option.token
  showToModal.value = false
  quoteResult.value = null
}

const handleGetQuote = async () => {
  loading.value = true
  error.value = ''
  quoteResult.value = null

  try {
    const response = await $fetch('/api/near/quote', {
      method: 'POST',
      body: {
        recipientAddress: recipientAddress.value,
        amount: amount.value,
      },
    })

    quoteResult.value = response
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to get quote'
    console.error('Error getting quote:', err)
  } finally {
    loading.value = false
  }
}

const calculateRate = () => {
  if (!quoteResult.value) return '0'
  const amountIn = parseFloat(quoteResult.value.quote.amountInFormatted.split(' ')[0])
  const amountOut = parseFloat(quoteResult.value.quote.amountOutFormatted.split(' ')[0])
  return (amountOut / amountIn).toFixed(4)
}

const formatAmount = (formatted: string) => {
  return formatted.split(' ')[0] || '0.0'
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
