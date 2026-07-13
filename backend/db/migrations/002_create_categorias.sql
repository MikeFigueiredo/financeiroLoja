CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(60) NOT NULL UNIQUE,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida'))
);
