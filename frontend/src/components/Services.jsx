import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../config/api'

function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch(`${API_URL}/services/public`)
        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Erro ao carregar serviços.')
        }

        setServices(data.services || [])
      } catch (error) {
        console.error('Erro ao buscar serviços:', error)
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [])

  return (
    <section
      id="servicos"
      className="services-section"
    >

      <div className="section-header services-header">

        <div>
          <span>SERVIÇOS TKS</span>

          <h2>
            Tecnologia para
            <strong> resolver.</strong>
          </h2>
        </div>

        <p>
          Desenvolvemos soluções tecnológicas
          de acordo com as necessidades de cada
          projeto.
        </p>

      </div>

      {loading && (
        <div className="services-status">
          Carregando serviços...
        </div>
      )}

      {!loading && services.length === 0 && (
        <div className="services-status">
          Novos serviços em breve.
        </div>
      )}

      {!loading && services.length > 0 && (
        <div className="services-grid">

        {services.map((service, index) => (
          <article
            className="service-card"
            key={service.id}
          >

            <div className="service-top">

              <span className="service-number">
                {String(index + 1).padStart(2, '0')}
              </span>

              <span className="service-icon">
                {service.icon}
              </span>

            </div>

            <div className="service-content">

              <h3>
                {service.title}
              </h3>

              <p>
                {service.description}
              </p>

              <div className="service-tags">
                <span>CONSULTORIA</span>
                <span>SOLUÇÕES TKS</span>
              </div>

            </div>

            <Link
              to={`/servicos/${service.id}`}
              className="service-link"
            >
              Saiba mais
              <span>→</span>
            </Link>

          </article>
        ))}

        </div>
      )}

    </section>
  )
}

export default Services