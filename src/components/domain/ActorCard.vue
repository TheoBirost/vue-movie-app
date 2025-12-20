<script setup>
const props = defineProps({
  actor: { type: Object, required: true }
});
</script>

<template>
  <div class="universal-card group cursor-pointer bg-black rounded-lg hover:rounded-lg" role="article" :aria-label="'Acteur : ' + actor.firstname + ' ' + actor.lastname">
    <div class="relative w-full h-72 overflow-hidden rounded-lg hover:rounded-lg">
      <img
          :src="actor.url || '/default_actor.jpeg'"
          :alt="'Photo de ' + actor.firstname + ' ' + actor.lastname"
          class="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          loading="lazy"
          width="300"
          height="450"
      />
      <div class="absolute inset-0"></div>
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
