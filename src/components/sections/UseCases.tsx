import React, { useRef, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import * as Tabs from '@radix-ui/react-tabs';
import {
  Laptop,
  Briefcase,
  HardDrive,
  Monitor,
  Usb,
  LayoutGrid,
  Mic,
  Lightbulb,
  Headphones,
  Gamepad2,
  Mouse,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function UseCases() {
  const { t, dir } = useLanguage();
  const container = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(t.useCases.cases[0]?.id || 'study');

  const isRtl = dir === 'rtl';

  useGSAP(() => {
    // Section fade-in on scroll
    gsap.from(container.current, {
      scrollTrigger: {
        trigger: container.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  }, { scope: container });

  const handleTabChange = (value: string) => {
    if (value === activeTab) return;
    
    // Crossfade animation
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.to('.tab-content-inner', {
        opacity: 0,
        y: 10,
        duration: 0.2,
        ease: 'power2.inOut',
        onComplete: () => {
          setActiveTab(value);
          gsap.fromTo('.tab-content-inner', 
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.1 }
          );
        }
      });
    }, contentRef);

    return () => ctx.revert();
  };

  const getIcon = (caseId: string, itemIndex: number) => {
    const iconClass = "w-6 h-6 text-[#7C3AED]";
    switch (caseId) {
      case 'study':
        if (itemIndex === 0) return <Laptop className={iconClass} />;
        if (itemIndex === 1) return <Briefcase className={iconClass} />;
        if (itemIndex === 2) return <HardDrive className={iconClass} />;
        break;
      case 'work':
        if (itemIndex === 0) return <Monitor className={iconClass} />;
        if (itemIndex === 1) return <Usb className={iconClass} />;
        if (itemIndex === 2) return <LayoutGrid className={iconClass} />;
        break;
      case 'content':
        if (itemIndex === 0) return <Mic className={iconClass} />;
        if (itemIndex === 1) return <Lightbulb className={iconClass} />;
        if (itemIndex === 2) return <Headphones className={iconClass} />;
        break;
      case 'gaming':
        if (itemIndex === 0) return <Gamepad2 className={iconClass} />;
        if (itemIndex === 1) return <Monitor className={iconClass} />;
        if (itemIndex === 2) return <Mouse className={iconClass} />;
        break;
    }
    return <Laptop className={iconClass} />; // fallback
  };

  return (
    <section 
      id="setups" 
      ref={container}
      className="py-24 bg-[#F8F7FC] text-[#17131F] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">{t.useCases.title}</h2>
          <p className="text-lg md:text-xl text-gray-600">{t.useCases.subtitle}</p>
        </div>

        <Tabs.Root 
          value={activeTab} 
          onValueChange={handleTabChange}
          dir={dir}
          className="flex flex-col gap-12"
        >
          <Tabs.List 
            className="flex overflow-x-auto md:overflow-visible pb-4 md:pb-0 hide-scrollbar gap-2 md:gap-4 md:justify-center border-b border-gray-200"
            aria-label="Use cases"
          >
            {t.useCases.cases.map((c) => (
              <Tabs.Trigger
                key={c.id}
                value={c.id}
                className="whitespace-nowrap px-6 py-4 text-lg font-medium text-gray-500 hover:text-[#17131F] border-b-2 border-transparent data-[state=active]:border-[#7C3AED] data-[state=active]:text-[#7C3AED] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] rounded-t-lg"
              >
                {c.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <div ref={contentRef} className="relative min-h-[400px]">
            {t.useCases.cases.map((c) => (
              <Tabs.Content
                key={c.id}
                value={c.id}
                className="focus:outline-none"
                forceMount={true}
                style={{ display: activeTab === c.id ? 'block' : 'none' }}
              >
                <div className="tab-content-inner grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1 space-y-8">
                    <div>
                      <h3 className="text-3xl font-bold mb-4">{c.title}</h3>
                      <p className="text-gray-600 text-lg leading-relaxed">{c.description}</p>
                    </div>

                    <div className="space-y-6">
                      {c.items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          <div className="mt-1 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                            {getIcon(c.id, idx)}
                          </div>
                          <p className="text-gray-800 font-medium pt-3">{item}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <a 
                        href={`#contact?interest=${c.id}`}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#17131F] text-white rounded-full font-bold hover:bg-[#7C3AED] transition-colors group"
                      >
                        {c.cta}
                        {isRtl ? <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                      </a>
                    </div>
                  </div>

                  <div className="order-1 lg:order-2 tab-content-inner">
                    <div className="w-full aspect-square md:aspect-[4/3] bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-gray-100 flex items-center justify-center overflow-hidden relative">
                      {/* Geometric placeholder based on active tab */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
                      
                      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mb-8 relative">
                          <div className="absolute inset-0 border-2 border-dashed border-[#7C3AED]/30 rounded-full animate-[spin_20s_linear_infinite]"></div>
                          {getIcon(c.id, 0)}
                        </div>
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center">
                             {getIcon(c.id, 1)}
                          </div>
                          <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center">
                             {getIcon(c.id, 2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tabs.Content>
            ))}
          </div>
        </Tabs.Root>
      </div>
    </section>
  );
}
