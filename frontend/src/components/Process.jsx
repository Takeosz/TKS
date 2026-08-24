const steps = [
  {
    number: '01',
    title: 'Diagnóstico',
    description:
      'Entendemos o contexto, os objetivos e os riscos do seu negócio.',
  },
  {
    number: '02',
    title: 'Estratégia',
    description:
      'Definimos uma solução viável, prioridades e o caminho de execução.',
  },
  {
    number: '03',
    title: 'Entrega',
    description:
      'Construímos, validamos e evoluímos a solução com você.',
  },
  {
    number: '04',
    title: 'Evolução',
    description:
      'Acompanhamos os resultados e ajustamos o próximo passo do negócio.',
  },
]

function Process({ variant = 'section' }) {
  return (
    <section className={`process-section ${variant === 'page' ? 'process-page-section' : ''}`} id="processo">
      <div className="section-header process-header">
        <div>
          <span>COMO TRABALHAMOS</span>
          <h2>
            Clareza para decidir.
            <strong> Tecnologia para avançar.</strong>
          </h2>
        </div>

        <p>
          Projetos bem-sucedidos começam com escuta, método e objetivos claros.
        </p>
      </div>

      <div className="process-grid">
        {steps.map((step) => (
          <article className="process-step" key={step.number}>
            <span>{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Process
