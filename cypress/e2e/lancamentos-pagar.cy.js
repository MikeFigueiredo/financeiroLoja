import { navSelectors, lancamentosSelectors } from '../support/selectors'

function dataPassada(dias) {
  const data = new Date()
  data.setDate(data.getDate() - dias)
  return data.toISOString().slice(0, 10)
}

// Cria e remove seu próprio lançamento atrasado via API em vez de depender de uma linha fixa
// do seed (backend/db/seed.js) — assim o teste é idempotente e roda quantas vezes for
// necessário sem exigir reseed do banco entre execuções.
const DESCRICAO_TESTE = 'QA Automação - lançamento atrasado para dar baixa'

describe('Lançamentos — Dar Baixa (Pagar)', () => {
  let lancamentoId

  beforeEach(() => {
    cy.buscarCategoriaViaApi('Vendas', 'entrada').then((categoria) =>
      cy
        .criarLancamentoViaApi({
          tipo: 'entrada',
          descricao: DESCRICAO_TESTE,
          categoria_id: categoria.id,
          valor: 100,
          data_vencimento: dataPassada(3),
        })
        .then((lancamento) => {
          lancamentoId = lancamento.id
        })
    )
  })

  afterEach(() => {
    if (lancamentoId) {
      cy.excluirLancamentoViaApi(lancamentoId)
      lancamentoId = null
    }
  })

  it('Deve marcar um lançamento pendente como pago e refletir no dashboard', () => {
    cy.intercept('GET', '**/api/lancamentos/resumo').as('getResumo')
    cy.loginSession()
    cy.visit('/dashboard')

    cy.wait('@getResumo').then(({ response }) => {
      const resumoAntes = response.body

      cy.getByTest(navSelectors.mnuLancamentos).click()
      cy.getByTest(lancamentosSelectors.filtroStatus).select('atrasado')

      cy.contains(`[data-test="${lancamentosSelectors.tabela}"] tbody tr`, DESCRICAO_TESTE)
        .find(`[data-test="${lancamentosSelectors.btnPagar}"]`)
        .click()

      cy.mensagemSucesso('Lançamento marcado como pago.')

      // Após pago, some da lista de "atrasado" (filtro atual) e some o botão "Pagar" da linha.
      cy.getByTest(lancamentosSelectors.tabela).should('not.contain.text', DESCRICAO_TESTE)

      cy.getByTest(lancamentosSelectors.filtroStatus).select('pago')
      cy.contains(`[data-test="${lancamentosSelectors.tabela}"] tbody tr`, DESCRICAO_TESTE).should('be.visible')

      cy.intercept('GET', '**/api/lancamentos/resumo').as('getResumoDepois')
      cy.getByTest(navSelectors.mnuDashboard).click()

      cy.wait('@getResumoDepois').then(({ response }) => {
        const resumoDepois = response.body
        expect(resumoDepois.contasAtrasadas).to.eq(resumoAntes.contasAtrasadas - 1)
        expect(resumoDepois.saldo).to.be.greaterThan(resumoAntes.saldo)
      })
    })
  })
})
