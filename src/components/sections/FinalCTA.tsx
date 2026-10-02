import { useState, useEffect } from 'react'
import { Copy, Check, ArrowUpLeft, ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
export default function FinalCTA(){
 const {t,language}=useLanguage()
 const ar=language==='ar',Arrow=ar?ArrowUpLeft:ArrowUpRight
 const [interest,setInterest]=useState('study')
 const [details,setDetails]=useState('')
 const [copied,setCopied]=useState(false)
 const [error,setError]=useState(false)
 const options=[...t.useCases.cases.map(c=>({id:c.id,label:c.label})),...t.categories.items.map(c=>({id:`category-${c.id}`,label:c.name})),{id:'business',label:t.finalCta.business},{id:'support',label:t.finalCta.support}]
 useEffect(()=>{
  const handler=(e:Event)=>{setInterest((e as CustomEvent<string>).detail);setCopied(false)}
  window.addEventListener('setup-interest',handler)
  return()=>window.removeEventListener('setup-interest',handler)
 },[])
 useEffect(()=>{setCopied(false)},[interest,details,language])
 const summary=`${t.footer.storeName}\n${ar?'احتياجي':'My setup'}: ${options.find(o=>o.id===interest)?.label}\n${details.trim()}`
 const copy=async()=>{try{await navigator.clipboard.writeText(summary);setCopied(true);setError(false)}catch{setError(true)}}
 return <section id="contact" className="contact-section section-space"><div className="page-shell contact-grid"><div><div className="eyebrow"><span className="status-dot"/>{ar?'خطوتك التالية تبدأ هنا':'YOUR NEXT CHAPTER STARTS HERE'}</div><h2>{ar?<>جاهز لتجربة<br/><em>على مقاسك؟</em></>:<>Ready for something<br/><em>built around you?</em></>}</h2><p>{t.finalCta.subtitle}</p><span className="contact-location">{t.footer.location} / {ar?'أجهزة • تجهيزات • حلول':'DEVICES • SETUPS • SOLUTIONS'}</span></div><div className="brief-card"><span className="micro-label">{ar?'رتّب احتياجك':'BUILD YOUR BRIEF'}</span><h3>{t.finalCta.title}</h3><label htmlFor="brief-interest">{t.contact.useCaseLabel}</label><select id="brief-interest" value={interest} onChange={e=>setInterest(e.target.value)}>{options.map(o=><option value={o.id} key={o.id}>{o.label}</option>)}</select><label htmlFor="brief-details">{ar?'ما الذي يهمك في تجهيزك؟':'What matters in your setup?'}</label><textarea id="brief-details" rows={3} value={details} onChange={e=>setDetails(e.target.value)} placeholder={ar?'استخدامك، جهازك الحالي، والميزانية التقريبية…':'Your use, current device and approximate budget…'}/><button type="button" className="action-primary" onClick={copy}>{copied?<Check size={19}/>:<Copy size={19}/>}<span>{copied?(ar?'تم نسخ ملخصك':'Brief copied'):(ar?'انسخ ملخص احتياجك':'Copy your setup brief')}</span><Arrow size={19}/></button><p className="brief-note" role="status">{error?(ar?'تعذر النسخ. يمكنك تحديد النص من الحقول ونسخه يدويًا.':'Copy unavailable. Select and copy the fields manually.'):(ar?'ملخص جاهز لتشاركه مع فريقنا. لا تُرسل بياناتك تلقائيًا.':'A brief ready to share with our team. Nothing is sent automatically.')}</p></div></div></section>
}
