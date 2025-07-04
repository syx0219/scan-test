import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import otherView from '@/views/other.vue'
const router = createRouter({
  history: createWebHistory('/scan-test/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/other',
      name: 'other',
      component: otherView,
    },
  ],
})

export default router
