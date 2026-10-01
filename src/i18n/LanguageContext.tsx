import React, { createContext, useContext, useState, useEffect, useTransition } from 'react'
import { Language, Direction, Translations } from './types'
import { ar } from './ar'
import { en } from './en'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const STORAGE_KEY = 'alarbi_lang'

interface LanguageContextType {
  language: Language
  dir: Direction
  t: Translations
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

const translationsMap: Record<Language, Translations> = {
  ar,
  en,
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'ar'
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'ar') return saved
  } catch {
    // ignore localStorage errors (e.g. incognito/disabled)
  }
  return 'ar' // Default is Arabic as required
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)
  const [, startTransition] = useTransition()

  const dir: Direction = language === 'ar' ? 'rtl' : 'ltr'
  const t = translationsMap[language]

  const setLanguage = (newLang: Language) => {
    startTransition(() => {
      setLanguageState(newLang)
    })
  }

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar')
  }

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // ignore
    }

    // Update documentElement attributes
    document.documentElement.lang = language
    document.documentElement.dir = dir
    document.documentElement.setAttribute('data-lang', language)

    // Update page title
    document.title = t.meta.title

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', t.meta.description)

    // Recalculate GSAP ScrollTrigger and layout measurements
    const timer = setTimeout(() => {
      ScrollTrigger.refresh()
      window.dispatchEvent(new Event('resize'))
    }, 100)

    return () => clearTimeout(timer)
  }, [language, dir, t])

  return (
    <LanguageContext.Provider value={{ language, dir, t, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const useTranslation = useLanguage
