import { useCatalog } from '@/data/CatalogContext';
import MotionHeading from '@/components/home/MotionHeading';
import { referenceHome } from '@/data/reference-home';
import { isLite } from '@/hooks/useMotionMode';
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ArrowUpLeft, ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import ProductDisplay from '@/components/sections/ReferenceDisplay'

gsap.registerPlugin(useGSAP)

const images = ['laptop-design', 'desktop', 'headphones', 'gaming', 'network', 'storage', 'power']

export default function Categories() {
  const { products: productsData, categories: managedCategories } = useCatalog();
  const { t, language, dir } = useLanguage()
  const ref = useRef<HTMLElement>(null)
  const ar = language === 'ar'
  const Arrow = ar ? ArrowUpLeft : ArrowUpRight
  const items=managedCategories.map(c=>({id:c.slug,name:c.title[language],description:t.categories.items.find(item=>item.id===c.slug)?.description??''})).sort((a,b)=>{
    const rank=(id:string)=>{const i=t.categories.items.findIndex(c=>c.id===id);return i<0?100:i;};return rank(a.id)-rank(b.id);
  })

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (isLite()) return
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
            <MotionHeading lines={[t.categories.title]}/>
          </div>
          <p>
            {referenceHome[language].categoriesDescription}
          </p>
        </div>

        <div className="category-grid">
          {items.map((c, i) => {
            // Dynamically calculate product count for this category from productsData
            const count = productsData.filter((p) => p.category === c.id).length

            return (
              <Link
                key={c.id}
                to={`/${language}/shop/${c.id}`}
                className={`category-card category-${i}`}
              >
                <div className="category-meta">
                  <span className="category-number">
                    <span dir="ltr">/ 0{i + 1}</span>
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300">
                    {count} {ar ? 'منتج' : 'items'}
                  </span>
                </div>

                <span className="category-arrow">
                  <Arrow size={21} />
                </span>

                <div className="category-image">
                  {c.id === 'displays' ? (
                    <ProductDisplay label={c.name} />
                  ) : (
                    <img
                      src={`/images/home-reference/${images[t.categories.items.findIndex(item=>item.id===c.id)]??'laptop-design'}.webp`}
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
