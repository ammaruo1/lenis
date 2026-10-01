import { motion } from 'framer-motion'
import { useLanguage } from '@/i18n'

const colors = [
  '#6366f1',
  '#10b981',
  '#06b6d4',
  '#8b5cf6',
  '#f59e0b',
  '#ec4899',
  '#14b8a6',
  '#f97316',
]

export default function Testimonials() {
  const { t, dir } = useLanguage()

  const items = t.testimonials.items.map((item, i) => ({
    ...item,
    color: colors[i % colors.length],
  }))

  const row1 = [...items.slice(0, 4), ...items.slice(0, 4)]
  const row2 = [...items.slice(4), ...items.slice(4)]

  return (
    <section className="relative py-32 overflow-hidden" id="testimonials">
      <div className="section-padding container-custom mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <span className="tag mb-4 inline-flex">{t.testimonials.tag}</span>
          <h2 className="text-[clamp(36px,5vw,72px)] font-black tracking-tight leading-tight mb-6">
            {t.testimonials.titleLine1}
            <br />
            <span className="gradient-text">{t.testimonials.titleLine2}</span>
          </h2>
        </motion.div>
      </div>

      <div className="space-y-4 overflow-hidden dir-ltr" dir="ltr">
        <div className="flex gap-4">
          <div className="animate-marquee flex gap-4 shrink-0">
            {row1.map((item, i) => <TestimonialCard key={`r1a-${i}`} {...item} dir={dir} />)}
          </div>
          <div className="animate-marquee flex gap-4 shrink-0" aria-hidden>
            {row1.map((item, i) => <TestimonialCard key={`r1b-${i}`} {...item} dir={dir} />)}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="animate-marquee-reverse flex gap-4 shrink-0">
            {row2.map((item, i) => <TestimonialCard key={`r2a-${i}`} {...item} dir={dir} />)}
          </div>
          <div className="animate-marquee-reverse flex gap-4 shrink-0" aria-hidden>
            {row2.map((item, i) => <TestimonialCard key={`r2b-${i}`} {...item} dir={dir} />)}
          </div>
        </div>
      </div>

      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
    </section>
  )
}

function TestimonialCard({ quote, author, role, company, initials, color, dir }: {
  quote: string; author: string; role: string; company: string; initials: string; color: string; dir: 'rtl' | 'ltr'
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -3 }}
      transition={{ duration: 0.3 }}
      dir={dir}
      className="shrink-0 w-80 glass rounded-2xl p-6 flex flex-col gap-4 cursor-default text-start"
    >
      <p className="text-white/60 text-sm leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-3 mt-auto">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 font-mono dir-ltr"
          dir="ltr"
          style={{ background: `linear-gradient(135deg, ${color}80, ${color}30)`, border: `1px solid ${color}40` }}
        >
          {initials}
        </div>
        <div>
          <div className="text-sm font-medium text-white/80">{author}</div>
          <div className="text-xs text-white/40">{role} · {company}</div>
        </div>
      </div>
    </motion.div>
  )
}
