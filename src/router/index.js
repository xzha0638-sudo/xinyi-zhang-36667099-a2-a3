import { createRouter, createWebHistory } from 'vue-router'
import { activeRole, authReadyPromise, currentUser } from '@/auth'

const HomeView = () => import('@/views/HomeView.vue')
const DataLabView = () => import('@/views/DataLabView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const FirebaseRegisterView = () => import('@/views/FirebaseRegisterView.vue')
const FirebaseSigninView = () => import('@/views/FirebaseSigninView.vue')
const RolePortalView = () => import('@/views/RolePortalView.vue')
const AboutView = () => import('@/views/AboutView.vue')
const ContactSupportView = () => import('@/views/ContactSupportView.vue')
const FirebaseLogoutView = () => import('@/views/FirebaseLogoutView.vue')
const AccessDeniedView = () => import('@/views/AccessDeniedView.vue')

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/catalog', name: 'Catalog', component: DataLabView },
  { path: '/join', name: 'Join', component: LoginView },
  { path: '/contact', name: 'Contact', component: ContactSupportView },
  { path: '/firebase-register', name: 'FirebaseRegister', component: FirebaseRegisterView },
  { path: '/firebase-signin', name: 'FirebaseSignin', component: FirebaseSigninView },
  {
    path: '/dashboard',
    alias: '/role-portal',
    name: 'Dashboard',
    component: RolePortalView,
    meta: { requiresAuth: true }
  },
  {
    path: '/staff-hub',
    name: 'StaffHub',
    component: AboutView,
    meta: { requiresAuth: true, allowedRoles: ['Librarian', 'Manager'] }
  },
  {
    path: '/security',
    name: 'Security',
    component: AboutView
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

  const allowedRoles = to.meta.allowedRoles || []
  if (allowedRoles.length && !allowedRoles.includes(activeRole.value)) {
    return {
      name: 'AccessDenied',
      query: { reason: 'role', redirect: to.fullPath }
    }
  }

  return true
})

export default router
