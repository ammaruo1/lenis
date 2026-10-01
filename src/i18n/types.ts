export type Language = 'ar' | 'en'
export type Direction = 'rtl' | 'ltr'

export interface Translations {
  meta: {
    title: string
    description: string
  }
  nav: {
    why: string
    features: string
    install: string
    showcase: string
    performance: string
    getStarted: string
    switchLanguage: string
    currentLanguageName: string
    targetLanguageName: string
    toggleMenu: string
  }
  hero: {
    badge: string
    titleLine1: string
    titleLine2: string
    subtitle: string
    liveDemo: string
    github: string
    getStarted: string
    starsLabel: string
    downloadsLabel: string
    licenseLabel: string
    scrollIndicator: string
  }
  why: {
    tag: string
    titleLine1: string
    titleLine2: string
    subtitle: string
    problems: Array<{
      before: string
      after: string
    }>
    stats: Array<{
      value: string
      unit: string
      label: string
    }>
    quote: string
    quoteAuthor: string
    quoteUrl: string
  }
  features: {
    tag: string
    titleLine1: string
    titleLine2: string
    subtitle: string
    learnMore: string
    items: Array<{
      tag: string
      title: string
      description: string
    }>
  }
  demo: {
    tag: string
    titleLine1: string
    titleLine2: string
    subtitle: string
    tabs: {
      basic: string
      react: string
      options: string
      gsap: string
    }
    liveConfig: string
    duration: string
    wheelMultiplier: string
    touchMultiplier: string
    easing: string
    metricsTitle: string
    metrics: {
      bundleSize: string
      frameBudget: string
      treeShakeable: string
      ssrSafe: string
      yes: string
    }
    copy: string
    copied: string
  }
  showcase: {
    tag: string
    titleLine1: string
    titleLine2: string
    subtitle: string
  }
  performance: {
    tag: string
    titleLine1: string
    titleLine2: string
    subtitle: string
    resourceUsage: string
    lighthouseScores: string
    fpsText: string
    fpsSubtext: string
    metrics: Array<{
      label: string
      unit: string
      suffix: string
      description: string
    }>
    scores: {
      performance: string
      accessibility: string
      bestPractices: string
      seo: string
    }
  }
  testimonials: {
    tag: string
    titleLine1: string
    titleLine2: string
    items: Array<{
      quote: string
      author: string
      role: string
      company: string
      initials: string
    }>
  }
  openSource: {
    tag: string
    titleLine1: string
    titleLine2: string
    subtitle: string
    stats: {
      stars: string
      forks: string
      contributors: string
      weeklyDl: string
    }
    contributorsTitle: string
    viewAllContributors: string
    releaseTimeline: string
    releases: Array<{
      version: string
      date: string
      label: string
      note: string
    }>
    links: {
      github: string
      liveDemo: string
      twitter: string
      npm: string
    }
  }
  finalCta: {
    tag: string
    titleLine1: string
    titleLine2: string
    subtitle: string
    github: string
    docs: string
    license: string
  }
  footer: {
    github: string
    npm: string
    demo: string
    licenseText: string
    builtBy: string
  }
}
