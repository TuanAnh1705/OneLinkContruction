'use client'

import Image from 'next/image'

export default function Footer() {
  return (
    <footer
      className="relative w-full overflow-hidden bg-[#000000]"
      style={{ minHeight: 'clamp(400px, 29.7vw, 572px)' }}
    >

      <div
        className="relative z-10 max-w-480 mx-auto pt-14 lg:pt-20 pb-24 lg:pb-0 px-6 lg:px-29.75"
      >
        

        {/* Link columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10 mb-10 lg:mb-12">
          {/* Contact Us */}
          <div>
            <h4 className="text-white font-semibold mb-6" style={{ fontSize: '18px' }}>
              Contact Us
            </h4>
            <div className="space-y-4">
              <a
                href="mailto:info@onelinkconstruction.com"
                className="block break-words text-white/50 hover:text-white transition-colors text-[15px] lg:text-[18px]"
              >
                info@onelinkconstruction.com
              </a>
              <a
                href="tel:+61448146052"
                className="block text-white/50 hover:text-white transition-colors"
                style={{ fontSize: '18px' }}
              >
                +61 448 146 052
              </a>
            </div>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="text-white font-semibold mb-6" style={{ fontSize: '18px' }}>
              Follow Us
            </h4>
            <div className="space-y-4">
              <a
                href="#"
                className="block text-white/50 hover:text-white transition-colors"
                style={{ fontSize: '18px' }}
              >
                Instagram
              </a>
              <a
                href="#"
                className="block text-white/50 hover:text-white transition-colors"
                style={{ fontSize: '18px' }}
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

{/* Logo */}
        <a
          href="#top"
          aria-label="Back to top"
          className="inline-block mb-10 lg:mb-12"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={(e) => { e.preventDefault(); (window as any).__lenis?.scrollTo(0, { duration: 1.2 }) }}
        >
          <Image
            src="/Layer_1.svg"
            alt="OLCO"
            width={355}
            height={355}
            style={{ height: 'clamp(60px, 10vw, 150px)', width: 'auto' }}
          />
        </a>
        {/* Bottom bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-t border-white/10 lg:border-t-0 pt-6 lg:pt-5 pb-5 gap-3 lg:gap-4">
          <p className="text-white/35" style={{ fontSize: '15px' }}>
            © 2026 OLCO, All Rights Reserved
          </p>
          <div className="flex items-center flex-wrap gap-6 lg:gap-8">
            <a href="#" className="text-white/35 hover:text-white/60 transition-colors" style={{ fontSize: '15px' }}>
              Terms &amp; Conditions
            </a>
            <a href="#" className="text-white/35 hover:text-white/60 transition-colors" style={{ fontSize: '15px' }}>
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
