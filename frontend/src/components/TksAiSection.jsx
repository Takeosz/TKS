import { useEffect, useMemo, useState } from 'react'
import { API_URL } from '../config/api'

const prompts = [
  'Quais riscos merecem atenção agora?',
  'Qual é a nossa prioridade executiva?',
  'Como acelerar as entregas sem perder qualidade?',
  'Como transformar a operação em vantagem competitiva?',
]

const initialMessages = [
  {
    sender: 'assistant',
    text: 'Olá! Sou a TKS AL, a inteligência executiva da TKS. Posso diagnosticar riscos, priorizar decisões e apontar o próximo passo com clareza e foco em resultado.',
  },
  {
    sender: 'user',
    text: 'Quero um diagnóstico estratégico da operação agora.',
  },
  {
    sender: 'assistant',
    text: 'Analisando o contexto, o melhor caminho é fortalecer execução, reduzir ruído operacional e alinhar a operação com prioridades que geram velocidade sem perder qualidade.',
  },
]

const metrics = [
  { value: '4h', label: 'tempo médio de resposta' },
  { value: '92%', label: 'foco em execução' },
  { value: '24/7', label: 'apoio contínuo' },
]

const valueProps = [
  { value: 'Diagnóstico', label: 'riscos, oportunidades e prioridades' },
  { value: 'Estratégia', label: 'decisões com clareza e foco' },
  { value: 'Execução', label: 'ações com velocidade e controle' },
]

const checklist = [
  'Diagnóstico de riscos e oportunidades em tempo real.',
  'Priorização de ações com foco em resultado e velocidade.',
  'Acompanhamento estratégico de projetos, operações e decisões.',
]

const focusAreas = [
  'Diagnóstico estratégico',
  'Prioridade executiva',
  'Aceleração de entregas',
]

function TksAiSection() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('tks-ai-chat')

    if (saved) {
      try {
        const parsed = JSON.parse(saved)

        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
        }
      } catch (error) {
        console.error('Erro ao ler histórico da IA:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('tks-ai-chat', JSON.stringify(messages))
  }, [messages])

  const totalMessages = useMemo(() => messages.length, [messages])

  const sendMessage = async (value) => {
    const trimmed = value.trim()

    if (!trimmed || isLoading) {
      return
    }

    const userMessage = { sender: 'user', text: trimmed }
    const loadingMessage = { sender: 'assistant', text: 'Pensando na melhor resposta para você...', isLoading: true }

    setMessages((current) => [...current, userMessage, loadingMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: trimmed }),
      })

      const data = await response.json()
      const reply = data?.reply || 'Posso te ajudar com isso. Me diga mais detalhes para eu te orientar melhor.'

      setMessages((current) => {
        const next = [...current]
        const lastIndex = next.length - 1

        if (next[lastIndex]?.isLoading) {
          next[lastIndex] = { sender: 'assistant', text: reply }
        } else {
          next.push({ sender: 'assistant', text: reply })
        }

        return next
      })
    } catch (error) {
      console.error('Erro ao chamar a IA:', error)

      setMessages((current) => {
        const next = [...current]
        const lastIndex = next.length - 1

        if (next[lastIndex]?.isLoading) {
          next[lastIndex] = {
            sender: 'assistant',
            text: 'Não consegui responder agora, mas posso te ajudar com diagnóstico estratégico e próximos passos. Me diga mais sobre o que você precisa.',
          }
        } else {
          next.push({
            sender: 'assistant',
            text: 'Não consegui responder agora, mas posso te ajudar com diagnóstico estratégico e próximos passos. Me diga mais sobre o que você precisa.',
          })
        }

        return next
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage(input)
  }

  return (
    <section className="tks-ai-section" id="tks-ai">
      <div className="tks-ai-header-shell">
        <div className="section-header tks-ai-header">
          <div className="tks-ai-header-label-wrap">
            <span className="tks-ai-kicker">Inteligência executiva</span>
            <h2>TKS AL</h2>
          </div>

          <p>
            Diagnóstico estratégico, priorização de ações e orientação executiva em um único ponto de decisão para acelerar resultados e reduzir ruído operacional.
          </p>
        </div>
      </div>

      <div className="tks-ai-value-strip" aria-label="Principais diferenciais da TKS AL">
        {valueProps.map((item) => (
          <div key={item.value} className="tks-ai-value-card">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="tks-ai-shell">
        <div className="tks-ai-conversation-panel">
          <div className="tks-ai-panel-top">
            <div className="tks-ai-live-indicator">
              <span className="tks-ai-dot" />
              TKS AL online
            </div>
            <span className="tks-ai-badge">Consultoria ativa</span>
          </div>

          <div className="tks-ai-message-list">
            {messages.map((message, index) => (
              <div key={`${message.sender}-${index}`} className={`tks-ai-message ${message.sender}`}>
                <p>{message.text}</p>
              </div>
            ))}
          </div>

          <div className="tks-ai-suggestions">
            {prompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => sendMessage(prompt)} disabled={isLoading}>
                {prompt}
              </button>
            ))}
          </div>

          <form className="tks-ai-input-row" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Pergunte à TKS AL..."
              aria-label="Pergunte à TKS AL"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Pensando...' : 'Enviar'}
            </button>
          </form>
        </div>

        <div className="tks-ai-side-panel">
          <div className="tks-ai-highlight-card">
            <span className="eyebrow-small">Estratégia em execução</span>
            <h3>Clareza para decidir. Velocidade para agir.</h3>
            <p>
              A TKS AL organiza o que importa, identifica riscos e sugere o próximo passo mais inteligente para sua operação, liderança e crescimento.
            </p>
            <div className="tks-ai-focus-list">
              {focusAreas.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <div className="tks-ai-metrics-grid">
            {metrics.map((metric) => (
              <div key={metric.label} className="tks-ai-metric-card">
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>

          <div className="tks-ai-checklist-box">
            <h4>O que a IA ajuda a enxergar</h4>
            <ul>
              {checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TksAiSection
