<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  director: { type: Object, required: true }
})

const router = useRouter()

const goToDirector = (id) => {
  router.push(`/directors/${id}`)
}
</script>

<template>
  <div
    class="universal-card group cursor-pointer"
    @click="goToDirector(director.id)"
    role="article"
    :aria-label="'Réalisateur : ' + director.firstname + ' ' + director.lastname"
  >
    <div class="relative w-full h-72 overflow-hidden rounded-lg">
      <img
          :src="director.url || '/default_director.jpeg'"
          :alt="'Photo de ' + director.firstname + ' ' + director.lastname"
          class="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          loading="lazy"
          width="300"
          height="450"
      />

      <!-- Overlay gradient -->
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <!-- Nom en overlay -->
      <div class="absolute bottom-0 left-0 right-0 p-5">
        <h3 class="text-white font-bold text-xl leading-tight group-hover:text-[#FFD700] transition-colors duration-300">
          {{ director.firstname }}
        </h3>
        <p class="text-[#FFD700] text-sm uppercase tracking-widest font-medium">
          {{ director.lastname }}
        </p>
      </div>
    </div>
  </div>
</template>
