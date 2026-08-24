const testimonials = [
  {
    quote:
      'A TKS trouxe clareza para o processo desde o primeiro diagnóstico. A solução ficou mais objetiva e a evolução foi muito mais natural.',
    author: 'João Pereira',
    role: 'Diretor de operação',
  },
  {
    quote:
      'O trabalho foi extremamente útil para organizar a operação, reduzir falhas e dar mais previsibilidade ao crescimento do negócio.',
    author: 'Marina Costa',
    role: 'Fundadora',
  },
  {
    quote:
      'A comunicação foi direta, o processo foi bem estruturado e o resultado final ficou alinhado com o que a empresa precisava.',
    author: 'Lucas Almeida',
    role: 'Gestor de tecnologia',
  },
]

function Testimonials() {
  return (
    <section className="testimonials-section" id="depoimentos" aria-labelledby="testimonials-title">
      <div className="section-header testimonials-header">
        <div>
          <span>DEPOIMENTOS</span>
          <h2 id="testimonials-title">
            Quem confia no
            <strong> processo.</strong>
          </h2>
        </div>
        <p>
          Mais do que entregar código, a TKS cria estrutura para decisões melhores e resultados com mais consistência.
        </p>
      </div>

      <div className="testimonial-grid">
        {testimonials.map((item) => (
          <article className="testimonial-card" key={item.author}>
            <div className="testimonial-stars" aria-label="Avaliação de 5 estrelas">★★★★★</div>
            <p className="testimonial-quote">“{item.quote}”</p>
            <div className="testimonial-author">
              <strong>{item.author}</strong>
              <span>{item.role}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Testimonials
