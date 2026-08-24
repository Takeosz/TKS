const questions = [
  {
    question: 'A TKS atende projetos sob medida?',
    answer: 'Sim. Começamos entendendo o contexto e desenhamos uma solução adequada às prioridades do negócio.',
  },
  {
    question: 'Posso contratar apenas uma consultoria?',
    answer: 'Sim. Atuamos desde diagnósticos pontuais até desenvolvimento, automação e acompanhamento contínuo.',
  },
  {
    question: 'Como funciona o primeiro contato?',
    answer: 'Você compartilha seu desafio pelo formulário. A TKS avalia o contexto e retorna com uma direção clara para a conversa.',
  },
  {
    question: 'A segurança é considerada desde o início?',
    answer: 'Sim. Segurança e privacidade fazem parte das decisões técnicas desde o diagnóstico até a evolução da solução.',
  },
]

function Faq() {
  return (
    <section className="faq-section" aria-labelledby="faq-title">
      <div className="section-header">
        <div>
          <span>DÚVIDAS FREQUENTES</span>
          <h2 id="faq-title">
            Antes de começar,
            <strong> clareza.</strong>
          </h2>
        </div>
        <p>As respostas essenciais para entender como a TKS pode entrar no seu próximo desafio.</p>
      </div>

      <div className="faq-list">
        {questions.map((item) => (
          <details className="faq-item" key={item.question}>
            <summary>{item.question}<span aria-hidden="true">+</span></summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export default Faq
