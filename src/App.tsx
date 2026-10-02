import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useLenis } from '@/hooks/useLenis'
import Navigation from '@/components/layout/Navigation'
import ProgressBar from '@/components/layout/ProgressBar'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/layout/ScrollToTop'
import HomePage from '@/pages/HomePage'
const ShopPage = lazy(() => import('@/pages/ShopPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const WarrantyPage = lazy(() => import('@/pages/WarrantyPage'))
const FAQPage = lazy(() => import('@/pages/FAQPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))

export default function App() {
  useLenis()

  return (
    <div className="relative min-h-screen">
      <ScrollToTop />
      <ProgressBar />
      <Navigation />

      <Suspense fallback={<main id="main-content" className="page-shell" style={{ minHeight:'100svh', paddingTop:140 }} aria-busy="true" />}><Routes>
        <Route path="/" element={<Navigate to="/ar" replace />} />
        <Route path="/:lang" element={<HomePage />} />
        
        {/* Phase 1 Routes */}
        <Route path="/:lang/shop" element={<ShopPage />} />
        <Route path="/:lang/shop/:category" element={<ShopPage />} />
        <Route path="/:lang/shop/:category/:slug" element={<ProductDetailPage />} />

        {/* Phase 2 Routes */}
        <Route path="/:lang/warranty" element={<WarrantyPage />} />
        <Route path="/:lang/warranty/:subtab" element={<WarrantyPage />} />
        <Route path="/:lang/faq" element={<FAQPage />} />
        <Route path="/:lang/about" element={<AboutPage />} />
        <Route path="/:lang/contact" element={<ContactPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/ar" replace />} />
      </Routes></Suspense>

      <Footer />
    </div>
  )
}
