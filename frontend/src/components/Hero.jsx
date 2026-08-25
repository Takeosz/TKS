import heroImage from '../assets/hero.png'

function Hero() {
  return (
    <section id="inicio" className="hero">

      <div className="hero-background">
        <img
          src={heroImage}
          alt=""
        />
      </div>

      <div className="hero-overlay"></div>

      <div className="hero-content">

        <span className="hero-tag">
          TKS • TECHNOLOGY SOLUTIONS
        </span>

        <h1>
          Tecnologia para
          <span> crescer com segurança.</span>
        </h1>

        <p>
          Desenvolvemos produtos digitais, automações e estruturas de TI para
          empresas que precisam transformar desafios em resultados concretos.
        </p>

        <div className="hero-buttons">

          <a
            href="#servicos"
            className="primary-button"
          >
            Falar sobre meu projeto
          </a>

          <a
            href="#processo"
            className="secondary-button"
          >
            Ver como atuamos
          </a>

        </div>

        <div className="hero-status">
          <span></span>

          Estratégia • Desenvolvimento • Segurança
        </div>

      </div>

    </section>
  )
}

export default Hero
