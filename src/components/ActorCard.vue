<script setup>
const props = defineProps({
  actor: { type: Object, required: true }
});
</script>

<template>
  <div class="universal-card group cursor-pointer">
    <div class="relative w-full h-72 overflow-hidden">
      <img
          :src="actor.url || '/default_actor.jpeg'"
          :alt="`${actor.firstname} ${actor.lastname}`"
          class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
      <div class="absolute bottom-0 left-0 right-0 p-5">
        <h3 class="text-white font-bold text-xl leading-tight group-hover:text-[#FFD700] transition-colors duration-300">
          {{ actor.firstname }}
        </h3>
        <p class="text-[#FFD700] text-sm uppercase tracking-widest font-medium">
          {{ actor.lastname }}
        </p>
      </div>
    </div>
  </div>
</template>
