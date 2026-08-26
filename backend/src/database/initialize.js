const pool = require('./connection')

const initializeDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'client',
      avatar_url TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(180) NOT NULL,
      description TEXT,
      icon VARCHAR(120),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(180) NOT NULL,
      description TEXT,
      image TEXT,
      link TEXT,
      category VARCHAR(80),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120),
      email VARCHAR(160),
      subject VARCHAR(180),
      message TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      recipient_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'client'
  `)

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS avatar_url TEXT
  `)

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS provider VARCHAR(30),
    ADD COLUMN IF NOT EXISTS provider_id VARCHAR(180)
  `)

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_provider_identity_idx
    ON users (provider, provider_id)
    WHERE provider IS NOT NULL AND provider_id IS NOT NULL
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lead_history (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      status VARCHAR(30) NOT NULL,
      assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

module.exports = initializeDatabase
