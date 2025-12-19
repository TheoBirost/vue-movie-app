<script setup>
import { ref, onMounted } from "vue"
import api from '../../../api/api'

const loading = ref(false)
const reviews = ref([])

const fetchReviews = async () => {
  loading.value = true
  try {
    const response = await api.get('/reviews', { params: { 'groups[]': 'review:read' } })
    reviews.value = response.data['hydra:member']
  } catch (err) {
    console.error("Erreur lors du chargement des données :", err);
  } finally {
    loading.value = false
  }
}

const deleteReview = async (reviewId) => {
  if (!confirm("Are you sure you want to delete this review?")) {
    return
  }
  try {
    await api.delete(`/reviews/${reviewId}`)
    reviews.value = reviews.value.filter(review => review.id !== reviewId)
  } catch (err) {
    console.error("Erreur suppression :", err)
  }
}

onMounted(async () => {
  await fetchReviews()
})
</script>

<template>
  <div class="universal-card p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="garamond text-3xl font-bold text-white">Manage Reviews</h2>
    </div>
    <div v-if="loading" class="text-center py-10">
      <p class="text-text-gray">Loading reviews...</p>
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="border-b border-border">
          <tr>
            <th class="p-4 text-sm font-semibold text-text-dark uppercase tracking-wider">Movie</th>
            <th class="p-4 text-sm font-semibold text-text-dark uppercase tracking-wider">User</th>
            <th class="p-4 text-sm font-semibold text-text-dark uppercase tracking-wider">Rating</th>
            <th class="p-4 text-sm font-semibold text-text-dark uppercase tracking-wider">Comment</th>
            <th class="p-4 text-sm font-semibold text-text-dark uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="review in reviews" :key="review.id" class="border-b border-border hover:bg-bg-hover">
            <td class="p-4 text-text-white">{{ review.movie?.name }}</td>
            <td class="p-4 text-text-white">{{ review.user?.firstname }} {{ review.user?.lastname }}</td>
            <td class="p-4 text-text-white">{{ review.rating }}</td>
            <td class="p-4 text-text-white">{{ review.comment }}</td>
            <td class="p-4 text-right">
              <button @click="deleteReview(review.id)" class="text-red-500 hover:text-red-400 font-semibold transition-colors">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
