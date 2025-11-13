<script setup>
const emit = defineEmits(['cancel', 'confirm'])
const props = defineProps({ user: Object })
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50" @click.self="emit('cancel')">
    <div class="relative bg-[var(--color-gigas-950)] border border-[var(--color-gigas-700)]/40 backdrop-blur-2xl p-8 rounded-3xl w-full max-w-sm shadow-2xl text-white overflow-hidden animate-fadeIn">
      <div class="absolute inset-0 bg-gradient-to-br from-[var(--color-gigas-800)]/70 via-[var(--color-gigas-900)]/90 to-[var(--color-gigas-950)]"></div>
      <div class="relative z-10 flex flex-col gap-4">
        <h3 class="text-xl font-semibold text-[var(--color-gigas-300)]">
          Supprimer "{{ props.user?.firstname }} {{ props.user?.lastname }}" ?
        </h3>
        <p class="text-gray-400 text-sm leading-relaxed mb-6">
          Cette action est irréversible et supprimera définitivement votre compte.
        </p>
        <button
            @click="emit('confirm')"
            class="w-full bg-red-600/90 hover:bg-red-500/80 text-white font-medium py-3 rounded-xl transition-all duration-200 active:scale-95"
        >
          Supprimer
        </button>
        <button
            @click="emit('cancel')"
            class="w-full bg-[var(--color-gigas-800)] hover:bg-[var(--color-gigas-700)] text-[var(--color-gigas-200)] font-medium py-3 rounded-xl transition-all duration-200 active:scale-95"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>
