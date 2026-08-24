import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { API_URL } from '../config/api'

function Projects({ variant = 'section' }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `${API_URL}/projects/public`
        )

        const data = await response.json()

        if (!response.ok || !data.success) {
          setError(
            data.message || 'Erro ao carregar projetos.'
          )
          return
        }

        setProjects(data.projects || [])
      } catch (error) {
        console.error(
          'Erro ao buscar projetos:',
          error
        )

        setError(
          'Não foi possível conectar ao servidor.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [retryKey])

  const categories = [...new Set(
    projects.map((project) => project.category).filter(Boolean)
  )]

  const filteredProjects = projects.filter((project) =>
    categoryFilter === 'all' || project.category === categoryFilter
  )

  return (
    <section
      id="projetos"
      className={`projects-section ${variant === 'page' ? 'projects-page' : ''}`}
    >
      <div className={`section-header ${variant === 'page' ? 'projects-page-header' : ''}`}>

        <div>
          <span>PROJETOS</span>

          <h2>
            O que estamos
            <strong> construindo.</strong>
          </h2>
        </div>

        <p>
          Soluções pensadas para transformar desafios complexos em experiências digitais mais eficientes.
        </p>

      </div>

      {loading && (
        <div className="projects-status">
          Carregando projetos...
        </div>
      )}

      {error && (
        <div className="projects-status">
          {error}
          <button type="button" onClick={() => setRetryKey((value) => value + 1)}>
            Tentar novamente
          </button>
        </div>
      )}

      {!loading &&
        !error &&
        projects.length === 0 && (
          <div className="projects-status">
            Nenhum projeto cadastrado.
          </div>
        )}

      {!loading &&
        !error &&
        projects.length > 0 && (
          <>
          {categories.length > 0 && (
            <div className="projects-filter">
              <label htmlFor="public-project-filter">
                Filtrar projetos
              </label>
              <select
                id="public-project-filter"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">Todos</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          )}
          <div className="projects-grid">

            {filteredProjects.map((project, index) => (
              <article
                className={`project-card ${
                  project.image ? 'has-image' : ''
                }`}
                key={project.id}
              >

                <div className="project-category">
                  {String(index + 1).padStart(2, '0')} / {project.category || 'TKS'}
                </div>

                {project.image && (
                  <img
                    src={project.image}
                    alt={`Imagem do projeto ${project.title}`}
                    className="project-image"
                    loading="lazy"
                  />
                )}

                <div className="project-content">

                  <h3>
                    {project.title}
                  </h3>

                  <p>
                    {project.description ||
                      'Projeto desenvolvido pela TKS.'}
                  </p>

                  <div className="project-actions">
                    <Link className="project-link" to={`/projetos/${project.id}`}>
                      Ver detalhes <span aria-hidden="true">↗</span>
                    </Link>

                    {project.link && (
                      <a
                        className="project-link secondary"
                        href={project.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Acessar site <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>

                </div>

                <span className="project-arrow">
                  ↗
                </span>

              </article>
            ))}

          </div>
          </>
        )}
    </section>
  )
}

export default Projects
