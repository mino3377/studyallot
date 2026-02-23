// src/components/landing/Animate.tsx
"use client"

import { motion, type MotionProps } from "motion/react"
import { cn } from "@/lib/utils"

const baseTransition = { duration: 0.6, easing: "ease-out" as const }

export function MotionDiv(
  props: React.HTMLAttributes<HTMLDivElement> & MotionProps & { className?: string }
) {
  const { className, ...rest } = props
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, amount: 0.2 }}
      transition={baseTransition}
      {...rest}
      className={cn(className)}
    />
  )
}

export function MotionSection(
  props: React.HTMLAttributes<HTMLElement> & MotionProps & { className?: string }
) {
  const { className, ...rest } = props
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, amount: 0.2 }}
      transition={baseTransition}
      {...rest}
      className={cn(className)}
    />
  )
}
