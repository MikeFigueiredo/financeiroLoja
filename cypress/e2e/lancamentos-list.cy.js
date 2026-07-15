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
    // Uma única asserção via callback: o Cypress reconsulta o DOM do zero em cada retry,
    // então cobre tanto esperar a resposta filtrada da API chegar (evita ler as linhas
    // antigas, que já existiam antes do filtro e fariam ">0" passar de imediato) quanto
    // evitar "element detached from DOM" (nunca reusa um elemento de uma consulta antiga).
    cy.getByTest(lancamentosSelectors.tabela)
      .find('tbody tr')
      .should(($rows) => {
        expect($rows.length).to.be.greaterThan(0)
        $rows.each((_, row) => {
          expect(row.innerText).to.contain('Pago')
        })
      })
  })

  it('Deve filtrar por tipo "Entrada" e mostrar apenas entradas', () => {
    cy.getByTest(lancamentosSelectors.filtroTipo).select('entrada')
    cy.getByTest(lancamentosSelectors.tabela)
      .find('tbody tr')
      .should(($rows) => {
        expect($rows.length).to.be.greaterThan(0)
        $rows.each((_, row) => {
          expect(row.innerText).to.contain('Entrada')
        })
      })
  })
})
