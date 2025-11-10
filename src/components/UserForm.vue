<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '/src/api/api.js'

const emit = defineEmits(['close', 'refresh'])
const props = defineProps({ user: Object })

const userId = ref(null)
const firstname = ref('')
const lastname = ref('')  // ✅ Changé de lastName à lastname
const email = ref('')
const dob = ref('')
const password = ref('')
const roles = ref('ROLE_USER')
const loading = ref(false)
const errors = ref(null)

const initFromUser = (u) => {
  console.log("Initialisation avec l'utilisateur:", u)

  if (!u) {
    userId.value = null
    firstname.value = ''
    lastname.value = ''  // ✅ Corrigé
    email.value = ''
    dob.value = ''
    password.value = ''
    roles.value = 'ROLE_USER'
    return
  }

  userId.value = u.id || null
  firstname.value = u.firstname || ''
  lastname.value = u.lastname || ''  // ✅ Corrigé pour correspondre aux props
  email.value = u.email || ''

  // ✅ Gérer le format de date qui peut être un objet ou une string
  if (u.dob) {
    if (typeof u.dob === 'string') {
      dob.value = u.dob.split(' ')[0] // Prendre uniquement la date
    } else if (u.dob.date) {
      dob.value = u.dob.date.split(' ')[0]
    }
  } else {
    dob.value = ''
  }

  password.value = ''
  roles.value = (u.roles && u.roles[0]) || 'ROLE_USER'

  console.log("userId après init:", userId.value)
  console.log("roles après init:", roles.value)
  console.log("dob après init:", dob.value)
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
      lastname: lastname.value.trim(),  // ✅ Corrigé
      email: email.value.trim(),
    }

    if (dob.value) {
      userData.dob = dob.value
    }


    if (userId.value) {
      console.log(`Tentative 1: PUT /users/${userId.value}`)

      try {
        const response = await api.put(`/users/${userId.value}`, userData, {
          headers: { 'Content-Type': 'application/json' }
        })

        console.log("Réponse:", response.data)

        if (response.data.firstname === userData.firstname) {
          console.log("✅ Modification confirmée: firstname correspond")
        } else {
          console.warn("⚠️ Warning: firstname ne correspond pas!")
          console.warn("Envoyé:", userData.firstname)
          console.warn("Reçu:", response.data.firstname)
        }
      } catch (putError) {
        try {
          const response = await api.patch(`/users/${userId.value}`, userData, {
            headers: { 'Content-Type': 'application/merge-patch+json' }
          })
        } catch (patchError) {
          const response = await api.patch(`/users/${userId.value}`, userData, {
            headers: { 'Content-Type': 'application/json' }
          })


        }
      }
    } else {
      if (!password.value || !password.value.trim()) {
        errors.value = 'Le mot de passe est requis pour créer un utilisateur'
        loading.value = false
        return
      }
      const response = await api.post('/users', userData, {
        headers: { 'Content-Type': 'application/ld+json' }
      })

    }

    await new Promise(resolve => setTimeout(resolve, 500))

    emit('refresh')

    await new Promise(resolve => setTimeout(resolve, 200))

    emit('close')

  } catch (err) {
    console.error("Réponse erreur:", err.response)

    if (err.response) {
      const errorMsg = err.response.data?.['hydra:description']
          || err.response.data?.message
          || err.response.data?.error
          || `Erreur ${err.response.status}`

      errors.value = errorMsg
      console.error("Message d'erreur:", errorMsg)
    } else if (err.request) {
      // Pas de réponse du serveur
      errors.value = "Impossible de contacter le serveur"
      console.error("Pas de réponse du serveur")
    } else {
      // Autre erreur
      errors.value = err.message
      console.error("Autre erreur:", err.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4" @click.self="emit('close')">
    <div class="bg-white/90 backdrop-blur-xl rounded-2xl w-full max-w-lg p-8 shadow-2xl border border-gray-200/50 transition-all duration-200 animate-fadeIn">
      <h2 class="text-2xl font-semibold text-gray-900 mb-6 text-center">
        {{ userId ? 'Modifier un utilisateur' : 'Ajouter un utilisateur' }}
      </h2>

      <div class="space-y-5">
        <input
            v-model="firstname"
            placeholder="Prénom"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
        />

        <input
            v-model="lastname"
            placeholder="Nom"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
        />

        <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
        />

        <input
            v-model="dob"
            type="date"
            placeholder="Date de naissance"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
        />
        

        <div v-if="errors" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">
          {{ errors }}
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-8">
        <button
            @click="emit('close')"
            class="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all active:scale-95 font-medium"
        >
          Annuler
        </button>
        <button
            @click="saveUser"
            :disabled="loading"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all active:scale-95 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>