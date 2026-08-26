import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import './LoginPage.css'

import { API_URL } from '../config/api'
import SocialAuthButtons from '../components/SocialAuthButtons'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()

  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const oauthError = searchParams.get('oauth_error')

    if (oauthError) {
      setMessage(oauthError)
    }
  }, [searchParams])

  const handleLogin = async (e) => {
    e.preventDefault()

    setMessage('')
    setLoading(true)

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Erro ao fazer login.'
        )
      }

      const loginSuccess = login(data)

      if (!loginSuccess) {
        throw new Error(
          'Resposta inválida do servidor.'
        )
      }

      navigate('/painel', { replace: true })

    } catch (error) {
      setMessage(
        error.message || 'Erro ao fazer login.'
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

          <h1>Entrar</h1>

          <p>
            Acesse sua conta TKS
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleLogin}
        >

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
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="login-forgot">
            <Link to="/reset-password">
              Esqueci minha senha
            </Link>
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

        </form>

        <SocialAuthButtons />

        {message && (
          <p className="login-message">
            {message}
          </p>
        )}

        <div className="login-register">
          <span>
            Ainda não possui uma conta?
          </span>

          <Link to="/cadastro">
            Criar conta
          </Link>
        </div>

        <Link
          to="/"
          className="login-back"
        >
          Voltar para o site
        </Link>

      </div>
    </main>
  )
}

export default LoginPage
