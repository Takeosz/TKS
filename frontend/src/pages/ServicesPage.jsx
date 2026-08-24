import { useEffect, useState } from 'react'
import './ServicesPage.css'

import { API_URL } from '../config/api'

function ServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_URL}/services/public`
        )

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || 'Erro ao carregar serviços.'
          )
        }

        setServices(data.services || [])
      } catch (error) {
        console.error(
          'Erro ao buscar serviços:',
          error
        )

        setError(
          'Não foi possível carregar os serviços.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  return (
    <main className="services-page">

      <section className="services-page-header">

        <span>
          TKS TECHNOLOGY SOLUTIONS
        </span>

        <h1>
          Nossos Serviços
        </h1>

        <p>
          Soluções tecnológicas desenvolvidas
          para atender às necessidades da sua empresa.
        </p>

      </section>

      <section className="services-page-content">

        {loading && (
          <div className="services-loading">
            Carregando serviços...
          </div>
        )}

        {error && (
          <div className="services-error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          services.length === 0 && (
            <div className="services-empty">
              Nenhum serviço disponível no momento.
            </div>
          )}

        {!loading &&
          !error &&
          services.length > 0 && (
            <div className="services-grid">

              {services.map((service, index) => (
                <article
                  className="service-card"
                  key={service.id}
                >

                  <div className="service-card-topline">
                    <span>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span> TKS / SERVIÇOS</span>
                  </div>

                  <div className="service-icon">
                    {service.icon || '◇'}
                  </div>

                  <h2>
                    {service.title}
                  </h2>

                  <p>
                    {service.description ||
                      'Solução tecnológica da TKS.'}
                  </p>

                  <a
                    className="service-card-link"
                    href="/contato"
                  >
                    Conversar sobre este serviço
                    <span aria-hidden="true">↗</span>
                  </a>

                </article>
              ))}

            </div>
          )}

      </section>

    </main>
  )
}

export default ServicesPage
