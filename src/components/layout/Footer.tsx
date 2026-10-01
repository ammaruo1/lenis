import { useLanguage } from '@/i18n/LanguageContext'
import { Globe } from 'lucide-react'

export default function Footer() {
  const { t, language, toggleLanguage } = useLanguage()

  const navLinks = [
    { id: 'setups', label: t.nav.setups },
    { id: 'business', label: t.nav.businessSolutions },
    { id: 'service', label: t.nav.warrantySupport },
    { id: 'contact', label: t.nav.contactUs }
  ]

  return (
    <footer className="bg-[#0B0B0F] text-[#F8F7FC] pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-5 flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-white">
              {language === 'ar' ? 'الجيل العربي الرقمي' : 'Al-Jeel Al-Arabi'}
            </h2>
            <p className="text-purple-300 text-sm max-w-sm">
              {t.service?.motto || 'تقنية تتكامل.. وضمان يستمر'}
            </p>
            <p className="text-gray-400 text-sm">
              {t.footer?.location || 'صنعاء'}
            </p>
          </div>
          
          <nav className="md:col-span-7 flex flex-col sm:flex-row gap-8 sm:gap-16" aria-label="Footer Navigation">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-white">{language === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h3>
              <ul className="flex flex-col gap-3">
                {navLinks.map(link => (
                  <li key={link.id}>
                    <a href={`#${link.id}`} className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-gray-500 text-sm flex items-center gap-4">
            <span>© {new Date().getFullYear()} {language === 'ar' ? 'الجيل العربي الرقمي' : 'Al-Jeel Al-Arabi'}.</span>
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
          </div>
          
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-purple-400 transition-colors"
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
