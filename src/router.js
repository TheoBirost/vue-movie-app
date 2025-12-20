import { createRouter, createWebHistory } from 'vue-router'

const Connexion = () => import('./views/auth/Connexion.vue')
const Inscription = () => import('./views/auth/Inscription.vue')
const Home = () => import('./views/public/Home.vue')
const Movies = () => import('./views/public/Movies.vue')
const MovieDetails = () => import('./views/details/MovieDetails.vue')
const Actors = () => import('./views/public/Actors.vue')
const ActorDetails = () => import('./views/details/ActorDetails.vue')
const Categories = () => import('./views/public/Categories.vue')
const Directors = () => import('./views/public/Directors.vue')
const DirectorDetails = () => import('./views/details/DirectorDetails.vue')
const Profile = () => import('./views/public/Profile.vue')
const AdminPanel = () => import('./views/admin/Admin.vue')
const ServerError = () => import('./views/errors/ServerError.vue')
const NotFound = () => import('./views/errors/NotFound.vue')

const getUserRole = () => localStorage.getItem('role') || 'user'

const routes = [
    { path: '/', component: Home, meta: { title: 'Accueil - Vue Movie App' } },
    { path: '/connexion', component: Connexion, meta: { hideNavbar: true, title: 'Connexion - Vue Movie App' } },
    { path: '/inscription', component: Inscription, meta: { hideNavbar: true, title: 'Inscription - Vue Movie App' } },
    { path: '/movies', component: Movies, meta: { title: 'Films - Vue Movie App' } },
    { path: '/movies/:id', component: MovieDetails, meta: { title: 'Détails du film - Vue Movie App' } },
    { path: '/actors', component: Actors, meta: { title: 'Acteurs - Vue Movie App' } },
    { path: '/actors/:id', component: ActorDetails, meta: { title: 'Détails de l\'acteur - Vue Movie App' } },
    { path: '/categories', component: Categories, meta: { title: 'Catégories - Vue Movie App' } },
    { path: '/directors', component: Directors, meta: { title: 'Réalisateurs - Vue Movie App' } },
    { path: '/directors/:id', component: DirectorDetails, meta: { title: 'Détails du réalisateur - Vue Movie App' } },
    { path: '/profile', component: Profile, meta: { requiresAuth: true, title: 'Mon Profil - Vue Movie App' } },
    { path: '/admin', component: AdminPanel, meta: { requiresAuth: true, requiresAdmin: true, title: 'Administration - Vue Movie App' } },
    { path: '/500', component: ServerError, meta: { title: 'Erreur Serveur - Vue Movie App' } },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound, meta: { title: 'Page Non Trouvée - Vue Movie App' } },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true'
    const role = getUserRole()

    document.title = to.meta.title || 'Vue Movie App'

    if (to.meta.requiresAuth && !loggedIn) {
        next('/connexion')
    } else if (to.meta.requiresAdmin && role !== 'admin') {
        next('/')
    } else {
        next()
    }
})

export default router
