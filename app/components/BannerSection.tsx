import Image from 'next/image'

const badges = [
  { label: 'Free detailed written quotes', x: 'left' },
  { label: 'Pre-shipment QA on every order', x: 'right-top' },
  { label: 'Aligned to AS/NZS and NCC requirements', x: 'right-bottom' },
]

export default function BannerSection() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#3A3A3A] lg:min-h-[clamp(500px,33.7vw,647px)]"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Frame 34.svg"
          alt=""
          fill
          quality={85}
          className="object-contain object-center"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#3A3A3A] to-transparent" style={{ bottom: '60%' }} />
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-[#3A3A3A]" style={{ top: '60%' }} />
      </div>


      {/* Content */}
      <div className="relative z-10 max-w-480 mx-auto h-full px-6 lg:px-36">
        <div className="relative min-h-75 lg:min-h-[clamp(500px,33.7vw,647px)]">
          {/* Helmet image — centered */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-0 z-10"
            style={{ width: 'clamp(280px, 51.4vw, 986px)', height: 'clamp(200px, 34.3vw, 658px)' }}
          >
            <Image
              src="/HELMET-1 1.png"
              alt="OLCO Safety Helmet"
              fill
              quality={90}
              className="object-contain object-bottom"
            />
          </div>

          {/* Badge left */}
          <div
            className="hidden lg:block absolute z-20"
            style={{ left: '223px', top: '219px' }}
          >
            <BadgeButton label="Free detailed written quotes" noSlide/>
          </div>

          {/* Badge right top */}
          <div
            className="hidden lg:block absolute z-20"
            style={{ right: '200px', top: '126px' }}
          >
            <BadgeButton label="Pre-shipment QA on every order" noSlide />
          </div>

          {/* Badge right bottom */}
          <div
            className="hidden lg:block absolute z-20"
            style={{ right: '228px', bottom: '120px' }}
          >
            <BadgeButton label="Aligned to AS/NZS and NCC requirements" noSlide />
          </div>
        </div>

        {/* Badges mobile — xếp tĩnh dưới helmet */}
        <div className="flex lg:hidden flex-wrap justify-center gap-3 pt-6 pb-10">
          {badges.map((b) => (
            <BadgeButton key={b.label} label={b.label} noSlide />
          ))}
        </div>
      </div>
    </section>
  )
}

function BadgeButton({ label, noSlide }: { label: string; noSlide?: boolean }) {
  return (
    <div
      className="group bg-[#F4F4F4]/70 flex items-center cursor-default rounded-xl border border-[#D1D0E2]/60 backdrop-blur-md transition-colors duration-300 hover:border-[#D1D0E2]"
      style={{
        padding: '18px 28px',
      }}
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
          className={`block font-medium text-[#000000] whitespace-nowrap transition-all duration-300${noSlide ? '' : ' pl-0 group-hover:pl-8'}`}
          style={{ fontSize: 'clamp(13px, 1.1vw, 20px)' }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
