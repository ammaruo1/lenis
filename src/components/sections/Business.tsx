import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Server, Network, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Business() {
  const { t, dir } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const pillarsRef = useRef<HTMLDivElement[]>([]);
  const stepsRef = useRef<HTMLDivElement[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);

  const icons = [Server, Network, ShieldCheck];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pillars reveal
      gsap.fromTo(
        pillarsRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: pillarsRef.current[0],
            start: 'top 85%',
          }
        }
      );

      // Line animation for steps
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { height: 0 },
          {
            height: '100%',
            duration: 1.5,
            ease: 'none',
            scrollTrigger: {
              trigger: stepsRef.current[0],
              start: 'top 80%',
              end: 'bottom 20%',
              scrub: true,
            }
          }
        );
      }

      // Steps reveal
      gsap.fromTo(
        stepsRef.current,
        { x: dir === 'rtl' ? -30 : 30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.3,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: stepsRef.current[0],
            start: 'top 75%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [dir]);

  return (
    <section id="business" ref={sectionRef} className="py-24 bg-[#0B0B0F] text-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{t.business.title}</h2>
          <h3 className="text-xl md:text-2xl text-purple-400 mb-6">{t.business.subtitle}</h3>
          <p className="text-gray-400 text-lg leading-relaxed">{t.business.description}</p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {t.business.pillars.map((pillar, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div 
                key={index} 
                ref={(el) => { if (el) pillarsRef.current[index] = el; }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors"
              >
                <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6">
                  <Icon size={28} />
                </div>
                <h4 className="text-xl font-bold mb-4">{pillar.title}</h4>
                <p className="text-gray-400 leading-relaxed">{pillar.description}</p>
              </div>
            );
          })}
        </div>

        {/* Process Steps */}
        <div className="relative max-w-3xl mx-auto mb-16">
          <div className="absolute top-0 bottom-0 w-1 bg-white/10 start-8 md:start-1/2 md:-translate-x-1/2 rtl:md:translate-x-1/2"></div>
          <div 
            ref={lineRef} 
            className="absolute top-0 w-1 bg-purple-500 start-8 md:start-1/2 md:-translate-x-1/2 rtl:md:translate-x-1/2" 
            style={{ height: '0%' }}
          ></div>
          
          <div className="space-y-12">
            {t.business.steps.map((step, index) => (
              <div 
                key={index}
                ref={(el) => { if (el) stepsRef.current[index] = el; }}
                className={`relative flex flex-col md:flex-row gap-8 md:gap-16 items-start md:items-center ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="hidden md:block flex-1"></div>
                <div className="absolute start-8 md:start-1/2 transform -translate-x-1/2 rtl:translate-x-1/2 w-8 h-8 rounded-full bg-purple-900 border-4 border-purple-500 flex items-center justify-center text-xs font-bold text-white z-10 mt-1 md:mt-0">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 ms-16 md:ms-0">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                    <h4 className="text-xl font-bold mb-2 text-purple-300">{step.title}</h4>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <a 
            href="#contact" 
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-purple-600 text-white font-bold text-lg hover:bg-purple-700 transition-colors shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transform hover:-translate-y-1"
          >
            {t.business.cta}
          </a>
        </div>
      </div>
    </section>
  );
};
