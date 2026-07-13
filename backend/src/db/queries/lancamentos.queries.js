const pool = require('../../../db/pool')

// "atrasado" nunca é gravado no banco por um job — é derivado na hora da consulta,
// evitando status desatualizado sem precisar de um scheduler.
const STATUS_EFETIVO = `
  CASE
    WHEN l.status = 'pendente' AND l.data_vencimento < CURRENT_DATE THEN 'atrasado'
    ELSE l.status
  END
`

async function listar({ status, tipo, categoria_id } = {}) {
  const condicoes = []
  const valores = []

  if (tipo) {
    valores.push(tipo)
    condicoes.push(`l.tipo = $${valores.length}`)
  }
  if (categoria_id) {
    valores.push(categoria_id)
    condicoes.push(`l.categoria_id = $${valores.length}`)
  }
  if (status) {
    valores.push(status)
    condicoes.push(`(${STATUS_EFETIVO}) = $${valores.length}`)
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : ''

  const { rows } = await pool.query(
    `SELECT l.*, c.nome AS categoria_nome, (${STATUS_EFETIVO}) AS status_efetivo
     FROM lancamentos l
     JOIN categorias c ON c.id = l.categoria_id
     ${where}
     ORDER BY l.data_vencimento ASC, l.id ASC`,
    valores
  )
  return rows
}

async function buscarPorId(id) {
  const { rows } = await pool.query(
    `SELECT l.*, c.nome AS categoria_nome, (${STATUS_EFETIVO}) AS status_efetivo
     FROM lancamentos l
     JOIN categorias c ON c.id = l.categoria_id
     WHERE l.id = $1`,
    [id]
  )
  return rows[0] || null
}

async function criar({ tipo, descricao, categoria_id, valor, data_vencimento, forma_pagamento, usuario_id }) {
  const { rows } = await pool.query(
    `INSERT INTO lancamentos (tipo, descricao, categoria_id, valor, data_vencimento, forma_pagamento, usuario_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [tipo, descricao, categoria_id, valor, data_vencimento, forma_pagamento || null, usuario_id]
  )
  return rows[0]
}

async function atualizar(id, { tipo, descricao, categoria_id, valor, data_vencimento, forma_pagamento }) {
  const { rows } = await pool.query(
    `UPDATE lancamentos SET
       tipo = $1, descricao = $2, categoria_id = $3, valor = $4,
       data_vencimento = $5, forma_pagamento = $6, updated_at = now()
     WHERE id = $7
     RETURNING *`,
    [tipo, descricao, categoria_id, valor, data_vencimento, forma_pagamento || null, id]
  )
  return rows[0] || null
}

async function marcarComoPago(id) {
  const { rows } = await pool.query(
    `UPDATE lancamentos SET status = 'pago', data_pagamento = CURRENT_DATE, updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id]
  )
  return rows[0] || null
}

async function excluir(id) {
  const { rowCount } = await pool.query('DELETE FROM lancamentos WHERE id = $1', [id])
  return rowCount > 0
}

async function resumo() {
  const { rows } = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN tipo = 'entrada' AND status = 'pago' THEN valor ELSE 0 END), 0) AS total_recebido,
      COALESCE(SUM(CASE WHEN tipo = 'saida' AND status = 'pago' THEN valor ELSE 0 END), 0) AS total_pago,
      COALESCE(SUM(CASE WHEN tipo = 'entrada' AND status = 'pendente' THEN valor ELSE 0 END), 0) AS total_a_receber,
      COALESCE(SUM(CASE WHEN tipo = 'saida' AND status = 'pendente' THEN valor ELSE 0 END), 0) AS total_a_pagar,
      COUNT(*) FILTER (WHERE status = 'pendente' AND data_vencimento < CURRENT_DATE) AS contas_atrasadas
    FROM lancamentos
  `)

  const r = rows[0]
  const totalRecebido = Number(r.total_recebido)
  const totalPago = Number(r.total_pago)

  return {
    saldo: totalRecebido - totalPago,
    totalReceber: Number(r.total_a_receber),
    totalPagar: Number(r.total_a_pagar),
    contasAtrasadas: Number(r.contas_atrasadas),
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, marcarComoPago, excluir, resumo }
