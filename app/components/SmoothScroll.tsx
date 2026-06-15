'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    ;(window as any).__lenis = lenis

    // Drive Lenis from GSAP ticker so both stay frame-locked
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    lenis.on('scroll', ScrollTrigger.update)

    // Intercept anchor clicks — route through lenis.scrollTo for smooth scroll
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || !href.startsWith('#')) return
      const id = href.slice(1)
      // Bare "#" = footer placeholder, prevent jump to top but don't scroll
      if (!id) { e.preventDefault(); return }
      // "#top" = scroll to top of page
      if (id === 'top') { e.preventDefault(); lenis.scrollTo(0, { duration: 1.2 }); return }
      const target = document.getElementById(id)
      if (!target) return
      e.preventDefault()
      lenis.scrollTo(target, { duration: 1.2 })
    }

    document.addEventListener('click', handleAnchorClick)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      document.removeEventListener('click', handleAnchorClick)
      delete (window as any).__lenis
    }
  }, [])

  return <>{children}</>
}
