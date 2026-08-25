import Breadcrumbs from '../components/Breadcrumbs'

function PrivacyPage() {
  return (
    <main className="page legal-page">
      <div className="legal-shell">
        <Breadcrumbs current="Privacidade" />
        <span className="legal-kicker">TRANSPARÊNCIA</span>
        <h1>Política de privacidade</h1>
        <p className="legal-lead">A TKS respeita sua privacidade e trata os dados enviados pelo site com responsabilidade e segurança.</p>
        <section><h2>Dados coletados</h2><p>Coletamos os dados informados nos formulários de contato, como nome, e-mail, serviço de interesse e mensagem, para responder solicitações e organizar o atendimento.</p></section>
        <section><h2>Uso das informações</h2><p>As informações são usadas para comunicação relacionada à solicitação, prestação de serviços e melhoria da experiência. Não vendemos dados pessoais.</p></section>
        <section><h2>Armazenamento e segurança</h2><p>Adotamos medidas técnicas e administrativas para reduzir riscos de acesso indevido. Os dados são mantidos pelo tempo necessário às finalidades informadas ou às obrigações legais.</p></section>
        <section><h2>Seus direitos</h2><p>Você pode solicitar confirmação, acesso, correção ou exclusão dos seus dados pelo e-mail <a href="mailto:iuri.aono@gmail.com">iuri.aono@gmail.com</a>.</p></section>
      </div>
    </main>
  )
}

export default PrivacyPage
