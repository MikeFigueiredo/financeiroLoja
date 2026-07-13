const bcrypt = require('bcryptjs')
const usuariosQueries = require('../db/queries/usuarios.queries')
const { sign } = require('../utils/jwt')

async function login(req, res) {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe email e senha.' })
  }

  const usuario = await usuariosQueries.buscarPorEmail(email)
  if (!usuario) {
    return res.status(401).json({ erro: 'Credenciais inválidas.' })
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash)
  if (!senhaValida) {
    return res.status(401).json({ erro: 'Credenciais inválidas.' })
  }

  const token = sign({ id: usuario.id, email: usuario.email })

  res.json({
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  })
}

async function me(req, res) {
  const usuario = await usuariosQueries.buscarPorId(req.usuario.id)
  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' })
  }
  res.json(usuario)
}

module.exports = { login, me }
