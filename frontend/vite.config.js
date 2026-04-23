import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/generate-question': 'http://localhost:5000',
      '/analyze-answer':    'http://localhost:5000',
      '/transcribe-audio':  'http://localhost:5000',
      '/analyze-audio':     'http://localhost:5000',
      '/health':            'http://localhost:5000',
    },
  },
})
