import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Trust() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  const placeholders = Array.from({ length: 8 }, (_, i) => `Brand ${i + 1}`);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="trust" ref={sectionRef} className="py-24 bg-[#0B0B0F] border-t border-white/5 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
          {t.trust.title}
        </h2>
        
        <div className="mb-12 relative w-full overflow-hidden">
          <h3 className="text-center text-gray-400 mb-8">{t.trust.brandsTitle}</h3>
          
          <div className="flex gap-6 relative" style={{ width: 'fit-content' }}>
            <div className="flex gap-6 animate-marquee">
              {placeholders.map((brand, i) => (
                <div 
                  key={i} 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 font-bold backdrop-blur-sm transition-colors hover:bg-white/10 shrink-0"
                >
                  {brand}
                </div>
              ))}
            </div>
            <div className="flex gap-6 animate-marquee" aria-hidden="true">
              {placeholders.map((brand, i) => (
                <div 
                  key={`dup-${i}`} 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 font-bold backdrop-blur-sm transition-colors hover:bg-white/10 shrink-0"
                >
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 max-w-2xl mx-auto">
          {t.trust.brandsDisclaimer}
        </p>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% - 1.5rem)); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        [dir="rtl"] .animate-marquee {
          animation-direction: reverse;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};
