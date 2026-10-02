import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ArrowUpLeft, ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import productsData from '@/data/products.json'
import ProductDisplay from '@/components/ui/ProductDisplay'

gsap.registerPlugin(useGSAP)

const images = ['laptop-design', 'desktop', 'headphones', 'gaming', 'network', 'storage', 'power']

export default function Categories() {
  const { t, language, dir } = useLanguage()
  const ref = useRef<HTMLElement>(null)
  const ar = language === 'ar'
  const Arrow = ar ? ArrowUpLeft : ArrowUpRight

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Phase 1 Motion: Simple reveal without scrub
      gsap.utils.toArray<HTMLElement>('.category-card').forEach((card, i) => {
        gsap.from(card, {
          y: 35,
          opacity: 0,
          duration: 0.7,
          delay: (i % 3) * 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: card, start: 'top 92%', once: true },
        })
      })
    })
    return () => mm.revert()
  }, { scope: ref, dependencies: [dir], revertOnUpdate: true })

  return (
    <section id="categories" ref={ref} className="categories-section section-space">
      <div className="page-shell">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="section-index">03</span>
              {ar ? 'عالم من الإمكانيات' : 'A WORLD OF POSSIBILITIES'}
            </div>
            <h2>{t.categories.title}</h2>
          </div>
          <p>
            {ar
              ? 'كل ما تحتاجه، ليعمل عالمك معًا ببيانات ومواصفات دقيقة.'
              : 'Everything you need to bring your world together with clear hardware data.'}
          </p>
        </div>

        <div className="category-grid">
          {t.categories.items.map((c, i) => {
            // Dynamically calculate product count for this category from productsData
            const count = productsData.filter((p) => p.category === c.id).length

            return (
              <Link
                key={c.id}
                to={`/${language}/shop/${c.id}`}
                className={`category-card category-${i}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="category-number" dir="ltr">
                    / 0{i + 1}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300">
                    {count} {ar ? 'منتج' : 'items'}
                  </span>
                </div>

                <span className="category-arrow">
                  <Arrow size={21} />
                </span>

                <div className="category-image">
                  {i === 1 ? (
                    <ProductDisplay label={c.name} />
                  ) : (
                    <img
                      src={`/images/${images[i]}.webp`}
                      alt={c.name}
                      width="900"
                      height="600"
                      loading="lazy"
                    />
                  )}
                </div>

                <div className="category-copy">
                  <h3>{c.name}</h3>
                  <p>{c.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
