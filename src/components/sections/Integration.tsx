import React, { useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Integration() {
  const { t, dir } = useLanguage();
  const container = useRef<HTMLElement>(null);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const stages = gsap.utils.toArray('.stage-card');
      const line = document.querySelector('.connecting-line-fill');
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 60%',
          end: 'bottom 80%',
          scrub: 1,
        }
      });
      
      tl.to(line, {
        scaleX: 1,
        transformOrigin: dir === 'rtl' ? 'right' : 'left',
        ease: 'none',
        duration: 1
      }, 0);
      
      stages.forEach((stage: any, i) => {
        tl.from(stage, {
          y: 50,
          opacity: 0,
          duration: 0.3,
        }, i * (1 / stages.length));
        
        const visual = stage.querySelector('.stage-visual');
        if(visual) {
          tl.from(visual, {
            scale: 0.8,
            opacity: 0,
            duration: 0.2
          }, (i * (1 / stages.length)) + 0.1);
        }
      });
    });

    mm.add("(max-width: 767px)", () => {
      const stages = gsap.utils.toArray('.stage-card');
      
      stages.forEach((stage: any) => {
        gsap.from(stage, {
          scrollTrigger: {
            trigger: stage,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out'
        });
      });
    });
    
    return () => mm.revert();
  }, { scope: container, dependencies: [dir] });

  const isRtl = dir === 'rtl';

  return (
    <section 
      id="integration" 
      ref={container}
      className="py-24 bg-[#0B0B0F] text-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">{t.integration.title}</h2>
          <p className="text-lg md:text-xl text-gray-400">{t.integration.subtitle}</p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-[40%] left-0 right-0 h-1 bg-white/10 -translate-y-1/2 rounded-full overflow-hidden">
            <div 
              className="connecting-line-fill absolute top-0 bottom-0 w-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] scale-x-0"
              style={{ transformOrigin: isRtl ? 'right' : 'left' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
            {t.integration.stages.map((stage, idx) => (
              <div key={idx} className="stage-card bg-[#17131F]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col h-full relative">
                <div className="text-5xl font-black text-white/5 mb-6 leading-none">
                  0{idx + 1}
                </div>
                
                <div className="stage-visual w-full aspect-video rounded-xl bg-gradient-to-br from-white/5 to-white/10 mb-8 border border-white/10 flex items-center justify-center overflow-hidden relative">
                   {idx === 0 && <div className="w-16 h-16 rounded-lg bg-[#7C3AED]/20 border border-[#7C3AED]/50 shadow-[0_0_30px_rgba(124,58,237,0.3)]"></div>}
                   {idx === 1 && (
                     <div className="flex gap-4">
                       <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/50"></div>
                       <div className="w-12 h-12 rounded-lg bg-[#4C1D95]/40 border border-[#4C1D95]/50"></div>
                     </div>
                   )}
                   {idx === 2 && (
                     <div className="relative w-24 h-24">
                       <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#7C3AED]/40 to-[#8B5CF6]/40 border border-[#C4B5FD]/50 blur-sm"></div>
                       <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] border border-white/20 shadow-[0_0_40px_rgba(124,58,237,0.5)] flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md"></div>
                       </div>
                     </div>
                   )}
                </div>

                <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">{stage.title}</h3>
                <p className="text-gray-400 leading-relaxed flex-grow">{stage.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 md:mt-24 text-center">
          <a 
            href="#setups"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#7C3AED] text-white rounded-full font-bold text-lg hover:bg-[#6D28D9] transition-colors group"
          >
            {t.integration.cta}
            {isRtl ? <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </a>
        </div>
      </div>
    </section>
  );
}
