<script setup>
defineProps({
  actor: { type: Object, required: true }
})
</script>

<template>
  <div class="group cursor-pointer overflow-hidden rounded-lg bg-color-surface shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up">
    <div class="relative w-full h-72">
      <img
        :src="actor.url || '/default_actor.jpeg'"
        :alt="`${actor.firstname} ${actor.lastname}`"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
    </div>
    <div class="p-5 text-center">
      <h3 class="text-xl font-gloock font-bold text-color-heading">
        {{ actor.firstname }} {{ actor.lastname }}
      </h3>
    </div>
  </div>
</template>
