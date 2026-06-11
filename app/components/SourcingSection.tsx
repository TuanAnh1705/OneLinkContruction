export default function SourcingSection() {
  return (
    <section
      id="why-olco"
      className="relative w-full bg-[#3A3A3A] py-16 lg:py-30"
    >
      <div className="max-w-480 md:-mt-20 mx-auto grid grid-cols-12 gap-y-10 lg:gap-33 items-start px-6 lg:px-36">
        {/* Left — main heading */}
        <div className="col-span-12 lg:col-span-7">
          <h2
            className="font-medium text-[#F4F4F4] leading-[1.05] tracking-tight"
            style={{ fontSize: 'clamp(36px, 4.3vw, 88px)' }}
          >
            The Sourcing Partner That Builds It Right{' '} <br/>
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to bottom, #66A3FF 35%, #99C2FF 100%)' }}            >– Stand Behind It</span>
          </h2>
        </div>

        {/* Right — body text */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
          <p
            className="text-[#F4F4F4] leading-relaxed"
            style={{ fontSize: 'clamp(14px, 0.95vw, 17px)', maxWidth: '555px' }}
          >
            Local suppliers charge a premium for what&apos;s already on the shelf. Direct importing comes with risk
            most builders can&apos;t carry. OLCO is the structural set-out point in between — precise, accountable,
            factory-direct.
          </p>
          <p
            className="text-[#F4F4F4] leading-relaxed"
            style={{ fontSize: 'clamp(14px, 0.95vw, 17px)', maxWidth: '555px' }}
          >
            We protect your program and your margin. One contract, one accountable team, full documentation on
            every shipment.
          </p>
        </div>
      </div>
    </section>
  )
}
