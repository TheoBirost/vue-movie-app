<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div class="bg-gray-800 p-8 rounded-lg">
      <h2 class="text-xl font-bold mb-4">Confirm Delete</h2>
      <p>Are you sure you want to delete this director?</p>
      <div class="flex justify-end mt-4">
        <button @click="$emit('cancel')" class="mr-2">Cancel</button>
        <button @click="$emit('confirm')" class="bg-red-500 text-white px-4 py-2 rounded-lg">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['cancel', 'confirm']);
</script>
