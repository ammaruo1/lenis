import { motion } from 'framer-motion'
import { Github, GitBranch, Star, Users, Package, ExternalLink } from 'lucide-react'
import GradientOrb from '@/components/ui/GradientOrb'
import { useLanguage } from '@/i18n'

const contributors = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  color: `hsl(${(i * 47) % 360}, 60%, 55%)`,
  initial: String.fromCharCode(65 + (i % 26)),
}))

export default function OpenSource() {
  const { t } = useLanguage()

  const stats = [
    { icon: Star, value: '14.2K', label: t.openSource.stats.stars, color: 'text-yellow-400' },
    { icon: GitBranch, value: '230', label: t.openSource.stats.forks, color: 'text-blue-400' },
    { icon: Users, value: '48', label: t.openSource.stats.contributors, color: 'text-green-400' },
    { icon: Package, value: '620K', label: t.openSource.stats.weeklyDl, color: 'text-purple-400' },
  ]

  const communityLinks = [
    { label: t.openSource.links.github, href: 'https://github.com/abdellahaarab/lenis', icon: '⭐' },
    { label: t.openSource.links.liveDemo, href: 'https://pro-lenis.vercel.app', icon: '🌐' },
    { label: t.openSource.links.twitter, href: 'https://twitter.com/abdellahaarab', icon: '𝕏' },
    { label: t.openSource.links.npm, href: 'https://www.npmjs.com/package/lenis', icon: '📦' },
  ]

  return (
    <section className="relative py-32 overflow-hidden" id="open-source">
      <GradientOrb color="multi" size="lg" className="left-1/2 -translate-x-1/2 bottom-0 opacity-8" />

      <div className="section-padding container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <span className="tag mb-4 inline-flex">
            <Github size={12} className="shrink-0" />
            <span>{t.openSource.tag}</span>
          </span>
          <h2 className="text-[clamp(36px,5vw,72px)] font-black tracking-tight leading-tight mb-6">
            {t.openSource.titleLine1}
            <br />
            <span className="gradient-text">{t.openSource.titleLine2}</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            {t.openSource.subtitle}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass rounded-2xl p-6 text-center"
              >
                <Icon size={18} className={`${stat.color} mx-auto mb-3`} />
                <div className="text-3xl font-black text-white mb-1 font-mono dir-ltr" dir="ltr">{stat.value}</div>
                <div className="text-xs text-white/40">{stat.label}</div>
              </motion.div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 text-start">
          {/* Contributors */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass rounded-2xl p-8"
          >
            <h3 className="font-semibold text-white/80 mb-6">{t.openSource.contributorsTitle}</h3>
            <div className="flex flex-wrap gap-2 mb-6 dir-ltr" dir="ltr">
              {contributors.map((c) => (
                <motion.div
                  key={c.id}
                  whileHover={{ scale: 1.2, y: -2 }}
                  title={`Contributor ${c.id + 1}`}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${c.color}80, ${c.color}30)`, border: `1px solid ${c.color}40` }}
                >
                  {c.initial}
                </motion.div>
              ))}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white/40 glass border-white/10">
                +
              </div>
            </div>
            <a
              href="https://github.com/abdellahaarab/lenis/graphs/contributors"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              <span>{t.openSource.viewAllContributors}</span>
              <ExternalLink size={12} className="rtl:rotate-180" />
            </a>
          </motion.div>

          {/* Release timeline */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass rounded-2xl p-8"
          >
            <h3 className="font-semibold text-white/80 mb-6">{t.openSource.releaseTimeline}</h3>
            <div className="space-y-4 relative">
              <div className="absolute start-[11px] top-2 bottom-2 w-px bg-white/10" />
              {t.openSource.releases.map((release, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${
                    i === 0
                      ? 'bg-accent-purple border-accent-purple'
                      : 'bg-black border-white/20'
                  }`}>
                    {i === 0 && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-sm font-bold text-white/80 dir-ltr" dir="ltr">
                        v{release.version}
                      </span>
                      {release.label && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          i === 0
                            ? 'bg-accent-purple/20 text-purple-300'
                            : 'bg-white/5 text-white/30'
                        }`}>
                          {release.label}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/40">{release.note}</div>
                    <div className="text-xs text-white/25 mt-0.5">{release.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Community links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          {communityLinks.map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <span>{icon}</span>
              <span>{label}</span>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
