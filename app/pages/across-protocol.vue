<template>
  <UContainer class="py-12 min-h-screen">
    <UButton
      icon="i-heroicons-arrow-left"
      color="gray"
      variant="ghost"
      @click="navigateTo('/')"
      class="mb-8"
    >
      Back
    </UButton>

    <div class="max-w-2xl mx-auto text-center">
      <img
        src="/icons/across.jpeg"
        alt="Across Protocol"
        class="w-32 h-32 object-contain mx-auto mb-6 rounded-lg"
      />
      <h1 class="text-4xl font-bold mb-4">Across Protocol</h1>
      <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Fast cross-chain transfers with optimistic bridging
      </p>

      <UCard class="text-left">
        <div class="space-y-4">
          <div>
            <h3 class="font-semibold mb-2">Key Features</h3>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Optimistic bridging</li>
              <li>• Multi-chain support</li>
              <li>• Fast transfers</li>
            </ul>
          </div>
        </div>
      </UCard>

      <div class="mt-8">
        <UButton
          color="gray"
          trailing-icon="i-heroicons-arrow-top-right-on-square"
          to="https://across.to"
          target="_blank"
        >
          Learn More
        </UButton>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
useHead({
  title: 'Across Protocol - Blockchain Intents Playground',
})
</script>
