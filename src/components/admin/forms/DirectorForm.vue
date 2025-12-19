<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div class="bg-gray-800 p-8 rounded-lg">
      <h2 class="text-xl font-bold mb-4">{{ director ? 'Edit' : 'Add' }} Director</h2>
      <form @submit.prevent="saveDirector">
        <div class="mb-4">
          <label for="firstname" class="block mb-2">First Name</label>
          <input type="text" id="firstname" v-model="form.firstname" class="w-full p-2 rounded-lg bg-gray-700">
        </div>
        <div class="mb-4">
          <label for="lastname" class="block mb-2">Last Name</label>
          <input type="text" id="lastname" v-model="form.lastname" class="w-full p-2 rounded-lg bg-gray-700">
        </div>
        <div class="flex justify-end">
          <button type="button" @click="$emit('close')" class="mr-2">Cancel</button>
          <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-lg">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import api from '/src/api/api.js';

const props = defineProps({
  director: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'refresh']);

const form = ref({
  firstname: '',
  lastname: '',
});

watch(() => props.director, (newDirector) => {
  if (newDirector) {
    form.value = { ...newDirector };
  } else {
    form.value = { firstname: '', lastname: '' };
  }
}, { immediate: true });

const saveDirector = async () => {
  try {
    if (props.director) {
      await api.put(`/directors/${props.director.id}`, form.value);
    } else {
      await api.post('/directors', form.value);
    }
    emit('refresh');
    emit('close');
  } catch (error) {
    console.error('Error saving director:', error);
  }
};
</script>
