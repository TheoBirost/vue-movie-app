<script setup>
defineProps({
  actor: { type: Object, required: true }
})
</script>

<template>
  <div class="group cursor-pointer">
    <div class="relative overflow-hidden rounded-2xl bg-gray-100 mb-3 ">
      <img
          :src="actor.photo?.url || '/img/default-actor.jpg'"
          :alt="`${actor.firstname} ${actor.lastname}`"
          class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
    </div>

    <div class="px-1">
      <h3 class="font-semibold text-gray-900 text-base">
        {{ actor.firstname }}
      </h3>
      <p class="text-gray-900 text-base">
        {{ actor.lastname }}
      </p>
    </div>
  </div>
</template>