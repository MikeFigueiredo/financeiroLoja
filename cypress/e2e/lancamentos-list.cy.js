import { lancamentosSelectors } from '../support/selectors'

describe('Lançamentos — Listagem e Filtros', () => {
  beforeEach(() => {
    cy.loginSession()
    cy.visit('/lancamentos')
    cy.getByTest(lancamentosSelectors.tabela).should('be.visible')
  })

  it('Deve listar os lançamentos semeados na tabela', () => {
    cy.getByTest(lancamentosSelectors.tabela).find('tbody tr').should('have.length.greaterThan', 0)
  })

  it('Deve filtrar por status "Pago" e mostrar apenas lançamentos pagos', () => {
    cy.getByTest(lancamentosSelectors.filtroStatus).select('pago')
    cy.getByTest(lancamentosSelectors.tabela).find('tbody tr').should('have.length.greaterThan', 0)
    cy.getByTest(lancamentosSelectors.tabela).find('tbody tr').each(($row) => {
      cy.wrap($row).should('contain.text', 'Pago')
    })
  })

  it('Deve filtrar por tipo "Entrada" e mostrar apenas entradas', () => {
    cy.getByTest(lancamentosSelectors.filtroTipo).select('entrada')
    cy.getByTest(lancamentosSelectors.tabela).find('tbody tr').should('have.length.greaterThan', 0)
    cy.getByTest(lancamentosSelectors.tabela).find('tbody tr').each(($row) => {
      cy.wrap($row).should('contain.text', 'Entrada')
    })
  })
})
