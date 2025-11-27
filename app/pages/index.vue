<template>
  <UContainer class="py-16 min-h-screen">
    <div class="text-center mb-12">
      <h1 class="text-5xl font-bold mb-4">
        Blockchain Intents Playground
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-400">
        Explore different blockchain intents solutions
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
      <!-- Near Intents Card -->
      <UCard
        class="hover:scale-105 transition-transform cursor-pointer"
        @click="navigateTo('/near-intents')"
      >
        <div class="flex flex-col items-center text-center space-y-4 p-4">
          <img
            src="/icons/near.png"
            alt="NEAR Protocol"
            class="w-24 h-24 object-contain"
          />
          <h3 class="text-2xl font-semibold">NEAR Intents</h3>
          <p class="text-gray-600 dark:text-gray-400">
            Chain abstraction & cross-chain operations
          </p>
        </div>
      </UCard>

      <!-- Across Protocol Card -->
      <UCard
        class="hover:scale-105 transition-transform cursor-pointer"
        @click="navigateTo('/across-protocol')"
      >
        <div class="flex flex-col items-center text-center space-y-4 p-4">
          <img
            src="/icons/across.jpeg"
            alt="Across Protocol"
            class="w-24 h-24 object-contain rounded-lg"
          />
          <h3 class="text-2xl font-semibold">Across Protocol</h3>
          <p class="text-gray-600 dark:text-gray-400">
            Optimistic bridge for fast transfers
          </p>
        </div>
      </UCard>

      <!-- 1inch Card -->
      <UCard
        class="hover:scale-105 transition-transform cursor-pointer"
        @click="navigateTo('/1inch')"
      >
        <div class="flex flex-col items-center text-center space-y-4 p-4">
          <img
            src="/icons/1inch.jpeg"
            alt="1inch Fusion"
            class="w-24 h-24 object-contain rounded-lg"
          />
          <h3 class="text-2xl font-semibold">1inch Fusion</h3>
          <p class="text-gray-600 dark:text-gray-400">
            Gasless swaps with MEV protection
          </p>
        </div>
      </UCard>

      <!-- Squid Router Card -->
      <UCard
        class="hover:scale-105 transition-transform cursor-pointer"
        @click="navigateTo('/squid')"
      >
        <div class="flex flex-col items-center text-center space-y-4 p-4">
          <img
            src="/icons/squid.jpg"
            alt="Squid Router"
            class="w-24 h-24 object-contain rounded-lg"
          />
          <h3 class="text-2xl font-semibold">Squid Router</h3>
          <p class="text-gray-600 dark:text-gray-400">
            XRPL cross-chain bridge
          </p>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
useHead({
  title: 'Blockchain Intents Playground',
  meta: [
    { name: 'description', content: 'Explore and test different blockchain intents solutions' }
  ]
})
</script>
