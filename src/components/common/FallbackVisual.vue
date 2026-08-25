<script setup>
import { computed } from 'vue'

/**
 * Visuel de remplacement, généré à partir du titre de l'œuvre.
 *
 * La base ne contient aucune affiche ni photo : sans cela, toutes les cartes
 * afficheraient la même image et la grille aurait l'air cassée. Ici chaque
 * élément reçoit sa propre teinte et ses initiales, dérivées de son nom — le
 * résultat est stable dans le temps (même film, même visuel) et la grille
 * paraît composée plutôt que vide.
 *
 * Les teintes restent volontairement très sombres et désaturées : elles
 * habillent la carte sans concurrencer l'or de l'identité.
 */
const props = defineProps({
    /** Chaîne d'où dérivent la teinte et l'angle. Le titre convient. */
    seed: { type: [String, Number], default: '' },
    /** Texte affiché en grand, généralement des initiales. */
    label: { type: String, default: '' },
    /** 'poster' pour une œuvre, 'person' pour un portrait. */
    kind: { type: String, default: 'poster' },
})

/**
 * Hachage déterministe : même entrée, même visuel, à chaque rendu.
 *
 * On combine le type, l'identifiant ET le nom. Se contenter de l'identifiant
 * donnait une répartition médiocre — des entrées d'un seul caractère — et une
 * collision systématique entre le film n°1 et l'acteur n°1, qui se retrouvaient
 * de la même couleur sur la page d'accueil.
 */
const hash = computed(() => {
    const text = `${props.kind}|${props.seed}|${props.label}` || 'cineaste'
    let h = 2166136261
    for (let i = 0; i < text.length; i += 1) {
        h ^= text.charCodeAt(i)
        h = Math.imul(h, 16777619)
    }
    return Math.abs(h)
})

const hue = computed(() => (hash.value * 137.508) % 360)
const angle = computed(() => 115 + (hash.value % 50))

const initials = computed(() => {
    const source = String(props.label || props.seed || '')
    const words = source.trim().split(/\s+/).filter(Boolean)
    if (!words.length) return '—'
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
})

const style = computed(() => ({
    '--fv-a': `hsl(${hue.value} 24% 13%)`,
    '--fv-b': `hsl(${(hue.value + 35) % 360} 30% 7%)`,
    '--fv-angle': `${angle.value}deg`,
}))
</script>

<template>
    <div class="fallback-visual" :style="style" aria-hidden="true">
        <span class="fv-initials">{{ initials }}</span>

        <!-- Perforations de pellicule pour une œuvre, arc de portrait sinon -->
        <span v-if="kind === 'poster'" class="fv-perfs fv-perfs--left" />
        <span v-if="kind === 'poster'" class="fv-perfs fv-perfs--right" />
        <span v-else class="fv-halo" />
    </div>
</template>

<style scoped>
.fallback-visual {
    position: relative;
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    /* Les initiales se dimensionnent sur la carte, pas sur la fenêtre :
       il faut donc déclarer ce bloc comme conteneur pour que `cqw` résolve. */
    container-type: inline-size;
    background:
        radial-gradient(120% 90% at 50% 0%, rgb(255 215 0 / 0.06), transparent 60%),
        linear-gradient(var(--fv-angle), var(--fv-a), var(--fv-b));
}

.fv-initials {
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 22cqw, 5rem);
    font-weight: 600;
    letter-spacing: 0.06em;
    color: rgb(255 215 0 / 0.5);
    line-height: 1;
    user-select: none;
}

/* Bandes perforées, comme les bords d'une pellicule 35 mm */
.fv-perfs {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 12px;
    background-image: repeating-linear-gradient(
        to bottom,
        rgb(255 255 255 / 0.07) 0 8px,
        transparent 8px 18px
    );
}
.fv-perfs--left { left: 6px; }
.fv-perfs--right { right: 6px; }

/* Arc discret derrière les initiales d'une personne */
.fv-halo {
    position: absolute;
    width: 62%;
    aspect-ratio: 1;
    border-radius: 50%;
    border: 1px solid rgb(255 255 255 / 0.07);
}

@media (prefers-reduced-motion: no-preference) {
    .fallback-visual::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
            105deg,
            transparent 42%,
            rgb(255 255 255 / 0.05) 50%,
            transparent 58%
        );
        opacity: 0;
        transition: opacity var(--duration-base) var(--ease-cinema);
    }
    .universal-card:hover .fallback-visual::after { opacity: 1; }
}
</style>
