import { computed, ref } from 'vue'
import { deleteUser, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import { deleteLibraryDataForEmail, ensureProfileForUser, saveProfile } from './libraryStore'

export const currentUser = ref(null)
export const authReady = ref(false)
export const currentProfile = ref(null)
export const activeRole = computed(() => currentProfile.value?.role || '')

let resolveAuthReady
export const authReadyPromise = new Promise((resolve) => {
  resolveAuthReady = resolve
})

export const refreshCurrentProfile = () => {
  if (!currentUser.value?.email) {
    currentProfile.value = null
    return null
  }

  currentProfile.value = ensureProfileForUser(currentUser.value)
  return currentProfile.value
}

export const updateCurrentProfile = (patch) => {
  if (!currentUser.value?.email || !currentProfile.value) {
    return null
  }

  currentProfile.value = saveProfile({
    ...currentProfile.value,
    email: currentUser.value.email,
    ...patch
  })

  return currentProfile.value
}

onAuthStateChanged(auth, (user) => {
  currentUser.value = user
  authReady.value = true

  currentProfile.value = user ? ensureProfileForUser(user) : null

  if (resolveAuthReady) {
    resolveAuthReady()
    resolveAuthReady = null
  }
})

export const logoutUser = async () => {
  await signOut(auth)
  currentProfile.value = null
}

export const deleteCurrentAccount = async () => {
  const firebaseUser = auth.currentUser
  const email = firebaseUser?.email

  if (!firebaseUser || !email) {
    throw new Error('No signed-in account is available to delete.')
  }

  await deleteUser(firebaseUser)
  deleteLibraryDataForEmail(email)
  currentUser.value = null
  currentProfile.value = null
}
