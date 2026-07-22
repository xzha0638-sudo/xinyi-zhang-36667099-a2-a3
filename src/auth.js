import { ref } from 'vue'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'

export const currentUser = ref(null)
export const authReady = ref(false)
export const activeRole = ref(localStorage.getItem('nomash-active-role') || '')
export const roles = ['Member', 'Librarian', 'Manager']

let resolveAuthReady
export const authReadyPromise = new Promise((resolve) => {
  resolveAuthReady = resolve
})

export const setActiveRole = (role) => {
  activeRole.value = role
  if (role) {
    localStorage.setItem('nomash-active-role', role)
    return
  }
  localStorage.removeItem('nomash-active-role')
}

onAuthStateChanged(auth, (user) => {
  currentUser.value = user
  authReady.value = true

  if (!user) {
    setActiveRole('')
  }

  if (resolveAuthReady) {
    resolveAuthReady()
    resolveAuthReady = null
  }

  console.log('Current Firebase user:', user ? { uid: user.uid, email: user.email } : null)
})

export const logoutUser = async () => {
  await signOut(auth)
  setActiveRole('')
  console.log('Current Firebase user after logout:', auth.currentUser)
}
