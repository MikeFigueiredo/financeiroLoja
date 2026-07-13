const { verify } = require('../utils/jwt')

function verifyToken(req, res, next) {
  const header = req.headers.authorization || ''
  const [, token] = header.split(' ')

  if (!token) {
    return res.status(401).json({ erro: 'Token não informado.' })
  }

  try {
    req.usuario = verify(token)
    next()
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' })
  }
}

module.exports = { verifyToken }
