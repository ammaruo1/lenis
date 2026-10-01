import { motion, useScroll, useSpring } from 'framer-motion'
import { useLanguage } from '@/i18n/LanguageContext'

export default function ProgressBar() {
  const { scrollYProgress } = useScroll()
  const { dir } = useLanguage()
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <motion.div
      className="fixed top-0 start-0 end-0 h-[3px] bg-gradient-to-r from-purple-600 to-purple-500 z-[60]"
      style={{ 
        scaleX, 
        transformOrigin: dir === 'rtl' ? 'right' : 'left' 
      }}
    />
  )
}
