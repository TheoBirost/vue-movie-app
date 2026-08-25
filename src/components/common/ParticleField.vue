<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useMotionPreference } from '../../composables/useMotion'

/**
 * Champ de particules dorées, partagé par l'accueil, les écrans
 * d'authentification et la page réalisateurs.
 *
 * Remplace trois implémentations Three.js distinctes qui fuyaient toutes :
 * boucle `requestAnimationFrame` jamais annulée (elle continuait à tourner et
 * à rendre sur un contexte WebGL déjà libéré), géométries et matériaux non
 * libérés, un renderer par vue.
 *
 * Le rendu passe ici par un canvas 2D avec projection perspective faite à la
 * main : le résultat visuel est le même — des points dorés qui dérivent en
 * profondeur — pour ~2 ko au lieu des 124 ko gzip du moteur 3D. C'est le poste
 * d'économie le plus important du chargement initial.
 */
const props = defineProps({
    /** Densité de base ; réduite automatiquement sur petit écran. */
    count: { type: Number, default: 320 },
    /** Rayon maximal des points, en pixels. */
    size: { type: Number, default: 1.6 },
    color: { type: String, default: '255, 215, 0' },
    /** Vitesse de dérive vers l'observateur. */
    speed: { type: Number, default: 0.28 },
    /** `fixed` pour un fond plein écran, `absolute` dans une section. */
    position: { type: String, default: 'absolute' },
    opacity: { type: Number, default: 0.75 },
})

const reduced = useMotionPreference()
const canvas = ref(null)

const DEPTH = 1000

let ctx = null
let stars = []
let frameId = null
let resizeObserver = null
let width = 0
let height = 0
let dpr = 1

const spawn = (initial) => ({
    x: (Math.random() - 0.5) * 2 * DEPTH,
    y: (Math.random() - 0.5) * 2 * DEPTH,
    // Au premier remplissage on répartit la profondeur ; ensuite les points
    // réapparaissent au fond pour que le flux reste continu.
    z: initial ? Math.random() * DEPTH : DEPTH,
    twinkle: Math.random() * Math.PI * 2,
})

const build = () => {
    const density = width < 768 ? 0.55 : 1
    const total = Math.max(60, Math.round(props.count * density))
    stars = Array.from({ length: total }, () => spawn(true))
}

const measure = () => {
    const parent = canvas.value?.parentElement
    if (!canvas.value || !parent) return

    width = parent.clientWidth || window.innerWidth
    height = parent.clientHeight || window.innerHeight
    dpr = Math.min(window.devicePixelRatio || 1, 2)

    canvas.value.width = Math.round(width * dpr)
    canvas.value.height = Math.round(height * dpr)
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
}

const draw = () => {
    frameId = requestAnimationFrame(draw)
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)

    const cx = width / 2
    const cy = height / 2
    const focal = Math.max(width, height) * 0.85

    for (const star of stars) {
        star.z -= props.speed * 2
        star.twinkle += 0.02

        if (star.z <= 1) Object.assign(star, spawn(false))

        const scale = focal / star.z
        const px = cx + star.x * scale
        const py = cy + star.y * scale

        // Hors cadre : on recycle plutôt que de dessiner dans le vide
        if (px < -20 || px > width + 20 || py < -20 || py > height + 20) {
            Object.assign(star, spawn(false))
            continue
        }

        // Les points proches sont plus gros et plus lumineux : c'est ce qui
        // donne la sensation de profondeur.
        const depthRatio = 1 - star.z / DEPTH
        const radius = Math.max(0.35, props.size * depthRatio)
        const alpha =
            props.opacity * depthRatio * (0.65 + 0.35 * Math.sin(star.twinkle))

        ctx.beginPath()
        ctx.fillStyle = `rgba(${props.color}, ${alpha.toFixed(3)})`
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fill()
    }
}

const start = () => {
    if (frameId === null && ctx) draw()
}

const stop = () => {
    if (frameId !== null) {
        cancelAnimationFrame(frameId)
        frameId = null
    }
}

// Un onglet masqué ne doit rien coûter
const onVisibility = () => (document.hidden ? stop() : start())

const onResize = () => {
    measure()
    build()
}

onMounted(() => {
    if (reduced.value || !canvas.value) return

    ctx = canvas.value.getContext('2d', { alpha: true })
    if (!ctx) return

    measure()
    build()

    // ResizeObserver plutôt que l'événement `resize` : suit aussi les
    // changements de mise en page (menu mobile, barre d'URL iOS).
    resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(canvas.value.parentElement)
    document.addEventListener('visibilitychange', onVisibility)

    start()
})

onBeforeUnmount(() => {
    stop()
    document.removeEventListener('visibilitychange', onVisibility)
    resizeObserver?.disconnect()
    resizeObserver = null
    stars = []
    ctx = null
})
</script>

<template>
    <canvas
        v-if="!reduced"
        ref="canvas"
        class="pointer-events-none inset-0 h-full w-full"
        :class="position === 'fixed' ? 'fixed z-0' : 'absolute'"
        aria-hidden="true"
    />
</template>
