import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { API_URL } from '../config/api'
import Breadcrumbs from '../components/Breadcrumbs'

function ServiceDetailPage() {
  const { id } = useParams()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_URL}/services/public/${id}`)
        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Erro ao carregar serviço.')
        }

        setService(data.service)
      } catch (error) {
        console.error('Erro ao buscar serviço:', error)
        setError(error.message || 'Não foi possível carregar o serviço.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchService()
    }
  }, [id])

  return (
    <main className="page detail-page">
      <div className="detail-shell">
        <Breadcrumbs current={service?.title || 'Serviço'} />
        <Link className="back-link" to="/servicos">← Voltar para serviços</Link>

        {loading && <div className="detail-state">Carregando serviço...</div>}

        {error && <div className="detail-state error">{error}</div>}

        {!loading && !error && service && (
          <article className="detail-card service-detail-card">
            <div className="detail-badge">SERVIÇO</div>
            <div className="detail-icon">{service.icon || '◇'}</div>
            <h1>{service.title}</h1>
            <p className="detail-summary">{service.description || 'Solução tecnológica da TKS.'}</p>

            <div className="detail-highlights">
              <span>Consultoria estratégica</span>
              <span>Execução prática</span>
              <span>Suporte contínuo</span>
            </div>

            <div className="detail-actions">
              <Link className="primary-button" to={`/contato?service=${encodeURIComponent(service.title)}`}>
                Solicitar proposta
              </Link>
              <Link className="secondary-button" to="/servicos">
                Ver todos os serviços
              </Link>
            </div>
          </article>
        )}
      </div>
    </main>
  )
}

export default ServiceDetailPage
