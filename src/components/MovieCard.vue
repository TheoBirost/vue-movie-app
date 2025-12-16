<script setup>
import { ref, onMounted } from 'vue';
import api from '/src/api/api.js';

const props = defineProps({
  movie: { type: Object, required: true }
});

const categories = ref([]);
const loading = ref(true);

// Mapping pour raccourcir les noms de catégories
const categoryShortNames = {
  'Documentaire': 'Docu',
  'Science-Fiction': 'SF'
};

const getYear = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date)) return '—';
  return date.getFullYear();
};

const getShortCategoryName = (categoryName) => {
  return categoryShortNames[categoryName] || categoryName;
};

const fetchCategories = async () => {
  if (!props.movie.categories || props.movie.categories.length === 0) {
    loading.value = false;
    return;
  }

  try {
    const categoryPromises = props.movie.categories.map(async (categoryUrl) => {
      const path = categoryUrl.replace('/api', '');
      const response = await api.get(path);
      return response.data;
    });

    categories.value = await Promise.all(categoryPromises);
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error);
    categories.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div class="universal-card group cursor-pointer">
    <div class="relative w-full h-64 overflow-hidden">
      <img
          :src="movie.url ? movie.url : '/default-film.jpg'"
          :alt="movie.name"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80"></div>
      <div class="absolute top-3 right-3 px-3 py-1 bg-black/80 backdrop-blur-sm rounded text-xs font-semibold text-[#FFD700] tracking-wider">
        {{ getYear(movie.releaseDate) }}
      </div>
    </div>

    <div class="p-5">
      <h3 class="text-white font-semibold text-lg leading-tight line-clamp-2 group-hover:text-[#FFD700] transition-colors duration-300">
        {{ movie.name }}
      </h3>

      <div class="flex flex-wrap gap-2 mt-3">
        <template v-if="loading">
          <span class="px-2 py-1 text-xs bg-black/20 border border-transparent rounded text-gray-400 animate-pulse">
            Chargement...
          </span>
        </template>
        <template v-else-if="categories.length > 0">
          <span
              v-for="category in categories.slice(0, 3)"
              :key="category.id"
              class="px-2 py-1 text-xs bg-black/20 border border-white/10 rounded text-gray-300"
          >
            {{ getShortCategoryName(category.name) }}
          </span>
          <span
              v-if="categories.length > 3"
              class="px-2 py-1 text-xs bg-black/20 border border-white/10 rounded text-gray-400"
          >
            +{{ categories.length - 3 }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>
