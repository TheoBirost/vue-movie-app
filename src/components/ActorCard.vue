<script setup>
import { ref } from 'vue';
import { gsap } from 'gsap';

const props = defineProps({
  actor: { type: Object, required: true }
});

const cardRef = ref(null);

const handleMouseEnter = () => {
  gsap.to(cardRef.value, {
    scale: 1.05,
    boxShadow: '0 0 25px rgba(255, 215, 0, 0.4)',
    duration: 0.3,
    ease: 'power2.out'
  });
};

const handleMouseLeave = () => {
  gsap.to(cardRef.value, {
    scale: 1,
    boxShadow: '0 0 10px rgba(255, 215, 0, 0.1)',
    duration: 0.3,
    ease: 'power2.out'
  });
};
</script>

<template>
  <div
    ref="cardRef"
    class="group cursor-pointer"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="relative overflow-hidden rounded-lg bg-[#16181E] border border-[#2A2D36] transition-all duration-500">

      <div class="relative w-full h-72 overflow-hidden">
        <img
            :src="actor.url || '/default_actor.jpeg'"
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