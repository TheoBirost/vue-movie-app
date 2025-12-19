import { createRouter, createWebHistory } from 'vue-router'
import Connexion from './views/auth/Connexion.vue'
import Inscription from './views/auth/Inscription.vue'
import Home from './views/public/Home.vue'
import Movies from './views/public/Movies.vue'
import MovieDetails from './views/details/MovieDetails.vue'
import Actors from './views/public/Actors.vue'
import ActorDetails from './views/details/ActorDetails.vue'
import Categories from './views/public/Categories.vue'
import Directors from './views/public/Directors.vue'
import DirectorDetails from './views/details/DirectorDetails.vue'
import Profile from './views/public/Profile.vue'
import AdminPanel from './views/admin/Admin.vue'
import ServerError from './views/errors/ServerError.vue'
import NotFound from './views/errors/NotFound.vue'

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
    { path: '/directors/:id', component: DirectorDetails },
    { path: '/profile', component: Profile, meta: { requiresAuth: true } },
    { path: '/admin', component: AdminPanel, meta: { requiresAuth: true, requiresAdmin: true } },
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
