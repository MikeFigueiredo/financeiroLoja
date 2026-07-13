const express = require('express')
const router = express.Router()
const categoriasController = require('../controllers/categorias.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { asyncHandler } = require('../utils/asyncHandler')

router.use(verifyToken)

router.get('/', asyncHandler(categoriasController.listar))

module.exports = router
