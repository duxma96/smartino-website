import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base './' keeps asset paths relative, so the build works both on a
// GitHub Pages project URL (/smartino-website/) and on a custom domain root.
export default defineConfig({
  base: './',
  plugins: [react()],
})
