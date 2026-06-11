'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const TOTAL_FRAMES = 172

function frameSrc(n: number) {
  return `/frames/ezgif-frame-${String(n).padStart(3, '0')}.png`
}

interface Section {
  id: string
  startFrame: number
  endFrame: number
  side: 'left' | 'right' | 'center'
  tag: string
  heading: [string, string]
  body: string
  cta?: string
}

const SECTIONS: Section[] = [
  {
    id: 's1',
    startFrame: 0,
    endFrame: 33,
    side: 'left',
    tag: 'OLCO SAFETY EQUIPMENT',
    heading: ['Engineered', 'for Excellence'],
    body: 'Premium safety helmets built for the most demanding construction environments.',
  },
  {
    id: 's2',
    startFrame: 41,
    endFrame: 73,
    side: 'right',
    tag: '360° PROTECTION',
    heading: ['All-Around', 'Safety'],
    body: 'Advanced multi-impact absorption technology guards from every angle.',
  },
  {
    id: 's3',
    startFrame: 84,
    endFrame: 117,
    side: 'left',
    tag: 'PREMIUM DESIGN',
    heading: ['Form Meets', 'Function'],
    body: 'Aerodynamic shell with integrated ventilation for all-day comfort on site.',
  },
  {
    id: 's4',
    startFrame: 126,
    endFrame: 159,
    side: 'right',
    tag: 'TRUSTED WORLDWIDE',
    heading: ['Built for', 'Champions'],
    body: 'Worn by professionals across construction sites in over 50 countries.',
  },
  {
    id: 's5',
    startFrame: 159,
    endFrame: 171,
    side: 'center',
    tag: 'DISCOVER MORE',
    heading: ['Your Safety,', 'Our Priority'],
    body: 'Explore the complete OLCO safety equipment collection.',
    cta: 'View Collection',
  },
]

export default function HelmAnimation() {
  const pinnedRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // GPU-ready bitmaps: drawImage with ImageBitmap skips CPU decode on every paint
  const bitmaps = useRef<(ImageBitmap | HTMLImageElement | null)[]>(
    new Array(TOTAL_FRAMES).fill(null)
  )
  const ctx = useRef<CanvasRenderingContext2D | null>(null)
  const displayW = useRef(0)
  const displayH = useRef(0)
  const currentFrame = useRef(-1)
  const cropCache = useRef<{ sx: number; sy: number; sw: number; sh: number } | null>(null)
  const overlayRefs = useRef<(HTMLDivElement | null)[]>(new Array(SECTIONS.length).fill(null))
  const scrollCueRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const [progress, setProgress] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const w = window.innerWidth
    const h = window.innerHeight
    displayW.current = w
    displayH.current = h
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    cropCache.current = null
    const context = canvas.getContext('2d', { alpha: false, desynchronized: true })
    if (context) {
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'medium'
      ctx.current = context
    }
  }, [])

  const paintFrame = useCallback((idx: number) => {
    const context = ctx.current
    if (!context) return
    const bmp = bitmaps.current[idx]
    if (!bmp) return

    const cw = displayW.current
    const ch = displayH.current
    if (!cw || !ch) return

    if (!cropCache.current) {
      const iw = bmp instanceof ImageBitmap ? bmp.width : (bmp as HTMLImageElement).naturalWidth
      const ih = bmp instanceof ImageBitmap ? bmp.height : (bmp as HTMLImageElement).naturalHeight
      if (!iw || !ih) return
      const ia = iw / ih
      const ca = cw / ch
      let sx = 0, sy = 0, sw = iw, sh = ih
      if (ia > ca) { sw = ih * ca; sx = (iw - sw) / 2 }
      else { sh = iw / ca; sy = (ih - sh) / 2 }
      cropCache.current = { sx, sy, sw, sh }
    }

    const { sx, sy, sw, sh } = cropCache.current
    context.drawImage(bmp as CanvasImageSource, sx, sy, sw, sh, 0, 0, cw, ch)
  }, [])

  const updateOverlays = useCallback((frame: number) => {
    SECTIONS.forEach((s, i) => {
      const el = overlayRefs.current[i]
      if (!el) return
      const span = s.endFrame - s.startFrame
      const FADE = Math.max(2, Math.floor(span / 4))
      let op = 0, ty = 30

      if (frame >= s.startFrame && frame <= s.endFrame) {
        const inEnd = s.startFrame + FADE
        const outStart = s.endFrame - FADE
        if (frame <= inEnd) {
          const t = (frame - s.startFrame) / FADE
          op = t; ty = 30 * (1 - t)
        } else if (frame >= outStart) {
          const t = (frame - outStart) / FADE
          op = 1 - t; ty = -20 * t
        } else {
          op = 1; ty = 0
        }
      }

      el.style.opacity = String(op)
      el.style.transform = `translateY(${ty}px)`
    })

    const cue = scrollCueRef.current
    if (cue) cue.style.opacity = String(Math.max(0, 1 - (TOTAL_FRAMES - 1 - frame) / 8))

    const bar = progressBarRef.current
    if (bar) bar.style.width = `${((TOTAL_FRAMES - 1 - frame) / (TOTAL_FRAMES - 1)) * 100}%`
  }, [])

  // Pre-decode all frames into GPU-ready ImageBitmaps
  useEffect(() => {
    setupCanvas()

    const onResize = () => {
      setupCanvas()
      if (currentFrame.current >= 0) paintFrame(currentFrame.current)
    }
    window.addEventListener('resize', onResize)

    const hasBitmapAPI = typeof createImageBitmap !== 'undefined'
    let doneCount = 0

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      const frameIdx = i

      img.onload = async () => {
        try {
          bitmaps.current[frameIdx] = hasBitmapAPI
            ? await createImageBitmap(img)
            : img
        } catch {
          bitmaps.current[frameIdx] = img
        }
        doneCount++
        setProgress(Math.round((doneCount / TOTAL_FRAMES) * 100))
        if (frameIdx === 0) {
          setupCanvas()
          paintFrame(0)
          currentFrame.current = 0
        }
        if (doneCount === TOTAL_FRAMES) setLoaded(true)
      }
      img.onerror = () => {
        doneCount++
        if (doneCount === TOTAL_FRAMES) setLoaded(true)
      }
      img.src = frameSrc(i + 1)
    }

    return () => window.removeEventListener('resize', onResize)
  }, [setupCanvas, paintFrame])

  // GSAP pin + scrub — runs after all bitmaps are ready
  useEffect(() => {
    if (!loaded) return
    gsap.registerPlugin(ScrollTrigger)

    const el = pinnedRef.current
    if (!el) return

    currentFrame.current = TOTAL_FRAMES - 1
    paintFrame(TOTAL_FRAMES - 1)
    updateOverlays(TOTAL_FRAMES - 1)

    const proxy = { f: TOTAL_FRAMES - 1 }

    const tween = gsap.to(proxy, {
      f: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: '+=150%',
        pin: true,
        pinSpacing: true,
        scrub: 0.8,
        anticipatePin: 1,
      },
      onUpdate() {
        const f = Math.round(Math.max(0, Math.min(proxy.f, TOTAL_FRAMES - 1)))
        if (f !== currentFrame.current) {
          currentFrame.current = f
          paintFrame(f)
          updateOverlays(f)
        }
      },
    })

    // Recalculate after pin spacer is injected
    ScrollTrigger.refresh()

    return () => {
      tween.kill()
      tween.scrollTrigger?.kill()
    }
  }, [loaded, paintFrame, updateOverlays])

  return (
    <>
      {/* Loading screen */}
      {!loaded && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-8">
          <div className="text-center space-y-3">
            <h1 className="text-white text-6xl font-black tracking-[0.2em]">OLCO</h1>
            <p className="text-white/25 text-[11px] tracking-[0.5em] uppercase font-mono">
              Construction Innovation
            </p>
          </div>
          <div className="w-52 h-px bg-white/10 relative">
            <div
              className="absolute inset-y-0 left-0 bg-blue-400 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/20 text-[10px] font-mono tracking-widest">{progress}%</p>
        </div>
      )}

      {/* Pinned scene — GSAP locks this at top while user scrolls 5× viewport */}
      <div ref={pinnedRef} className="h-screen w-full overflow-hidden relative">
        <canvas ref={canvasRef} className="absolute inset-0" />

        {/* Gradient vignettes for text legibility */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-y-0 left-0 w-2/5 bg-linear-to-r from-black/55 via-black/15 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-2/5 bg-linear-to-l from-black/55 via-black/15 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/30 to-transparent" />
        </div>

        {/* Text overlays */}
        {SECTIONS.map((s, i) => (
          <div
            key={s.id}
            ref={(el) => { overlayRefs.current[i] = el }}
            className={`absolute inset-0 flex items-center pointer-events-none transition-none ${
              s.side === 'left'
                ? 'justify-start'
                : s.side === 'right'
                ? 'justify-end'
                : 'justify-center'
            }`}
            style={{ opacity: 0, willChange: 'opacity, transform' }}
          >
            <div
              className={`px-12 max-w-115 ${
                s.side === 'center' ? 'text-center flex flex-col items-center' : ''
              }`}
            >
              <p className="text-blue-300/75 text-[9px] tracking-[0.45em] font-mono uppercase mb-5">
                — {s.tag}
              </p>
              <h2 className="text-white font-black text-[clamp(2.4rem,4vw,3.2rem)] leading-[1.04] mb-5 drop-shadow-xl">
                {s.heading[0]}
                <br />
                {s.heading[1]}
              </h2>
              <p className="text-white/60 text-[15px] leading-relaxed max-w-sm">{s.body}</p>
              {s.cta && (
                <button className="pointer-events-auto mt-8 px-9 py-3.5 border border-white/25 hover:border-white/80 hover:bg-white hover:text-black text-white text-[11px] tracking-[0.35em] uppercase font-bold transition-all duration-300">
                  {s.cta}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Scroll cue */}
        <div
          ref={scrollCueRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none"
        >
          <span className="text-white/30 text-[9px] tracking-[0.5em] uppercase font-mono">
            Scroll
          </span>
          <div className="w-px h-14 bg-linear-to-b from-white/35 to-transparent" />
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-white/5 pointer-events-none">
          <div
            ref={progressBarRef}
            className="h-full bg-blue-400/50"
            style={{ width: '0%' }}
          />
        </div>
      </div>
    </>
  )
}
