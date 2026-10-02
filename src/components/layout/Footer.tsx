import { Link } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Globe } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import siteData from '@/data/site.json'

export default function Footer() {
  const { t, language, toggleLanguage } = useLanguage()

  const categories = [
    { id: 'laptops', label: t.shop.categories.laptops },
    { id: 'displays', label: t.shop.categories.displays },
    { id: 'gaming', label: t.shop.categories.gaming },
    { id: 'power', label: t.shop.categories.power },
  ]

  return (
    <footer className="bg-[#FAF8FF] dark:bg-[#0B0B0F] text-[#110D20] dark:text-[#F8F7FC] pt-16 pb-8 border-t border-purple-100 dark:border-white/5 transition-colors duration-500">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.webp"
                alt={t.footer.storeName} 
                className="h-10 w-auto object-contain"
              />
              <span className="text-xl font-extrabold text-[#110D20] dark:text-white">
                {language === 'ar' ? 'الجيل العربي الرقمي' : 'Al-Jeel Al-Arabi'}
              </span>
            </div>
            <p className="text-purple-700 dark:text-purple-300 text-sm font-semibold max-w-sm">
              {siteData.tagline[language] || 'تقنيتك، تعمل معًا.'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {siteData.city[language] || 'صنعاء، اليمن'}
            </p>
          </div>
          
          <nav className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8" aria-label="Footer Navigation">
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

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-[#110D20] dark:text-white uppercase tracking-wider">
                {language === 'ar' ? 'روابط المتجر' : 'Quick Links'}
              </h3>
              <ul className="flex flex-col gap-2.5">
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
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-[#110D20] dark:text-white uppercase tracking-wider">
                {language === 'ar' ? 'الثقة والضمان' : 'Trust'}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {language === 'ar'
                  ? 'فحص شامل بـ 7 نقاط معتمدة قبل التسليم، ودرجات حالة معلنة بكل شفافية.'
                  : '7-Point certified hardware verification with transparent condition grading.'}
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
                <Dialog.Overlay className="info-overlay"/>
                <Dialog.Content className="info-dialog" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <Dialog.Title>
                    {language === 'ar' ? 'تنبيه البيانات التجريبية' : 'Demo Data Notice'}
                  </Dialog.Title>
                  <Dialog.Description>
                    {siteData.demoNotice[language] || siteData.demoNotice.ar}
                  </Dialog.Description>
                  <Dialog.Close aria-label={language === 'ar' ? 'إغلاق' : 'Close'}>
                    <X size={20}/>
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
  )
}
