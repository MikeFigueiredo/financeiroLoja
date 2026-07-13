CREATE TABLE IF NOT EXISTS lancamentos (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  descricao VARCHAR(200) NOT NULL,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  valor NUMERIC(12, 2) NOT NULL CHECK (valor > 0),
  data_vencimento DATE NOT NULL,
  data_pagamento DATE NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado')),
  forma_pagamento VARCHAR(20) NULL CHECK (forma_pagamento IN ('dinheiro', 'pix', 'cartao', 'boleto', 'transferencia')),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lancamentos_status ON lancamentos(status);
CREATE INDEX IF NOT EXISTS idx_lancamentos_data_vencimento ON lancamentos(data_vencimento);
