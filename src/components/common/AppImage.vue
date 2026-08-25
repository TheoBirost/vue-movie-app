<script setup>
import { computed, ref, watch } from 'vue'

/**
 * Image applicative : squelette pendant le chargement, révélation en fondu,
 * et repli automatique si la source distante est absente ou cassée.
 *
 * Remplace les `:src="x || '/default.jpg'"` disséminés dans les vues, qui
 * n'attrapaient que le cas "URL vide" — pas le 404 d'une affiche distante.
 */
const props = defineProps({
    src: { type: String, default: '' },
    alt: { type: String, required: true },
    fallback: { type: String, default: '/placeholder-poster.svg' },
    width: { type: [Number, String], default: 300 },
    height: { type: [Number, String], default: 450 },
    /** `true` sur l'image LCP d'une page (affiche principale d'un détail). */
    priority: { type: Boolean, default: false },
    imgClass: { type: String, default: '' },
    /** Ratio CSS appliqué au conteneur, évite le décalage de mise en page. */
    ratio: { type: String, default: '' },
})

const loaded = ref(false)
const failed = ref(false)

const resolvedSrc = computed(() =>
    !props.src || failed.value ? props.fallback : props.src
)

// Une nouvelle source repart d'un état neutre (pagination, changement de film…)
watch(
    () => props.src,
    () => {
        loaded.value = false
        failed.value = false
    }
)

const onLoad = (event) => {
    // Une image servie depuis le cache peut être déjà complète au montage :
    // on ne déclenche le fondu que si elle a une taille réelle.
    loaded.value = event.target.naturalWidth > 0
}

const onError = () => {
    failed.value = true
    loaded.value = true
}
</script>

<template>
    <div
        class="relative overflow-hidden"
        :class="{ skeleton: !loaded }"
        :style="ratio ? { aspectRatio: ratio } : null"
    >
        <img
            :src="resolvedSrc"
            :alt="alt"
            :width="width"
            :height="height"
            :loading="priority ? 'eager' : 'lazy'"
            :fetchpriority="priority ? 'high' : 'auto'"
            decoding="async"
            class="img-reveal h-full w-full object-cover"
            :class="[imgClass, { 'is-loaded': loaded }]"
            @load="onLoad"
            @error="onError"
        />
    </div>
</template>
