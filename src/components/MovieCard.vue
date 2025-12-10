<script setup>
import { ref, onMounted } from 'vue';
import { gsap } from 'gsap';
import api from '/src/api/api.js';

const props = defineProps({
  movie: { type: Object, required: true }
});

const categories = ref([]);
const loading = ref(true);
const cardRef = ref(null);

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

const handleMouseEnter = () => {
  gsap.to(cardRef.value, {
    scale: 1.05,
    boxShadow: '0 0 25px rgba(255, 215, 0, 0.4)',
    duration: 0.3,
    ease: 'power2.out'
  });
};

const handleMouseLeave = () => {
  gsap.to(cardRef.value, {
    scale: 1,
    boxShadow: '0 0 10px rgba(255, 215, 0, 0.1)',
    duration: 0.3,
    ease: 'power2.out'
  });
};

onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div
    ref="cardRef"
    class="group cursor-pointer"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="relative overflow-hidden rounded-lg bg-[#16181E] border border-[#2A2D36] transition-all duration-500">

      <div class="relative w-full h-64 overflow-hidden">
        <img
            :src="movie.url ? movie.url : '/default-film.jpg'"
            :alt="movie.name"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60" />

        <div class="absolute top-3 right-3 px-3 py-1 bg-black/80 backdrop-blur-sm rounded text-xs font-semibold text-[#FFD700] tracking-wider">
          {{ getYear(movie.releaseDate) }}
        </div>

        <div class="absolute bottom-0 left-0 right-0 p-5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <h3 class="text-white font-bold text-lg leading-tight line-clamp-2">
            {{ movie.name }}
          </h3>
        </div>
      </div>

      <div class="p-5 space-y-3">
        <h3 class="text-white font-semibold line-clamp-2 leading-tight group-hover:text-[#FFD700] transition-colors">
          {{ movie.name }}
        </h3>

        <div class="flex flex-wrap gap-2">
          <template v-if="loading">
            <span class="px-2 py-1 text-xs bg-[var(--bg-hover)] border border-[var(--border)] rounded text-[var(--text-gray)] animate-pulse">
              ...
            </span>
          </template>
          <template v-else-if="categories.length > 0">
            <span
                v-for="category in categories.slice(0, 3)"
                :key="category.id"
                class="px-2 py-1 text-xs bg-[var(--bg-hover)] border border-[var(--color-border)] rounded text-[var(--color-star)]"
            >
              {{ getShortCategoryName(category.name) }}
            </span>
            <span
                v-if="categories.length > 3"
                class="px-2 py-1 text-xs bg-[var(--bg-hover)] border border-[var(--border)] rounded text-[var(--text-gray)]"
            >
              +{{ categories.length - 3 }}
            </span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>