<template>
  <div class="min-h-screen bg-[#0d0d0f] flex flex-col items-center justify-center text-white text-center px-4">
    <h1 class="text-8xl font-bold text-[#FFD700] garamond">404</h1>
    <h2 class="mt-4 text-3xl font-bold">Page Introuvable</h2>
    <p class="mt-2 text-[#C1C1C7]">Désolé, la page que vous recherchez n'existe pas ou a été déplacée.</p>
    <router-link to="/" class="mt-8 px-6 py-3 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFE55C] transition-colors" aria-label="Retour à l'accueil">
      Retour à l'accueil
    </router-link>
  </div>
</template>

<script setup>
// Pas de script nécessaire pour cette page simple
</script>
