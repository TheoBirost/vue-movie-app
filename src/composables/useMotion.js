import { readonly, ref } from 'vue'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Préférence système partagée par toute l'application (une seule
 * MediaQueryList). Source de vérité commune au CSS (@media), aux animations
 * JavaScript et aux décors animés.
 *
 * Volontairement sans dépendance : ce module est importé par App.vue, donc
 * dans le chemin critique. Le réglage de GSAP vit dans `useGsap.js`, chargé
 * seulement par les vues qui animent réellement.
 */
const reduced = ref(
    typeof window !== 'undefined' && window.matchMedia(QUERY).matches
)

if (typeof window !== 'undefined') {
    window
        .matchMedia(QUERY)
        .addEventListener('change', (event) => {
            reduced.value = event.matches
        })
}

export function useMotionPreference() {
    return readonly(reduced)
}

/** Lecture synchrone hors composant (routeur, intercepteurs…). */
export function prefersReducedMotion() {
    return reduced.value
}
