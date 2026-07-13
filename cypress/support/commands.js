Cypress.Commands.add('getByTest', (selector, options = {}) => {
  return cy.get(`[data-test="${selector}"]`, options)
})

// Login real via UI — usado apenas em login.cy.js, que testa a própria tela de login.
Cypress.Commands.add('login', (email, senha) => {
  const usuario = email || Cypress.env('USUARIO_EMAIL')
  const password = senha || Cypress.env('USUARIO_SENHA')

  cy.visit('/login')
  cy.getByTest('login_input_email').type(usuario)
  cy.getByTest('login_input_senha').type(password)
  cy.getByTest('login_btn_submit').click()
  cy.getByTest('mnu_btn_logout', { timeout: 10000 }).should('exist')
})

// Autentica via API e reaproveita a sessão entre testes (cy.session), em vez de repetir
// o preenchimento do formulário de login em todo spec que não está testando a tela de
// login em si. Ainda é necessário visitar a rota desejada depois de chamar este comando.
Cypress.Commands.add('loginSession', (email, senha) => {
  const usuario = email || Cypress.env('USUARIO_EMAIL')
  const password = senha || Cypress.env('USUARIO_SENHA')

  cy.session(
    usuario,
    () => {
      cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, {
        email: usuario,
        senha: password,
      }).then(({ body }) => {
        cy.visit('/login')
        cy.window().then((win) => {
          win.localStorage.setItem('token', body.token)
          win.localStorage.setItem('usuario', JSON.stringify(body.usuario))
        })
      })
    },
    {
      cacheAcrossSpecs: true,
      validate() {
        return cy.window().then((win) =>
          cy.request({
            url: `${Cypress.env('apiUrl')}/auth/me`,
            headers: { Authorization: `Bearer ${win.localStorage.getItem('token')}` },
          })
        )
      },
    }
  )
})

Cypress.Commands.add('mensagemSucesso', (texto) => {
  cy.getByTest('app_toast_sucesso', { timeout: 10000 })
    .should('be.visible')
    .and('contain.text', texto)
})

// Helpers de API para setup/teardown determinístico de dados de teste — evitam que specs
// dependam de linhas fixas do seed (backend/db/seed.js) ou deixem dados órfãos entre execuções.
// Cada chamada autentica de forma independente (não depende do localStorage/cy.session da UI),
// então funciona mesmo antes de qualquer cy.visit() ter ocorrido no teste.
Cypress.Commands.add('apiHeaders', (email, senha) => {
  const usuario = email || Cypress.env('USUARIO_EMAIL')
  const password = senha || Cypress.env('USUARIO_SENHA')

  return cy
    .request('POST', `${Cypress.env('apiUrl')}/auth/login`, { email: usuario, senha: password })
    .then(({ body }) => ({ Authorization: `Bearer ${body.token}` }))
})

Cypress.Commands.add('buscarCategoriaViaApi', (nome, tipo) => {
  return cy.apiHeaders().then((headers) =>
    cy
      .request({ method: 'GET', url: `${Cypress.env('apiUrl')}/categorias`, headers, qs: { tipo } })
      .then(({ body }) => body.find((c) => c.nome === nome))
  )
})

Cypress.Commands.add('criarLancamentoViaApi', (dados) => {
  return cy.apiHeaders().then((headers) =>
    cy
      .request({ method: 'POST', url: `${Cypress.env('apiUrl')}/lancamentos`, headers, body: dados })
      .then(({ body }) => body)
  )
})

Cypress.Commands.add('excluirLancamentoViaApi', (id) => {
  return cy.apiHeaders().then((headers) =>
    cy.request({
      method: 'DELETE',
      url: `${Cypress.env('apiUrl')}/lancamentos/${id}`,
      headers,
      failOnStatusCode: false,
    })
  )
})
