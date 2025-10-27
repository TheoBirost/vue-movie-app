import { createRouter, createWebHistory } from 'vue-router'
import Connexion from './views/Connexion.vue'
import Inscription from './views/Inscription.vue'
import Home from './views/Home.vue'
import Movies from './views/Movies.vue'
import MovieDetails from '/src/views/MovieDetails.vue'
import Actors from './views/Actors.vue'
import Categories from './views/Categories.vue'
import Profile from './views/Profile.vue'

const routes = [
    { path: '/', component: Connexion, meta: { hideNavbar: true }
    },
    { path: '/inscription', component: Inscription, meta: { hideNavbar: true } },
    { path: '/home', component: Home },
    { path: '/movies', component: Movies },
    { path: '/movies/:id', component: MovieDetails },
    { path: '/actors', component: Actors },
    { path: '/categories', component: Categories },
    { path: '/profile', component: Profile }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
