const benefits = [
  {
    title: 'Estratégia antes da execução',
    text: 'Mapeamos objetivos, riscos e oportunidades para que cada decisão tenha direção, clareza e justificativa.',
    tag: 'Diagnóstico',
  },
  {
    title: 'Soluções desenhadas para o negócio',
    text: 'Entendemos a operação, a rotina e a escala do que precisa ser criado ou melhorado para entregar crescimento real.',
    tag: 'Customização',
  },
  {
    title: 'Segurança e evolução contínua',
    text: 'Pensamos em desempenho, proteção, manutenção e escala para que a solução siga funcionando no dia a dia.',
    tag: 'Segurança',
  },
  {
    title: 'Comunicação clara e orientada a ação',
    text: 'Você acompanha o progresso com linguagem direta, sem ruído técnico e sem perder contexto estratégico.',
    tag: 'Acompanhamento',
  },
]

function WhyChooseUs() {
  return (
    <section className="benefits-section" id="diferenciais" aria-labelledby="benefits-title">
      <div className="section-header benefits-header">
        <div>
          <span>POR QUE A TKS</span>
          <h2 id="benefits-title">
            Um parceiro que
            <strong> entende execução.</strong>
          </h2>
        </div>
        <p>
          A TKS combina análise, tecnologia e acompanhamento para transformar ideias em operações mais claras, rápidas e preparadas para crescer.
        </p>
      </div>

      <div className="benefits-grid">
        {benefits.map((benefit) => (
          <article className="benefit-card" key={benefit.title}>
            <div className="benefit-card-header">
              <span className="benefit-tag">{benefit.tag}</span>
              <span className="benefit-icon">↗</span>
            </div>
            <h3>{benefit.title}</h3>
            <p>{benefit.text}</p>
          </article>
        ))}
      </div>

      <div className="benefits-cta-bar">
        <div>
          <span>Consultoria estratégica</span>
          <strong>Foco em clareza, velocidade e resultado.</strong>
        </div>
        <a href="#contato" className="primary-button">Agendar diagnóstico</a>
      </div>
    </section>
  )
}

export default WhyChooseUs
