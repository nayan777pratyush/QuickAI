import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      // This is the new way to configure Tailwind CSS v4 in Vite
      config: { darkMode: 'class' }
    }),
    tailwindcss(),
  ],
})