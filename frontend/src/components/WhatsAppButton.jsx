const whatsappUrl = 'https://wa.me/5516991445287?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20TKS%20e%20gostaria%20de%20conversar%20sobre%20um%20projeto.'

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
