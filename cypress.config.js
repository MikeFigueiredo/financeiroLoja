const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log('[CY-LOG]', message)
          return null
        },
      })
    },
    // Sobrescreva com CYPRESS_BASE_URL para rodar contra o ambiente implantado online.
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 800,
    retries: { runMode: 2, openMode: 0 },
    defaultCommandTimeout: 8000,
  },
  env: {
    USUARIO_EMAIL: 'teste@financeiroloja.com.br',
    USUARIO_SENHA: 'Teste@123',
    // Sobrescreva com CYPRESS_API_URL para rodar contra um back-end implantado online.
    apiUrl: process.env.CYPRESS_API_URL || 'http://localhost:4000/api',
  },
})
