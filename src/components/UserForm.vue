<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '/src/api/api.js'

const emit = defineEmits(['close', 'refresh'])
const props = defineProps({ user: Object })

const userId = ref(null)
const firstname = ref('')
const lastname = ref('')
const email = ref('')
const dob = ref('')
const password = ref('')
const roles = ref('ROLE_USER')
const loading = ref(false)
const errors = ref(null)

const initFromUser = (u) => {
  if (!u) {
    userId.value = null
    firstname.value = ''
    lastname.value = ''
    email.value = ''
    dob.value = ''
    password.value = ''
    roles.value = 'ROLE_USER'
    return
  }

  userId.value = u.id || null
  firstname.value = u.firstname || ''
  lastname.value = u.lastname || ''
  email.value = u.email || ''

  if (u.dob) {
    if (typeof u.dob === 'string') {
      dob.value = u.dob.split(' ')[0]
    } else if (u.dob.date) {
      dob.value = u.dob.date.split(' ')[0]
    }
  } else {
    dob.value = ''
  }

  password.value = ''
  roles.value = (u.roles && u.roles[0]) || 'ROLE_USER'
}

onMounted(() => {
  initFromUser(props.user)
})

watch(() => props.user, (u) => initFromUser(u))

const saveUser = async () => {
  loading.value = true
  errors.value = null

  try {
    const userData = {
      firstname: firstname.value.trim(),
      lastname: lastname.value.trim(),
      email: email.value.trim(),
    }

    if (dob.value) userData.dob = dob.value

    if (userId.value) {
      await api.put(`/users/${userId.value}`, userData, {
        headers: { 'Content-Type': 'application/json' }
      })
    } else {
      if (!password.value || !password.value.trim()) {
        errors.value = 'Le mot de passe est requis pour créer un utilisateur'
        loading.value = false
        return
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500))
    emit('refresh')
    await new Promise(resolve => setTimeout(resolve, 200))
    emit('close')
  } catch (err) {
    if (err.response) {
      errors.value =
          err.response.data?.['hydra:description'] ||
          err.response.data?.message ||
          err.response.data?.error ||
          `Erreur ${err.response.status}`
    } else if (err.request) {
      errors.value = "Impossible de contacter le serveur"
    } else {
      errors.value = err.message
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4" @click.self="emit('close')">
    <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] w-full max-w-lg p-8 shadow-2xl">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-white">
          {{ userId ? 'Modifier un utilisateur' : 'Ajouter un utilisateur' }}
        </h2>
        <button @click="emit('close')" class="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition text-[var(--text-gray)] hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-[var(--text-gray)] mb-2">Prénom</label>
          <input v-model="firstname" placeholder="Prénom"
                 class="w-full px-4 py-3 bg-[var(--bg-main)] text-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] transition" />
        </div>

        <div>
          <label class="block text-sm font-medium text-[var(--text-gray)] mb-2">Nom</label>
          <input v-model="lastname" placeholder="Nom"
                 class="w-full px-4 py-3 bg-[var(--bg-main)] text-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] transition" />
        </div>

        <div>
          <label class="block text-sm font-medium text-[var(--text-gray)] mb-2">Email</label>
          <input v-model="email" type="email" placeholder="email@example.com"
                 class="w-full px-4 py-3 bg-[var(--bg-main)] text-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] transition" />
        </div>

        <div>
          <label class="block text-sm font-medium text-[var(--text-gray)] mb-2">Date de naissance</label>
          <input v-model="dob" type="date"
                 class="w-full px-4 py-3 bg-[var(--bg-main)] text-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] transition" />
        </div>

        <div v-if="errors" class="bg-red-900/20 border border-red-800/30 text-red-400 p-3 rounded-lg text-sm">
          {{ errors }}
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-[var(--border)]">
        <button @click="emit('close')"
                class="px-5 py-3 bg-[var(--bg-hover)] hover:bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-gray)] rounded-lg transition font-medium">
          Annuler
        </button>
        <button @click="saveUser" :disabled="loading"
                class="px-6 py-3 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>