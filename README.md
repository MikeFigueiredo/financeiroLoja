# financeiroLoja

Sistema financeiro simples (porém completo) para uma loja de roupas: contas a pagar/receber e fluxo de caixa. Projeto de portfólio criado para demonstrar, no mesmo repositório, tanto o desenvolvimento da aplicação quanto a automação de testes E2E sobre ela.

Front-end (React) e a convenção de testes (Cypress com atributos `data-test`) espelham deliberadamente o padrão usado profissionalmente no projeto Go2Route/Cargozilla.

## Stack

- **Back-end**: Node.js + Express + PostgreSQL (`pg`, sem ORM — SQL puro e migrations em arquivos numerados).
- **Front-end**: React (Vite) + React Router + react-bootstrap.
- **Autenticação**: JWT (`jsonwebtoken` + `bcryptjs`).
- **Testes**: Cypress (suíte na raiz do repositório, cobrindo login, navegação, dashboard, CRUD de lançamentos e a ação de "dar baixa").

## Estrutura

```
financeiroLoja/
  backend/     # API Express — rotas, controllers, queries SQL, migrations, seed
  frontend/    # SPA React (Vite)
  cypress/     # Suíte de testes E2E
  docker-compose.yml
```

## Escopo (MVP)

Contas a pagar/receber + fluxo de caixa. **Fora do escopo do v1**: estoque, vendas/PDV, múltiplas lojas, exportação de relatórios.

Um lançamento (`entrada` ou `saida`) tem descrição, categoria, valor, vencimento, forma de pagamento e status (`pendente`, `pago` — o status `atrasado` **nunca é gravado**, é calculado na consulta comparando `data_vencimento` com a data atual, evitando a necessidade de um job agendado).

## Rodando localmente

Requer PostgreSQL (via Docker **ou** instalação nativa — o que estiver disponível) e Node.js ≥ 18.

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

npm run install:all
```

**Opção A — Postgres via Docker:**
```bash
npm run db:setup      # sobe o container, migra e semeia
```

**Opção B — Postgres já instalado na máquina:** crie manualmente o banco/usuário indicados em `backend/.env` (`DATABASE_URL`) e rode:
```bash
npm run db:migrate
npm run db:seed
```

Depois, em ambos os casos:
```bash
npm run dev            # backend em :4000, frontend em :5173
```

Acesse `http://localhost:5173` e entre com o usuário semeado: `teste@financeiroloja.com.br` / `Teste@123`.

## Rodando os testes

```bash
npm run cy:open         # modo interativo
npm run cy:run          # headless
npm run test:e2e        # re-semeia o banco e roda headless (estado determinístico)
```

Para rodar a suíte contra um ambiente já implantado (em vez de `localhost:5173`/`localhost:4000`), sobrescreva a `baseUrl` do frontend e a URL da API:

```bash
CYPRESS_BASE_URL=https://seu-frontend-implantado.exemplo.com \
CYPRESS_API_URL=https://seu-backend-implantado.exemplo.com/api \
npm run cy:run
```

A maioria dos specs autentica via API (`cy.session`) e cria/remove seus próprios dados de teste — não é necessário re-semear o banco entre execuções. A exceção é `dashboard-resumo.cy.js`, que só pressupõe que exista ao menos um lançamento pendente vencido na base (garantido pelo seed).

## Implantação (deploy)

A aplicação lê toda a configuração de variáveis de ambiente (`DATABASE_URL`, `JWT_SECRET`, `VITE_API_URL`) — não há nada hardcoded que amarre o projeto a uma máquina ou provedor específico. O front-end (estático) e o back-end (servidor Node com pool de conexões Postgres) são implantados em serviços separados.

### 1. Banco de dados — Neon ou Supabase

Ambos têm camada gratuita sem necessidade de cartão. Crie um projeto Postgres em [neon.tech](https://neon.tech) ou [supabase.com](https://supabase.com) e copie a connection string (`DATABASE_URL`). Evite o Postgres gratuito do Render para uso de longo prazo — costuma expirar após um período (confira o plano vigente no site); Neon/Supabase não têm esse limite no tier free.

### 2. Back-end — Render (usa o `render.yaml` já commitado)

1. No [dashboard do Render](https://dashboard.render.com), **New +** → **Blueprint** → conecte o repositório do GitHub.
2. O Render lê o [render.yaml](render.yaml) da raiz e propõe o serviço `financeiroloja-backend`. Quando pedir o valor de `DATABASE_URL`, cole a connection string do Neon/Supabase (as demais variáveis — `JWT_SECRET`, `JWT_EXPIRES_IN` — já vêm definidas no blueprint).
3. Aplique o blueprint. As migrations rodam automaticamente a cada deploy (dentro do `buildCommand` — `preDeployCommand` não é suportado no plano free; a migration é idempotente, controla o que já foi aplicado em `schema_migrations`).
4. **Uma única vez**, após o primeiro deploy, rode o seed manualmente pela aba **Shell** do serviço no Render: `npm run seed`. Não é automático de propósito — o seed faz `TRUNCATE` nas tabelas, e rodar isso em todo deploy apagaria dados reais.
5. Anote a URL pública do serviço (ex.: `https://financeiroloja-backend.onrender.com`) — o front-end vai apontar `VITE_API_URL` para `<essa-url>/api`.

O plano free do Render hiberna após um período sem tráfego; a primeira requisição depois disso demora ~30-50s para "acordar" o serviço.

### 3. Front-end — Vercel (usa o `vercel.json` já commitado)

1. No [dashboard da Vercel](https://vercel.com/new), importe o mesmo repositório (a integração com o GitHub é nativa — não precisa de nenhum GitHub Secret nem workflow de deploy).
2. O [vercel.json](vercel.json) na raiz já define o build (`npm run build --prefix frontend`) e a saída (`frontend/dist`), além do rewrite de SPA necessário para as rotas do React Router funcionarem em acesso direto (ex. `/dashboard`). Deixe o "Root Directory" como raiz do repositório.
3. Em **Settings → Environment Variables**, adicione `VITE_API_URL` = `https://<seu-backend-no-render>.onrender.com/api` (para os ambientes Production e Preview). Não é um valor sensível — variáveis `VITE_*` ficam embutidas no bundle que roda no navegador.
4. Deploy. A cada push na branch configurada, a Vercel reimplanta automaticamente.

### CI — GitHub Actions

O workflow [.github/workflows/e2e-tests.yml](.github/workflows/e2e-tests.yml) roda a suíte Cypress completa em todo push/PR para `main`/`master` (e também pode ser disparado manualmente): sobe um Postgres descartável como serviço do próprio job, migra, semeia, inicia backend e frontend localmente dentro do runner, e executa `npm run cy:run`. Em caso de falha, screenshots/vídeos ficam disponíveis como artefato do run. **Nenhum GitHub Secret é necessário** — as credenciais usadas ali (Postgres, JWT_SECRET) são valores descartáveis só para a duração do job, não as credenciais reais de produção.

## API

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/health` | não | liveness |
| POST | `/api/auth/login` | não | `{email, senha}` → `{token, usuario}` |
| GET | `/api/auth/me` | JWT | usuário autenticado |
| GET | `/api/categorias` | JWT | lista categorias (filtro `?tipo=`) |
| GET | `/api/lancamentos` | JWT | lista lançamentos (filtros `?status=&tipo=&categoria_id=`) |
| GET | `/api/lancamentos/resumo` | JWT | totais para o dashboard |
| GET/POST/PUT/DELETE | `/api/lancamentos/:id` | JWT | CRUD |
| PATCH | `/api/lancamentos/:id/pagar` | JWT | dá baixa no lançamento |
