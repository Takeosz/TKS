const stats = [
  { value: '4+', label: 'anos entregando soluções', detail: 'com foco em resultado e clareza' },
  { value: '20+', label: 'projetos em diferentes etapas', detail: 'de diagnóstico até execução' },
  { value: '98%', label: 'de aproximação começa por escuta', detail: 'entendimento do problema real' },
  { value: '24/7', label: 'apoio para operação crítica', detail: 'com atenção e acompanhamento' },
]

function ImpactStats() {
  return (
    <section className="metrics-section" aria-label="Estatísticas da TKS">
      <div className="section-header metrics-header">
        <div>
          <span>IMPACTO REAL</span>
          <h2>
            Mais clareza,
            <strong> menos ruído.</strong>
          </h2>
        </div>
        <p>
          Cada etapa do trabalho é pensada para reduzir incertezas e criar um caminho de execução mais eficiente.
        </p>
      </div>

      <div className="metrics-grid">
        {stats.map((item) => (
          <article className="metric-card" key={item.label}>
            <strong>{item.value}</strong>
            <h3>{item.label}</h3>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ImpactStats
