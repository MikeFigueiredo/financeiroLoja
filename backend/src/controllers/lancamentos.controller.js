const lancamentosQueries = require('../db/queries/lancamentos.queries')

const TIPOS_VALIDOS = ['entrada', 'saida']

function validarPayload(body) {
  const erros = []
  if (!TIPOS_VALIDOS.includes(body.tipo)) erros.push('tipo deve ser "entrada" ou "saida".')
  if (!body.descricao || !body.descricao.trim()) erros.push('descricao é obrigatória.')
  if (!body.categoria_id) erros.push('categoria_id é obrigatória.')
  if (!body.valor || Number(body.valor) <= 0) erros.push('valor deve ser maior que zero.')
  if (!body.data_vencimento) erros.push('data_vencimento é obrigatória.')
  return erros
}

async function listar(req, res) {
  const { status, tipo, categoria_id } = req.query
  const lancamentos = await lancamentosQueries.listar({ status, tipo, categoria_id })
  res.json(lancamentos)
}

async function resumo(req, res) {
  const dados = await lancamentosQueries.resumo()
  res.json(dados)
}

async function buscarPorId(req, res) {
  const lancamento = await lancamentosQueries.buscarPorId(req.params.id)
  if (!lancamento) return res.status(404).json({ erro: 'Lançamento não encontrado.' })
  res.json(lancamento)
}

async function criar(req, res) {
  const erros = validarPayload(req.body)
  if (erros.length) return res.status(400).json({ erro: erros.join(' ') })

  const lancamento = await lancamentosQueries.criar({
    ...req.body,
    usuario_id: req.usuario.id,
  })
  res.status(201).json(lancamento)
}

async function atualizar(req, res) {
  const erros = validarPayload(req.body)
  if (erros.length) return res.status(400).json({ erro: erros.join(' ') })

  const lancamento = await lancamentosQueries.atualizar(req.params.id, req.body)
  if (!lancamento) return res.status(404).json({ erro: 'Lançamento não encontrado.' })
  res.json(lancamento)
}

async function marcarComoPago(req, res) {
  const lancamento = await lancamentosQueries.marcarComoPago(req.params.id)
  if (!lancamento) return res.status(404).json({ erro: 'Lançamento não encontrado.' })
  res.json(lancamento)
}

async function excluir(req, res) {
  const removido = await lancamentosQueries.excluir(req.params.id)
  if (!removido) return res.status(404).json({ erro: 'Lançamento não encontrado.' })
  res.status(204).send()
}

module.exports = { listar, resumo, buscarPorId, criar, atualizar, marcarComoPago, excluir }
