import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel serves the site from the root. The old GitHub Pages copy lives under
// the repository name, so its build sets PAGES_BASE.
export default defineConfig({
  plugins: [react()],
  base: process.env.PAGES_BASE || '/',
})
