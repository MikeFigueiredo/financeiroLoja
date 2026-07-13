require('./commands')

// Só ignora o erro benigno de "ResizeObserver loop" (comum com modais/tabelas responsivas
// do react-bootstrap). Qualquer outra exceção não tratada da aplicação deve falhar o teste —
// suprimir todas indiscriminadamente mascararia crashes reais do React.
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop')) {
    return false
  }
  return true
})
