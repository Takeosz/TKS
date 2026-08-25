import heroImage from '../assets/hero.png'
import { useRef } from 'react'

function Hero() {
  const heroRef = useRef(null)

  const handlePointerMove = (event) => {
    if (!heroRef.current || event.pointerType === 'touch') {
      return
    }

    const bounds = heroRef.current.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100
    const offsetX = (x - 50) * 0.16
    const offsetY = (y - 50) * 0.16

    heroRef.current.style.setProperty('--hero-pointer-x', `${x}%`)
    heroRef.current.style.setProperty('--hero-pointer-y', `${y}%`)
    heroRef.current.style.setProperty('--hero-offset-x', `${offsetX}px`)
    heroRef.current.style.setProperty('--hero-offset-y', `${offsetY}px`)
  }

  return (
    <section ref={heroRef} id="inicio" className="hero" onPointerMove={handlePointerMove}>

      <div className="hero-background">
        <img
          src={heroImage}
          alt=""
        />
      </div>

      <div className="hero-overlay"></div>

      <div className="hero-interactive-visual" aria-hidden="true">
        <div className="hero-visual-grid"></div>
        <div className="hero-visual-frame hero-visual-frame-large"></div>
        <div className="hero-visual-frame hero-visual-frame-small"></div>
        <div className="hero-pointer-light"></div>
      </div>

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
