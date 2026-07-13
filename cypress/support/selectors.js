export const loginSelectors = {
  inputEmail: 'login_input_email',
  inputSenha: 'login_input_senha',
  btnSubmit: 'login_btn_submit',
  msgErro: 'login_msg_erro',
}

export const navSelectors = {
  mnuDashboard: 'mnu_dashboard',
  mnuLancamentos: 'mnu_lancamentos',
  btnLogout: 'mnu_btn_logout',
}

export const dashboardSelectors = {
  cardTotalReceber: 'dash_card_total_receber',
  cardTotalPagar: 'dash_card_total_pagar',
  cardSaldo: 'dash_card_saldo',
  cardAtrasadas: 'dash_card_atrasadas',
}

export const lancamentosSelectors = {
  btnNovo: 'lanc_btn_novo',
  filtroStatus: 'lanc_filtro_status',
  filtroTipo: 'lanc_filtro_tipo',
  tabela: 'lanc_tabela',
  btnEditar: 'lanc_btn_editar',
  btnPagar: 'lanc_btn_pagar',
  btnExcluir: 'lanc_btn_excluir',
  modalConfirmarBtnConfirmar: 'lanc_modal_confirm_btn_confirmar',
}

export const lancamentoFormSelectors = {
  selectTipo: 'lanc_form_select_tipo',
  inputDescricao: 'lanc_form_input_descricao',
  selectCategoria: 'lanc_form_select_categoria',
  inputValor: 'lanc_form_input_valor',
  inputVencimento: 'lanc_form_input_vencimento',
  selectFormaPagamento: 'lanc_form_select_forma_pagamento',
  btnSalvar: 'lanc_form_btn_salvar',
}
