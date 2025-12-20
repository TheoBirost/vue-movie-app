<script setup>
import { ref, onMounted, computed } from "vue"
import api from '../../../api/api'

const loading = ref(false)
const reviews = ref([])
const page = ref(1)
const totalItems = ref(0)
const itemsPerPage = 30 // Valeur par défaut d'API Platform

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

// Fonction pour charger les détails d'un film si nécessaire
const fetchMovieDetails = async (movieIri) => {
  if (!movieIri) return null;
  try {
    // Si movieIri est déjà un objet, on le retourne
    if (typeof movieIri === 'object') return movieIri;

    // Sinon on extrait l'ID et on fetch
    const id = movieIri.split('/').pop();
    const res = await api.get(`/movies/${id}`);
    return res.data;
  } catch (e) {
    console.error("Erreur chargement film", e);
    return null;
  }
};

const fetchReviews = async () => {
  loading.value = true
  try {
    const response = await api.get('/reviews', {
      params: {
        page: page.value,
        'groups[]': 'review:read'
      }
    })

    // Gestion robuste des données (hydra:member ou member)
    const data = response.data
    let items = data['hydra:member'] || data['member'] || []

    // Si le film est retourné sous forme d'IRI (string) au lieu d'objet, on charge les détails
    // C'est une solution de contournement si le groupe de sérialisation n'est pas parfait côté backend
    const enrichedItems = await Promise.all(items.map(async (review) => {
        if (review.movie && typeof review.movie === 'string') {
            const movieDetails = await fetchMovieDetails(review.movie);
            return { ...review, movie: movieDetails };
        }
        return review;
    }));

    reviews.value = enrichedItems;
    totalItems.value = data['hydra:totalItems'] || data['totalItems'] || reviews.value.length

  } catch (err) {
    console.error("Erreur lors du chargement des avis :", err);
  } finally {
    loading.value = false
  }
}

const deleteReview = async (reviewId) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
    return
  }
  try {
    await api.delete(`/reviews/${reviewId}`)
    // Rafraîchir la liste après suppression
    fetchReviews()
  } catch (err) {
    console.error("Erreur suppression :", err)
  }
}

const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage
    fetchReviews()
  }
}

onMounted(async () => {
  await fetchReviews()
})
</script>

<template>
  <div class="universal-card p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="garamond text-3xl font-bold text-white">Gestion des Avis</h2>
      <div class="text-sm text-text-gray">
        Total: <span class="text-gold font-bold">{{ totalItems }}</span> avis
      </div>
    </div>

    <div v-if="loading" class="text-center py-10">
      <div class="flex justify-center gap-2 mb-2">
          <div class="w-2 h-2 bg-gold rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-gold rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-gold rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
      <p class="text-text-gray text-sm">Chargement des avis...</p>
    </div>

    <div v-else-if="reviews.length > 0" class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead class="border-b border-border bg-bg-main/50">
          <tr>
            <th class="p-4 text-xs font-bold text-text-gray uppercase tracking-widest">Film</th>
            <th class="p-4 text-xs font-bold text-text-gray uppercase tracking-widest">Utilisateur</th>
            <th class="p-4 text-xs font-bold text-text-gray uppercase tracking-widest">Note</th>
            <th class="p-4 text-xs font-bold text-text-gray uppercase tracking-widest w-1/3">Commentaire</th>
            <th class="p-4 text-xs font-bold text-text-gray uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="review in reviews" :key="review.id" class="border-b border-border hover:bg-white/5 transition-colors">
            <td class="p-4 text-white font-medium">
                <router-link v-if="review.movie && review.movie.id" :to="`/movies/${review.movie.id}`" class="hover:text-gold transition-colors">
                    {{ review.movie.name }}
                </router-link>
                <span v-else class="text-text-gray italic">Film inconnu</span>
            </td>
            <td class="p-4 text-text-gray text-sm">{{ review.user?.firstname }} {{ review.user?.lastname }}</td>
            <td class="p-4">
              <div class="flex text-gold">
                <span v-for="n in 5" :key="n" class="text-sm">{{ n <= review.rating ? '★' : '☆' }}</span>
              </div>
            </td>
            <td class="p-4 text-text-gray text-sm line-clamp-2 max-w-xs">{{ review.comment }}</td>
            <td class="p-4 text-right">
              <button @click="deleteReview(review.id)" class="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider transition-colors border border-red-900/50 hover:bg-red-900/20 px-3 py-1.5 rounded">
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-border">
        <button
          @click="changePage(page - 1)"
          :disabled="page === 1"
          class="px-4 py-2 bg-[#16181E] border border-[#2A2D36] rounded text-white hover:border-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Précédent
        </button>
        <span class="text-text-gray text-sm">Page <span class="text-gold font-bold">{{ page }}</span> sur {{ totalPages }}</span>
        <button
          @click="changePage(page + 1)"
          :disabled="page === totalPages"
          class="px-4 py-2 bg-[#16181E] border border-[#2A2D36] rounded text-white hover:border-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Suivant
        </button>
      </div>
    </div>

    <div v-else class="text-center py-20 bg-white/5 rounded-lg border border-white/10">
      <p class="text-text-gray">Aucun avis trouvé.</p>
    </div>
  </div>
</template>
