const cases = [
  {
    number: '01',
    label: 'PRODUTO DIGITAL',
    title: 'Da ideia ao próximo passo',
    result: 'Mais clareza para decidir e validar prioridades.',
    description: 'Estruturamos experiências digitais com foco no problema real e na evolução do negócio.',
  },
  {
    number: '02',
    label: 'SEGURANÇA',
    title: 'Operação mais protegida',
    result: 'Menos exposição e mais confiança na rotina.',
    description: 'Mapeamos riscos e organizamos medidas de proteção que cabem na operação.',
  },
  {
    number: '03',
    label: 'AUTOMAÇÃO',
    title: 'Processos que avançam',
    result: 'Mais agilidade onde o trabalho se repetia.',
    description: 'Conectamos ferramentas e criamos fluxos mais simples, rastreáveis e eficientes.',
  },
]

function CaseStudies() {
  return (
    <section className="cases-section" aria-labelledby="cases-title">
      <div className="section-header cases-header">
        <div>
          <span>RESULTADOS TKS</span>
          <h2 id="cases-title">
            Tecnologia que gera
            <strong> resultado.</strong>
          </h2>
        </div>

        <p>
          Cada projeto nasce de um desafio concreto e termina com um próximo passo mais claro.
        </p>
      </div>

      <div className="cases-grid">
        {cases.map((item) => (
          <article className="case-card" key={item.number}>
            <div className="case-topline">
              <span>{item.number}</span>
              <span>{item.label}</span>
            </div>
            <h3>{item.title}</h3>
            <strong>{item.result}</strong>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default CaseStudies
