import { useScroll, useSpring, motion } from 'framer-motion'
import { useLanguage } from '@/i18n'
import { cn } from '@/lib/utils'

export default function ProgressBar() {
  const { dir } = useLanguage()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className={cn(
        'fixed top-0 left-0 right-0 h-[2px] z-[100] pointer-events-none',
        dir === 'rtl' ? 'origin-right' : 'origin-left'
      )}
      style={{
        scaleX,
        background: dir === 'rtl'
          ? 'linear-gradient(270deg, #8b5cf6, #6366f1, #06b6d4)'
          : 'linear-gradient(90deg, #8b5cf6, #6366f1, #06b6d4)',
      }}
    />
  )
}
