import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        allowedHosts: true,
        port: 5173,
        // Disable caching for development
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        },
        // Force reload on file changes
        watch: {
            usePolling: true
        },
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
                timeout: 120000, // 2 minutes
                proxyTimeout: 120000 // 2 minutes
            },
            '/images': {
                target: 'http://localhost:8000',
                changeOrigin: true
            }
        }
    },
    // Disable build cache
    build: {
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    }
})
