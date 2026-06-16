'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionTemplate } from 'framer-motion';
import useIsMobile from './useIsMobile';

interface SupplyTier {
  title: string;
  body: string;
}

const supplyTiers: SupplyTier[] = [
  {
    title: 'Builders & Renovators',
    body: 'Perfect for homeowners, owner-builders, renovators, and small construction projects. Access factory-direct, AS/NZS-compliant materials with transparent pricing, expert guidance, and end-to-end support.',
  },
  {
    title: 'Architects & Contractors',
    body: 'Supporting residential and commercial projects with direct access to trusted manufacturers across Asia. Reduce procurement costs, expand product choice, and source compliant materials with confidence.',
  },
  {
    title: 'Developers & Procurement Teams',
    body: 'Helping developers and procurement professionals streamline material sourcing across single and multi-stage projects. Access trusted factory networks, quality-controlled supply, and dedicated project support from specification through to delivery.',
  },
];

export default function SupplyTiers() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Entry: scale up + round corners; exit bottom: no effect
  const scale = useTransform(smoothProgress, [0, 0.48], [0.45, 1]);
  // Bo góc bằng clip-path thay vì border-radius: border-radius animate ép repaint
  // toàn bộ section full-screen mỗi frame, clip-path được composite trên GPU
  const radius = useTransform(smoothProgress, [0, 0.48], [50, 0]);
  const clipPath = useMotionTemplate`inset(0px round ${radius}px)`;
  return (
    <section ref={containerRef} id="services" className="relative lg:h-[150vh]">
      {/* overflow-hidden removed so card can translate upward past sticky boundary */}
      <div className="lg:sticky lg:top-0 lg:h-screen w-full">
        <motion.div
          className="w-full lg:h-full bg-[#3A3A3A] overflow-hidden flex flex-col justify-center py-20 lg:py-0 max-lg:transform-none! max-lg:[clip-path:none]!"
          // Shadow cùng màu nền tràn 2px ra mọi phía — che khe hở sub-pixel (line trắng)
          // quanh section ở DPR lẻ (Windows scaling 125%/150%); desktop bị clip-path cắt nên không ảnh hưởng animation
          style={isMobile ? { boxShadow: '0 0 0 2px #3A3A3A' } : { scale, clipPath }}
        >
          <div className="w-full max-w-screen-2xl mx-auto px-6 lg:px-36">
            {/* Header */}
            <h2
              className="text-white font-medium tracking-tight"
              style={{ fontSize: 'clamp(36px, 4.5vw, 64px)', maxWidth: '980px' }}
            >
              Built for Projects of Every Scale
            </h2>
            <p
              className="text-[#F4F4F4] mt-5"
              style={{ fontSize: 'clamp(14px, 1vw, 18px)', maxWidth: '1500px' }}
            >
              Access the same factory-direct sourcing networks and manufacturing capabilities
              traditionally reserved for large developers.
            </p>

            {/* Tier cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12 lg:mt-16">
              {supplyTiers.map((tier) => (
                <div key={tier.title} className="group border border-white/20 hover:border-white p-6 lg:p-10 transition-all duration-300">
                  <div className="relative w-40 h-31.25">
                    <Image
                      src="/Vector1.svg"
                      alt=""
                      width={160}
                      height={125}
                      aria-hidden="true"
                      className="absolute inset-0 transition-opacity duration-300 opacity-100 group-hover:opacity-0"
                    />
                    <Image
                      src="/Vector.svg"
                      alt=""
                      width={160}
                      height={125}
                      aria-hidden="true"
                      className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    />
                  </div>
                  <div className="relative mt-16 mb-6">
                    <Image
                      src="/Group.svg"
                      alt=""
                      width={22}
                      height={22}
                      aria-hidden="true"
                      className="absolute left-0 top-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                    />
                    <h3 className="text-white text-2xl leading-snug pl-0 group-hover:pl-8 transition-all duration-300">
                      {tier.title}
                    </h3>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed transition-colors duration-300 group-hover:text-white/90">{tier.body}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
