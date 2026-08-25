<script setup>
defineProps({
    eyebrow: { type: String, required: true },
    title: { type: String, required: true },
    updatedAt: { type: String, required: true },
})
</script>

<template>
    <div class="min-h-screen bg-[#0d0d0f]">
        <div class="mx-auto max-w-3xl px-6 py-24 md:py-32">
            <p class="eyebrow mb-3">{{ eyebrow }}</p>
            <h1 class="garamond mb-4 text-5xl font-bold text-white md:text-6xl">
                {{ title }}
            </h1>
            <p class="text-sm text-[#82828A]">Dernière mise à jour : {{ updatedAt }}</p>

            <div class="section-rule my-12" />

            <div class="legal-prose space-y-10">
                <slot />
            </div>

            <div class="section-rule my-12" />

            <router-link to="/" class="btn btn-secondary">
                Retour à l'accueil
            </router-link>
        </div>
    </div>
</template>

<style scoped>
.legal-prose :deep(h2) {
    font-family: var(--font-display);
    font-size: 1.75rem;
    color: var(--color-chalk);
    margin-bottom: 0.75rem;
}

.legal-prose :deep(h3) {
    font-family: var(--font-sans);
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-gold);
    margin-bottom: 0.4rem;
}

.legal-prose :deep(p),
.legal-prose :deep(li) {
    color: var(--color-ash);
    line-height: 1.75;
}

.legal-prose :deep(ul) {
    list-style: disc;
    padding-left: 1.25rem;
    display: grid;
    gap: 0.5rem;
}

.legal-prose :deep(a) {
    color: var(--color-gold);
    text-decoration: underline;
    text-underline-offset: 4px;
}

.legal-prose :deep(.todo) {
    display: inline-block;
    padding: 0.1rem 0.5rem;
    border-radius: 4px;
    background: rgb(255 215 0 / 0.12);
    border: 1px dashed rgb(255 215 0 / 0.45);
    color: var(--color-gold-light);
    font-size: 0.85em;
    font-weight: 600;
}

.legal-prose :deep(table) {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.legal-prose :deep(th),
.legal-prose :deep(td) {
    border: 1px solid var(--color-line);
    padding: 0.65rem 0.85rem;
    text-align: left;
    color: var(--color-ash);
}

.legal-prose :deep(th) {
    color: var(--color-chalk);
    background: var(--color-surface);
    font-weight: 600;
}
</style>
