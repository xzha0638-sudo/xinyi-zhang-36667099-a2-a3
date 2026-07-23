import { fileURLToPath } from 'node:url'
import path from 'node:path'
import vue from '@vitejs/plugin-vue'

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))

export const sharedViteConfig = {
  root: projectRoot,
  plugins: [vue()],
  optimizeDeps: {
    noDiscovery: true,
    include: []
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router'],
          'vendor-firebase': ['firebase/app', 'firebase/auth']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, 'src')
    }
  }
}

export { projectRoot }
