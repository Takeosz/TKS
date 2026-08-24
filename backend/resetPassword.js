import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './ResetPassword.css'

function ResetPassword() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleResetPassword = async (e) => {
    e.preventDefault()

    setMessage('')
    setSuccess(false)

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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

      const response = await fetch(
        `${apiUrl}/api/auth/reset-password`,
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

      setSuccess(true)
      setMessage(
        'Senha alterada com sucesso!'
      )

      setEmail('')
      setNewPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        navigate('/login')
      }, 1500)

    } catch (error) {
      setMessage(
        error.message ||
        'Erro ao alterar senha.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="reset-password-page">
      <div className="reset-password-container">

        <div className="reset-password-header">
          <span className="reset-password-brand">
            TKS
          </span>

          <span className="reset-password-subtitle">
            TECHNOLOGY SOLUTIONS
          </span>

          <h1>Redefinir senha</h1>

          <p>
            Informe seu e-mail e escolha uma nova senha.
          </p>
        </div>

        <form
          className="reset-password-form"
          onSubmit={handleResetPassword}
        >

          <div className="reset-password-field">
            <label htmlFor="reset-email">
              E-mail
            </label>

            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Digite seu e-mail"
              autoComplete="email"
              required
            />
          </div>

          <div className="reset-password-field">
            <label htmlFor="new-password">
              Nova senha
            </label>

            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              placeholder="Digite a nova senha"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div className="reset-password-field">
            <label htmlFor="confirm-password">
              Confirmar nova senha
            </label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Digite a senha novamente"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <button
            className="reset-password-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Alterando...'
              : 'Alterar senha'}
          </button>

        </form>

        {message && (
          <p
            className={
              success
                ? 'reset-password-message success'
                : 'reset-password-message'
            }
          >
            {message}
          </p>
        )}

        <Link
          to="/login"
          className="reset-password-back"
        >
          Voltar para o login
        </Link>

      </div>
    </main>
  )
}

export default ResetPassword