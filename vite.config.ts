import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Load env so VITE_API_BASE_URL is available to the client
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      port: 5173,
      proxy: {
        // Proxy API calls to the Spring Boot backend during local dev.
        // Override VITE_API_BASE_URL in .env to point at a remote backend.
        '/ai': 'http://localhost:8080',
        '/api/tutor': 'http://localhost:8080',
        '/actuator': 'http://localhost:8080',
      },
    },
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        env.VITE_API_BASE_URL || 'http://localhost:8080'
      ),
    },
  }
})