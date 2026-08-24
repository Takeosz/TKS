import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './LoginPage.css'

import { API_URL } from '../config/api'

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()

    setMessage('')
    setLoading(true)

    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanName || !cleanEmail || !password) {
      setMessage('Preencha todos os campos.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage('A senha deve ter pelo menos 6 caracteres.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Erro ao criar conta.'
        )
      }

      setMessage(
        'Conta criada com sucesso! Redirecionando...'
      )

      setName('')
      setEmail('')
      setPassword('')

      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1200)

    } catch (error) {
      setMessage(
        error.message || 'Erro ao criar conta.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-container">

        <div className="login-header">
          <span className="login-brand">
            TKS
          </span>

          <span className="login-subtitle">
            TECHNOLOGY SOLUTIONS
          </span>

          <h1>Criar conta</h1>

          <p>
            Crie sua conta TKS
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleRegister}
        >

          <div className="login-field">
            <label htmlFor="name">
              Nome
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              autoComplete="name"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="email">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">
              Senha
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Criando...' : 'Criar conta'}
          </button>

        </form>

        {message && (
          <p className="login-message">
            {message}
          </p>
        )}

        <div className="login-back">
          <Link to="/login">
            Já tenho uma conta
          </Link>
        </div>

      </div>
    </main>
  )
}

export default RegisterPage
