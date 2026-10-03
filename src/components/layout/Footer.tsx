import { useCatalog } from '@/data/CatalogContext';
import { Link } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Globe } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function Footer() {
  const { site: siteData, categories: managedCategories } = useCatalog();
  const { t, language, toggleLanguage } = useLanguage();

  const categories = managedCategories.map((c) => ({
    id: c.slug,
    label: c.title[language]
  }));

  return (
    <footer className="bg-[#FAF8FF] dark:bg-[#0B0B0F] text-[#110D20] dark:text-[#F8F7FC] pt-16 pb-8 border-t border-purple-100 dark:border-white/5 transition-colors duration-500">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.webp"
                alt={siteData.storeName[language]}
                className="h-10 w-auto object-contain"
              />
              <span className="text-xl font-extrabold text-[#110D20] dark:text-white">
                {siteData.storeName[language]}
              </span>
            </div>
            <p className="text-purple-700 dark:text-purple-300 text-sm font-semibold max-w-sm">
              {siteData.tagline[language] || 'تقنيتك، تعمل معًا.'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {siteData.city[language] || 'صنعاء، اليمن'}
            </p>
          </div>

          <nav className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8" aria-label="Footer Navigation">
            {/* Categories */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-[#110D20] dark:text-white uppercase tracking-wider">
                {t.shop.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <Link
                    to={`/${language}/shop`}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors text-xs"
                  >
                    {t.shop.allCategories}
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/${language}/shop/${c.id}`}
                      className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors text-xs"
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-[#110D20] dark:text-white uppercase tracking-wider">
                {language === 'ar' ? 'أقسام المتجر' : 'Store Sections'}
              </h3>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <Link
                    to={`/${language}/bundles`}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors text-xs"
                  >
                    {language === 'ar' ? 'الباقات والتجهيزات' : 'Curated Bundles'}
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${language}/business`}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors text-xs"
                  >
                    {language === 'ar' ? 'حلول الشركات (B2B)' : 'Business Solutions'}
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${language}/compare`}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors text-xs"
                  >
                    {language === 'ar' ? 'مقارنة الأجهزة' : 'Compare Hardware'}
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${language}/warranty`}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors text-xs"
                  >
                    {language === 'ar' ? 'الضمان والفحص' : 'Warranty & Inspection'}
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${language}/faq`}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors text-xs"
                  >
                    {language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Policies & Company */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-[#110D20] dark:text-white uppercase tracking-wider">
                {language === 'ar' ? 'الثقة والسياسات' : 'Trust & Policies'}
              </h3>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <Link
                    to={`/${language}/legal`}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors text-xs"
                  >
                    {language === 'ar' ? 'الشروط والضمان والخصوصية' : 'Terms & Privacy'}
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${language}/about`}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors text-xs"
                  >
                    {language === 'ar' ? 'من نحن' : 'About Us'}
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${language}/contact`}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors text-xs"
                  >
                    {t.nav.contactUs}
                  </Link>
                </li>
              </ul>
              <p className="text-xs text-neutral-500 leading-relaxed pt-2">
                {language === 'ar'
                  ? 'فحص شامل بـ 7 نقاط معتمدة قبل التسليم، ودرجات حالة معلنة بكل شفافية في صنعاء.'
                  : '7-Point certified hardware verification with transparent condition grading in Sana\'a.'}
              </p>
            </div>
          </nav>
        </div>

        <div className="pt-8 border-t border-purple-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-4 font-medium">
            <span>© {new Date().getFullYear()} {language === 'ar' ? 'الجيل العربي الرقمي' : 'Al-Jeel Al-Arabi'}.</span>
            <Dialog.Root>
              <Dialog.Trigger className="footer-info-link text-xs underline text-purple-600 dark:text-purple-400">
                {language === 'ar' ? 'معلومات وبيانات العرض' : 'Demo Notice'}
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="info-overlay" />
                <Dialog.Content className="info-dialog" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <Dialog.Title>
                    {language === 'ar' ? 'تنبيه البيانات التجريبية' : 'Demo Data Notice'}
                  </Dialog.Title>
                  <Dialog.Description>
                    {siteData.demoNotice[language] || siteData.demoNotice.ar}
                  </Dialog.Description>
                  <Dialog.Close aria-label={language === 'ar' ? 'إغلاق' : 'Close'}>
                    <X size={20} />
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            aria-label={t.nav.switchLanguage || 'Toggle language'}
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
