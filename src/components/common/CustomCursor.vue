<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useMotionPreference } from '../../composables/useMotion'

/**
 * Curseur cinéma : un point qui colle au pointeur, un anneau qui suit avec du
 * retard et grossit au survol des éléments interactifs.
 *
 * Écrit en rAF + interpolation plutôt qu'avec GSAP, pour deux raisons :
 *  - le composant est monté dans App.vue, donc dans le chemin critique ; le
 *    garder sans dépendance sort GSAP (28 ko gzip) du bundle initial ;
 *  - l'implémentation précédente créait un tween par `mousemove`, soit des
 *    centaines d'objets par seconde.
 *
 * Rien n'est monté sur pointeur grossier (tactile) ni en « mouvement réduit ».
 */
const reduced = useMotionPreference()
const enabled = ref(false)
const dot = ref(null)
const ring = ref(null)

const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, .universal-card'

let frameId = null
let cleanup = () => {}

onMounted(() => {
    const finePointer =
        typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

    if (!finePointer || reduced.value) return
    enabled.value = true

    // Les refs n'existent qu'après le rendu conditionnel
    requestAnimationFrame(() => {
        const dotEl = dot.value
        const ringEl = ring.value
        if (!dotEl || !ringEl) return

        const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
        const dotPos = { ...target }
        const ringPos = { ...target }
        let scale = 1
        let targetScale = 1
        let opacity = 0

        const tick = () => {
            frameId = requestAnimationFrame(tick)

            // Interpolation exponentielle : le point rattrape vite, l'anneau traîne
            dotPos.x += (target.x - dotPos.x) * 0.45
            dotPos.y += (target.y - dotPos.y) * 0.45
            ringPos.x += (target.x - ringPos.x) * 0.14
            ringPos.y += (target.y - ringPos.y) * 0.14
            scale += (targetScale - scale) * 0.18

            dotEl.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0)`
            ringEl.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) scale(${scale.toFixed(3)})`
            dotEl.style.opacity = opacity
            ringEl.style.opacity = opacity
        }

        const onMove = (event) => {
            target.x = event.clientX
            target.y = event.clientY
            opacity = 1
        }

        const onOver = (event) => {
            if (!event.target.closest?.(INTERACTIVE)) return
            targetScale = 1.6
            ringEl.style.borderColor = '#FFD700'
        }

        const onOut = (event) => {
            if (!event.target.closest?.(INTERACTIVE)) return
            targetScale = 1
            ringEl.style.borderColor = '#C1C1C7'
        }

        const hide = () => {
            opacity = 0
        }

        window.addEventListener('mousemove', onMove, { passive: true })
        document.addEventListener('mouseover', onOver, true)
        document.addEventListener('mouseout', onOut, true)
        document.addEventListener('mouseleave', hide)

        tick()

        cleanup = () => {
            if (frameId !== null) cancelAnimationFrame(frameId)
            frameId = null
            window.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseover', onOver, true)
            document.removeEventListener('mouseout', onOut, true)
            document.removeEventListener('mouseleave', hide)
        }
    })
})

onBeforeUnmount(() => cleanup())
</script>

<template>
    <template v-if="enabled">
        <div ref="dot" class="cursor-dot" aria-hidden="true" />
        <div ref="ring" class="cursor-ring" aria-hidden="true" />
    </template>
</template>

<style scoped>
.cursor-dot,
.cursor-ring {
    position: fixed;
    top: 0;
    left: 0;
    opacity: 0;
    pointer-events: none;
    border-radius: 50%;
    mix-blend-mode: difference;
    will-change: transform;
    transition: opacity 200ms linear;
}

.cursor-dot {
    width: 8px;
    height: 8px;
    margin: -4px 0 0 -4px;
    background-color: #ffd700;
    z-index: 9999;
}

.cursor-ring {
    width: 36px;
    height: 36px;
    margin: -18px 0 0 -18px;
    border: 1.5px solid #c1c1c7;
    z-index: 9998;
    transition: opacity 200ms linear, border-color 300ms ease;
}
</style>
