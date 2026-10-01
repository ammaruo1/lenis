import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Laptop, Monitor, Mic, Gamepad2, Wifi, HardDrive, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ICONS = [Laptop, Monitor, Mic, Gamepad2, Wifi, HardDrive, Zap];

export default function Categories() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLAnchorElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="categories" ref={sectionRef} className="py-24 bg-[#0B0B0F] text-white">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">
          {t.categories.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {t.categories.items.map((item, index) => {
            const Icon = ICONS[index % ICONS.length];
            const isLarge = index < 2;
            return (
              <a
                key={item.id}
                href={`#contact`}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el;
                }}
                className={`group block p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 ${
                  isLarge ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-1 lg:col-span-1'
                }`}
              >
                <div className="flex items-start gap-4 h-full flex-col sm:flex-row">
                  <div className="p-4 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/30 transition-all duration-300 shrink-0">
                    <Icon size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">{item.name}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
