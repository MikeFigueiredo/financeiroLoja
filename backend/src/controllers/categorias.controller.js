const categoriasQueries = require('../db/queries/categorias.queries')

async function listar(req, res) {
  const categorias = await categoriasQueries.listar({ tipo: req.query.tipo })
  res.json(categorias)
}

module.exports = { listar }
