import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  optimizeDeps: {
    // Pre-bundle Matter so the dev server doesn’t serve a stale `deps/*.js` chunk (504 Outdated Optimize Dep).
    include: ['matter-js'],
  },
})
