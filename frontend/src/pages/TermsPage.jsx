import Breadcrumbs from '../components/Breadcrumbs'

function TermsPage() {
  return (
    <main className="page legal-page">
      <div className="legal-shell">
        <Breadcrumbs current="Termos de uso" />
        <span className="legal-kicker">TKS TECHNOLOGY SOLUTIONS</span>
        <h1>Termos de uso</h1>
        <p className="legal-lead">Estes termos definem as condições gerais para utilização do site e dos canais digitais da TKS.</p>
        <section><h2>Uso do site</h2><p>O conteúdo do site tem finalidade informativa. O envio de um formulário não representa contratação ou garantia de disponibilidade de um serviço.</p></section>
        <section><h2>Conteúdo e links</h2><p>Buscamos manter as informações atualizadas, mas alguns conteúdos podem ser alterados sem aviso. Links externos possuem suas próprias políticas e responsabilidades.</p></section>
        <section><h2>Contato e propostas</h2><p>Cada projeto é analisado individualmente. Escopo, prazo, investimento e condições são definidos em proposta específica.</p></section>
        <section><h2>Responsabilidade</h2><p>Não utilize o site para atividades ilícitas, tentativas de acesso indevido ou envio de conteúdo malicioso. Dúvidas podem ser encaminhadas para <a href="mailto:iuri.aono@gmail.com">iuri.aono@gmail.com</a>.</p></section>
      </div>
    </main>
  )
}

export default TermsPage
