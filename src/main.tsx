import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import './home.css'
import './commerce.css'
import App from './App.tsx'
import { LanguageProvider } from './i18n'
import { ThemeProvider } from './i18n/ThemeContext'
import { prefetchProduct } from './data/product-prefetch'

const initialProductPath = window.location.pathname.match(/^\/(?:ar|en)\/shop\/([^/]+)\/([^/]+)\/?$/)
if (initialProductPath) {
  try {
    void prefetchProduct(decodeURIComponent(initialProductPath[1]), decodeURIComponent(initialProductPath[2])).catch(() => {})
  } catch {
    // Leave malformed paths for the router's normal not-found handling.
  }
}

const router = createBrowserRouter([{
  path: '*',
  loader: async ({ request }) => {
    if (new URL(request.url).pathname.split('/').filter(Boolean).length === 4) await import('./pages/ProductDetailPage');
    return null;
  },
  HydrateFallback: () => null,
  element: <ThemeProvider><LanguageProvider><App /></LanguageProvider></ThemeProvider>
}]);
createRoot(document.getElementById('root')!).render(<StrictMode><RouterProvider router={router} /></StrictMode>);
