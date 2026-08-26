import { useEffect } from 'react'

export function InteractiveFX() {
  useEffect(() => {
    let activeCard = null

    const targetSelector = [
      '.service-card',
      '.project-card',
      '.case-card',
      '.benefit-card',
      '.metric-card',
      '.testimonial-card',
      '.tks-ai-value-card',
      '.tks-ai-highlight-card',
      '.tks-ai-metric-card',
      '.proof-section',
      '.process-step',
      '.primary-button',
      '.secondary-button',
      '.navbar-button',
      '.navbar-ai-button',
      '.whatsapp-button',
      '.footer-social-links a',
    ].join(', ')

    const handlePointerMove = (event) => {
      if (event.pointerType === 'touch') {
        return
      }

      const target = event.target.closest(targetSelector)

      if (!target) {
        if (activeCard) {
          activeCard.style.setProperty('--tilt-x', '0deg')
          activeCard.style.setProperty('--tilt-y', '0deg')
          activeCard.classList.remove('is-hovered')
          activeCard = null
        }
        return
      }

      if (activeCard && activeCard !== target) {
        activeCard.style.setProperty('--tilt-x', '0deg')
        activeCard.style.setProperty('--tilt-y', '0deg')
        activeCard.classList.remove('is-hovered')
      }

      activeCard = target
      target.classList.add('is-hovered')

      const rect = target.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const pctX = (x / rect.width) * 100
      const pctY = (y / rect.height) * 100

      // Calculate subtle 3D tilt angles (max +/- 8deg)
      const tiltX = ((x / rect.width) - 0.5) * 8
      const tiltY = ((y / rect.height) - 0.5) * -8

      // Calculate magnetic shift for buttons (max +/- 10px)
      const magX = ((x / rect.width) - 0.5) * 10
      const magY = ((y / rect.height) - 0.5) * 10

      target.style.setProperty('--mouse-x', `${x}px`)
      target.style.setProperty('--mouse-y', `${y}px`)
      target.style.setProperty('--mouse-pct-x', `${pctX}%`)
      target.style.setProperty('--mouse-pct-y', `${pctY}%`)
      target.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`)
      target.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`)
      target.style.setProperty('--magnetic-x', `${magX.toFixed(2)}px`)
      target.style.setProperty('--magnetic-y', `${magY.toFixed(2)}px`)
    }

    const handlePointerOut = (event) => {
      const target = event.target.closest(targetSelector)
      if (target) {
        if (event.relatedTarget && target.contains(event.relatedTarget)) {
          return
        }
        target.style.setProperty('--tilt-x', '0deg')
        target.style.setProperty('--tilt-y', '0deg')
        target.style.setProperty('--magnetic-x', '0px')
        target.style.setProperty('--magnetic-y', '0px')
        target.classList.remove('is-hovered')
      }
    }

    document.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.addEventListener('pointerout', handlePointerOut, { passive: true })

    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerout', handlePointerOut)
    }
  }, [])

  return null
}

export default InteractiveFX
