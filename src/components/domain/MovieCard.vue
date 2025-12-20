<script setup>
import { computed } from 'vue';
import { useDataStore } from '../../stores/useDataStore';

const props = defineProps({
  movie: { type: Object, required: true }
});

const dataStore = useDataStore();

const categories = computed(() => {
  if (!props.movie.categories || props.movie.categories.length === 0) {
    return [];
  }
  return props.movie.categories.map(categoryUrl => {
    return dataStore.categories.find(c => `/api/categories/${c.id}` === categoryUrl);
  }).filter(Boolean); // Filter out any undefined results
});

const categoryShortNames = {
  'Documentaire': 'Docu',
  'Science-Fiction': 'SF',
  'Biographie':'Bio'
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
</script>

<template>
  <div class="universal-card group cursor-pointer bg-black rounded-lg hover:rounded-lg" role="article" :aria-label="'Film : ' + movie.name">
    <div class="relative w-full h-64 overflow-hidden rounded-lg hover:rounded-lg ">
      <img
          :src="movie.url ? movie.url : '/default-film.jpg'"
          :alt="'Affiche du film ' + movie.name"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          width="300"
          height="450"
      />
      <div class="absolute inset-0 "></div>
      <div class="absolute top-3 right-3 px-3 py-1  text-xs font-semibold text-[#FFD700] tracking-wider">
        {{ getYear(movie.releaseDate) }}
      </div>
    </div>

    <div class="p-5">
      <h3 class="text-white font-semibold text-lg leading-tight line-clamp-2 group-hover:text-[#FFD700] transition-colors duration-300">
        {{ movie.name }}
      </h3>

      <div class="flex flex-wrap gap-2 mt-3">
        <template v-if="categories.length > 0">
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
