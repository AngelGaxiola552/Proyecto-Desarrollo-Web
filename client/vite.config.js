import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Todo lo que empiece con /api se reenvía al backend (Express en el puerto 3001).
    // Así el navegador cree que front y back son el mismo sitio y la cookie de sesión funciona.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
