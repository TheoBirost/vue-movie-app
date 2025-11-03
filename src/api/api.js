import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

// Ajout du token à chaque requête
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const getUserRole = async () => {
    try {
        const email = localStorage.getItem('email')
        if (!email) return 'ROLE_USER'

        const res = await api.get('/users')
        const users = res.data.member || []

        const currentUser = users.find(u => u.email === email)
        if (!currentUser || !currentUser.roles.length) return 'ROLE_USER'

        // Retourne le rôle exact de la BD
        return currentUser.roles[0]
    } catch (err) {
        console.error('Impossible de récupérer le rôle utilisateur :', err)
        return 'ROLE_USER'
    }
}

export default api
