<script setup>
import { ref, onMounted, watch, nextTick } from "vue"
import { useRouter } from "vue-router"
import { gsap } from 'gsap'
import * as THREE from 'three'
import api from "/src/api/api.js"
import DirectorCard from "/src/components/DirectorCard.vue"

const router = useRouter()
const directors = ref([])
const search = ref("")
const page = ref(1)
const totalPages = ref(1)
const loading = ref(true)
const canvasRef = ref(null)

const limit = 12

const fetchDirectors = async () => {
  loading.value = true
  try {
    const res = await api.get("/directors", {
      params: {
        page: page.value,
        itemsPerPage: limit,
        "order[id]": "desc",
        lastname: search.value || undefined,
      },
    })
    directors.value = res.data['hydra:member'] || res.data.member || []
    const totalItems = res.data['hydra:totalItems'] || res.data.totalItems || 0
    totalPages.value = Math.max(1, Math.ceil(totalItems / limit))

    await nextTick()

    if (document.querySelectorAll('.director-card-wrapper').length > 0) {
      gsap.from('.director-card-wrapper', {
        opacity: 0,
        y: 50,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out'
      })
    }
  } catch (err) {
    // L'intercepteur global gérera l'affichage de l'erreur 429
    console.error("Erreur lors du chargement des réalisateurs :", err);
    directors.value = [] // Vider les réalisateurs en cas d'erreur
  } finally {
    loading.value = false
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

watch(page, fetchDirectors)
let searchTimeout
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchDirectors()
  }, 300)
})

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
    <canvas ref="canvasRef" class="fixed top-0 left-0 w-full h-full z-0 opacity-50"></canvas>
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
          <input v-model="search" placeholder="Rechercher un réalisateur..." class="w-full px-6 py-4 bg-[#16181E] text-white border border-[#2A2D36] rounded-lg focus:outline-none focus:border-[#FFD700] transition-all text-lg" />
          <svg class="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center min-h-[40vh]">
        <div class="flex gap-2">
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce"></div>
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>

      <div v-else-if="directors.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div v-for="director in directors" :key="director.id" class="director-card-wrapper">
          <DirectorCard :director="director" />
        </div>
      </div>

      <div v-else class="text-center py-20">
        <p class="text-[#C1C1C7] text-lg">Aucun réalisateur trouvé</p>
      </div>

      <div v-if="totalPages > 1" class="flex justify-center items-center gap-6 pt-8">
        <button :disabled="page === 1" @click="page--" class="w-12 h-12 rounded-lg bg-[#16181E] border border-[#2A2D36] hover:border-[#FFD700] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white flex items-center justify-center"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button>
        <span class="text-[#C1C1C7] tracking-[0.2em] text-sm">PAGE <span class="text-[#FFD700] font-bold">{{ page }}</span> / {{ totalPages }}</span>
        <button :disabled="page === totalPages" @click="page++" class="w-12 h-12 rounded-lg bg-[#16181E] border border-[#2A2D36] hover:border-[#FFD700] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white flex items-center justify-center"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></button>
      </div>
    </div>
  </div>
</template>
