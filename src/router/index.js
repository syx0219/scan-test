import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import otherView from '@/views/Scan.vue'
const router = createRouter({
  history: createWebHistory('/scan-test/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/scan',
      name: 'Scan',
      component: otherView,
    },
  ],
})

export default router
