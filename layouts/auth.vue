<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">InvestHold Ура!!л</h1>
        <p class="text-gray-400">Crypto Portfolio Manager</p>
      </div>
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/10">
        <slot />
      </div>
    </div>
  </div>
</template>