import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Sem isso, o Vite pode escutar só em IPv6 (::1) em alguns ambientes Linux
    // (ex.: runners do GitHub Actions), enquanto ferramentas como o Cypress conectam
    // explicitamente via IPv4 (127.0.0.1) — causando ECONNREFUSED mesmo com o servidor
    // no ar. host: true faz escutar em todas as interfaces (0.0.0.0 + ::).
    host: true,
  },
})
