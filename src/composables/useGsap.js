import { onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { prefersReducedMotion } from './useMotion'

/**
 * Aligne GSAP sur la préférence système dès le premier usage.
 *
 * `timeScale(100)` fait jouer toutes les animations quasi instantanément :
 * l'état final est appliqué et les rappels (`onComplete`, `clearProps`) sont
 * exécutés. C'est préférable à « ne pas animer du tout », qui laisserait les
 * éléments d'un `gsap.from` bloqués dans leur état de départ.
 */
let configured = false

const configure = () => {
    if (configured) return
    configured = true
    gsap.globalTimeline.timeScale(prefersReducedMotion() ? 100 : 1)
}

/**
 * Enveloppe un ensemble d'animations dans un `gsap.context()` lié au cycle de
 * vie du composant. Le `revert()` au démontage remet le DOM dans son état
 * initial : c'est ce qui évite les éléments figés à `opacity: 0` quand on
 * quitte une vue avant la fin de l'animation.
 *
 * @param {(ctx: import('gsap').Context) => void} setup
 * @param {import('vue').Ref<HTMLElement | null>} [scope] racine de sélection
 */
export function useGsapContext(setup, scope) {
    let ctx = null

    onMounted(() => {
        configure()
        ctx = gsap.context(setup, scope?.value ?? undefined)
    })

    onUnmounted(() => {
        ctx?.revert()
        ctx = null
    })

    return {
        /** Rejoue le bloc d'animations. */
        refresh(nextSetup = setup) {
            ctx?.revert()
            ctx = gsap.context(nextSetup, scope?.value ?? undefined)
        },
        /** Ajoute une animation dans le contexte courant. */
        add(fn) {
            ctx?.add(fn)
        },
    }
}
