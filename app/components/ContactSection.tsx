'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import ContactButton from './ContactButton'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const EMPTY_FORM = {
  fullname: '',
  email: '',
  company: '',
  phone: '',
  projectbrief: '',
}

export default function ContactSection() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [toast, setToast] = useState(false)

  // Toast tự ẩn sau 3.5s
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(false), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const update =
    (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setMessage('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Something went wrong.')
      setStatus('success')
      setMessage('')
      setForm(EMPTY_FORM)
      setToast(true)
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

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
        {/* Fade từ #3A3A3A (màu nền section phía trên) xuống trong suốt — hoà mép trên của ảnh
            với nền tối bên trên, tránh đường cắt cứng (giống cách hero fade sang trắng ở mép dưới) */}
        <div
          className="absolute inset-x-0 top-0 h-[70%]"
          style={{ background: 'linear-gradient(to bottom, #3A3A3A 0%, rgba(58,58,58,0) 100%)' }}
        />
      </div>

      <div
        className="relative z-10 max-w-8xl mx-auto flex flex-col px-6 pt-16 pb-16 lg:px-36 lg:pt-30 lg:pb-0" // Mobile có padding bottom; desktop cắt bỏ để set margin âm
      >
        {/* Top — Heading (Được giải phóng width, không bị ép bởi form) */}
        <div className="w-full mb-16">
          <h2
            className="font-medium text-white leading-[1.05] tracking-tight"
            style={{ fontSize: 'clamp(32px, 4.0vw, 82px)', maxWidth: '800px' }}
          >
            The Smarter Starting Point for Every Project
          </h2>
        </div>

        {/* Bottom — Form (Nằm dưới chữ, giữ nguyên kích thước cũ, đẩy sang phải và tràn xuống Footer) */}
        {/* Margin âm + translate chỉ áp dụng desktop — mobile nằm gọn trong section, không lấn xuống Footer */}
        <div className="w-full lg:w-7/14 ml-auto relative z-50 lg:-mb-40 lg:translate-y-[60px]">
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

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Full Name" placeholder="Jane Smith" type="text" value={form.fullname} onChange={update('fullname')} required />
                <FormField label="Email" placeholder="jane@company.com" type="email" value={form.email} onChange={update('email')} required />
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Company" placeholder="Smith Constructions" type="text" value={form.company} onChange={update('company')} />
                <FormField label="Phone" placeholder="01 XXX XXX" type="tel" value={form.phone} onChange={update('phone')} />
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
                  value={form.projectbrief}
                  onChange={update('projectbrief')}
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <ContactButton
                  label={status === 'submitting' ? 'Sending…' : 'Send Inquiry'}
                  as="button"
                  align="left"
                  backgroundColor="#F4F4F4"
                  textColor="#3A3A3A"
                />
              </div>

              {message && (
                <p
                  className={status === 'success' ? 'text-[#99C2FF]' : 'text-red-400'}
                  style={{ fontSize: '15px' }}
                  role="status"
                >
                  {message}
                </p>
              )}
            </form>

            {/* Divider */}
            <div className="w-full h-px mt-12 mb-5 bg-[#FFFFFF]/50" />

            <p className="text-white/50" style={{ fontSize: '17px' }}>
              Complete the form below and we&apos;ll be in touch as soon as OLCO becomes available to the wider market.
            </p>
          </div>
        </div>
      </div>

      {/* Toast thành công — hiện chính giữa màn hình, tự ẩn sau 3.5s */}
      {toast && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6 pointer-events-none">
          <div
            role="status"
            aria-live="polite"
            onClick={() => setToast(false)}
            className="pointer-events-auto flex items-center gap-4 rounded-xl border border-white/10 bg-[#3A3A3A] px-7 py-5 shadow-2xl cursor-pointer"
            style={{ animation: 'fade-up 0.3s ease' }}
          >
            <span
              className="flex items-center justify-center rounded-full shrink-0"
              style={{
                width: 40,
                height: 40,
                background: 'linear-gradient(to bottom, #66A3FF 35%, #99C2FF 100%)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#3A3A3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-white font-medium" style={{ fontSize: '17px' }}>
                Inquiry sent
              </p>
              <p className="text-white/60" style={{ fontSize: '14px' }}>
                Thanks! We&apos;ll be in touch soon.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function FormField({
  label,
  placeholder,
  type,
  value,
  onChange,
  required,
}: {
  label: string
  placeholder: string
  type: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-white mb-3" style={{ fontSize: '18px' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="form-input w-full  border border-white/12 hover:border-white/20 text-white placeholder:text-[#F4F4F4]/70 rounded-xl transition-all duration-200"
        style={{ fontSize: '18px', padding: '22.5px 17px', height: '71px' }}
      />
    </div>
  )
}