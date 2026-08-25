import Hero from '../components/Hero'
import Proof from '../components/Proof'
import ImpactStats from '../components/ImpactStats'
import Services from '../components/Services'
import About from '../components/About'
import WhyChooseUs from '../components/WhyChooseUs'
import Process from '../components/Process'
import TksAiSection from '../components/TksAiSection'
import CaseStudies from '../components/CaseStudies'
import Projects from '../components/Projects'
import Testimonials from '../components/Testimonials'
import Faq from '../components/Faq'
import FinalCta from '../components/FinalCta'
import Contact from '../components/Contact'
import WhatsAppButton from '../components/WhatsAppButton'
import RevealOnScroll from '../components/RevealOnScroll'

function Home() {
  return (
    <>
      <Hero />
      <RevealOnScroll><Proof /></RevealOnScroll>
      <RevealOnScroll><ImpactStats /></RevealOnScroll>
      <RevealOnScroll><Services /></RevealOnScroll>
      <RevealOnScroll><About /></RevealOnScroll>
      <RevealOnScroll><WhyChooseUs /></RevealOnScroll>
      <RevealOnScroll><Process /></RevealOnScroll>
      <RevealOnScroll><TksAiSection /></RevealOnScroll>
      <RevealOnScroll><CaseStudies /></RevealOnScroll>
      <RevealOnScroll><Projects /></RevealOnScroll>
      <RevealOnScroll><Testimonials /></RevealOnScroll>
      <RevealOnScroll><Faq /></RevealOnScroll>
      <RevealOnScroll><FinalCta /></RevealOnScroll>
      <RevealOnScroll><Contact /></RevealOnScroll>
      <WhatsAppButton />
    </>
  )
}

export default Home
