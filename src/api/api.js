import axios from 'axios'
import { bus } from '../bus'
import router from '../router' // Importer le routeur

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Déconnexion et redirection
                    localStorage.removeItem('token')
                    localStorage.removeItem('loggedIn')
                    localStorage.removeItem('userPhoto')
                    localStorage.removeItem('role')
                    delete api.defaults.headers.common['Authorization']
                    router.push('/connexion')
                    bus.emit('error', 'Votre session a expiré. Veuillez vous reconnecter.')
                    break
                case 429:
                    bus.emit('error', 'Trop de requêtes. Veuillez réessayer dans un instant.')
                    break
                case 500:
                    router.push('/500')
                    break
            }
        }
        return Promise.reject(error)
    }
)

export default api
