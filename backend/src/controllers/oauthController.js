const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../database/connection')

const providers = {
  google: {
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'openid email profile',
  },
  github: {
    clientId: () => process.env.GITHUB_CLIENT_ID,
    clientSecret: () => process.env.GITHUB_CLIENT_SECRET,
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scope: 'read:user user:email',
  },
  facebook: {
    clientId: () => process.env.FACEBOOK_CLIENT_ID,
    clientSecret: () => process.env.FACEBOOK_CLIENT_SECRET,
    authorizeUrl: 'https://www.facebook.com/v21.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v21.0/oauth/access_token',
    scope: 'email,public_profile',
  },
}

const getRedirectUri = (provider) => `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/${provider}/callback`
const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173'

const setStateCookie = (res, state) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader('Set-Cookie', `tks_oauth_state=${state}; HttpOnly; SameSite=Lax; Max-Age=600; Path=/${secure}`)
}

const readStateCookie = (req) => {
  const cookie = req.headers.cookie || ''
  const match = cookie.match(/(?:^|;\s*)tks_oauth_state=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

const startOAuth = (req, res) => {
  const provider = providers[req.params.provider]

  if (!provider || !provider.clientId() || !provider.clientSecret()) {
    return res.status(503).json({ success: false, message: 'Este login social ainda não foi configurado.' })
  }

  const state = crypto.randomBytes(24).toString('hex')
  setStateCookie(res, state)

  const params = new URLSearchParams({
    client_id: provider.clientId(),
    redirect_uri: getRedirectUri(req.params.provider),
    response_type: 'code',
    scope: provider.scope,
    state,
  })

  return res.redirect(`${provider.authorizeUrl}?${params}`)
}

const exchangeCode = async (provider, code, redirectUri) => {
  const response = await fetch(provider.tokenUrl, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: provider.clientId(),
      client_secret: provider.clientSecret(),
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  const data = await response.json()
  if (!response.ok || data.error || !data.access_token) throw new Error('Não foi possível obter o token social.')
  return data.access_token
}

const getProfile = async (name, accessToken) => {
  if (name === 'google') {
    const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } })
    const data = await response.json()
    return { id: data.sub, name: data.name, email: data.email, avatarUrl: data.picture }
  }

  if (name === 'github') {
    const headers = { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json' }
    const [profileResponse, emailsResponse] = await Promise.all([fetch('https://api.github.com/user', { headers }), fetch('https://api.github.com/user/emails', { headers })])
    const profile = await profileResponse.json()
    const emails = await emailsResponse.json()
    const primaryEmail = Array.isArray(emails) ? emails.find((item) => item.primary && item.verified)?.email || emails.find((item) => item.verified)?.email : ''
    return { id: profile.id, name: profile.name || profile.login, email: primaryEmail || profile.email, avatarUrl: profile.avatar_url }
  }

  const response = await fetch('https://graph.facebook.com/me?fields=id,name,email,picture.type(large)', { headers: { Authorization: `Bearer ${accessToken}` } })
  const data = await response.json()
  return { id: data.id, name: data.name, email: data.email, avatarUrl: data.picture?.data?.url }
}

const oauthCallback = async (req, res) => {
  const providerName = req.params.provider
  const provider = providers[providerName]
  const frontendUrl = getFrontendUrl()

  try {
    if (!provider || !provider.clientId() || !provider.clientSecret()) throw new Error('Provedor não configurado.')
    if (!req.query.code || !req.query.state || req.query.state !== readStateCookie(req)) throw new Error('Sessão social inválida ou expirada.')

    const accessToken = await exchangeCode(provider, req.query.code, getRedirectUri(providerName))
    const profile = await getProfile(providerName, accessToken)
    const email = String(profile.email || '').trim().toLowerCase()
    const name = String(profile.name || 'Usuário TKS').trim().slice(0, 120)

    if (!email) throw new Error('O provedor não retornou um e-mail verificável.')

    let result = await pool.query('SELECT id, name, email, role, avatar_url FROM users WHERE provider = $1 AND provider_id = $2', [providerName, String(profile.id)])
    if (!result.rows[0]) result = await pool.query('SELECT id, name, email, role, avatar_url FROM users WHERE email = $1', [email])

    let user = result.rows[0]
    if (user) {
      await pool.query('UPDATE users SET provider = $1, provider_id = $2, avatar_url = COALESCE(avatar_url, $3) WHERE id = $4', [providerName, String(profile.id), profile.avatarUrl || null, user.id])
      user = { ...user, avatar_url: user.avatar_url || profile.avatarUrl || null }
    } else {
      const password = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10)
      const created = await pool.query('INSERT INTO users (name, email, password, provider, provider_id, avatar_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, avatar_url', [name, email, password, providerName, String(profile.id), profile.avatarUrl || null])
      user = created.rows[0]
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url }, process.env.JWT_SECRET, { expiresIn: '30d' })
    return res.redirect(`${frontendUrl}/oauth/callback?token=${encodeURIComponent(token)}`)
  } catch (error) {
    console.error('Erro no OAuth:', error)
    return res.redirect(`${frontendUrl}/login?oauth_error=${encodeURIComponent(error.message || 'Não foi possível entrar com a conta social.')}`)
  }
}

module.exports = { startOAuth, oauthCallback }
