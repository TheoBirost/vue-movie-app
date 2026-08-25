<script setup>
import { computed, ref, watch } from 'vue'
import FallbackVisual from './FallbackVisual.vue'

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
    /** 'poster' (œuvre) ou 'person' (portrait) : choisit le motif de repli. */
    kind: { type: String, default: 'poster' },
    /** Sert à générer un visuel stable et distinct par élément. */
    fallbackSeed: { type: [String, Number], default: '' },
    /** Texte du repli, généralement le nom : les initiales en sont tirées. */
    fallbackLabel: { type: String, default: '' },
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

/**
 * Vrai tant qu'aucune image exploitable n'est disponible : source absente, ou
 * chargement en échec. On bascule alors sur un visuel généré plutôt que sur un
 * fichier unique — la base ne contenant aucune illustration, une image commune
 * donnerait huit tuiles identiques par grille.
 */
const useFallback = computed(() => !props.src || failed.value)

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
        :class="{ skeleton: !loaded && !useFallback }"
        :style="ratio ? { aspectRatio: ratio } : null"
    >
        <FallbackVisual
            v-if="useFallback"
            :seed="fallbackSeed || alt"
            :label="fallbackLabel || alt"
            :kind="kind"
        />

        <img
            v-else
            :src="src"
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
