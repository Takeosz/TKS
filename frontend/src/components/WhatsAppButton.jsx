const whatsappUrl = 'https://wa.me/5516991445287?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20sobre%20uma%20solu%C3%A7%C3%A3o%20para%20minha%20empresa.'

function WhatsAppButton() {
  return (
    <a
      className="whatsapp-button"
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar com a TKS pelo WhatsApp"
    >
      <span>◔</span>
      Falar no WhatsApp
    </a>
  )
}

export default WhatsAppButton
