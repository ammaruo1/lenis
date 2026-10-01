import { motion } from 'framer-motion'
import { Zap, Layers, Code2, Globe, Cpu, Puzzle, GitBranch, Shield, Repeat, ArrowRight } from 'lucide-react'
import GradientOrb from '@/components/ui/GradientOrb'
import { useLanguage } from '@/i18n'
import { cn } from '@/lib/utils'

const featureStyles = [
  { icon: Zap, gradient: 'from-yellow-500/20 to-orange-500/10', iconColor: 'text-yellow-400', size: 'large' },
  { icon: Globe, gradient: 'from-blue-500/20 to-cyan-500/10', iconColor: 'text-blue-400' },
  { icon: Layers, gradient: 'from-green-500/20 to-emerald-500/10', iconColor: 'text-green-400' },
  { icon: Cpu, gradient: 'from-purple-500/20 to-violet-500/10', iconColor: 'text-purple-400' },
  { icon: Code2, gradient: 'from-cyan-500/20 to-blue-500/10', iconColor: 'text-cyan-400', size: 'large' },
  { icon: Puzzle, gradient: 'from-pink-500/20 to-rose-500/10', iconColor: 'text-pink-400' },
  { icon: Shield, gradient: 'from-emerald-500/20 to-teal-500/10', iconColor: 'text-emerald-400' },
  { icon: Repeat, gradient: 'from-indigo-500/20 to-purple-500/10', iconColor: 'text-indigo-400' },
  { icon: GitBranch, gradient: 'from-rose-500/20 to-pink-500/10', iconColor: 'text-rose-400' },
]

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export default function Features() {
  const { t } = useLanguage()

  return (
    <section className="relative py-32 overflow-hidden" id="features">
      <GradientOrb color="purple" size="xl" className="-start-60 top-20 opacity-8" />

      <div className="section-padding container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 text-center"
        >
          <span className="tag mb-4 inline-flex">{t.features.tag}</span>
          <h2 className="text-[clamp(36px,5vw,72px)] font-black tracking-tight leading-tight mb-6">
            {t.features.titleLine1}
            <br />
            <span className="gradient-text">{t.features.titleLine2}</span>
          </h2>
          <p className="text-white/50 text-lg max-w-lg mx-auto">
            {t.features.subtitle}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {t.features.items.map((item, i) => {
            const style = featureStyles[i] || featureStyles[0]
            const Icon = style.icon
            const isLarge = style.size === 'large'

            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className={cn('feature-card group relative overflow-hidden text-start', isLarge && 'lg:col-span-1')}
                whileHover={{ scale: 1.01 }}
              >
                {/* Gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl bg-white/5 border border-white/8 ${style.iconColor} shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <span className="tag text-xs">{item.tag}</span>
                  </div>

                  <h3 className="font-bold text-white/90 text-lg mb-2 group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {item.description}
                  </p>

                  {/* Arrow on hover */}
                  <div className="mt-4 overflow-hidden h-5">
                    <div className="transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-1.5 text-xs text-white/50">
                      <span>{t.features.learnMore}</span>
                      <ArrowRight size={13} className="rtl:rotate-180" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
