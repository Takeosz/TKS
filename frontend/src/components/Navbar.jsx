import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  function closeMenu() {
    setMenuOpen(false)
  }

  function isActive(path, hash = '') {
    if (path === '/' && location.pathname !== '/') {
      return false
    }

    if (path !== '/' && location.pathname !== path && !location.pathname.startsWith(`${path}/`)) {
      return false
    }

    return !hash || location.hash === hash
  }

  return (
    <header className="navbar">

      <Link
        to="/"
        className="logo"
        onClick={closeMenu}
      >
        <span className="logo-main">
          TKS
        </span>

        <span className="logo-sub">
          TECHNOLOGY SOLUTIONS
        </span>
      </Link>

      <nav className="desktop-menu">
        <Link className={isActive('/') && !location.hash ? 'active' : ''} to="/">Início</Link>
        <Link className={isActive('/sobre') ? 'active' : ''} to="/sobre">Sobre</Link>
        <Link className={isActive('/servicos') ? 'active' : ''} to="/servicos">Serviços</Link>
        <Link className={isActive('/projetos') ? 'active' : ''} to="/projetos">Projetos</Link>
        <Link className={isActive('/contato') ? 'active' : ''} to="/contato">Contato</Link>
        <Link className={isActive('/processo') ? 'active' : ''} to="/processo">Como atuamos</Link>
        <Link className={`navbar-ai-button ${isActive('/tks-al') ? 'active' : ''}`} to="/tks-al">Inteligência Executiva</Link>
      </nav>

      <Link
        to="/login"
        className="navbar-button"
      >
        Área do cliente
      </Link>

      <button
        className={`mobile-menu-button ${
          menuOpen ? 'active' : ''
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menu"
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav
        className={`mobile-menu ${
          menuOpen ? 'open' : ''
        }`}
      >
        <Link className={isActive('/') && !location.hash ? 'active' : ''} to="/" onClick={closeMenu}>
          Início
        </Link>

        <Link className={isActive('/sobre') ? 'active' : ''} to="/sobre" onClick={closeMenu}>
          Sobre
        </Link>

        <Link className={isActive('/servicos') ? 'active' : ''} to="/servicos" onClick={closeMenu}>
          Serviços
        </Link>

        <Link className={isActive('/projetos') ? 'active' : ''} to="/projetos" onClick={closeMenu}>
          Projetos
        </Link>

        <Link className={isActive('/contato') ? 'active' : ''} to="/contato" onClick={closeMenu}>
          Contato
        </Link>

        <Link className={isActive('/processo') ? 'active' : ''} to="/processo" onClick={closeMenu}>Como atuamos</Link>
        <Link className={`mobile-ai-button ${isActive('/tks-al') ? 'active' : ''}`} to="/tks-al" onClick={closeMenu}>Inteligência Executiva</Link>
        <Link to="/login" onClick={closeMenu}>Área do cliente</Link>
      </nav>

    </header>
  )
}

export default Navbar
