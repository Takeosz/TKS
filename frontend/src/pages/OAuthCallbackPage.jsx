import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      navigate('/login?oauth_error=Não foi possível concluir o login social.', { replace: true })
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))

      if (!login({ token, user: payload })) {
        navigate('/login?oauth_error=Resposta inválida do provedor.', { replace: true })
        return
      }
    } catch {
      navigate('/login?oauth_error=Resposta inválida do provedor.', { replace: true })
      return
    }

    navigate('/painel', { replace: true })
  }, [login, navigate, searchParams])

  return <main className="login-page"><div className="login-container"><p className="login-message">Conectando sua conta...</p></div></main>
}

export default OAuthCallbackPage
