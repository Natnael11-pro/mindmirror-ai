// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Import tailwind

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Add it here
  ],
})