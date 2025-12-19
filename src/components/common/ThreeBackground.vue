<template>
  <canvas ref="canvas" class="fixed top-0 left-0 w-full h-full z-0"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const canvas = ref(null)
let renderer, scene, camera, stars

const init = () => {
  // Scène
  scene = new THREE.Scene()

  // Caméra
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 50

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    alpha: true, // Fond transparent
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // Particules
  const starGeometry = new THREE.BufferGeometry()
  const starCount = 10000
  const positions = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 2000
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const starMaterial = new THREE.PointsMaterial({
    color: '#FFD700',
    size: 0.7,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  })

  stars = new THREE.Points(starGeometry, starMaterial)
  scene.add(stars)

  // Gestion du redimensionnement
  window.addEventListener('resize', handleResize)
}

const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

const animate = () => {
  requestAnimationFrame(animate)

  // Animation subtile
  stars.rotation.x += 0.0001
  stars.rotation.y += 0.0002

  renderer.render(scene, camera)
}

onMounted(() => {
  init()
  animate()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  // Nettoyage pour éviter les fuites de mémoire
  renderer.dispose()
  stars.geometry.dispose()
  stars.material.dispose()
})
</script>
