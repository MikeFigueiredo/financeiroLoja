import { dashboardSelectors } from '../support/selectors'

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

// Recalcula o resumo a partir dos lançamentos crus (mesma fonte que a API usa), em vez de
// comparar o card só contra a própria resposta do endpoint de resumo. Isso garante que o
// teste também pega um erro de cálculo no backend, não só um erro de exibição na UI.
function calcularResumoEsperado(lancamentos) {
  const hoje = new Date().toISOString().slice(0, 10)
  let totalRecebido = 0
  let totalPago = 0
  let totalReceber = 0
  let totalPagar = 0
  let contasAtrasadas = 0

  for (const l of lancamentos) {
    const valor = Number(l.valor)
    if (l.tipo === 'entrada' && l.status === 'pago') totalRecebido += valor
    if (l.tipo === 'saida' && l.status === 'pago') totalPago += valor
    if (l.tipo === 'entrada' && l.status === 'pendente') totalReceber += valor
    if (l.tipo === 'saida' && l.status === 'pendente') totalPagar += valor
    if (l.status === 'pendente' && l.data_vencimento.slice(0, 10) < hoje) contasAtrasadas += 1
  }

  return { saldo: totalRecebido - totalPago, totalReceber, totalPagar, contasAtrasadas }
}

describe('Dashboard — Resumo Financeiro', () => {
  it('Deve calcular os totais corretamente a partir dos lançamentos e exibi-los nos cards', () => {
    cy.apiHeaders().then((headers) =>
      cy.request({ url: `${Cypress.env('apiUrl')}/lancamentos`, headers }).then(({ body: lancamentos }) => {
        const esperado = calcularResumoEsperado(lancamentos)

        // A base semeada sempre inclui lançamentos pendentes vencidos — garante que o teste
        // não passe "por acaso" comparando contra um total zerado.
        expect(esperado.contasAtrasadas, 'contas atrasadas semeadas').to.be.greaterThan(0)

        cy.intercept('GET', '**/api/lancamentos/resumo').as('getResumo')
        cy.loginSession()
        cy.visit('/dashboard')

        cy.wait('@getResumo').then(({ response }) => {
          expect(response.body.contasAtrasadas).to.eq(esperado.contasAtrasadas)
          expect(response.body.totalReceber).to.be.closeTo(esperado.totalReceber, 0.01)
          expect(response.body.totalPagar).to.be.closeTo(esperado.totalPagar, 0.01)
          expect(response.body.saldo).to.be.closeTo(esperado.saldo, 0.01)

          cy.getByTest(dashboardSelectors.cardTotalReceber).should('contain.text', formatarMoeda(esperado.totalReceber))
          cy.getByTest(dashboardSelectors.cardTotalPagar).should('contain.text', formatarMoeda(esperado.totalPagar))
          cy.getByTest(dashboardSelectors.cardSaldo).should('contain.text', formatarMoeda(esperado.saldo))
          cy.getByTest(dashboardSelectors.cardAtrasadas).should('contain.text', String(esperado.contasAtrasadas))
        })
      })
    )
  })
})
