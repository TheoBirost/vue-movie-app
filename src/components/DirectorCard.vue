<script setup>
import { gsap } from 'gsap'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  director: { type: Object, required: true }
})

const router = useRouter()
const cardRef = ref(null)

const handleMouseEnter = () => {
  gsap.to(cardRef.value, {
    scale: 1.05,
    boxShadow: '0 0 25px rgba(255, 215, 0, 0.4)',
    duration: 0.3,
    ease: 'power2.out'
  })
}

const handleMouseLeave = () => {
  gsap.to(cardRef.value, {
    scale: 1,
    boxShadow: '0 0 10px rgba(255, 215, 0, 0.1)',
    duration: 0.3,
    ease: 'power2.out'
  })
}

const goToDirector = (id) => {
  router.push(`/directors/${id}`)
}
</script>

<template>
  <div
    ref="cardRef"
    class="relative overflow-hidden rounded-lg bg-[#16181E] border border-[#2A2D36] shadow-lg
           transition-all duration-300 ease-in-out cursor-pointer"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="goToDirector(director.id)"
  >
    <div class="relative w-full h-72 overflow-hidden">
      <img
          :src="director.url || '/default_director.jpeg'"
          :alt="`${director.firstname} ${director.lastname}`"
          class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
      />

      <!-- Overlay gradient -->
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <!-- Nom en overlay -->
      <div class="absolute bottom-0 left-0 right-0 p-5">
        <h3 class="text-white font-bold text-xl leading-tight">
          {{ director.firstname }}
        </h3>
        <p class="text-[#FFD700] text-sm uppercase tracking-widest font-medium">
          {{ director.lastname }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles spécifiques si nécessaire */
</style>
