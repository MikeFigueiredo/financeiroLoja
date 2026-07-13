const bcrypt = require('bcryptjs')
const pool = require('./pool')

function diasAPartirDeHoje(dias) {
  const data = new Date()
  data.setDate(data.getDate() + dias)
  return data.toISOString().slice(0, 10)
}

async function run() {
  await pool.query('TRUNCATE lancamentos, categorias, usuarios RESTART IDENTITY CASCADE')

  const senhaHash = await bcrypt.hash('Teste@123', 10)
  const { rows: usuarioRows } = await pool.query(
    'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id',
    ['Usuário Teste', 'teste@financeiroloja.com.br', senhaHash]
  )
  const usuarioId = usuarioRows[0].id

  const categorias = [
    ['Vendas', 'entrada'],
    ['Serviços', 'entrada'],
    ['Outras Receitas', 'entrada'],
    ['Aluguel', 'saida'],
    ['Fornecedores', 'saida'],
    ['Salários', 'saida'],
  ]
  const categoriaIds = {}
  for (const [nome, tipo] of categorias) {
    const { rows } = await pool.query(
      'INSERT INTO categorias (nome, tipo) VALUES ($1, $2) RETURNING id',
      [nome, tipo]
    )
    categoriaIds[nome] = rows[0].id
  }

  const lancamentos = [
    // pagos (já liquidados)
    { tipo: 'entrada', descricao: 'Venda balcão - camisetas', categoria: 'Vendas', valor: 850.0, vencimento: diasAPartirDeHoje(-10), pagamento: diasAPartirDeHoje(-10), status: 'pago', forma: 'pix' },
    { tipo: 'entrada', descricao: 'Venda online - vestidos', categoria: 'Vendas', valor: 1200.5, vencimento: diasAPartirDeHoje(-8), pagamento: diasAPartirDeHoje(-8), status: 'pago', forma: 'cartao' },
    { tipo: 'saida', descricao: 'Aluguel da loja - mês anterior', categoria: 'Aluguel', valor: 2200.0, vencimento: diasAPartirDeHoje(-15), pagamento: diasAPartirDeHoje(-15), status: 'pago', forma: 'transferencia' },
    { tipo: 'saida', descricao: 'Fornecedor de tecidos', categoria: 'Fornecedores', valor: 980.0, vencimento: diasAPartirDeHoje(-5), pagamento: diasAPartirDeHoje(-5), status: 'pago', forma: 'boleto' },
    // pendentes com vencimento futuro
    { tipo: 'entrada', descricao: 'Venda a prazo - cliente Marina', categoria: 'Vendas', valor: 430.0, vencimento: diasAPartirDeHoje(5), pagamento: null, status: 'pendente', forma: null },
    { tipo: 'entrada', descricao: 'Serviço de ajuste de roupas', categoria: 'Serviços', valor: 150.0, vencimento: diasAPartirDeHoje(3), pagamento: null, status: 'pendente', forma: null },
    { tipo: 'saida', descricao: 'Salário funcionária', categoria: 'Salários', valor: 1800.0, vencimento: diasAPartirDeHoje(7), pagamento: null, status: 'pendente', forma: null },
    // pendentes já vencidos (para virar "atrasado" na query)
    { tipo: 'entrada', descricao: 'Venda a prazo - cliente João', categoria: 'Vendas', valor: 320.0, vencimento: diasAPartirDeHoje(-3), pagamento: null, status: 'pendente', forma: null },
    { tipo: 'saida', descricao: 'Fornecedor de aviamentos', categoria: 'Fornecedores', valor: 210.0, vencimento: diasAPartirDeHoje(-2), pagamento: null, status: 'pendente', forma: null },
    { tipo: 'saida', descricao: 'Conta de energia', categoria: 'Aluguel', valor: 340.0, vencimento: diasAPartirDeHoje(-1), pagamento: null, status: 'pendente', forma: null },
  ]

  for (const l of lancamentos) {
    await pool.query(
      `INSERT INTO lancamentos
        (tipo, descricao, categoria_id, valor, data_vencimento, data_pagamento, status, forma_pagamento, usuario_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [l.tipo, l.descricao, categoriaIds[l.categoria], l.valor, l.vencimento, l.pagamento, l.status, l.forma, usuarioId]
    )
  }

  console.log(`[seed] 1 usuário, ${categorias.length} categorias, ${lancamentos.length} lançamentos.`)
  await pool.end()
}

run().catch((err) => {
  console.error('[seed] falhou:', err)
  process.exit(1)
})
