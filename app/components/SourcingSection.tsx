export default function SourcingSection() {
  return (
    <section
      id="why-olco"
      className="relative w-full bg-[#3A3A3A] py-16 lg:py-30"
      // Phủ màu nền tràn 2px ra mọi phía — che khe hở sub-pixel (line trắng) quanh section ở DPR lẻ
      style={{ boxShadow: '0 0 0 2px #3A3A3A' }}
    >
      <div className="max-w-480 md:-mt-20 -mt-20 mx-auto grid grid-cols-12 gap-y-10 lg:gap-33 items-start px-6 lg:px-36">
        {/* Left — main heading */}
        <div className="col-span-12 lg:col-span-7">
          <h2
            className="font-medium text-[#F4F4F4] leading-[1.05] tracking-tight"
            style={{ fontSize: 'clamp(38px, 4.3vw, 88px)' }}
          >
            Smarter Supply. <br/> Better Value.{' '} <br/>
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to bottom, #66A3FF 35%, #99C2FF 100%)' }}            >Built for You.</span>
          </h2>
        </div>

        {/* Right — body text */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
          <p
            className="text-[#F4F4F4] leading-relaxed"
            style={{ fontSize: 'clamp(14px, 0.95vw, 17px)', maxWidth: '555px' }}
          >
            The traditional construction supply model is expensive, inefficient, and burdened by unnecessary
            layers of distribution, warehousing, and overheads. While direct importing can reduce costs, it
            often introduces risks around quality, compliance, communication, and delivery.
          </p>
          <p
            className="text-[#F4F4F4] leading-relaxed"
            style={{ fontSize: 'clamp(14px, 0.95vw, 17px)', maxWidth: '555px' }}
          >
            OLCO combines the benefits of factory-direct procurement with the confidence of professional
            oversight, compliance management, quality control, and dedicated on-the-ground support across Asia.
          </p>
        </div>
      </div>
    </section>
  )
}
