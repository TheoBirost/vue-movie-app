<script setup>
const emit = defineEmits(['cancel', 'confirm'])
const props = defineProps({ actor: Object })
</script>

<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" @click.self="emit('cancel')">
    <div class="bg-color-surface border border-color-border rounded-lg w-full max-w-md shadow-2xl" data-aos="fade-up">
      <header class="p-6 border-b border-color-border">
        <h2 class="text-2xl font-gloock font-bold text-color-heading">Confirm Deletion</h2>
      </header>
      <main class="p-6">
        <p class="text-color-text">
          Are you sure you want to delete the actor
          <strong class="text-color-heading">{{ props.actor?.firstname }} {{ props.actor?.lastname }}</strong>? This action cannot be undone.
        </p>
      </main>
      <footer class="p-6 flex justify-end gap-4 bg-color-bg rounded-b-lg">
        <button @click="emit('cancel')" class="btn-secondary">
          Cancel
        </button>
        <button @click="emit('confirm')" class="btn-danger">
          Delete
        </button>
      </footer>
    </div>
  </div>
</template>
