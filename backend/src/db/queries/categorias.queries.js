const pool = require('../../../db/pool')

async function listar({ tipo } = {}) {
  if (tipo) {
    const { rows } = await pool.query('SELECT * FROM categorias WHERE tipo = $1 ORDER BY nome', [tipo])
    return rows
  }
  const { rows } = await pool.query('SELECT * FROM categorias ORDER BY nome')
  return rows
}

module.exports = { listar }
