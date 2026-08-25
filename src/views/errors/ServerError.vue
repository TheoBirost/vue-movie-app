<script setup>
const reload = () => window.location.reload()
</script>

<template>
    <div class="flex min-h-screen items-center bg-[#0d0d0f] px-6 py-24">
        <div class="mx-auto w-full max-w-2xl text-center">
            <p class="eyebrow mb-4">Erreur 500</p>

            <p class="garamond text-[9rem] font-bold leading-none text-[#FFD700] md:text-[11rem]">
                500
            </p>

            <h1 class="garamond mt-2 text-4xl font-bold text-white md:text-5xl">
                La pellicule a cassé
            </h1>
            <p class="mx-auto mt-4 max-w-lg text-[#C1C1C7]">
                Une erreur inattendue est survenue de notre côté. L'incident a été
                enregistré ; réessayez dans un instant.
            </p>

            <div class="mt-10 flex flex-wrap justify-center gap-4">
                <button type="button" class="btn btn-primary" @click="reload">
                    Réessayer
                </button>
                <router-link to="/" class="btn btn-ghost">Retour à l'accueil</router-link>
            </div>
        </div>
    </div>
</template>
