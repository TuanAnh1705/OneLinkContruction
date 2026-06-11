import Image from 'next/image'

const stats = [
  {
    icon: '/Coin, Money.svg',
    value: '40%',
    label: 'Avg. Cost Savings',
    bg: '/Rectangle 9.png',
  },
  {
    icon: '/Shield Check.svg',
    value: '100%',
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

export default function StatsSection() {
  return (
    <section
      className="relative w-full bg-[#3A3A3A] md:-mt-40"
      style={{ padding: '80px 0 120px' }}
    >
      <div className="max-w-480 mx-auto px-6 lg:px-36">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                    {s.value}
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
