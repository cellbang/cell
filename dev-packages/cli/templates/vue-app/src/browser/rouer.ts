import { createRouter, createWebHashHistory } from 'vue-router'
import Root from './views/Root.vue'
import About from './views/About.vue'

const routes = [
  { path: '/', component: Root },
  { path: '/about', component: About },
]

const router = createRouter({

  history: createWebHashHistory(),
  routes, 
})

export default router