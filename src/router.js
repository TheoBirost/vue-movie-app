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
import ServerError from './views/ServerError.vue'
import NotFound from './views/NotFound.vue'

const getUserRole = () => localStorage.getItem('role') || 'user'

const routes = [
    { path: '/', component: Home }, // Page d'accueil accessible à tous
    { path: '/connexion', component: Connexion, meta: { hideNavbar: true } }, // Page de connexion
    { path: '/inscription', component: Inscription, meta: { hideNavbar: true } },
    { path: '/movies', component: Movies }, // Accessible à tous
    { path: '/movies/:id', component: MovieDetails }, // Accessible à tous
    { path: '/actors', component: Actors }, // Accessible à tous
    { path: '/actors/:id', component: ActorDetails }, // Accessible à tous
    { path: '/categories', component: Categories }, // Accessible à tous
    { path: '/profile', component: Profile, meta: { requiresAuth: true } }, // Nécessite une authentification
    { path: '/users', component: UserManagement, meta: { requiresAuth: true, requiresAdmin: true } }, // Nécessite une authentification et le rôle admin
    { path: '/500', component: ServerError },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true'
    const role = getUserRole()

    if (to.meta.requiresAuth && !loggedIn) {
        next('/connexion') // Redirige vers la page de connexion si authentification requise et non connecté
    } else if (to.meta.requiresAdmin && role !== 'admin') {
        next('/') // Redirige vers la page d'accueil si non admin
    } else {
        next()
    }
})

export default router
