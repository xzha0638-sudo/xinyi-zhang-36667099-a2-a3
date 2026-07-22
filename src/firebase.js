import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'your_api_key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your_project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your_project_id',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'your_project.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'your_sender_id',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'your_app_id',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'your_measurement_id'
}

const placeholderValues = new Set([
  'your_api_key',
  'your_project.firebaseapp.com',
  'your_project_id',
  'your_project.firebasestorage.app',
  'your_sender_id',
  'your_app_id',
  'your_measurement_id'
])

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => value && !placeholderValues.has(value)
)

const firebaseApp = initializeApp(firebaseConfig)

export const auth = getAuth(firebaseApp)
