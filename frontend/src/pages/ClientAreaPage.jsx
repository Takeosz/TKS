import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

const metrics = [
  { label: 'Projetos ativos', value: '08', detail: '+2 no último mês' },
  { label: 'Sprints concluídas', value: '24', detail: '96% de aproveitamento' },
  { label: 'Tempo de resposta', value: '4h', detail: 'Suporte prioritário' },
  { label: 'Atenção geral', value: '9.8/10', detail: 'Satisfação do cliente' },
]

const roadmap = [
  { phase: 'Diagnóstico', status: 'Concluído', date: '12 Mar', color: 'green' },
  { phase: 'Design UX', status: 'Em andamento', date: '18 Mar', color: 'blue' },
  { phase: 'Desenvolvimento', status: 'Planejado', date: '26 Mar', color: 'amber' },
  { phase: 'Go live', status: 'Agendado', date: '08 Abr', color: 'purple' },
]

const tasks = [
  'Revisão da arquitetura de automação',
  'Validação das integrações do CRM',
  'Aprovação final do layout da área de clientes',
  'Conferência de performance e segurança',
]

const supportHighlights = [
  'A TKS AI pode explicar status do projeto, próximos passos e pendências de forma direta.',
  'Você consegue acompanhar evolução por sprint, entregas e riscos operacionais em um único painel.',
  'A equipe de execução responde por canal unificado com foco em decisão e velocidade.',
]

function ClientAreaPage() {
  const storageKey = 'tks-client-executive-panel'
  const [executiveSuggestions, setExecutiveSuggestions] = useState([
    'Quais métricas importam mais agora?',
    'Qual é o próximo passo mais estratégico?',
    'Onde a TKS deve agir primeiro?',
  ])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)

      if (saved) {
        const parsed = JSON.parse(saved)

        if (Array.isArray(parsed) && parsed.length > 0) {
          setExecutiveSuggestions(parsed)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar sugestões executivas do cliente:', error)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(executiveSuggestions))
    } catch (error) {
      console.error('Erro ao salvar sugestões executivas do cliente:', error)
    }
  }, [executiveSuggestions])

  const executiveSummary = useMemo(() => [
    'A execução atual está com boa velocidade e a maior vantagem está em reforçar a automação e o acompanhamento das ações prioritárias.',
    'A melhor sequência agora é alinhar entregas, reduzir ruído operacional e priorizar o que mais impacta resultado.',
    'A TKS AI pode apoiar a tomada de decisão com visão estratégica, clareza e foco na execução.',
  ], [])

  const recommendedActions = useMemo(() => [
    'Reforçar a priorização das entregas com maior impacto para o cliente.',
    'Reduzir bottlenecks de aprovação e comunicação entre as áreas de execução.',
    'Usar a TKS AI para transformar pendências em planejamento claro e prático.',
  ], [])

  return (
    <div className="client-area-page page">
      <section className="client-area-hero">
        <div className="client-area-hero-copy">
          <span className="eyebrow">Área do cliente</span>
          <h1>Portal premium da TKS</h1>
          <p>
            Acompanhe projetos, metas, entregas e próximos passos com uma visão estratégica e muito mais clara.
          </p>
          <div className="client-area-actions">
            <Link to="/dashboard" className="primary-button">Abrir painel</Link>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                localStorage.setItem('tks-client-business-analysis', 'true')
                window.location.href = '/dashboard'
              }}
            >
              Pedir análise do negócio
            </button>
            <Link to="/contato" className="secondary-button">Falar com a equipe</Link>
          </div>
        </div>

        <div className="client-area-card-highlight">
          <div className="mini-badge">Status do projeto</div>
          <strong>Transformação digital em execução</strong>
          <div className="progress-row">
            <span>Progresso geral</span>
            <span>78%</span>
          </div>
          <div className="progress-bar">
            <span />
          </div>
          <ul>
            <li>Último checkpoint: 2h atrás</li>
            <li>Próxima entrega: sprint de automação</li>
          </ul>
        </div>
      </section>

      <section className="client-metrics-grid">
        {metrics.map((item) => (
          <article key={item.label} className="client-metric-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </article>
        ))}
      </section>

      <section className="client-grid">
        <article className="client-panel executive-panel">
          <div className="panel-header">
            <span>Executivo</span>
            <h2>Visão estratégica</h2>
          </div>

          <div className="executive-summary-list">
            {executiveSummary.map((item) => (
              <div key={item} className="executive-summary-item">
                <span className="executive-dot" />
                <p>{item}</p>
              </div>
            ))}
          </div>

          <div className="executive-suggestions">
            {executiveSuggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => setExecutiveSuggestions((previous) => [suggestion, ...previous.filter((item) => item !== suggestion)].slice(0, 4))}>
                {suggestion}
              </button>
            ))}
          </div>

          <div className="executive-actions-box">
            <strong>Ações recomendadas</strong>
            <ul>
              {recommendedActions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </article>

        <article className="client-panel">
          <div className="panel-header">
            <span>Roadmap</span>
            <h2>Planejamento estratégico</h2>
          </div>

          <div className="roadmap-list">
            {roadmap.map((step) => (
              <div key={step.phase} className="roadmap-item">
                <div className={`dot ${step.color}`} />
                <div>
                  <strong>{step.phase}</strong>
                  <small>{step.date}</small>
                </div>
                <span className={`status ${step.color}`}>{step.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="client-panel">
          <div className="panel-header">
            <span>Prioridades</span>
            <h2>Próximas ações</h2>
          </div>

          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="client-panel support-panel">
        <div className="panel-header">
          <span>TKS AI</span>
          <h2>Assistente consultiva para clientes</h2>
        </div>

        <div className="support-grid">
          {supportHighlights.map((item) => (
            <div key={item} className="support-item">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ClientAreaPage
