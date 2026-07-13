const express = require('express')
const router = express.Router()
const lancamentosController = require('../controllers/lancamentos.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { asyncHandler } = require('../utils/asyncHandler')

router.use(verifyToken)

// /resumo precisa ser registrada ANTES de /:id, senão o Express trata "resumo" como um :id.
router.get('/resumo', asyncHandler(lancamentosController.resumo))

router.get('/', asyncHandler(lancamentosController.listar))
router.get('/:id', asyncHandler(lancamentosController.buscarPorId))
router.post('/', asyncHandler(lancamentosController.criar))
router.put('/:id', asyncHandler(lancamentosController.atualizar))
router.patch('/:id/pagar', asyncHandler(lancamentosController.marcarComoPago))
router.delete('/:id', asyncHandler(lancamentosController.excluir))

module.exports = router
