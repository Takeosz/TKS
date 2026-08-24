const points = [
  'Estratégia antes do código',
  'Segurança desde o início',
  'Comunicação direta e transparente',
]

function Proof() {
  return (
    <section className="proof-section" aria-label="Diferenciais da TKS">
      <p>PARCERIA TECNOLÓGICA PARA DECISÕES IMPORTANTES</p>

      <div className="proof-points">
        {points.map((point) => (
          <span key={point}>
            <b>✓</b>
            {point}
          </span>
        ))}
      </div>
    </section>
  )
}

export default Proof
