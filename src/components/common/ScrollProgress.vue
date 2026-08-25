<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useMotionPreference } from '../../composables/useMotion'

/**
 * Filet doré indiquant la progression de lecture.
 * Écrit directement dans le style de l'élément via rAF : pas de re-rendu Vue
 * à chaque pixel scrollé.
 */
const reduced = useMotionPreference()
const bar = ref(null)
let frame = null

const update = () => {
    frame = null
    if (!bar.value) return
    const scrollable = document.documentElement.scrollHeight - window.innerHeight
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0
    bar.value.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`
}

const onScroll = () => {
    if (frame !== null) return
    frame = requestAnimationFrame(update)
}

onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()
})

onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    if (frame !== null) cancelAnimationFrame(frame)
})
</script>

<template>
    <div
        ref="bar"
        class="scroll-progress"
        :style="reduced ? null : { transition: 'transform 120ms linear' }"
        aria-hidden="true"
    />
</template>
