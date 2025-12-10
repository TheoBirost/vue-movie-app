import axios from 'axios'
import { bus } from '../bus'
import router from '../router'

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

const handleRateLimitHeaders = (headers) => {
    if (headers['x-ratelimit-remaining'] && headers['x-ratelimit-limit']) {
        bus.emit('rate-limit-update', {
            remaining: headers['x-ratelimit-remaining'],
            limit: headers['x-ratelimit-limit'],
        })
    }
}

api.interceptors.response.use(
    response => {
        handleRateLimitHeaders(response.headers)
        return response
    },
    error => {
        if (error.response) {
            handleRateLimitHeaders(error.response.headers)
            switch (error.response.status) {
                case 401:
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
