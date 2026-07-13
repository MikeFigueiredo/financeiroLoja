import { lancamentosSelectors, lancamentoFormSelectors } from '../support/selectors'

function dataFutura(dias) {
  const data = new Date()
  data.setDate(data.getDate() + dias)
  return data.toISOString().slice(0, 10)
}

describe('Lançamentos — CRUD', () => {
  let idsCriados = []

  beforeEach(() => {
    idsCriados = []
    cy.loginSession()
    cy.visit('/lancamentos')
    cy.getByTest(lancamentosSelectors.tabela).should('be.visible')
  })

  afterEach(() => {
    // Rede de segurança: se o teste falhar entre criar e excluir, remove via API para não
    // deixar dado órfão poluindo execuções seguintes (a suíte não depende mais de reseed
    // do banco entre runs).
    idsCriados.forEach((id) => cy.excluirLancamentoViaApi(id))
  })

  it('Deve criar, editar e excluir um lançamento', () => {
    cy.fixture('lancamentos').then(({ novoLancamento, edicaoLancamento }) => {
      // Criar
      cy.getByTest(lancamentosSelectors.btnNovo).click()
      cy.getByTest(lancamentoFormSelectors.selectTipo).select('entrada')
      cy.getByTest(lancamentoFormSelectors.inputDescricao).type(novoLancamento.descricao)
      cy.getByTest(lancamentoFormSelectors.selectCategoria).select(novoLancamento.categoria)
      cy.getByTest(lancamentoFormSelectors.inputValor).clear().type(novoLancamento.valor)
      cy.getByTest(lancamentoFormSelectors.inputVencimento).type(dataFutura(novoLancamento.diasParaVencimento))
      cy.getByTest(lancamentoFormSelectors.selectFormaPagamento).select(novoLancamento.formaPagamento)

      cy.intercept('POST', '**/api/lancamentos').as('criarLancamento')
      cy.getByTest(lancamentoFormSelectors.btnSalvar).click()
      cy.wait('@criarLancamento').then(({ response }) => {
        idsCriados.push(response.body.id)
      })

      cy.mensagemSucesso('Lançamento criado com sucesso.')
      cy.getByTest(lancamentosSelectors.tabela).should('contain.text', novoLancamento.descricao)

      // Editar
      cy.contains(`[data-test="${lancamentosSelectors.tabela}"] tbody tr`, novoLancamento.descricao)
        .find(`[data-test="${lancamentosSelectors.btnEditar}"]`)
        .click()

      cy.getByTest(lancamentoFormSelectors.inputDescricao).clear().type(edicaoLancamento.descricao)
      cy.getByTest(lancamentoFormSelectors.inputValor).clear().type(edicaoLancamento.valor)
      cy.getByTest(lancamentoFormSelectors.btnSalvar).click()

      cy.mensagemSucesso('Lançamento atualizado com sucesso.')
      cy.getByTest(lancamentosSelectors.tabela).should('contain.text', edicaoLancamento.descricao)

      // Excluir
      cy.contains(`[data-test="${lancamentosSelectors.tabela}"] tbody tr`, edicaoLancamento.descricao)
        .find(`[data-test="${lancamentosSelectors.btnExcluir}"]`)
        .click()

      cy.getByTest(lancamentosSelectors.modalConfirmarBtnConfirmar).click()

      cy.mensagemSucesso('Lançamento excluído com sucesso.')
      cy.getByTest(lancamentosSelectors.tabela).should('not.contain.text', edicaoLancamento.descricao)

      // Já excluído pela própria UI — não precisa da rede de segurança do afterEach.
      idsCriados = []
    })
  })
})
