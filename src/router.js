import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Movies from './views/Movies.vue'
import Actors from './views/Actors.vue'
import Categories from './views/Categories.vue'
import Profile from './views/Profile.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/movies', component: Movies },
    { path: '/actors', component: Actors },
    { path: '/categories', component: Categories },
    { path: '/profile', component: Profile }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
