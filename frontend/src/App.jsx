import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ContactPage from './pages/ContactPage'
import Process from './components/Process'
import TksAiSection from './components/TksAiSection'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResetPassword from './pages/ResetPassword'
import DashboardPage from './pages/DashboardPage'
import ClientAreaPage from './pages/ClientAreaPage'

function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  useEffect(() => {
    const routeMetadata = [
      ['/', 'TKS Technology Solutions | Tecnologia para crescer', 'Produtos digitais, automações e segurança para empresas que precisam crescer com controle.'],
      ['/sobre', 'Sobre a TKS | Technology Solutions', 'Conheça a TKS e nossa forma de transformar desafios tecnológicos em resultados concretos.'],
      ['/servicos', 'Serviços de Tecnologia, IA e Segurança | TKS', 'Desenvolvimento, inteligência artificial, automações e segurança para empresas.'],
      ['/projetos', 'Projetos Digitais e Sistemas | TKS', 'Conheça projetos digitais, sistemas e soluções desenvolvidos pela TKS.'],
      ['/contato', 'Fale com a TKS', 'Compartilhe seu desafio e encontre uma direção concreta para o próximo passo.'],
      ['/processo', 'Como Atuamos | TKS', 'Um processo claro para transformar desafios complexos em soluções digitais eficientes.'],
      ['/tks-al', 'TKS AL | Inteligência Executiva', 'Diagnóstico estratégico, priorização e orientação executiva para acelerar decisões.'],
    ]

    const metadata = routeMetadata.find(([path]) =>
      path === location.pathname || (path !== '/' && location.pathname.startsWith(`${path}/`))
    ) || routeMetadata[0]

    document.title = metadata[1]

    let description = document.querySelector('meta[name="description"]')

    if (!description) {
      description = document.createElement('meta')
      description.name = 'description'
      document.head.appendChild(description)
    }

    description.content = metadata[2]
  }, [location.pathname])

  return (
    <>
      <Routes>

        {/* SITE PÚBLICO */}

        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          }
        />

      <Route
        path="/sobre"
        element={
          <>
            <Navbar />
            <AboutPage />
            <Footer />
          </>
        }
      />

      <Route
        path="/servicos"
        element={
          <>
            <Navbar />
            <ServicesPage />
            <Footer />
          </>
        }
      />

      <Route
        path="/servicos/:id"
        element={
          <>
            <Navbar />
            <ServiceDetailPage />
            <Footer />
          </>
        }
      />

      <Route
        path="/projetos"
        element={
          <>
            <Navbar />
            <ProjectsPage />
            <Footer />
          </>
        }
      />

      <Route
        path="/projetos/:id"
        element={
          <>
            <Navbar />
            <ProjectDetailPage />
            <Footer />
          </>
        }
      />

      <Route
        path="/contato"
        element={
          <>
            <Navbar />
            <ContactPage />
            <Footer />
          </>
        }
      />

      <Route
        path="/processo"
        element={
          <>
            <Navbar />
            <main className="standalone-process-page">
              <Process variant="page" />
            </main>
            <Footer />
          </>
        }
      />

      <Route
        path="/tks-al"
        element={
          <>
            <Navbar />
            <main className="page tks-ai-page">
              <TksAiSection />
            </main>
            <Footer />
          </>
        }
      />

      {/* AUTENTICAÇÃO */}

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/cadastro"
        element={<RegisterPage />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      <Route
        path="/cliente"
        element={
          <>
            <Navbar />
            <ClientAreaPage />
            <Footer />
          </>
        }
      />

      {/* ÁREA PROTEGIDA */}

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          {/* Mantém /painel funcionando também */}
          <Route
            path="/painel"
            element={<DashboardPage />}
          />

          <Route
            path="/dashboard/cliente"
            element={<ClientAreaPage />}
          />
        </Route>

      </Routes>
    </>
  )
}

export default App