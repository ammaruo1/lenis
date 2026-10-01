import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GradientOrb from '@/components/ui/GradientOrb'
import { useLanguage } from '@/i18n'

gsap.registerPlugin(ScrollTrigger)

const metricValues = [
  { value: 2.6, max: 10, color: '#10b981' },
  { value: 0.4, max: 16.6, color: '#6366f1' },
  { value: 0.8, max: 5, color: '#06b6d4' },
]

export default function Performance() {
  const { t, dir, language } = useLanguage()
  const barsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const bars = document.querySelectorAll('.perf-bar-fill')
      bars.forEach((bar) => {
        const target = (bar as HTMLElement).dataset.width || '0'
        gsap.fromTo(
          bar,
          { width: '0%' },
          {
            width: `${target}%`,
            duration: 1.5,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: bar,
              start: 'top 90%',
              once: true,
            },
          }
        )
      })

      const circles = document.querySelectorAll('.score-circle')
      circles.forEach((circle) => {
        const target = parseInt((circle as HTMLElement).dataset.score || '0')
        const circumference = 2 * Math.PI * 40

        gsap.fromTo(
          circle,
          { strokeDashoffset: circumference },
          {
            strokeDashoffset: circumference * (1 - target / 100),
            duration: 1.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: circle,
              start: 'top 90%',
              once: true,
            },
          }
        )
      })
    }, barsRef)

    return () => ctx.revert()
  }, [language])

  const scores = [
    { label: t.performance.scores.performance, score: 99, color: '#10b981' },
    { label: t.performance.scores.accessibility, score: 100, color: '#6366f1' },
    { label: t.performance.scores.bestPractices, score: 100, color: '#06b6d4' },
    { label: t.performance.scores.seo, score: 100, color: '#8b5cf6' },
  ]

  return (
    <section className="relative py-32 overflow-hidden" id="performance" ref={barsRef}>
      <GradientOrb color="cyan" size="lg" className="end-0 bottom-0 opacity-8" />

      <div className="section-padding container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 text-center md:text-start"
        >
          <span className="tag mb-4 inline-flex">{t.performance.tag}</span>
          <h2 className="text-[clamp(36px,5vw,72px)] font-black tracking-tight leading-tight mb-6">
            {t.performance.titleLine1}
            <br />
            <span className="gradient-text">{t.performance.titleLine2}</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl">
            {t.performance.subtitle}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Bar charts */}
          <div className="space-y-8 text-start">
            <h3 className="text-sm uppercase tracking-widest text-white/40 font-mono">{t.performance.resourceUsage}</h3>
            {t.performance.metrics.map((metric, i) => {
              const meta = metricValues[i] || metricValues[0]
              const barGradient = dir === 'rtl'
                ? `linear-gradient(270deg, ${meta.color}, ${meta.color}80)`
                : `linear-gradient(90deg, ${meta.color}, ${meta.color}80)`

              return (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-white/70">{metric.label}</span>
                    <div className="text-end">
                      <span className="text-sm font-mono font-bold" style={{ color: meta.color }}>
                        <span className="dir-ltr" dir="ltr">{meta.value}</span>
                        <span className="text-xs ms-1 text-white/30">{metric.unit}</span>
                      </span>
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-1.5">
                    <div
                      className="perf-bar-fill h-full rounded-full"
                      data-width={((meta.value / meta.max) * 100).toString()}
                      style={{ background: barGradient, width: 0 }}
                    />
                  </div>

                  <p className="text-xs text-white/30">{metric.description}</p>
                </div>
              )
            })}
          </div>

          {/* Lighthouse scores */}
          <div className="text-start">
            <h3 className="text-sm uppercase tracking-widest text-white/40 font-mono mb-8">{t.performance.lighthouseScores}</h3>
            <div className="grid grid-cols-2 gap-6">
              {scores.map((score, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="glass rounded-2xl p-6 flex flex-col items-center gap-3"
                >
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="8"
                      />
                      <circle
                        className="score-circle"
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke={score.color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40}`}
                        data-score={score.score}
                        style={{ filter: `drop-shadow(0 0 8px ${score.color}60)` }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-black text-white dir-ltr font-mono" dir="ltr">{score.score}</span>
                    </div>
                  </div>
                  <span className="text-xs text-white/60 text-center font-medium">{score.label}</span>
                </motion.div>
              ))}
            </div>

            {/* FPS counter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 glass rounded-2xl p-5 flex items-center gap-4 text-start"
            >
              <div className="flex items-center gap-1 shrink-0 dir-ltr" dir="ltr">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-green-400"
                    style={{
                      height: `${Math.random() * 16 + 8}px`,
                      opacity: 0.4 + Math.random() * 0.6,
                      animation: `pulse ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
              <div>
                <div className="text-2xl font-black text-green-400 font-mono">{t.performance.fpsText}</div>
                <div className="text-xs text-white/40">{t.performance.fpsSubtext}</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
