import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/i18n/LanguageContext'
import { Menu, X, Globe } from 'lucide-react'
import { useLenis } from 'lenis/react'
import SkipLink from './SkipLink'

export default function Navigation() {
  const { t, language, toggleLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  
  const lenis = useLenis()

  const navLinks = [
    { id: 'setups', label: t.nav.setups },
    { id: 'business', label: t.nav.businessSolutions },
    { id: 'service', label: t.nav.warrantySupport },
    { id: 'contact', label: t.nav.contactUs }
  ]

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50)
    
    const sections = ['hero', 'integration', 'setups', 'categories', 'business', 'service', 'trust', 'contact']
    let current = ''
    for (const section of sections) {
      const el = document.getElementById(section)
      if (el && window.scrollY >= el.offsetTop - 100) {
        current = section
      }
    }
    setActiveSection(current)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const scrollTo = (id: string, e?: React.MouseEvent) => {
    e?.preventDefault()
    setIsOpen(false)
    if (lenis) {
      lenis.scrollTo(`#${id}`, { offset: -64 })
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const Logo = () => (
    <a 
      href="#hero" 
      onClick={(e) => scrollTo('hero', e)}
      className="text-lg font-bold text-[#17131F] flex items-center gap-2"
    >
      <span className="text-purple-600">{language === 'ar' ? 'الجيل العربي' : 'Al-Jeel Al-Arabi'}</span>
      <span>{language === 'ar' ? 'الرقمي' : 'Digital'}</span>
    </a>
  )

  return (
    <>
      <SkipLink />
      <header 
        className={`fixed top-0 start-0 end-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm h-16' : 'bg-transparent h-20'
        } flex items-center`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-full">
            <Logo />

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8" aria-label={'Main Navigation'}>
              <ul className="flex items-center gap-6">
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      onClick={(e) => scrollTo(link.id, e)}
                      className={`text-sm font-medium transition-colors hover:text-purple-600 ${
                        activeSection === link.id ? 'text-purple-600' : 'text-[#17131F]'
                      }`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 text-sm font-medium text-[#17131F] hover:text-purple-600 transition-colors"
                  aria-label={t.nav.switchLanguage || 'Toggle language'}
                >
                  <Globe className="w-4 h-4" />
                  <span>{language === 'ar' ? 'English' : 'العربية'}</span>
                </button>
                
                <a 
                  href="#setups"
                  onClick={(e) => scrollTo('setups', e)}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-purple-600/20"
                >
                  {t.nav.findSetup}
                </a>
              </div>
            </nav>

            {/* Mobile Header Controls */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={toggleLanguage}
                className="p-2 text-[#17131F] hover:text-purple-600"
                aria-label={t.nav.switchLanguage || 'Toggle language'}
              >
                <Globe className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-[#17131F]"
                aria-expanded={isOpen}
                aria-label={t.nav.toggleMenu || 'Open Menu'}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-[#F8F7FC] z-50 flex flex-col md:hidden"
            role="dialog"
            aria-modal="true"
            ref={menuRef}
          >
            <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200">
              <Logo />
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-[#17131F]"
                aria-label={t.nav.toggleMenu || 'Close Menu'}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-8 px-6 flex flex-col gap-6">
              <nav className="flex flex-col gap-6" aria-label={'Mobile Navigation'}>
                {navLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => scrollTo(link.id, e)}
                    className={`text-2xl font-bold transition-colors ${
                      activeSection === link.id ? 'text-purple-600' : 'text-[#17131F]'
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              
              <div className="mt-auto pt-8 border-t border-gray-200 flex flex-col gap-4">
                <a 
                  href="#setups"
                  onClick={(e) => scrollTo('setups', e)}
                  className="w-full py-4 text-center bg-purple-600 hover:bg-purple-700 text-white text-lg font-medium rounded-xl"
                >
                  {t.nav.findSetup}
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
