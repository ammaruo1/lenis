import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ArrowDown, ArrowUpLeft, ArrowUpRight, ShieldCheck, Sparkles, CheckCircle, Package } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import productsData from '@/data/products.json'

gsap.registerPlugin(useGSAP)

export default function Hero() {
  const { t, language, dir } = useLanguage()
  const ref = useRef<HTMLElement>(null)
  const ar = language === 'ar'
  const Arrow = ar ? ArrowUpLeft : ArrowUpRight

  // Dynamic calculations from data
  const inStockCount = productsData.filter((p) => p.stock === 'in_stock').length
  const totalCategories = 7

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Phase 1 Motion: simple transform (y) and opacity entry only. No Pin, no Scrub.
      gsap.from('.hero-copy > *', {
        y: 28,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
      })
      gsap.from('.hero-product img', {
        y: 40,
        autoAlpha: 0,
        duration: 1.1,
        ease: 'power2.out',
      })
      gsap.from('.hero-detail', {
        autoAlpha: 0,
        y: 15,
        duration: 0.8,
        stagger: 0.15,
        delay: 0.3,
      })
      gsap.from('.hero-stat-pill', {
        autoAlpha: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.4,
      })
    })
    return () => mm.revert()
  }, { scope: ref, dependencies: [dir], revertOnUpdate: true })

  return (
    <section id="hero" ref={ref} className="hero-scene">
      <div className="page-shell hero-grid">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" />
            {t.hero.storeName}
            <span className="eyebrow-divider" />
            {ar ? 'صنعاء، اليمن' : 'Sana’a, Yemen'}
          </div>

          <h1>
            {ar ? 'تقنيتك،' : 'Your tech.'}
            <br />
            <span>{ar ? 'تعمل معًا.' : 'In sync.'}</span>
          </h1>

          <p className="hero-description">
            {ar
              ? 'أجهزة ومعدات مدروسة ومفحوصة ببيانات واضحة، وتجهيزات تصنع الفرق في يومك.'
              : 'Thoughtfully tested devices with transparent data cards and complete hardware setups.'}
          </p>

          <p className="hero-helper">{t.hero.helper}</p>

          {/* Dynamic real stats calculated directly from data */}
          <div className="flex flex-wrap gap-2.5 my-2">
            <div className="hero-stat-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-700 dark:text-purple-300">
              <Package className="w-4 h-4" />
              <span>{inStockCount} {ar ? 'جهاز متوفر بالمحل' : 'devices ready in stock'}</span>
            </div>
            <div className="hero-stat-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <span>{totalCategories} {ar ? 'فئات متخصصة' : 'specialized categories'}</span>
            </div>
            <div className="hero-stat-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{ar ? '7 فحوصات معتمدة' : '7-Point Verified'}</span>
            </div>
          </div>

          <div className="hero-actions">
            <Link to={`/${language}/shop`} className="action-primary">
              {ar ? 'تصفح المتجر والكتالوج' : 'Explore Store Catalog'}
              <Arrow size={21} />
            </Link>
            <a href="#setups" className="action-text">
              {t.hero.ctaPrimary}
              <Arrow size={18} />
            </a>
          </div>

          <div className="hero-assurance">
            <ShieldCheck size={19} />
            <span>{ar ? 'فحص كامل قبل التسليم' : 'Full pre-delivery inspection'}</span>
            <i />
            <span>{ar ? 'درجات حالة معلنة' : 'Transparent condition grades'}</span>
            <i />
            <span>{ar ? 'توافق موثق' : 'Verified compatibility'}</span>
          </div>
        </div>

        <div className="hero-art">
          <div className="hero-orbit" aria-hidden="true" />
          <span className="art-coordinate" dir="ltr">01 / DATA-FIRST HARDWARE</span>
          <div className="hero-product">
            <img
              src="/images/laptop.webp"
              alt={ar ? 'لابتوب أعمال مفحوص بشاشة واضحة' : 'Inspected business laptop'}
              width="1600"
              height="766"
              fetchPriority="high"
            />
          </div>
          <div className="hero-detail product-note">
            <span className="micro-label" dir="ltr">INSPECTED & READY</span>
            <span>{ar ? 'أداء مفحوص يواكب أفكارك.' : 'Tested performance for your ideas.'}</span>
            <Sparkles size={18} />
          </div>
          <div className="hero-detail hero-headphones">
            <img
              src="/images/headphones.webp"
              width="614"
              height="680"
              alt={ar ? 'سماعات وملحقات صوتية متوافقة' : 'Compatible audio accessories'}
            />
            <span>{ar ? 'تفاصيل تكمل التجربة' : 'The finishing touches'}</span>
          </div>
          <span className="art-caption">
            {ar ? 'من جهاز واحد… إلى عالم متكامل.' : 'From one device to a connected world.'}
          </span>
        </div>
      </div>

      <div className="page-shell hero-bottom">
        <a href="#latest-products">
          <ArrowDown size={18} />
          {t.hero.scrollIndicator}
        </a>
        <span dir="ltr">DEVICES / SETUPS / POSSIBILITIES</span>
        <span>{ar ? 'تقنية تتكامل. وبيانات موثقة.' : 'Connected tech. Verified data.'}</span>
      </div>
    </section>
  )
}
