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
        errors.value = 'Password is required to create a user'
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
          `Error ${err.response.status}`
    } else if (err.request) {
      errors.value = "Could not contact the server"
    } else {
      errors.value = err.message
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" @click.self="emit('close')">
    <div class="bg-color-surface border border-color-border rounded-lg w-full max-w-lg shadow-2xl" data-aos="fade-up">
      <header class="p-6 flex items-center justify-between border-b border-color-border">
        <h2 class="text-2xl font-gloock font-bold text-color-heading">
          {{ userId ? 'Edit User' : 'Add User' }}
        </h2>
        <button @click="emit('close')" class="p-2 rounded-full hover:bg-color-bg dark:hover:bg-color-surface text-color-text" aria-label="Close form">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </header>

      <main class="p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="user-firstname" class="block text-sm font-medium text-color-text mb-1">First Name</label>
            <input id="user-firstname" v-model="firstname" type="text" placeholder="First Name" class="w-full px-4 py-2 bg-color-bg border border-color-border rounded-md focus:outline-none focus:ring-2 focus:ring-color-primary" />
          </div>
          <div>
            <label for="user-lastname" class="block text-sm font-medium text-color-text mb-1">Last Name</label>
            <input id="user-lastname" v-model="lastname" type="text" placeholder="Last Name" class="w-full px-4 py-2 bg-color-bg border border-color-border rounded-md focus:outline-none focus:ring-2 focus:ring-color-primary" />
          </div>
        </div>
        <div>
          <label for="user-email" class="block text-sm font-medium text-color-text mb-1">Email</label>
          <input id="user-email" v-model="email" type="email" placeholder="email@example.com" class="w-full px-4 py-2 bg-color-bg border border-color-border rounded-md focus:outline-none focus:ring-2 focus:ring-color-primary" />
        </div>
        <div>
          <label for="user-dob" class="block text-sm font-medium text-color-text mb-1">Date of Birth</label>
          <input id="user-dob" v-model="dob" type="date" class="w-full px-4 py-2 bg-color-bg border border-color-border rounded-md focus:outline-none focus:ring-2 focus:ring-color-primary" />
        </div>
        <div v-if="!userId">
          <label for="user-password" class="block text-sm font-medium text-color-text mb-1">Password</label>
          <input id="user-password" v-model="password" type="password" placeholder="Password" class="w-full px-4 py-2 bg-color-bg border border-color-border rounded-md focus:outline-none focus:ring-2 focus:ring-color-primary" />
        </div>

        <div v-if="errors" class="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-md text-sm">
          {{ errors }}
        </div>
      </main>

      <footer class="p-6 flex justify-end gap-4 border-t border-color-border">
        <button @click="emit('close')" class="btn-secondary">
          Cancel
        </button>
        <button @click="saveUser" :disabled="loading" class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? 'Saving...' : 'Save User' }}
        </button>
      </footer>
    </div>
  </div>
</template>
