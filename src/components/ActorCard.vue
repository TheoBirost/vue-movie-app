<script setup>
defineProps({
  actor: { type: Object, required: true }
})
</script>

<template>
  <div class="group cursor-pointer">
    <div class="relative overflow-hidden rounded-lg bg-[#16181E] border border-[#2A2D36] hover:border-[#FFD700] transition-all duration-500 hover:transform hover:scale-[1.02]">

      <div class="relative w-full h-72 overflow-hidden">
        <img
            :src="actor.url || '/img/default-actor.jpg'"
            :alt="`${actor.firstname} ${actor.lastname}`"
            class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
        />

        <!-- Overlay gradient -->
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <!-- Nom en overlay -->
        <div class="absolute bottom-0 left-0 right-0 p-5">
          <h3 class="text-white font-bold text-xl leading-tight">
            {{ actor.firstname }}
          </h3>
          <p class="text-[#FFD700] text-sm uppercase tracking-widest font-medium">
            {{ actor.lastname }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>