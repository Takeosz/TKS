import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { API_URL } from '../config/api'

function Contact({ variant = 'section' }) {
  const location = useLocation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    service: '',
    timeline: '',
    budget: '',
    message: '',
  })

  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const serviceParam = params.get('service')

    if (serviceParam) {
      setFormData((previous) => ({
        ...previous,
        service: serviceParam,
      }))
    }
  }, [location.search])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await fetch(
      `${API_URL}/contact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Erro ao enviar mensagem.'
        )
      }

      setSuccessMessage(
        'Mensagem enviada com sucesso!'
      )

      setFormData({
        name: '',
        email: '',
        subject: '',
        service: '',
        timeline: '',
        budget: '',
        message: '',
      })
    } catch (error) {
      console.error(
        'Erro ao enviar mensagem:',
        error
      )

      setErrorMessage(
        error.message ||
          'Não foi possível enviar a mensagem.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="contato"
      className={`contact-section ${variant === 'page' ? 'contact-page-section' : ''}`}
    >
      <div className="section-header">
        <div>
          <span>CONTATO</span>

          <h2>
            Vamos criar algo
            <strong> juntos?</strong>
          </h2>
        </div>

        <p>
          Compartilhe seu contexto e vamos encontrar uma direção concreta para o próximo passo.
        </p>
      </div>

      <div className="contact-grid">
        <div className="contact-info">
          <p>
            Tem uma ideia, projeto ou necessidade
            tecnológica?
          </p>

          <p>
            Entre em contato com a TKS e vamos
            entender como podemos transformar sua
            ideia em uma solução.
          </p>

          <div className="contact-promise">
            <span>PRÓXIMO PASSO</span>
            <strong>Uma conversa objetiva sobre o seu desafio.</strong>
            <p>Conte o contexto. A TKS ajuda a organizar o caminho.</p>
          </div>

          <div className="contact-line">
            <span>EMAIL</span>
            <a href="mailto:iuri.aono@gmail.com">iuri.aono@gmail.com</a>
          </div>

          <div className="contact-line">
            <span>ÁREA</span>
            <strong>
              Tecnologia • Segurança • IA
            </strong>
          </div>

          <div className="contact-line">
            <span>INSTAGRAM</span>
            <a href="https://instagram.com/i.aono_" target="_blank" rel="noreferrer">@i.aono_</a>
          </div>
        </div>

        <form
          className="contact-form"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="name"
            placeholder="Seu nome"
            aria-label="Seu nome"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <div className="contact-form-row">
            <select name="service" aria-label="Serviço de interesse" value={formData.service} onChange={handleChange}>
              <option value="">Serviço de interesse</option>
              <option value="Desenvolvimento">Desenvolvimento</option>
              <option value="Cibersegurança">Cibersegurança</option>
              <option value="Inteligência Artificial">Inteligência Artificial</option>
              <option value="Consultoria em TI">Consultoria em TI</option>
            </select>

            <select name="timeline" aria-label="Prazo desejado" value={formData.timeline} onChange={handleChange}>
              <option value="">Prazo desejado</option>
              <option value="Imediato">Imediato</option>
              <option value="1 a 3 meses">1 a 3 meses</option>
              <option value="Mais de 3 meses">Mais de 3 meses</option>
            </select>
          </div>

          <select name="budget" aria-label="Faixa de investimento" value={formData.budget} onChange={handleChange}>
            <option value="">Faixa de investimento (opcional)</option>
            <option value="Até R$ 5 mil">Até R$ 5 mil</option>
            <option value="R$ 5 mil a R$ 20 mil">R$ 5 mil a R$ 20 mil</option>
            <option value="Acima de R$ 20 mil">Acima de R$ 20 mil</option>
          </select>

          <input
            type="email"
            name="email"
            placeholder="Seu e-mail"
            aria-label="Seu e-mail"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="subject"
            placeholder="Assunto"
            aria-label="Assunto"
            value={formData.subject}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Conte um pouco sobre seu projeto..."
            aria-label="Conte um pouco sobre seu projeto"
            value={formData.message}
            onChange={handleChange}
            required
            rows="6"
          />

          {successMessage && (
            <div className="contact-success" role="status" aria-live="polite">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="contact-error" role="alert">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Enviando...'
              : 'Enviar mensagem'}

            {!loading && <span>→</span>}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Contact
