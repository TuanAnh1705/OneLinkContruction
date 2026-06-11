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

    // Drive Lenis from GSAP ticker so both stay frame-locked
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)

    // Disable lag compensation — prevents GSAP from skipping ahead during heavy frames
    gsap.ticker.lagSmoothing(0)

    // Keep ScrollTrigger position in sync with Lenis scroll values
    lenis.on('scroll', ScrollTrigger.update)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
