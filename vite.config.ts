import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' zodat de app ook vanuit een submap (bijv. GitHub Pages) werkt
export default defineConfig({
  base: './',
  plugins: [react()],
})
