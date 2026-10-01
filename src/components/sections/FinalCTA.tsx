import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function FinalCTA() {
  const { t } = useLanguage();

  return (
    <section id="contact" className="relative py-32 bg-gradient-to-b from-[#0B0B0F] to-[#1a0b2e] text-white overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
          {t.finalCta.title}
        </h2>
        <p className="text-xl md:text-2xl text-purple-200/70 mb-12 max-w-2xl mx-auto">
          {t.finalCta.subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <a 
            href="#contact" 
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-purple-600 text-white font-bold text-lg hover:bg-purple-500 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transform hover:-translate-y-1"
          >
            {t.finalCta.individual}
          </a>
          <a 
            href="#business" 
            className="w-full sm:w-auto px-8 py-4 rounded-full border border-purple-500/50 bg-purple-900/20 text-white font-bold text-lg hover:bg-purple-800/40 transition-colors backdrop-blur-sm"
          >
            {t.finalCta.business}
          </a>
          <a 
            href="#contact" 
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 text-gray-300 font-bold text-lg hover:bg-white/10 hover:text-white transition-colors"
          >
            {t.finalCta.support}
          </a>
        </div>
      </div>
    </section>
  );
};
