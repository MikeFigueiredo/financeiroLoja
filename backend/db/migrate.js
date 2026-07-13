const fs = require('fs')
const path = require('path')
const pool = require('./pool')

const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

async function waitForConnection(retries = 10, delayMs = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query('SELECT 1')
      return
    } catch (err) {
      if (attempt === retries) throw err
      console.log(`[migrate] Postgres ainda não respondeu (tentativa ${attempt}/${retries}), aguardando...`)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}

async function run() {
  await waitForConnection()

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `)

  const { rows: applied } = await pool.query('SELECT name FROM schema_migrations')
  const appliedNames = new Set(applied.map((r) => r.name))

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    if (appliedNames.has(file)) {
      console.log(`[migrate] já aplicada: ${file}`)
      continue
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
      await client.query('COMMIT')
      console.log(`[migrate] aplicada: ${file}`)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }

  console.log('[migrate] concluído.')
  await pool.end()
}

run().catch((err) => {
  console.error('[migrate] falhou:', err)
  process.exit(1)
})
