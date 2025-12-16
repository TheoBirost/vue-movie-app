import { createRouter, createWebHistory } from 'vue-router'
import Connexion from './views/Connexion.vue'
import Inscription from './views/Inscription.vue'
import Home from './views/Home.vue'
import Movies from './views/Movies.vue'
import MovieDetails from '/src/views/MovieDetails.vue'
import Actors from './views/Actors.vue'
import ActorDetails from './views/ActorDetails.vue'
import Categories from './views/Categories.vue'
import Directors from './views/Directors.vue'
import DirectorDetails from './views/DirectorDetails.vue' // Nouvelle importation
import Profile from './views/Profile.vue'
import UserManagement from './views/UserManagement.vue'
import ServerError from './views/ServerError.vue'
import NotFound from './views/NotFound.vue'

const getUserRole = () => localStorage.getItem('role') || 'user'

const routes = [
    { path: '/', component: Home },
    { path: '/connexion', component: Connexion, meta: { hideNavbar: true } },
    { path: '/inscription', component: Inscription, meta: { hideNavbar: true } },
    { path: '/movies', component: Movies },
    { path: '/movies/:id', component: MovieDetails },
    { path: '/actors', component: Actors },
    { path: '/actors/:id', component: ActorDetails },
    { path: '/categories', component: Categories },
    { path: '/directors', component: Directors },
    { path: '/directors/:id', component: DirectorDetails }, // Nouvelle route
    { path: '/profile', component: Profile, meta: { requiresAuth: true } },
    { path: '/users', component: UserManagement, meta: { requiresAuth: true, requiresAdmin: true } },
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
        next('/connexion')
    } else if (to.meta.requiresAdmin && role !== 'admin') {
        next('/')
    } else {
        next()
    }
})

export default router
