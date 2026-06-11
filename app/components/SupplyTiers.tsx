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
    title: 'Builder & Renovator',
    body: 'Order directly from our ready-to-ship catalogue without opening a corporate account. Standard factory-direct pricing, transparent quotes and flexible delivery for single-project needs.',
  },
  {
    title: 'Commercial Contractor',
    body: 'Optimise your project budget with tiered wholesale pricing and volume-based discounts. Includes full compliance documentation and scheduled site delivery so materials arrive exactly when needed.',
  },
  {
    title: 'Developer & Enterprise Partnership',
    body: 'End-to-end support for multi-stage developments — custom factory production to your exact specifications, consolidated freight, on-site QA and a dedicated OLCO account manager. Partners benefit from priority production slots, flexible payment terms and a single point of accountability across every shipment.',
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
          className="w-full lg:h-full bg-[#3A3A3A] overflow-hidden flex flex-col justify-center py-20 lg:py-0"
          style={isMobile ? undefined : { scale, clipPath }}
        >
          <div className="w-full max-w-screen-2xl mx-auto px-10 lg:px-36">
            {/* Header */}
            <h2
              className="text-white font-medium tracking-tight"
              style={{ fontSize: 'clamp(36px, 4.5vw, 64px)', maxWidth: '680px' }}
            >
              Built for Every Scale
            </h2>
            <p
              className="text-[#F4F4F4] mt-5"
              style={{ fontSize: 'clamp(14px, 1vw, 18px)', maxWidth: '980px' }}
            >
              From boutique fit-outs to national developments. Pick the supply tier that matches your
              project volume.
            </p>

            {/* Tier cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12 lg:mt-16">
              {supplyTiers.map((tier) => (
                <div key={tier.title} className="group border border-white/20 hover:border-white p-10 transition-all duration-300">
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
                      src="/group.svg"
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
