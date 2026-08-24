const pool = require('./connection')

const initializeDatabase = async () => {
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'client'
  `)

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS avatar_url TEXT
  `)

  await pool.query(`
    ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS category VARCHAR(80)
  `)

  const adminEmail = process.env.ADMIN_EMAIL

  if (adminEmail) {
    await pool.query(
      `UPDATE users SET role = 'admin' WHERE LOWER(email) = LOWER($1)`,
      [adminEmail.trim()]
    )
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL,
      subject VARCHAR(180) NOT NULL,
      message TEXT NOT NULL,
      service VARCHAR(100),
      timeline VARCHAR(80),
      budget VARCHAR(80),
      status VARCHAR(30) NOT NULL DEFAULT 'new',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.query(`
    ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS notes TEXT
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action VARCHAR(180) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

module.exports = initializeDatabase
