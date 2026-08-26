function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <span className="logo-main">TKS</span>
        <span className="logo-sub">TECHNOLOGY SOLUTIONS</span>
      </div>

      <div className="footer-links">
        <a href="/sobre">Sobre</a>
        <a href="/servicos">Serviços</a>
        <a href="/projetos">Projetos</a>
        <a href="/contato">Contato</a>
        <a href="/privacidade">Privacidade</a>
        <a href="/termos">Termos</a>
      </div>

      <div className="footer-contact">
        <a href="mailto:iuri.aono@gmail.com">iuri.aono@gmail.com</a>
        <a href="https://instagram.com/i.aono_" target="_blank" rel="noreferrer">
          Instagram @i.aono_
        </a>
      </div>

      <div className="footer-social" aria-label="Redes sociais da TKS">
        <h2>Siga a TKS</h2>
        <div className="footer-social-links">
          <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3.3 0-5 1.8-5 5v3H6v4h3v8h4v-8h3.2l.8-4H13V9c0-.7.3-1 1-1Z" /></svg>
          </a>
          <a href="https://x.com/" target="_blank" rel="noreferrer" aria-label="X">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4.2l3.1 4.5L16.2 4H19l-5.3 6.2L19.5 20h-4.2l-3.6-5.1L7.2 20H4.5l5.5-6.8L5 4Zm3 1.7 8.2 12.6h.6L8.6 5.7H8Z" /></svg>
          </a>
          <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2C2 9 2 12 2 12s0 3 .4 4.8a2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2c.4-1.8.4-4.8.4-4.8s0-3-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" /></svg>
          </a>
          <a href="https://instagram.com/i.aono_" target="_blank" rel="noreferrer" aria-label="Instagram">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.8" r="1" className="social-icon-dot" /></svg>
          </a>
        </div>
      </div>

      <p>
        © 2026 TKS. Todos os direitos reservados.
      </p>
    </footer>
  )
}

export default Footer
