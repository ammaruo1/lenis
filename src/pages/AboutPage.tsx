import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Target,
  Users,
  Compass,
} from 'lucide-react';
import siteData from '@/data/site.json';
import { useLanguage } from '@/i18n/LanguageContext';

export const AboutPage: React.FC = () => {
  const { language, dir } = useLanguage();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const promises = [
    {
      num: '01',
      title: language === 'ar' ? 'بطاقة بيانات كاملة لكل جهاز' : 'Full Data Card for Every Device',
      desc:
        language === 'ar'
          ? 'المعالج وجيله، الرام ونوعها وقابليتها للترقية، التخزين وسرعته، الشاشة، والمنافذ. لا نترك مواصفة جوهرية مجهولة.'
          : 'Processor generation, upgradable RAM, NVMe speeds, display panel, and ports. No essential spec is left omitted.',
    },
    {
      num: '02',
      title: language === 'ar' ? 'ما تشتريه يعمل معًا بتوافق تام' : 'Ecosystem Compatibility Verified',
      desc:
        language === 'ar'
          ? 'نتحقق من توافق المنافذ وقدرة الشحن بالواط (PD) واستقرار التوصيل بين اللابتوب والشاشة ووحدات الطاقة قبل التسليم.'
          : 'We verify port compatibility, USB-C PD wattage, and power requirements between your setup components prior to delivery.',
    },
    {
      num: '03',
      title: language === 'ar' ? 'ضمان مكتوب بنطاق محدد' : 'Documented Warranty with Clear Scope',
      desc:
        language === 'ar'
          ? 'بنود واضحة وصريحة: ماذا يغطي الضمان وماذا يستثني، وما هي خطوات الاستبدال أو الصيانة دون وعود غامضة.'
          : 'Transparent terms detailing coverage, explicit exclusions, and straightforward claim protocols without ambiguity.',
    },
    {
      num: '04',
      title: language === 'ar' ? 'دعم فني واستشارة بقناة موثوقة' : 'Direct Support & Technical Consultation',
      desc:
        language === 'ar'
          ? 'استشارة اختيار الأجهزة بحسب البرامج والتخصص، مع دعم فني مستمر لتحديث الأنظمة وتنظيف الأجهزة وترقية القطع.'
          : 'Hardware selection advice tailored to your exact software workflow, with ongoing diagnostics and upgrade support.',
    },
  ];

  // Schema.org LocalBusiness / Organization JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteData.storeName[language] || siteData.storeName.ar,
    alternateName: siteData.englishName,
    description:
      language === 'ar'
        ? 'متجر ومزوّد حلول تقنية في صنعاء: أجهزة لابتوب مفحوصة، شاشات، ملحقات، شبكات، وحلول طاقة وحماية.'
        : 'Electronics and technical solutions provider in Sana\'a, Yemen: inspected laptops, displays, networking, and power systems.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Sana\'a',
      addressCountry: 'YE',
    },
  };

  return (
    <div className="min-h-screen pt-28 pb-24 bg-neutral-50 dark:bg-neutral-950">
      {/* Schema.org LocalBusiness JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-6"
        >
          <Link to={`/${language}`} className="hover:text-purple-600 transition-colors">
            {language === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          <span className="text-neutral-800 dark:text-neutral-200 font-medium">
            {language === 'ar' ? 'من نحن' : 'About Us'}
          </span>
        </nav>

        {/* Hero Banner */}
        <section className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Compass className="w-4 h-4" />
            <span>{siteData.city[language] || 'صنعاء، اليمن'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight leading-tight mb-4">
            {siteData.storeName[language] || siteData.storeName.ar}
          </h1>

          <p className="text-lg sm:text-xl font-semibold text-purple-600 dark:text-purple-400 mb-6">
            «{siteData.tagline[language] || 'تقنيتك، تعمل معًا.'}»
          </p>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {language === 'ar'
              ? 'متجر ومزوّد حلول تقنية متخصص في صنعاء. لا ننافس بإعلانات مبهمة أو تفاصيل غير مؤكدة؛ بل ننافس بالوضوح التام، وجودة الفحص قبل التسليم، وتنظيم البيانات الفنية التي تحترم وقت العميل وقراره.'
              : 'A dedicated electronics and tech solution store in Sana\'a. We don\'t compete with vague ads or hidden details; our value lies in total transparency, certified pre-delivery inspection, and structured data that respects your decision.'}
          </p>
        </section>

        {/* Core Positioning Statement */}
        <section className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-neutral-900 border border-purple-500/30 shadow-lg shadow-purple-500/5 mb-16 relative overflow-hidden">
          <div className="absolute top-0 end-0 p-8 opacity-5 text-purple-600 pointer-events-none">
            <Target className="w-40 h-40" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="text-xs uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400 block mb-2">
              {language === 'ar' ? 'مبدأ عملنا والتموضع' : 'Our Guiding Philosophy'}
            </span>
            <blockquote className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-snug mb-4">
              {language === 'ar'
                ? '«لا نبيع قطعة معزولة. نبيع تجهيزًا كاملًا يعمل معًا، ببيانات واضحة وضمان مكتوب.»'
                : '“We never sell isolated pieces. We provide complete setups that work together, backed by transparent specs and written warranty.”'}
            </blockquote>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {language === 'ar'
                ? 'في سوق اعتاد فيه المشتري على مواصفات مبعثرة وضمانات شفوية قصيرة، اخترنا أن نبني الثقة عبر تقارير فحص حقيقية بدرجات حالة معلنة ومعايير توافق معتمدة.'
                : 'In a market historically accustomed to scattered listings and short verbal promises, we build confidence through 7-point diagnostic testing, declared condition grades, and verified component synergy.'}
            </p>
          </div>
        </section>

        {/* The 4 Verifiable Promises */}
        <section className="mb-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              {language === 'ar' ? 'أربعة وعود قابلة للتحقق' : 'Four Verifiable Commitments'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              {language === 'ar'
                ? 'كل وعد نقطعه على أنفسنا مدعوم بآلية فحص وبيانات موثقة'
                : 'Every promise we make is backed by documented hardware inspection protocols'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promises.map((p) => (
              <div
                key={p.num}
                className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3"
              >
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300">
                  {p.num}
                </span>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {p.title}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="text-center p-8 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            {language === 'ar' ? 'جاهز لاستكشاف الأجهزة والتجهيزات؟' : 'Ready to Explore Our Catalog?'}
          </h2>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mb-5">
            {language === 'ar'
              ? 'تصفح الكتالوج وفلتر الأجهزة بحسب الرام والمعالج ودرجة الحالة، أو اطلع على قائمة الفحص المعتمدة.'
              : 'Browse our catalog with filters for RAM, processor and condition, or review our certified inspection checklist.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/${language}/shop`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors"
            >
              <span>{language === 'ar' ? 'تصفح المتجر' : 'Explore Catalog'}</span>
              <Arrow className="w-3.5 h-3.5" />
            </Link>
            <Link
              to={`/${language}/warranty`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              <span>{language === 'ar' ? 'معايير الفحص والضمان' : 'Inspection Standards'}</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
