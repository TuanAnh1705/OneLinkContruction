'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface CustomButtonProps {
  text?: string
  defaultBg?: string
  hoverBg?: string
  defaultTextColor?: string
  hoverTextColor?: string
  href?: string
}

export default function CustomButton({
  text = 'Contact Us',
  defaultBg = '#000000',
  hoverBg = '#F4F4F4',
  defaultTextColor = '#ffffff',
  hoverTextColor = '#000000',
  href = '#contact',
}: CustomButtonProps) {
  const [hovered, setHovered] = useState(false)

  const rollTransition = { duration: 0.35, ease: [0.76, 0, 0.24, 1] as const }

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        borderRadius: '10px',
        padding: '12px 24px',
        textDecoration: 'none',
        cursor: 'pointer',
        background: hovered ? hoverBg : defaultBg,
        transition: 'background 0.35s ease',
        userSelect: 'none',
      }}
    >
      {/* Text with roll effect */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          height: '1.125em',
          lineHeight: 1.125,
        }}
      >
        {/* Current text — rolls up on hover */}
        <motion.span
          style={{
            display: 'block',
            fontSize: '18px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            color: hovered ? hoverTextColor : defaultTextColor,
            transition: 'color 0.25s ease',
          }}
          animate={{ y: hovered ? '-100%' : '0%' }}
          transition={rollTransition}
        >
          {text}
        </motion.span>

        {/* Incoming text — rolls in from below */}
        <motion.span
          style={{
            display: 'block',
            position: 'absolute',
            top: '100%',
            left: 0,
            fontSize: '18px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            color: hovered ? hoverTextColor : defaultTextColor,
            transition: 'color 0.25s ease',
          }}
          animate={{ y: hovered ? '-100%' : '0%' }}
          transition={rollTransition}
        >
          {text}
        </motion.span>
      </div>

      {/* Fixed icon — no hover effect */}
      <img
        src="/Group1.svg"
        alt=""
        width={24}
        height={24}
        style={{ display: 'block', flexShrink: 0 }}
        aria-hidden="true"
      />
    </a>
  )
}
