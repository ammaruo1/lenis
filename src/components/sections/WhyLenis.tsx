import { motion } from 'framer-motion'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import GradientOrb from '@/components/ui/GradientOrb'
import { useLanguage } from '@/i18n'

export default function WhyLenis() {
  const { t } = useLanguage()
  const sectionRef = useScrollReveal({ y: 50, stagger: 0.1, start: 'top 80%' })
  const statsRef = useScrollReveal({ y: 30, stagger: 0.08, start: 'top 85%' })

  return (
    <section className="relative py-32 overflow-hidden" id="why">
      <GradientOrb color="blue" size="lg" className="end-0 top-0 opacity-10" />

      <div className="section-padding container-custom relative z-10">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 text-center md:text-start"
        >
          <span className="tag mb-4 inline-flex">{t.why.tag}</span>
          <h2 className="text-[clamp(36px,5vw,72px)] font-black tracking-tight leading-tight mb-6">
            {t.why.titleLine1}
            <br />
            <span className="gradient-text">{t.why.titleLine2}</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl leading-relaxed">
            {t.why.subtitle}
          </p>
        </motion.div>

        {/* Problem / Solution grid */}
        <div ref={sectionRef} className="grid md:grid-cols-2 gap-6 mb-24">
          {t.why.problems.map((item, i) => (
            <div key={i} className="group">
              <div className="glass rounded-2xl p-6 h-full transition-all duration-500 group-hover:bg-white/[0.06] group-hover:border-white/15">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 shrink-0 mt-0.5">
                    <span className="text-red-400 text-sm">✕</span>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed pt-1 text-start">{item.before}</p>
                </div>
                <div className="h-px bg-gradient-to-r rtl:bg-gradient-to-l from-white/10 to-transparent mb-4" />
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 shrink-0 mt-0.5">
                    <span className="text-green-400 text-sm">✓</span>
                  </div>
                  <p className="text-white/85 text-sm leading-relaxed pt-1 text-start">{item.after}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {t.why.stats.map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.3 }}
              className="stat-card text-center"
            >
              <div className="text-[clamp(32px,4vw,48px)] font-black tracking-tight text-white leading-none">
                <span className="font-mono dir-ltr" dir="ltr">{stat.value}</span>
                <span className="text-accent-purple ms-1 text-[0.6em]">{stat.unit}</span>
              </div>
              <div className="text-white/40 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="mt-24 text-center"
        >
          <blockquote className="text-[clamp(18px,2.5vw,32px)] font-light text-white/50 leading-relaxed max-w-4xl mx-auto">
            {t.why.quote}
          </blockquote>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue shrink-0" />
            <div className="text-start">
              <div className="text-sm font-medium text-white/70">{t.why.quoteAuthor}</div>
              <div className="text-xs text-white/30 font-mono dir-ltr" dir="ltr">{t.why.quoteUrl}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
