import Image from 'next/image'

export default function Footer() {
  return (
    <footer
      className="relative w-full overflow-hidden bg-[#000000]"
      style={{ minHeight: 'clamp(400px, 29.7vw, 572px)' }}
    >

      <div
        className="relative z-10 max-w-480 mx-auto pt-20 px-6 lg:px-29.75"
      >
        

        {/* Link columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Contact Us */}
          <div>
            <h4 className="text-white font-semibold mb-6" style={{ fontSize: '18px' }}>
              Contact Us
            </h4>
            <div className="space-y-4">
              <a
                href="mailto:hello@olco.build"
                className="block text-white/50 hover:text-white transition-colors"
                style={{ fontSize: '18px' }}
              >
                hello@olco.build
              </a>
              <a
                href="tel:+61020000000"
                className="block text-white/50 hover:text-white transition-colors"
                style={{ fontSize: '18px' }}
              >
                +61 (0)2 0000 0000
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
        <Image
          src="/Layer_1.svg"
          alt="OLCO"
          width={355}
          height={355}
          className="mb-12"
          style={{ height: 'clamp(60px, 10vw, 150px)', width: 'auto' }}
        />
        {/* Bottom bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between py-5 gap-4">
          <p className="text-white/35" style={{ fontSize: '15px' }}>
            © 2026 OLCO, All Rights Reserved
          </p>
          <div className="flex items-center gap-8">
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
