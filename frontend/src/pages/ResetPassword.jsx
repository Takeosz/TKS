import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { API_URL } from '../config/api'

function ResetPassword() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleResetPassword = async (e) => {
    e.preventDefault()

    setMessage('')
    if (newPassword !== confirmPassword) {
      setMessage('As senhas não coincidem.')
      return
    }

    if (newPassword.length < 6) {
      setMessage(
        'A nova senha deve ter pelo menos 6 caracteres.'
      )
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${API_URL}/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            newPassword,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Erro ao alterar senha.'
        )
      }

      setMessage('Senha alterada com sucesso!')

      setTimeout(() => {
        navigate('/login')
      }, 1500)

    } catch (error) {
      setMessage(
        error.message || 'Erro ao alterar senha.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-container">

        <h1>Redefinir senha</h1>

        <p>
          Informe seu e-mail e escolha uma nova senha.
        </p>

        <form
          className="login-form"
          onSubmit={handleResetPassword}
        >

          <div className="login-field">
            <label htmlFor="email">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Digite seu e-mail"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="newPassword">
              Nova senha
            </label>

            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              placeholder="Digite a nova senha"
              minLength={6}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="confirmPassword">
              Confirmar nova senha
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Digite novamente a senha"
              minLength={6}
              required
            />
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Alterando...'
              : 'Alterar senha'}
          </button>

        </form>

        {message && (
          <p className="login-message">
            {message}
          </p>
        )}

        <Link to="/login">
          Voltar para o login
        </Link>

      </div>
    </main>
  )
}

export default ResetPassword
