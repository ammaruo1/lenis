import { useEffect } from 'react'
import { useLenis } from '@/hooks/useLenis'
import Navigation from '@/components/layout/Navigation'
import ProgressBar from '@/components/layout/ProgressBar'
import Footer from '@/components/layout/Footer'
import CursorFollower from '@/components/ui/CursorFollower'
import Hero from '@/components/sections/Hero'
import Integration from '@/components/sections/Integration'
import UseCases from '@/components/sections/UseCases'
import Categories from '@/components/sections/Categories'
import Business from '@/components/sections/Business'
import Service from '@/components/sections/Service'
import Trust from '@/components/sections/Trust'
import FinalCTA from '@/components/sections/FinalCTA'

export default function App() {
  useLenis()

  useEffect(() => {
    const handleReducedMotion = (e: MediaQueryListEvent) => {
      document.documentElement.style.setProperty(
        '--animation-duration',
        e.matches ? '0.01ms' : '1ms'
      )
    }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    mq.addEventListener('change', handleReducedMotion)
    return () => mq.removeEventListener('change', handleReducedMotion)
  }, [])

  return (
    <div className="relative min-h-screen">
      {/* Global overlays */}
      <CursorFollower />
      <ProgressBar />
      <Navigation />

      {/* Page sections — ordered as the visitor journey */}
      <main id="main-content">
        {/* Scene 01: Who are you, what can you offer me? */}
        <Hero />

        {/* Scene 02: Why combine needs at this store? */}
        <Integration />

        {/* Scene 03: What fits ME? (Study / Work / Content / Gaming) */}
        <UseCases />

        {/* Scene 04: I know what I need — where do I find it? */}
        <Categories />

        {/* Scene 05: Can you handle a company / project? */}
        <Business />

        {/* Scene 06: What happens before and after delivery? */}
        <Service />

        {/* Scene 07: What proof can you show? */}
        <Trust />

        {/* Scene 08: The decision — what do you want to set up? */}
        <FinalCTA />
      </main>

      <Footer />
    </div>
  )
}
