import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // Proxy para API: Todo /api va al backend
      '/api': {
        target: 'http://backend:3000',  // CAMBIO: Usa nombre de servicio Docker
        changeOrigin: true,  // Cambia origen para evitar CORS
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')  // Mantiene /api
      },
      // Proxy para imágenes: Todo /uploads va al backend (ServeStaticModule)
      '/uploads': {
        target: 'http://backend:3000', // CAMBIO: Usa nombre de servicio Docker
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/uploads/, '/uploads')
      },
    },
  },
});
