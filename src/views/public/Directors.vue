<script setup>
import { ref, onMounted, watch, nextTick, computed } from "vue"
import { useRouter } from "vue-router"
import { gsap } from 'gsap'
import * as THREE from 'three'
import { useDataStore } from '../../stores/useDataStore'
import DirectorCard from "../../components/domain/DirectorCard.vue"

const router = useRouter()
const dataStore = useDataStore()
const search = ref("")
const page = ref(1)
const loading = ref(true)
const canvasRef = ref(null)

const limit = 12

const filteredDirectors = computed(() => {
  if (!search.value) {
    return dataStore.directors;
  }
  return dataStore.directors.filter(director =>
    (director.firstname && director.firstname.toLowerCase().includes(search.value.toLowerCase())) ||
    (director.lastname && director.lastname.toLowerCase().includes(search.value.toLowerCase()))
  );
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredDirectors.value.length / limit));
});

const paginatedDirectors = computed(() => {
  const start = (page.value - 1) * limit;
  const end = start + limit;
  return filteredDirectors.value.slice(start, end);
});

const fetchDirectors = async (force = false) => {
  loading.value = true
  try {
    await dataStore.fetchDirectors(force)
    await nextTick()
    animateCards()
  } catch (err) {
    console.error("Erreur lors du chargement des réalisateurs :", err);
  } finally {
    loading.value = false
  }
}

const animateCards = () => {
  if (document.querySelectorAll('.director-card-wrapper').length > 0) {
    gsap.from('.director-card-wrapper', {
      opacity: 0,
      y: 50,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power3.out'
    })
  }
}

// --- Three.js Fog ---
let animationId
const initThreeJS = () => {
  if (!canvasRef.value) return
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)

  scene.fog = new THREE.FogExp2(0x0d0d0f, 0.08) // Brouillard assorti au fond

  const particlesGeometry = new THREE.BufferGeometry()
  const particlesCount = 800
  const posArray = new Float32Array(particlesCount * 3)
  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.03,
    color: 0xFFD700,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  })
  const particles = new THREE.Points(particlesGeometry, particlesMaterial)
  scene.add(particles)

  const clock = new THREE.Clock()
  const animate = () => {
    const elapsedTime = clock.getElapsedTime()
    particles.rotation.y = elapsedTime * 0.1
    renderer.render(scene, camera)
    animationId = requestAnimationFrame(animate)
  }
  animate()
}

watch(search, () => {
  page.value = 1;
});

watch(page, () => {
  nextTick().then(() => {
    animateCards();
  });
});

onMounted(async () => {
  await fetchDirectors()
  initThreeJS()
  gsap.from('.page-title, .search-bar', {
    opacity: 0,
    y: -30,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power3.out'
  })
})
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0f] relative">
    <canvas ref="canvasRef" class="fixed top-0 left-0 w-full h-full z-0 opacity-50" aria-hidden="true"></canvas>
    <div class="max-w-7xl mx-auto px-6 py-20 space-y-12 relative z-10">

      <div class="flex justify-between items-end">
        <div class="page-title">
          <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-2">MAESTROS</div>
          <h1 class="garamond text-6xl md:text-7xl font-bold text-white mb-3">Réalisateurs</h1>
          <div class="h-1 w-24 bg-gradient-to-r from-[#FFD700] to-transparent" />
        </div>
      </div>

      <div class="search-bar">
        <div class="relative">
          <label for="director-search" class="sr-only">Rechercher un réalisateur</label>
          <input id="director-search" v-model="search" placeholder="Rechercher un réalisateur..." class="w-full px-6 py-4 bg-[#16181E] text-white border border-[#2A2D36] rounded-lg focus:outline-none focus:border-[#FFD700] transition-all text-lg" />
          <svg class="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center min-h-[40vh]" aria-label="Chargement en cours">
        <div class="flex gap-2">
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce"></div>
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>

      <div v-else-if="paginatedDirectors.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div v-for="director in paginatedDirectors" :key="director.id" class="director-card-wrapper">
          <DirectorCard :director="director" />
        </div>
      </div>

      <div v-else class="text-center py-20">
        <p class="text-[#C1C1C7] text-lg">Aucun réalisateur trouvé</p>
      </div>

      <div v-if="totalPages > 1" class="flex justify-center items-center gap-6 pt-8">
        <button :disabled="page === 1" @click="page--" class="w-12 h-12 rounded-lg bg-[#16181E] border border-[#2A2D36] hover:border-[#FFD700] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white flex items-center justify-center" aria-label="Page précédente"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button>
        <span class="text-[#C1C1C7] tracking-[0.2em] text-sm">PAGE <span class="text-[#FFD700] font-bold">{{ page }}</span> / {{ totalPages }}</span>
        <button :disabled="page === totalPages" @click="page++" class="w-12 h-12 rounded-lg bg-[#16181E] border border-[#2A2D36] hover:border-[#FFD700] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white flex items-center justify-center" aria-label="Page suivante"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></button>
      </div>
    </div>
  </div>
</template>
