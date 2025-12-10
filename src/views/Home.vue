<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import api from '/src/api/api.js'
import MovieCard from '/src/components/MovieCard.vue'
import ActorCard from '/src/components/ActorCard.vue'
import { useRouter } from 'vue-router'

gsap.registerPlugin(ScrollTrigger)

const movies = ref([])
const actors = ref([])
const router = useRouter()
const loading = ref(false)
const canvasRef = ref(null)

const goToMovie = (id) => router.push(`/movies/${id}`)
const goToActor = (id) => router.push(`/actors/${id}`)

// Three.js Scene
let scene, camera, renderer, particles
let animationId = null

const initThreeJS = () => {
  if (!canvasRef.value) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    antialias: true
  })

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  camera.position.z = 5

  // Particules dorées
  const particlesGeometry = new THREE.BufferGeometry()
  const particlesCount = 5000 // Plus de particules
  const positions = new Float32Array(particlesCount * 3)
  const scales = new Float32Array(particlesCount) // Pour des tailles différentes

  for(let i = 0; i < particlesCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100 // Étendue plus large
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100
    scales[i] = Math.random() * 0.8 + 0.2 // Tailles aléatoires
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particlesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1, // Taille de base
    color: 0xFFD700,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true // Les particules plus éloignées sont plus petites
  })

  particles = new THREE.Points(particlesGeometry, particlesMaterial)
  scene.add(particles)

  const animate = () => {
    animationId = requestAnimationFrame(animate)

    // Animation des particules
    particles.rotation.y += 0.0008
    particles.rotation.x += 0.0004
    particles.position.z += 0.05 // Déplacement léger vers l'avant
    if (particles.position.z > 10) particles.position.z = -10 // Réinitialiser la position

    renderer.render(scene, camera)
  }

  animate()
}

const handleResize = () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

const initScrollTriggers = () => {
  // Animations au scroll
  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: 'power3.out'
    })
  })

  gsap.utils.toArray('.movie-card-wrapper, .actor-card-wrapper').forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 30,
      delay: (index % 4) * 0.1,
      duration: 0.6,
      ease: 'power3.out'
    })
  })
}

onMounted(async () => {
  loading.value = true

  initThreeJS()
  window.addEventListener('resize', handleResize)

  // Animations GSAP
  gsap.from('.hero-badge', {
    opacity: 0,
    scale: 0.5,
    duration: 0.8,
    delay: 0.5,
    ease: 'back.out(2)'
  })

  gsap.from('.hero-title', {
    opacity: 0,
    y: 100,
    duration: 1.2,
    delay: 0.7,
    ease: 'power4.out'
  })

  gsap.from('.hero-subtitle', {
    opacity: 0,
    y: 50,
    duration: 1,
    delay: 0.9,
    ease: 'power3.out'
  })

  try {
    const movieRes = await api.get('/movies', {
      params: { 'order[release_date]': 'desc', 'limit': 4, 'page': 1, 'groups[]': ['movie:read', 'movie:categories'] },
    })
    const dataMovies = movieRes.data.member || []
    movies.value = dataMovies.sort((a, b) => b.id - a.id).slice(0, 4)

    const actorRes = await api.get('/actors', {
      params: { limit: 10000, 'groups[]': 'actor:read' },
    })
    const dataActors = actorRes.data.member || []
    actors.value = dataActors.sort((a, b) => b.id - a.id).slice(0, 4)

    // Attendre que Vue mette à jour le DOM
    await nextTick()

    // Initialiser les animations de scroll
    initScrollTriggers()

  } catch (err) {
    // L'intercepteur global gérera l'affichage de l'erreur 429
    console.error("Erreur lors du chargement des données :", err);
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) renderer.dispose()
  ScrollTrigger.getAll().forEach(st => st.kill())
})
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0f] relative overflow-hidden">
    <!-- Hero avec Three.js -->
    <section class="relative h-screen flex items-center justify-center overflow-hidden">
      <canvas ref="canvasRef" class="absolute inset-0 w-full h-full" />

      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.03),transparent_70%)]" />
      <div class="absolute inset-0 bg-gradient-to-b from-[#0d0d0f]/60 via-transparent to-[#0d0d0f]" />

      <div class="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div class="hero-badge inline-block px-6 py-2 border border-[#FFD700]/30 rounded-full mb-8 text-[10px] tracking-[0.25em] text-[#FFD700]">
          PREMIUM FILM COLLECTION
        </div>

        <h1 class="hero-title garamond text-7xl md:text-9xl font-bold leading-none mb-6 text-[#FFD700]">
          CINÉASTE
        </h1>

        <p class="hero-subtitle text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed">
          Explorez une collection exclusive de films et d'acteurs légendaires
        </p>

        <div class="flex gap-4 justify-center flex-wrap">
          <router-link
              to="/movies"
              class="px-10 py-4 bg-[#FFD700] hover:bg-[#FFE55C] text-black text-xs tracking-[0.2em] font-bold rounded-lg transition-all hover:scale-105"
          >
            EXPLORER LES FILMS
          </router-link>
          <router-link
              to="/actors"
              class="px-10 py-4 border border-[#FFD700] hover:bg-[#FFD700] hover:text-black text-[#FFD700] text-xs tracking-[0.2em] font-bold rounded-lg transition-all"
          >
            DÉCOUVRIR LES ACTEURS
          </router-link>
        </div>
      </div>
    </section>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-6 py-24 space-y-24">
      <div v-if="loading" class="flex justify-center py-20">
        <div class="flex gap-2">
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce"></div>
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>

      <template v-else>
        <!-- Films -->
        <section class="space-y-8">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-2">SÉLECTION</div>
              <h2 class="section-title garamond text-5xl md:text-6xl font-bold text-white">
                Derniers Films
              </h2>
            </div>
            <router-link
                to="/movies"
                class="text-sm text-[#FFD700] hover:text-[#FFE55C] transition-colors tracking-[0.15em]"
            >
              VOIR TOUT →
            </router-link>
          </div>

          <div class="h-px bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-30" />

          <div v-if="movies.length === 0" class="text-center text-white/60 py-12">
            Aucun film trouvé.
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="movie in movies" :key="movie.id" class="movie-card-wrapper">
              <MovieCard
                  :movie="movie"
                  @click="goToMovie(movie.id)"
              />
            </div>
          </div>
        </section>

        <!-- Acteurs -->
        <section class="space-y-8">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-2">TALENTS</div>
              <h2 class="section-title garamond text-5xl md:text-6xl font-bold text-white">
                Acteurs Légendaires
              </h2>
            </div>
            <router-link
                to="/actors"
                class="text-sm text-[#FFD700] hover:text-[#FFE55C] transition-colors tracking-[0.15em]"
            >
              VOIR TOUT →
            </router-link>
          </div>

          <div class="h-px bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-30" />

          <div v-if="actors.length === 0" class="text-center text-white/60 py-12">
            Aucun acteur trouvé.
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="actor in actors" :key="actor.id" class="actor-card-wrapper">
              <ActorCard
                  :actor="actor"
                  @click="goToActor(actor.id)"
              />
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
