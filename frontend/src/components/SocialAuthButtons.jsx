const providers = [
  { id: 'google', label: 'Continuar com Google', icon: 'G' },
  { id: 'facebook', label: 'Continuar com Facebook', icon: 'f' },
  { id: 'github', label: 'Continuar com GitHub', icon: '◖' },
]

const apiBaseUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://tks-api.onrender.com')

function SocialAuthButtons() {
  const handleProviderClick = (provider) => {
    window.location.assign(`${apiBaseUrl.replace(/\/$/, '')}/api/auth/${provider}`)
  }

  return (
    <div className="social-auth" aria-label="Entrar com uma conta social">
      <div className="social-auth-divider"><span>ou continue com</span></div>
      <div className="social-auth-grid">
        {providers.map((provider) => (
          <button key={provider.id} type="button" className={`social-auth-button social-auth-${provider.id}`} onClick={() => handleProviderClick(provider)}>
            <span aria-hidden="true">{provider.icon}</span>
            {provider.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SocialAuthButtons
