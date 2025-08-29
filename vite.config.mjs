import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(),react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'src/webview/index.html',
      output: {
        entryFileNames: 'webview.js',
        chunkFileNames: 'webview.js',
        assetFileNames: 'webview.[ext]'
      }
    }
  }
})