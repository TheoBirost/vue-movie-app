import { createRouter, createWebHistory } from 'vue-router'
import Connexion from './views/Connexion.vue'
import Inscription from './views/Inscription.vue'
import Home from './views/Home.vue'
import Movies from './views/Movies.vue'
import MovieDetails from '/src/views/MovieDetails.vue'
import Actors from './views/Actors.vue'
import ActorDetails from './views/ActorDetails.vue'
import Categories from './views/Categories.vue'
import Profile from './views/Profile.vue'
import UserManagement from './views/UserManagement.vue'

const getUserRole = () => localStorage.getItem('role') || 'user'

const routes = [
    { path: '/', component: Connexion, meta: { hideNavbar: true } },
    { path: '/inscription', component: Inscription, meta: { hideNavbar: true } },
    { path: '/home', component: Home, meta: { requiresAuth: true } },
    { path: '/movies', component: Movies, meta: { requiresAuth: true } },
    { path: '/movies/:id', component: MovieDetails },
    { path: '/actors', component: Actors, meta: { requiresAuth: true } },
    { path: '/actors/:id', component: ActorDetails },
    { path: '/categories', component: Categories, meta: { requiresAuth: true } },
    { path: '/profile', component: Profile, meta: { requiresAuth: true } },
    { path: '/users', component: UserManagement, meta: { requiresAuth: true, requiresAdmin: true } },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true'
    const role = getUserRole()

    if (to.meta.requiresAuth && !loggedIn) {
        next('/')
    } else if (to.meta.requiresAdmin && role !== 'admin') {
        next('/home')
    } else {
        next()
    }
})

export default router
