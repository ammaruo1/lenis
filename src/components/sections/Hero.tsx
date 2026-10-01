import { useRef, useEffect } from 'react'
import { useLanguage } from '@/i18n/LanguageContext'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Briefcase, Zap } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const { dir, t } = useLanguage()
  const containerRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return

      // Entrance animation for text
      const texts = gsap.utils.toArray('.hero-text-anim')
      gsap.from(texts, {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.2
      })

      // Parallax for visual elements
      gsap.to('.hero-visual-layer-1', {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      })
      
      gsap.to('.hero-visual-layer-2', {
        y: -25,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      })
      
      // Floating animation for devices
      gsap.to('.floating-element', {
        y: '-=15',
        duration: 2.5,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        stagger: {
          each: 0.5,
          from: 'random'
        }
      })

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section 
      id="hero" 
      ref={containerRef}
      className="relative min-h-screen flex items-center bg-[#0B0B0F] overflow-hidden pt-24 pb-16"
      dir={dir}
    >
       <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
         <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
           {/* Text Content */}
           <div ref={textRef} className="w-full lg:w-1/2 flex flex-col items-start text-start">
             <span className="hero-text-anim inline-block py-1.5 px-4 rounded-full bg-purple-900/30 text-purple-300 text-sm font-medium mb-6 border border-purple-800/50">
               {t.hero.storeName}
             </span>
             
             <h1 className="hero-text-anim text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.15] tracking-tight">
               {t.hero.tagline}
             </h1>
             
             <p className="hero-text-anim text-xl md:text-2xl text-gray-300 mb-4 max-w-xl">
               {t.hero.subtitle}
             </p>
             
             <p className="hero-text-anim text-sm text-gray-400 mb-10 max-w-xl leading-relaxed">
               {t.hero.helper}
             </p>
             
             <div className="hero-text-anim flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
               <a 
                 href="#contact" 
                 className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F]"
               >
                 <Zap className="w-5 h-5" />
                 <span>{t.hero.ctaPrimary}</span>
               </a>
               
               <a 
                 href="#business" 
                 className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800/50 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F]"
               >
                 <Briefcase className="w-5 h-5" />
                 <span>{t.hero.ctaBusiness}</span>
               </a>
             </div>
           </div>

           {/* Visual Area Placeholder */}
           <div ref={visualRef} className="w-full lg:w-1/2 relative h-[50vh] lg:h-[70vh] flex items-center justify-center mt-8 lg:mt-0">
             {/* Glows */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
             <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none" />
             
             {/* Composition */}
             <div className="relative w-full max-w-md aspect-square hero-visual-layer-1">
               {/* Background Monitor (Layer 2) */}
               <div className="absolute top-[10%] right-[5%] w-[70%] h-[55%] bg-gray-900/80 border border-gray-700 rounded-lg shadow-xl backdrop-blur-sm -z-10 hero-visual-layer-2 floating-element">
                 <div className="w-full h-full border border-purple-900/30 rounded-lg flex items-center justify-center">
                    <div className="w-1/2 h-1/2 rounded-full bg-purple-500/5 blur-2xl" />
                 </div>
               </div>

               {/* Main Laptop */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[60%] bg-[#111116] border border-gray-700 rounded-lg shadow-2xl flex flex-col overflow-hidden z-20">
                 <div className="flex-1 bg-gradient-to-br from-gray-800/50 to-gray-900/80 border-b border-gray-700 p-2 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-purple-500/5" />
                   
                   {/* Abstract screen content */}
                   <div className="absolute top-4 left-4 right-4 h-3 bg-gray-700/50 rounded-full w-1/3" />
                   <div className="absolute top-10 left-4 right-4 h-24 bg-purple-500/10 rounded-lg border border-purple-500/20" />
                   <div className="absolute top-36 left-4 right-4 h-3 bg-gray-700/50 rounded-full w-2/3" />
                   <div className="absolute top-42 left-4 right-4 h-3 bg-gray-700/50 rounded-full w-1/2" />
                 </div>
                 {/* Keyboard Base */}
                 <div className="h-5 bg-gray-800 flex justify-center items-start pt-1">
                   <div className="w-[30%] h-1.5 bg-gray-600 rounded-full" />
                 </div>
               </div>

               {/* Foreground Mobile (Layer 1) */}
               <div className="absolute bottom-[15%] left-[10%] w-[22%] h-[40%] bg-gray-900 border border-gray-600 rounded-2xl shadow-2xl z-30 floating-element flex flex-col p-1" style={{ animationDelay: '1s' }}>
                 <div className="flex-1 border border-gray-700 rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col">
                    {/* Notch */}
                    <div className="w-1/3 h-2 bg-gray-950 mx-auto rounded-b-md mb-2" />
                    {/* Content */}
                    <div className="flex-1 px-2 flex flex-col gap-2">
                        <div className="w-full h-8 bg-purple-500/20 rounded-md" />
                        <div className="w-2/3 h-2 bg-gray-700 rounded-full" />
                        <div className="w-4/5 h-2 bg-gray-700 rounded-full" />
                    </div>
                 </div>
               </div>
               
               {/* Decorative elements */}
               <div className="absolute top-[25%] left-[20%] w-3 h-3 bg-purple-400 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.9)] z-30 floating-element" style={{ animationDelay: '0.5s' }} />
               <div className="absolute bottom-[35%] right-[20%] w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.9)] z-30 floating-element" style={{ animationDelay: '1.5s' }} />
             </div>
           </div>
         </div>
       </div>

       {/* Scroll Indicator */}
       <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 z-20">
         <span className="text-xs font-medium tracking-widest uppercase opacity-70">
           {t.hero.scrollIndicator}
         </span>
         <ArrowDown className="w-5 h-5 animate-bounce text-purple-500/70" />
       </div>
    </section>
  )
}
