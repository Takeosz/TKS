import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { API_URL } from '../config/api'

function ProjectDetailPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_URL}/projects/${id}`)
        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Erro ao carregar projeto.')
        }

        setProject(data.project)
      } catch (error) {
        console.error('Erro ao buscar projeto:', error)
        setError(error.message || 'Não foi possível carregar o projeto.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProject()
    }
  }, [id])

  return (
    <main className="page detail-page">
      <div className="detail-shell">
        <Link className="back-link" to="/projetos">← Voltar para projetos</Link>

        {loading && <div className="detail-state">Carregando projeto...</div>}

        {error && <div className="detail-state error">{error}</div>}

        {!loading && !error && project && (
          <article className="detail-card project-detail-card">
            <div className="detail-badge">PROJETO</div>
            <h1>{project.title}</h1>

            {project.image && (
              <img className="detail-image" src={project.image} alt={project.title} />
            )}

            <div className="detail-meta">
              {project.category && <span>{project.category}</span>}
              {project.link && <a href={project.link} target="_blank" rel="noreferrer">Acessar projeto</a>}
            </div>

            <p className="detail-summary">{project.description || 'Descrição do projeto em desenvolvimento.'}</p>

            <div className="detail-actions">
              <Link className="primary-button" to={`/contato?service=${encodeURIComponent(project.category || 'Desenvolvimento')}`}>
                Falar sobre um projeto similar
              </Link>
              <Link className="secondary-button" to="/projetos">
                Ver outros projetos
              </Link>
            </div>
          </article>
        )}
      </div>
    </main>
  )
}

export default ProjectDetailPage
