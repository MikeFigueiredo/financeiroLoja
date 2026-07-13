const pool = require('../../../db/pool')

async function buscarPorEmail(email) {
  const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email])
  return rows[0] || null
}

async function buscarPorId(id) {
  const { rows } = await pool.query('SELECT id, nome, email FROM usuarios WHERE id = $1', [id])
  return rows[0] || null
}

module.exports = { buscarPorEmail, buscarPorId }
