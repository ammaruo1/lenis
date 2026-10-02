import ProductDisplay from '@/components/ui/ProductDisplay'
import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
gsap.registerPlugin(ScrollTrigger, useGSAP)
export default function Integration() {
  const { t, language, dir } = useLanguage()
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const ar = language === 'ar'
  const Arrow = ar ? ArrowLeft : ArrowRight
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({scrollTrigger: {trigger: ref.current, start: 'top top', end: '+=1700', pin: '.integration-sticky', scrub: 1, invalidateOnRefresh: true, onUpdate: s => setActive(Math.min(2, Math.floor(s.progress * 3)))}})
      tl.fromTo('.ecosystem-laptop', {x: -55, y: 55, scale: .87}, {x: 0, y: 0, scale: 1, duration: 1})
        .fromTo('.ecosystem-audio', {x: 100, y: 50, opacity: .12, rotate: 15}, {x: 0, y: 0, opacity: 1, rotate: 0, duration: 1}, .7)
        .fromTo('.ecosystem-desktop', {x: -80, y: 80, opacity: .1, scale: .8}, {x: 0, y: 0, opacity: 1, scale: 1, duration: 1}, 1.6)
        .to('.ecosystem-halo', {scale: 1.2, opacity: .8, duration: 1}, 1.5)
    })
    mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.from('.ecosystem-laptop', {y: 40, scale: .92, duration: 1, scrollTrigger:{trigger:'.ecosystem',start:'top 85%',once:true}})
      gsap.from('.integration-step', {x: ar ? 24 : -24, opacity: 0, stagger: .15, duration: .7, scrollTrigger:{trigger:'.integration-steps',start:'top 85%',once:true}})
    })
    return () => mm.revert()
  }, {scope:ref,dependencies:[dir],revertOnUpdate:true})
  return <section id="integration" ref={ref} className="integration-scene">
    <div className="integration-sticky"><div className="page-shell integration-grid">
      <div className="integration-copy"><div className="eyebrow"><span className="section-index">01</span>{ar ? 'الصورة الكاملة' : 'THE BIG PICTURE'}</div><h2>{ar ? <>كل جزء له دور.<br/><em>معًا، تصنع الفرق.</em></> : <>Every part matters.<br/><em>Better together.</em></>}</h2><p>{t.integration.subtitle}</p>
        <div className="integration-steps">{t.integration.stages.map((s,i)=><div className={`integration-step ${active===i?'is-active':''}`} key={s.title}><span className="step-number">0{i+1}</span><div><h3>{s.title}</h3><p>{s.description}</p></div><Check size={18}/></div>)}</div>
        <a className="action-text" href="#setups">{t.integration.cta}<Arrow size={20}/></a>
      </div>
      <div className="ecosystem"><div className="ecosystem-halo" aria-hidden="true"/><span className="ecosystem-word" aria-hidden="true" dir="ltr">IN SYNC.</span><img className="ecosystem-laptop" src="/images/laptop.webp" alt={ar?'لابتوب للتجهيز الشخصي':'Laptop for your personal setup'} width="1600" height="766" loading="lazy"/><img className="ecosystem-audio" src="/images/headphones.webp" alt={ar?'سماعات تكمل التجهيز':'Headphones to complete the setup'} width="614" height="680" loading="lazy"/><ProductDisplay className="ecosystem-desktop" label={ar?'شاشة ومحطة عمل متكاملة':'Display and desktop workstation'}/><span className="ecosystem-caption"><span className="status-dot"/>{ar?'اختيار. توافق. تكامل.':'CHOOSE. CONNECT. CREATE.'}</span></div>
    </div></div>
  </section>
}
