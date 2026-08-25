import { Link } from 'react-router-dom'

function Breadcrumbs({ current }) {
  return (
    <nav className="breadcrumbs" aria-label="Navegação estrutural">
      <Link to="/">Início</Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{current}</span>
    </nav>
  )
}

export default Breadcrumbs
