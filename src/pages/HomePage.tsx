import Hero from '@/components/sections/Hero';
import Integration from '@/components/sections/Integration';
import UseCases from '@/components/sections/UseCases';
import Categories from '@/components/sections/Categories';
import Business from '@/components/sections/Business';
import Service from '@/components/sections/Service';
import Trust from '@/components/sections/Trust';
import FinalCTA from '@/components/sections/FinalCTA';
import FeaturedCatalog from '@/components/home/FeaturedCatalog';
import HomeFAQ from '@/components/home/HomeFAQ';
import { useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useHomeMotion } from '@/hooks/useHomeMotion';
import '@/mobile-home.css';
export default function HomePage(){
  const ref = useRef<HTMLElement>(null);
  const { language } = useLanguage();
  useHomeMotion(ref, language);
  return <main ref={ref} id="main-content" className="reference-home"><Hero/><Integration/><UseCases/><Categories/><FeaturedCatalog/><Business/><Service/><Trust/><FinalCTA/><HomeFAQ/></main>;
}
