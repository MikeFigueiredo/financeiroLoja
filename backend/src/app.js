const express = require('express')
const cors = require('cors')
const { errorHandler } = require('./middlewares/errorHandler')

const healthRoutes = require('./routes/health.routes')
const authRoutes = require('./routes/auth.routes')
const categoriasRoutes = require('./routes/categorias.routes')
const lancamentosRoutes = require('./routes/lancamentos.routes')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/categorias', categoriasRoutes)
app.use('/api/lancamentos', lancamentosRoutes)

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' })
})

app.use(errorHandler)

module.exports = app
