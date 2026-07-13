import { loginSelectors, navSelectors } from '../support/selectors'

describe('Login', () => {
  it('Deve logar com credenciais válidas e redirecionar para o dashboard', () => {
    cy.login()
    cy.url().should('include', '/dashboard')
    cy.getByTest(navSelectors.btnLogout).should('be.visible')
  })

  it('Deve mostrar mensagem de erro com credenciais inválidas', () => {
    cy.visit('/login')
    cy.getByTest(loginSelectors.inputEmail).type('usuario@invalido.com')
    cy.getByTest(loginSelectors.inputSenha).type('senhaErrada123')
    cy.getByTest(loginSelectors.btnSubmit).click()
    cy.getByTest(loginSelectors.msgErro).should('be.visible').and('contain.text', 'Credenciais inválidas')
    cy.url().should('include', '/login')
  })
})
