'use client'

import { useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

const badges = [
  'Australian support team',
  'Quality control at every stage',
  'AS/NZ compliant',
]

export default function BannerSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const helmetRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // Parallax chỉ chạy trên desktop; mobile giữ tĩnh
      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px)', () => {
        const helmet = helmetRef.current
        if (!helmet) return

        // Mũ trôi dọc chậm hơn nền khi section đi qua viewport (parallax)
        gsap.fromTo(
          helmet,
          { y: -70 },
          {
            y: 90,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        )
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#3A3A3A] py-16 lg:py-0 lg:min-h-[clamp(500px,33.7vw,647px)]"
      // Phủ màu nền tràn 2px ra mọi phía — che khe hở sub-pixel (line trắng) quanh section ở DPR lẻ
      style={{ boxShadow: '0 0 0 2px #3A3A3A' }}
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Frame 34.svg"
          alt=""
          fill
          quality={85}
          className="object-cover opacity-35 lg:object-contain lg:opacity-100 object-center"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#3A3A3A] to-transparent" style={{ bottom: '60%' }} />
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-[#3A3A3A]" style={{ top: '60%' }} />
      </div>


      {/* Content */}
      <div className="relative z-10 max-w-480 mx-auto h-full px-6 lg:px-[clamp(32px,7.5vw,144px)]">
        <div className="relative min-h-55 lg:min-h-[clamp(500px,33.7vw,647px)]">
          {/* Helmet image — mobile: neo góc trái dưới; desktop: căn giữa */}
          <div
            className="absolute bottom-0 z-10 -left-22 w-[78vw] h-[52vw] lg:left-1/2 lg:-translate-x-1/2 lg:w-[clamp(210px,51.4vw,986px)] lg:h-[clamp(150px,34.3vw,658px)]"
          >
            {/* Wrapper riêng cho parallax — tránh đụng transform căn giữa của div ngoài */}
            <div ref={helmetRef} className="absolute inset-0" style={{ willChange: 'transform' }}>
              {/* Hit area cắt theo hình mũ — phải đứng TRƯỚC Image để selector `.helmet-hit:hover + .helmet-glow` ăn */}
              <div className="helmet-hit absolute inset-0 z-10" aria-hidden="true" />
              <Image
                src="/HELMET-1 1.png"
                alt="OLCO Safety Helmet"
                fill
                quality={90}
                className="object-contain object-bottom helmet-glow pointer-events-none"
              />
            </div>
          </div>

          {/* Badge left — vị trí scale theo viewport (gốc 1920px) để bám helmet khi màn nhỏ lại */}
          <div
            className="hidden lg:block absolute z-20"
            style={{ left: 'clamp(119px,11.615vw,223px)', top: 'clamp(117px,11.406vw,219px)' }}
          >
            <BadgeButton label="Australian support team" noSlide/>
          </div>

          {/* Badge right top */}
          <div
            className="hidden lg:block absolute z-20"
            style={{ right: 'clamp(107px,10.417vw,200px)', top: 'clamp(67px,6.5625vw,126px)' }}
          >
            <BadgeButton label="Quality control at every stage" noSlide />
          </div>

          {/* Badge right bottom */}
          <div
            className="hidden lg:block absolute z-20"
            style={{ right: 'clamp(170px,16.5625vw,318px)', bottom: 'clamp(64px,6.25vw,120px)' }}
          >
            <BadgeButton label="AS/NZ compliant" noSlide />
          </div>

          {/* Badges mobile — cụm bên phải helmet, hơi đè lên helmet, xếp so le như thiết kế */}
          <div className="lg:hidden absolute left-[37%] top-[45%] -translate-y-1/2 z-20 flex flex-col items-start gap-2.5">
            {badges.map((label) => (
              <BadgeButton key={label} label={label} noSlide />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function BadgeButton({ label, noSlide }: { label: string; noSlide?: boolean }) {
  return (
    <div
      className="group flex items-center cursor-default rounded-lg lg:rounded-xl border border-[#D1D0E2]/60 transition-colors duration-300 hover:border-[#D1D0E2] px-4 py-2.5 lg:px-[clamp(18px,1.458vw,28px)] lg:py-[clamp(11px,0.9375vw,18px)]"
      // Nền giống các badge category ở hero section
      style={{ background: 'rgba(58,58,58,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      <div className="relative">
        {!noSlide && (
          <Image
            src="/Group.svg"
            alt=""
            width={18}
            height={18}
            aria-hidden="true"
            className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
          />
        )}
        <span
          className={`block font-medium text-white whitespace-nowrap text-[11px] lg:text-[clamp(13px,1.1vw,20px)] transition-all duration-300${noSlide ? '' : ' pl-0 group-hover:pl-8'}`}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
