import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useLanguage } from '@/i18n'

const showcaseItems = [
  { name: 'Basement Studio', category: 'Agency', color: '#1a1a2e' },
  { name: 'Awwwards', category: 'Platform', color: '#0f0f23' },
  { name: 'Resn', category: 'Interactive', color: '#1a0a2e' },
  { name: 'Active Theory', category: 'Studio', color: '#0a1a1a' },
  { name: 'Ueno', category: 'Agency', color: '#1a1a0a' },
  { name: 'Fantasy', category: 'Studio', color: '#1a0a0a' },
  { name: 'Jam3', category: 'Digital', color: '#0a0a1a' },
  { name: 'AKQA', category: 'Agency', color: '#0a1a0a' },
]

const row1 = [...showcaseItems, ...showcaseItems]
const row2 = [...showcaseItems.slice(4), ...showcaseItems.slice(0, 4), ...showcaseItems.slice(4), ...showcaseItems.slice(0, 4)]

export default function Showcase() {
  const { t, dir } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const x1 = useTransform(scrollYProgress, [0, 1], dir === 'rtl' ? ['0%', '10%'] : ['0%', '-10%'])
  const x2 = useTransform(scrollYProgress, [0, 1], dir === 'rtl' ? ['5%', '-5%'] : ['-5%', '5%'])

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden" id="showcase">
      <div className="section-padding container-custom mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <span className="tag mb-4 inline-flex">{t.showcase.tag}</span>
          <h2 className="text-[clamp(36px,5vw,72px)] font-black tracking-tight leading-tight mb-6">
            {t.showcase.titleLine1}
            <br />
            <span className="gradient-text">{t.showcase.titleLine2}</span>
          </h2>
          <p className="text-white/50 text-lg max-w-lg mx-auto">
            {t.showcase.subtitle}
          </p>
        </motion.div>
      </div>

      {/* Marquee rows (ltr track wrapper for reliable physical conveyor movement) */}
      <div className="space-y-4 overflow-hidden dir-ltr" dir="ltr">
        {/* Row 1 — left */}
        <motion.div style={{ x: x1 }} className="flex gap-4 w-[200%]">
          <div className="animate-marquee flex gap-4 shrink-0">
            {row1.map((item, i) => (
              <ShowcaseCard key={`r1a-${i}`} {...item} dir={dir} />
            ))}
          </div>
          <div className="animate-marquee flex gap-4 shrink-0" aria-hidden>
            {row1.map((item, i) => (
              <ShowcaseCard key={`r1b-${i}`} {...item} dir={dir} />
            ))}
          </div>
        </motion.div>

        {/* Row 2 — right */}
        <motion.div style={{ x: x2 }} className="flex gap-4 w-[200%]">
          <div className="animate-marquee-reverse flex gap-4 shrink-0">
            {row2.map((item, i) => (
              <ShowcaseCard key={`r2a-${i}`} {...item} variant="small" dir={dir} />
            ))}
          </div>
          <div className="animate-marquee-reverse flex gap-4 shrink-0" aria-hidden>
            {row2.map((item, i) => (
              <ShowcaseCard key={`r2b-${i}`} {...item} variant="small" dir={dir} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Side fades */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
    </section>
  )
}

function ShowcaseCard({ name, category, color, variant = 'default', dir }: {
  name: string; category: string; color: string; variant?: 'default' | 'small'; dir: 'rtl' | 'ltr'
}) {
  const isSmall = variant === 'small'

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.3 }}
      dir={dir}
      className={`shrink-0 glass rounded-2xl overflow-hidden cursor-pointer group text-start ${isSmall ? 'w-52 h-32' : 'w-72 h-44'}`}
    >
      {/* Colored preview */}
      <div
        className="w-full h-full relative flex flex-col justify-end p-4"
        style={{ background: `linear-gradient(135deg, ${color} 0%, #000 100%)` }}
      >
        {/* Animated grid */}
        <div className="absolute inset-0 grid-overlay opacity-30" />

        {/* Glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle at 50% 120%, ${color}80 0%, transparent 60%)` }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="text-xs text-white/40 mb-1 font-mono">{category}</div>
          <div className="font-semibold text-white/85 group-hover:text-white transition-colors text-sm">
            {name}
          </div>
        </div>

        {/* Arrow (top end of card) */}
        <div className="absolute top-3 end-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-xs text-white leading-none">{dir === 'rtl' ? '↖' : '↗'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
