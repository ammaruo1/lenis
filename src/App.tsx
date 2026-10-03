import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useLenis } from '@/hooks/useLenis'
import Navigation from '@/components/layout/Navigation'
import ProgressBar from '@/components/layout/ProgressBar'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/layout/ScrollToTop'
import HomePage from '@/pages/HomePage'
import {CatalogProvider} from '@/data/CatalogContext'
const ShopPage = lazy(() => import('@/pages/ShopPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CustomerPage = lazy(() => import('@/pages/CustomerPage'))
const OrderPage = lazy(() => import('@/pages/OrderPage'))
const PackagesPage = lazy(() => import('@/pages/PackagesPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const WarrantyPage = lazy(() => import('@/pages/WarrantyPage'))
const FAQPage = lazy(() => import('@/pages/FAQPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const BusinessPage = lazy(() => import('@/pages/BusinessPage'))
const ComparePage = lazy(() => import('@/pages/ComparePage'))
const LegalPage = lazy(() => import('@/pages/LegalPage'))

export default function App() {
  useLenis()

  return (
    <CatalogProvider><div className="relative min-h-screen">
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
        <Route path="/:lang/cart" element={<CartPage />} />
        <Route path="/:lang/bundles" element={<PackagesPage />} />
        <Route path="/:lang/setups" element={<PackagesPage />} />
        <Route path="/:lang/account" element={<CustomerPage />} />
        <Route path="/:lang/orders/:id" element={<OrderPage />} />

        {/* Phase 2 Routes */}
        <Route path="/:lang/warranty" element={<WarrantyPage />} />
        <Route path="/:lang/warranty/:subtab" element={<WarrantyPage />} />
        <Route path="/:lang/faq" element={<FAQPage />} />
        <Route path="/:lang/about" element={<AboutPage />} />
        <Route path="/:lang/contact" element={<ContactPage />} />

        {/* Phase 3 & Extended Routes */}
        <Route path="/:lang/business" element={<BusinessPage />} />
        <Route path="/:lang/compare" element={<ComparePage />} />
        <Route path="/:lang/legal" element={<LegalPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/ar" replace />} />
      </Routes></Suspense>

      <Footer />
    </div></CatalogProvider>
  )
}
