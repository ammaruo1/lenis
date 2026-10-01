import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Service() {
  const { t, dir } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const stagesRef = useRef<HTMLDivElement[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          width: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top center',
            end: 'bottom 80%',
            scrub: true,
          }
        });
      }

      stagesRef.current.forEach((stage, i) => {
        gsap.fromTo(stage,
          { opacity: 0.3, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `top+=${i * 15}% center`,
              end: `top+=${(i + 1) * 15}% center`,
              scrub: true,
            }
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="service" ref={sectionRef} className="py-24 bg-[#F8F7FC] text-[#17131F]">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#17131F]">{t.service.title}</h2>
          <p className="text-lg text-gray-600 leading-relaxed">{t.service.subtitle}</p>
        </div>

        <div className="relative mb-24">
          {/* Connecting line background */}
          <div className="absolute top-8 start-0 w-full h-1 bg-gray-200 rounded-full hidden md:block"></div>
          {/* Progress line */}
          <div 
            ref={progressBarRef}
            className="absolute top-8 start-0 h-1 bg-purple-600 rounded-full hidden md:block" 
            style={{ width: '0%', transformOrigin: dir === 'rtl' ? 'right' : 'left' }}
          ></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {t.service.stages.map((stage, index) => (
              <div 
                key={index}
                ref={el => { if (el) stagesRef.current[index] = el; }}
                className="relative flex flex-col items-center md:items-start text-center md:text-start"
              >
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-gray-200 flex items-center justify-center text-xl font-bold text-gray-400 mb-6 relative z-10 shadow-sm transition-all duration-300">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#17131F]">{stage.title}</h3>
                <p className="text-gray-600 leading-relaxed">{stage.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <a 
            href="#contact" 
            className="px-8 py-4 rounded-full border-2 border-purple-600 text-purple-700 font-bold hover:bg-purple-50 transition-colors w-full sm:w-auto text-center"
          >
            {t.service.warrantyLink}
          </a>
          <a 
            href="#contact" 
            className="px-8 py-4 rounded-full bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors w-full sm:w-auto text-center"
          >
            {t.service.helpCta}
          </a>
        </div>

        <div className="text-center">
          <p className="inline-block text-xl md:text-2xl font-bold italic text-purple-600 px-8 py-4 bg-purple-100/50 rounded-2xl border border-purple-200">
            "{t.service.motto}"
          </p>
        </div>
      </div>
    </section>
  );
};
