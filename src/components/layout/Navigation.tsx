import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '@/i18n/LanguageContext'
import { useTheme } from '@/i18n/ThemeContext'
import { Menu, X, Globe, Sun, Moon, ShoppingBag, User } from 'lucide-react'
import { scrollTo as scrollPage, setScrollLocked } from '@/hooks/useLenis'
import { shopApi, type Preview } from '@/data/commerce'
import SkipLink from './SkipLink'

export default function Navigation() {
  const { t, language, toggleLanguage } = useLanguage()
  const { toggleTheme, isDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const updateCartCount = () => {
      shopApi<Preview>('/cart')
        .then((res) => {
          const count = res.rawLines?.reduce((sum, line) => sum + (line.quantity || 1), 0) ?? 0
          setCartCount(count)
        })
        .catch(() => {})
    }
    updateCartCount()
    window.addEventListener('store-cart-changed', updateCartCount)
    return () => window.removeEventListener('store-cart-changed', updateCartCount)
  }, [])

  const isHomePage = location.pathname === `/${language}` || location.pathname === `/${language}/`

  const navLinks = [
    { id: 'shop', label: t.shop.title, path: `/${language}/shop`, isRoute: true },
    { id: 'bundles', label: language === 'ar' ? 'الباقات والتجهيزات' : 'Bundles', path: `/${language}/bundles`, isRoute: true },
    { id: 'business', label: language === 'ar' ? 'حلول الشركات' : 'Business', path: `/${language}/business`, isRoute: true },
    { id: 'compare', label: language === 'ar' ? 'المقارنة' : 'Compare', path: `/${language}/compare`, isRoute: true },
    { id: 'warranty', label: language === 'ar' ? 'الضمان والفحص' : 'Warranty', path: `/${language}/warranty`, isRoute: true },
    { id: 'about', label: language === 'ar' ? 'من نحن' : 'About', path: `/${language}/about`, isRoute: true },
    { id: 'contact', label: t.nav.contactUs, path: `/${language}/contact`, isRoute: true }
  ]

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50)
    
    if (!isHomePage) return

    const sections = ['hero', 'latest-products', 'integration', 'setups', 'categories', 'business', 'service', 'trust', 'contact']
    let current = ''
    for (const section of sections) {
      const el = document.getElementById(section)
      if (el && el.getBoundingClientRect().top <= 100) {
        current = section
      }
    }
    setActiveSection(current)
  }, [isHomePage])

  useEffect(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    setScrollLocked(isOpen)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    const focusTimer = isOpen ? window.setTimeout(() => menuRef.current?.querySelector<HTMLButtonElement>('button')?.focus(), 0) : undefined
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && isOpen) {
        const focusable = menuRef.current?.querySelectorAll<HTMLElement>('a[href], button')
        if (focusable?.length) {
          const first = focusable[0], last = focusable[focusable.length - 1]
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
        }
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => { window.clearTimeout(focusTimer); window.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; setScrollLocked(false) }
  }, [isOpen])

  const handleNavClick = (link: typeof navLinks[0], e?: React.MouseEvent) => {
    setIsOpen(false)
    if (link.isRoute) {
      // It's a standard page route
      return
    }

    // It's an anchor on the homepage
    e?.preventDefault()
    if (isHomePage) {
      window.history.replaceState(null, '', `#${link.id}`)
      requestAnimationFrame(() => scrollPage(`#${link.id}`, { offset: 0 }))
    } else {
      navigate(`/${language}#${link.id}`)
    }
  }

  const textColor = isDark ? 'text-white' : 'text-[#17131F]'

  const Logo = () => (
    <Link 
      to={`/${language}`}
      className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
      aria-label={language === 'ar' ? 'الجيل العربي الرقمي — الرئيسية' : 'Al-Jeel Al-Arabi Digital — Home'}
    >
      <img 
        src="/logo.webp"
        alt={language === 'ar' ? 'شعار الجيل العربي الرقمي' : 'Al-Jeel Al-Arabi Digital Logo'}
        className="nav-logo h-10 w-auto object-contain"
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.display = 'none'
          const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement
          if (fallback) fallback.style.display = 'flex'
        }}
      />
      <span className={`nav-brand text-lg font-bold flex flex-col items-start ${textColor}`}>
        <span className="text-purple-600">{language === 'ar' ? 'الجيل العربي' : 'Al-Jeel Al-Arabi'}</span>
        <span>{language === 'ar' ? 'الرقمي' : 'Digital'}</span>
      </span>
    </Link>
  )

  return (
    <>
      <SkipLink />
      <header 
        className={`site-nav fixed top-0 start-0 end-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? isDark 
              ? 'bg-[#0B0B0F]/90 backdrop-blur-md shadow-sm shadow-black/30 h-16' 
              : 'bg-white/90 backdrop-blur-md shadow-sm h-16'
            : 'bg-transparent h-20'
        } flex items-center`}
      >
        <div className="page-shell">
          <div className="flex items-center justify-between h-full">
            <Logo />

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8" aria-label={'Main Navigation'}>
              <ul className="flex items-center gap-6">
                {navLinks.map((link) => (
                  <li key={link.id}>
                    {link.isRoute ? (
                      <Link
                        to={link.path}
                        className={`text-sm font-medium transition-colors hover:text-purple-600 inline-flex items-center gap-1.5 ${
                          (link.id === 'shop' && location.pathname.startsWith(`/${language}/shop`)) ||
                          location.pathname === link.path
                            ? 'text-purple-600 font-bold' : textColor
                        }`}
                      >
                        {link.id === 'shop' && <ShoppingBag className="w-3.5 h-3.5" />}
                        <span>{link.label}</span>
                      </Link>
                    ) : (
                      <a
                        href={link.path}
                        onClick={(e) => handleNavClick(link, e)}
                        className={`text-sm font-medium transition-colors hover:text-purple-600 ${
                          activeSection === link.id ? 'text-purple-600 font-bold' : textColor
                        }`}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2.5">
                {/* Cart with Badge */}
                <Link
                  to={`/${language}/cart`}
                  className={`relative p-2 rounded-full transition-colors hover:text-purple-600 ${textColor}`}
                  aria-label={language === 'ar' ? 'السلة' : 'Cart'}
                  title={language === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -end-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Account Link */}
                <Link
                  to={`/${language}/account`}
                  className={`p-2 rounded-full transition-colors hover:text-purple-600 ${textColor}`}
                  aria-label={language === 'ar' ? 'حسابي' : 'Account'}
                  title={language === 'ar' ? 'حسابي وطلباتي' : 'My Account'}
                >
                  <User className="w-4 h-4" />
                </Link>

                {/* Language toggle */}
                <button
                  onClick={toggleLanguage}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 ${textColor} hover:text-purple-600 transition-colors`}
                  aria-label={t.nav.switchLanguage || 'Toggle language'}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
                </button>

                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isDark 
                      ? 'bg-white/10 hover:bg-white/20 text-yellow-300' 
                      : 'bg-black/10 hover:bg-black/20 text-gray-700'
                  }`}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={isDark ? (language === 'ar' ? 'الوضع النهاري' : 'Light mode') : (language === 'ar' ? 'الوضع الليلي' : 'Dark mode')}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                
                <Link 
                  to={`/${language}/shop`}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-purple-600/20"
                >
                  {t.shop.title}
                </Link>
              </div>
            </nav>

            {/* Mobile Header Controls */}
            <div className="flex items-center gap-1.5 md:hidden">
              <Link
                to={`/${language}/cart`}
                className={`relative p-2 ${textColor} hover:text-purple-600`}
                aria-label={language === 'ar' ? 'السلة' : 'Cart'}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 end-1 min-w-[16px] h-[16px] px-0.5 rounded-full bg-purple-600 text-white text-[9px] font-black flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to={`/${language}/account`}
                className={`p-2 ${textColor} hover:text-purple-600`}
                aria-label={language === 'ar' ? 'حسابي' : 'Account'}
              >
                <User className="w-5 h-5" />
              </Link>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isDark 
                    ? 'bg-white/10 text-yellow-300' 
                    : 'bg-black/10 text-gray-700'
                }`}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleLanguage}
                className={`p-2 ${textColor} hover:text-purple-600`}
                aria-label={t.nav.switchLanguage || 'Toggle language'}
              >
                <Globe className="w-4 h-4" />
              </button>
              <button
                ref={menuButtonRef}
                onClick={() => setIsOpen(true)}
                className={`p-2 ${textColor}`}
                aria-expanded={isOpen}
                aria-label={t.nav.toggleMenu || 'Open Menu'}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div 
            className={`fixed inset-0 z-50 flex flex-col md:hidden ${isDark ? 'bg-[#0B0B0F]' : 'bg-[#F8F7FC]'}`}
            role="dialog"
            aria-modal="true"
            aria-label={language === 'ar' ? 'التنقل' : 'Navigation'}
            data-lenis-prevent
            ref={menuRef}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-500/20">
              <Logo />
              <button 
                onClick={() => setIsOpen(false)}
                className={`p-2 ${textColor}`}
                aria-label={language === 'ar' ? 'إغلاق القائمة' : 'Close Menu'}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-6" aria-label="Mobile Navigation">
              <ul className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <li key={link.id}>
                    {link.isRoute ? (
                      <Link
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`text-xl font-bold ${textColor} hover:text-purple-600 flex items-center justify-between`}
                      >
                        <span>{link.label}</span>
                        {link.id === 'shop' && <ShoppingBag className="w-5 h-5 text-purple-600" />}
                      </Link>
                    ) : (
                      <a
                        href={link.path}
                        onClick={(e) => handleNavClick(link, e)}
                        className={`text-xl font-bold ${textColor} hover:text-purple-600 flex items-center justify-between`}
                      >
                        <span>{link.label}</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-6 border-t border-gray-500/20 flex flex-col gap-4">
              <Link
                to={`/${language}/shop`}
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-purple-600 text-white font-medium rounded-lg text-center"
              >
                {t.shop.title}
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
