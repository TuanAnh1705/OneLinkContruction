'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const stats = [
  {
    icon: '/Coin, Money.svg',
    value: '40%',
    countTo: 40,
    label: 'Avg. Cost Savings',
    bg: '/Rectangle 9.png',
  },
  {
    icon: '/Shield Check.svg',
    value: '100%',
    countTo: 100,
    label: 'AS/NZS Compliant',
    bg: '/Rectangle 9.png',
  },
  {
    icon: '/Ship.svg',
    value: 'End-to-End',
    label: 'Delivery Management',
    bg: '/Rectangle 9.png',
  },
  {
    icon: '/Support Chat.svg',
    value: '1:1',
    label: 'Project Support',
    bg: '/Rectangle 9.png',
  },
]

// Đếm từ 0 → target khi phần tử vào viewport, ease-out để chậm dần về cuối
function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()

        const duration = 1500
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - t, 3)
          setValue(Math.round(eased * target))
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [target])

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  )
}

// Hiện chữ dần từ trái sang phải khi vào viewport, phần chưa hiện nhảy ký tự ngẫu nhiên (scramble)
// — cùng duration/ease với CountUp để 4 card chạy đồng bộ
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function ScrambleText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  // Giữ chỗ bằng khoảng trắng cùng độ dài để không nhảy layout trước khi chạy
  const [display, setDisplay] = useState(() => ' '.repeat(text.length))

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()

        const duration = 1500
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - t, 3)
          const revealed = Math.round(eased * text.length)
          let out = text.slice(0, revealed)
          for (let i = revealed; i < text.length; i++) {
            const ch = text[i]
            // Giữ nguyên ký tự đặc biệt (-, :, khoảng trắng), chỉ scramble chữ/số
            out += /[a-zA-Z0-9]/.test(ch)
              ? SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
              : ch
          }
          setDisplay(out)
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [text])

  return <span ref={ref}>{display}</span>
}

export default function StatsSection() {
  return (
    <section
      className="relative w-full bg-[#3A3A3A] md:-mt-40 lg:mt-0"
      // Shadow cùng màu nền tràn 2px — che khe hở sub-pixel (line trắng) quanh section ở DPR lẻ
      style={{ padding: '80px 0 120px', boxShadow: '0 0 0 2px #3A3A3A' }}
    >
      <div className="max-w-480 mx-auto px-6 lg:px-36">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.value}
              className="relative overflow-hidden rounded-sm flex flex-col bg-[#000000]"
              style={{ height: 'clamp(280px, 20.2vw, 388px)' }}
            >

              <div className="relative z-10 flex flex-col h-full" style={{ padding: '32px' }}>
                <div
                  className="flex items-center justify-center rounded-xl mb-auto"
                  style={{
                    width: 62,
                    height: 42,
                  }}
                >
                  <Image src={s.icon} alt="" width={56} height={36} className="object-contain" />
                </div>

                <div className="mt-auto">
                  <p
                    className="font-medium leading-none tracking-tight inline-block bg-clip-text text-transparent"
                    style={{ fontSize: 'clamp(40px, 2.8vw, 72px)', backgroundImage: 'linear-gradient(to bottom, #66A3FF 35%, #99C2FF 100%)' }}
                  >
                    {s.countTo != null ? <CountUp target={s.countTo} suffix="%" /> : <ScrambleText text={s.value} />}
                  </p>
                  <p
                    className="text-white mt-3"
                    style={{ fontSize: 'clamp(12px, 1.95vw, 18px)' }}
                  >
                    {s.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
