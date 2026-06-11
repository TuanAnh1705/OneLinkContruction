'use client'

import Image from 'next/image'
import ContactButton from './ContactButton'

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="relative w-full z-20"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Rectangle 16.png"
          alt=""
          fill
          quality={85}
          className="object-cover object-center"
        />
      </div>

      <div
        className="relative z-10 max-w-8xl mx-auto flex flex-col px-6 pt-20 lg:px-36 lg:pt-30" // Cắt bỏ padding bottom để set margin âm
      >
        {/* Top — Heading (Được giải phóng width, không bị ép bởi form) */}
        <div className="w-full mb-16">
          <h2
            className="font-medium text-white leading-[1.05] tracking-tight"
            style={{ fontSize: 'clamp(32px, 4.0vw, 82px)', maxWidth: '800px' }}
          >
            Start your next project at the set-out point.
          </h2>
        </div>

        {/* Bottom — Form (Nằm dưới chữ, giữ nguyên kích thước cũ, đẩy sang phải và tràn xuống Footer) */}
        <div
          className="w-full lg:w-7/14 ml-auto relative z-50" 
          style={{ 
            marginBottom: '-160px', // Margin âm để hút phần Footer bên dưới dịch lên
            transform: 'translateY(60px)' // Đẩy nhẹ form trượt xuống đè lên mặt Footer
          }}
        >
          <div
            className="rounded-sm border border-white/8 shadow-2xl p-6 sm:p-10 lg:p-[79px_59px]"
            style={{ background: '#3A3A3A' }}
          >
            <p
              className="text-[#F4F4F4] mb-10 leading-snug"
              style={{ fontSize: 'clamp(13px, 1.95vw, 20px)', maxWidth: '534px' }}
            >
              Fill in the form below to share your interest with us. We will contact you with next steps to follow.
            </p>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Full Name" placeholder="Jane Smith" type="text" />
                <FormField label="Email" placeholder="jane@company.com" type="email" />
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Company" placeholder="Smith Constructions" type="text" />
                <FormField label="Phone" placeholder="01 XXX XXX" type="tel" />
              </div>

              {/* Project Brief */}
              <div>
                <label className="block text-white mb-3" style={{ fontSize: '18px' }}>
                  Project Brief
                </label>
                <textarea
                  placeholder="Tell us about the project - categories, quantities, target dates and any spec docs you can share."
                  className="form-input w-full border border-white/12 hover:border-white/20 text-white placeholder:text-[#F4F4F4]/70 rounded-xl resize-none transition-all duration-200"
                  style={{ fontSize: '18px', padding: '24px 17px', minHeight: '101px' }}
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <ContactButton
                  label="Send Inquiry"
                  as="button"
                  align="left"
                  backgroundColor="#F4F4F4"
                  textColor="#3A3A3A"
                />
              </div>
            </form>

            {/* Divider */}
            <div className="w-full h-px mt-12 mb-5 bg-[#FFFFFF]/50" />

            <p className="text-white/50" style={{ fontSize: '17px' }}>
              We reply within one business day. Your details stay confidential.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function FormField({
  label,
  placeholder,
  type,
}: {
  label: string
  placeholder: string
  type: string
}) {
  return (
    <div>
      <label className="block text-white mb-3" style={{ fontSize: '18px' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="form-input w-full  border border-white/12 hover:border-white/20 text-white placeholder:text-[#F4F4F4]/70 rounded-xl transition-all duration-200"
        style={{ fontSize: '18px', padding: '22.5px 17px', height: '71px' }}
      />
    </div>
  )
}