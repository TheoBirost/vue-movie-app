<script setup>
import { ref, watch, onUnmounted, computed } from 'vue';
import { bus } from '../bus';
import { gsap } from 'gsap';

const isVisible = ref(false);
const rawMessage = ref('');
const countdown = ref(0);
let intervalId = null;

const modalElement = ref(null);
const overlayElement = ref(null);

const isCountdownMessage = computed(() => rawMessage.value.includes('Veuillez réessayer dans'));

const errorMessage = computed(() => {
  if (isCountdownMessage.value) {
    return `Trop de requêtes. Veuillez réessayer dans ${countdown.value} secondes.`;
  }
  return rawMessage.value;
});

const startCountdown = (durationInSeconds) => {
  if (intervalId) clearInterval(intervalId);

  countdown.value = durationInSeconds;
  isVisible.value = true;

  intervalId = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      isVisible.value = false; // Auto-close when timer finishes
    }
  }, 1000);
};

const handleError = (msg) => {
  rawMessage.value = msg;
  const match = msg.match(/Veuillez réessayer dans (\d+)/);

  if (match && match[1]) {
    startCountdown(parseInt(match[1], 10));
  } else {
    isVisible.value = true;
  }
};

const close = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  isVisible.value = false;
};

watch(isVisible, (newValue) => {
  if (newValue) {
    gsap.fromTo(overlayElement.value, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(modalElement.value, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out', delay: 0.1 });
  } else {
    // Note: The `to` animations might not be visible if the component is removed immediately.
    // This is okay for this use case.
    gsap.to(modalElement.value, { opacity: 0, scale: 0.8, duration: 0.3, ease: 'power3.in' });
    gsap.to(overlayElement.value, { opacity: 0, duration: 0.4, delay: 0.1 });
  }
});

bus.on('error', handleError);

onUnmounted(() => {
  bus.off('error', handleError);
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center">
    <div ref="overlayElement" class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="close"></div>
    <div ref="modalElement" class="relative w-full max-w-md bg-[#16181E] rounded-lg shadow-2xl border border-[#FFD700]/30 p-8 text-center">
      <div class="flex flex-col items-center">
        <svg class="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <h3 class="text-2xl font-bold text-white garamond mb-2">Oups ! Une erreur est survenue</h3>
        <p class="text-[#C1C1C7] mb-6">
          {{ errorMessage }}
        </p>
        <button v-if="!isCountdownMessage" @click="close" class="px-8 py-2 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFE55C] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#16181E] focus:ring-[#FFD700]">
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>
