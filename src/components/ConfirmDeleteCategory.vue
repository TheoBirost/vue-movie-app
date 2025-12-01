<script setup>
const emit = defineEmits(['cancel', 'confirm'])
const props = defineProps({ category: Object })
</script>

<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" @click.self="emit('cancel')">
    <div class="bg-color-surface border border-color-border rounded-lg w-full max-w-md shadow-2xl" data-aos="fade-up">
      <header class="p-6 border-b border-color-border">
        <h2 class="text-2xl font-gloock font-bold text-color-heading">Confirm Deletion</h2>
      </header>
      <main class="p-6">
        <p class="text-color-text">
          Are you sure you want to delete the category
          <strong class="text-color-heading">{{ props.category?.name }}</strong>? This action cannot be undone.
        </p>
        <div v-if="props.category?.moviesCount > 0" class="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-sm rounded-md">
          This category contains {{ props.category.moviesCount }} movie(s) and cannot be deleted.
        </div>
      </main>
      <footer class="p-6 flex justify-end gap-4 bg-color-bg rounded-b-lg">
        <button @click="emit('cancel')" class="btn-secondary">
          Cancel
        </button>
        <button @click="emit('confirm')" :disabled="props.category?.moviesCount > 0" class="btn-danger disabled:opacity-50 disabled:cursor-not-allowed">
          Delete
        </button>
      </footer>
    </div>
  </div>
</template>
