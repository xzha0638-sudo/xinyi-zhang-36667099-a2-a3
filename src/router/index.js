import { createRouter, createWebHistory } from 'vue-router'
import { authReadyPromise, currentUser } from '@/auth'
import AccessDeniedView from '@/views/AccessDeniedView.vue'
import FirebaseLogoutView from '@/views/FirebaseLogoutView.vue'
import FirebaseRegisterView from '@/views/FirebaseRegisterView.vue'
import FirebaseSigninView from '@/views/FirebaseSigninView.vue'
import HomeView from '@/views/HomeView.vue'
import RolePortalView from '@/views/RolePortalView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/firebase-register', name: 'FirebaseRegister', component: FirebaseRegisterView },
  { path: '/firebase-signin', name: 'FirebaseSignin', component: FirebaseSigninView },
  {
    path: '/role-portal',
    name: 'RolePortal',
    component: RolePortalView,
    meta: { requiresAuth: true }
  },
  {
    path: '/firebase-logout',
    name: 'FirebaseLogout',
    component: FirebaseLogoutView,
    meta: { requiresAuth: true }
  },
  { path: '/access-denied', name: 'AccessDenied', component: AccessDeniedView },
  { path: '/:pathMatch(.*)*', redirect: { name: 'Home' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  await authReadyPromise

  if (to.meta.requiresAuth && !currentUser.value) {
    return {
      name: 'FirebaseSignin',
      query: { redirect: to.fullPath, denied: 'true' }
    }
  }

  return true
})

export default router
