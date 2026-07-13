import { navSelectors, lancamentosSelectors, dashboardSelectors } from '../support/selectors'

describe('Navegação', () => {
  beforeEach(() => {
    cy.loginSession()
    cy.visit('/dashboard')
  })

  it('Deve navegar entre Dashboard e Lançamentos pelo menu', () => {
    cy.getByTest(navSelectors.mnuLancamentos).click()
    cy.url().should('include', '/lancamentos')
    cy.getByTest(lancamentosSelectors.tabela).should('be.visible')

    cy.getByTest(navSelectors.mnuDashboard).click()
    cy.url().should('include', '/dashboard')
    cy.getByTest(dashboardSelectors.cardSaldo).should('be.visible')
  })

  it('Deve deslogar, limpar a sessão e redirecionar para o login', () => {
    cy.getByTest(navSelectors.btnLogout).click()
    cy.url().should('include', '/login')
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null
    })
  })
})
