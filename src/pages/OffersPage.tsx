import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Timer,
  Tag,
  Percent,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Boxes,
  ExternalLink,
  Sparkles,
  Laptop,
  CheckCircle2,
  Share2,
  Check,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Headphones,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Zap,
  RefreshCw,
  AlertCircle,
  MessageCircle,
  BadgePercent,
  Monitor,
  Layers,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCatalog, useExchangeRate } from '@/data/CatalogContext';
import { calculateYer, formatPriceYer } from '@/lib/currency';
import { addCart, commerceCopy, type CatalogItem, type Offer } from '@/data/commerce';
import ProductImage from '@/components/shop/ProductImage';

// ── Types ──────────────────────────────────────────────────────────
type PublishedCollectionItem = {
  id: string;
  slug: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  rules: {
    endsAt?: string | null;
    badge?: string | null;
    accentColor?: string | null;
    discountPct?: number | null;
    pinned?: boolean;
  };
  mode: string;
  productCount: number;
  updatedAt: string;
};

type PromoCoupon = {
  code: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string } | null;
  discountType: 'percentage' | 'fixed_amount' | 'free_shipping';
  discountValue: number;
  minOrderAmountUsd: number | null;
  endDate: string | null;
};

type DealProductItem = {
  id: string;
  slug: string;
  category: string;
  brand: string;
  model: string;
  title: { ar: string; en: string };
  summary?: { ar: string; en: string };
  images: string[];
  specsSummary: (string | null | undefined)[];
  dealPriceUsd: number;
  originalPriceUsd: number;
  discountPct: number;
  yerPrice: number | null;
  originalYer: number | null;
  inStock: boolean;
  variantId?: string;
};

/** Offer with a real catalog discount (original price strictly above sale price). */
function pickDiscountedOffer(offers: Offer[] | undefined): Offer | null {
  if (!offers?.length) return null;
  let best: Offer | null = null;
  let bestPct = 0;
  for (const o of offers) {
    if (o.available === false || o.priceUsd == null) continue;
    const price = Number(o.priceUsd);
    const orig = o.originalPriceUsd != null ? Number(o.originalPriceUsd) : NaN;
    if (!Number.isFinite(price) || !Number.isFinite(orig) || orig <= price) continue;
    const pct =
      o.discountPercent != null && o.discountPercent > 0
        ? Math.round(o.discountPercent)
        : Math.round(((orig - price) / orig) * 100);
    if (pct <= 0) continue;
    if (!best || pct > bestPct) {
      best = o;
      bestPct = pct;
    }
  }
  return best;
}

// ── Live Countdown Timer ──────────────────────────────────────────
function MiniCountdown({ endsAt, compact = false }: { endsAt: string; compact?: boolean }) {
  const [diff, setDiff] = useState(new Date(endsAt).getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setDiff(new Date(endsAt).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (diff <= 0) {
    return (
      <span className="text-red-500 font-bold text-xs bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
        انتهى العرض
      </span>
    );
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full text-xs font-mono font-bold" dir="ltr">
        <Timer size={11} className="animate-pulse text-orange-500" />
        <span>
          {d > 0 ? `${d}d ` : ''}
          {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-mono font-bold shadow-sm" dir="ltr">
      <Timer size={13} className="animate-pulse text-orange-500" />
      <span>
        {d > 0 ? `${d}d ` : ''}
        {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function OffersPage() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const { products: allCatalogProducts, bundles, site } = useCatalog();
  const exchangeRate = useExchangeRate();

  useEffect(() => {
    const pageTitle = ar ? 'العروض والتخفيضات الحصرية | الجيل العربي الرقمي' : 'Exclusive Offers & Deals | Al-Jeel Digital';
    document.title = pageTitle;

    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute(
        'content',
        ar
          ? 'استكشف أحدث العروض والخصومات على أجهزة اللابتوب والحلول التقنية المتطورة لدى الجيل العربي الرقمي.'
          : 'Discover exclusive deals and special offers on high-performance laptops and tech solutions at Al-Jeel Digital.'
      );
    }
  }, [ar]);

  const [collections, setCollections] = useState<PublishedCollectionItem[]>([]);
  const [catalogApiItems, setCatalogApiItems] = useState<CatalogItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'collections' | 'products' | 'bundles'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'discount' | 'price-asc' | 'price-desc' | 'popular'>('discount');

  // Copy feedback state
  const [copiedShareLink, setCopiedShareLink] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cartFeedback, setCartFeedback] = useState<Record<string, boolean>>({});
  const [promoCoupons, setPromoCoupons] = useState<PromoCoupon[]>([]);

  // Show Toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/shop/coupons/public')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('coupon_fetch_failed')))
      .then((data: { items?: PromoCoupon[] }) => { if (active) setPromoCoupons(data.items ?? []); })
      .catch(() => { if (active) setPromoCoupons([]); });
    return () => { active = false; };
  }, []);

  // Fetch Published Collections and Live Catalog from API
  useEffect(() => {
    let active = true;
    fetch('/api/shop/collections')
      .then(res => res.json())
      .then(data => {
        if (active && data.items) {
          setCollections(data.items);
        }
      })
      .catch(() => {});

    fetch('/api/shop/catalog')
      .then(res => res.json())
      .then(data => {
        if (active && data.items && Array.isArray(data.items)) {
          setCatalogApiItems(data.items);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Products with a real discount from shop catalog API (originalPriceUsd > priceUsd)
  const discountedProducts = useMemo(() => {
    const items: DealProductItem[] = [];
    for (const item of catalogApiItems) {
      const bestOffer = pickDiscountedOffer(item.offers);
      if (!bestOffer?.priceUsd || !bestOffer.originalPriceUsd) continue;

      const p = item.product;
      const dealPriceUsd = Number(bestOffer.priceUsd);
      const originalPriceUsd = Number(bestOffer.originalPriceUsd);
      if (!Number.isFinite(dealPriceUsd) || !Number.isFinite(originalPriceUsd) || originalPriceUsd <= dealPriceUsd) {
        continue;
      }

      const discountPct =
        bestOffer.discountPercent != null && bestOffer.discountPercent > 0
          ? Math.round(bestOffer.discountPercent)
          : Math.round(((originalPriceUsd - dealPriceUsd) / originalPriceUsd) * 100);
      if (discountPct <= 0) continue;

      const yerPrice = calculateYer(dealPriceUsd, exchangeRate, bestOffer.priceYer ?? undefined);
      const originalYer = calculateYer(originalPriceUsd, exchangeRate, bestOffer.originalPriceYer ?? undefined);

      const specsSummary = [
        bestOffer.specs?.cpu ? String(bestOffer.specs.cpu) : null,
        bestOffer.specs?.ramGB ? `${bestOffer.specs.ramGB}GB RAM` : null,
        bestOffer.specs?.storageGB ? `${bestOffer.specs.storageGB}GB SSD` : null,
        bestOffer.condition ? (ar ? `حالة ${bestOffer.condition}` : bestOffer.condition) : null,
      ].filter(Boolean);

      items.push({
        id: p.id,
        slug: p.slug,
        category: p.category,
        brand: p.brand,
        model: p.model,
        title: p.title,
        summary: p.summary,
        images: p.images?.length ? p.images : bestOffer.images?.length ? bestOffer.images : ['/placeholder.webp'],
        dealPriceUsd,
        originalPriceUsd,
        discountPct,
        yerPrice,
        originalYer,
        specsSummary,
        inStock: bestOffer.available !== false,
        variantId: bestOffer.variantId,
      });
    }
    return items;
  }, [catalogApiItems, exchangeRate, ar]);

  // Share Offer / Collection Handler
  const handleShare = async (title: string, slug?: string) => {
    const url = slug ? `${window.location.origin}/${language}/collection/${slug}` : window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* ignore */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedShareLink(slug || 'page');
      showToast(ar ? 'تم نسخ الرابط لمشاركته!' : 'Link copied to clipboard!');
      setTimeout(() => setCopiedShareLink(null), 2500);
    } catch {
      showToast(url);
    }
  };

  // Fast Add to Cart Handler (with full price and thumbnail metadata)
  const handleAddToCart = async (product: any) => {
    try {
      await addCart(
        {
          variantId: product.variantId || product.id,
          quantity: 1,
        },
        {
          title: product.title,
          priceUsd: String(product.dealPriceUsd),
          images: product.images,
        }
      );
      setCartFeedback(prev => ({ ...prev, [product.id]: true }));
      showToast(ar ? `تمت إضافة "${product.title[language] || product.title.ar}" إلى السلة بسعر العرض ($${product.dealPriceUsd})!` : `Added to cart at deal price ($${product.dealPriceUsd})!`);
      setTimeout(() => {
        setCartFeedback(prev => ({ ...prev, [product.id]: false }));
      }, 2500);
    } catch {
      setCartFeedback(prev => ({ ...prev, [product.id]: true }));
      showToast(ar ? 'تمت الإضافة إلى سلة المشتريات!' : 'Added to cart!');
      setTimeout(() => {
        setCartFeedback(prev => ({ ...prev, [product.id]: false }));
      }, 2500);
    }
  };

  // Direct WhatsApp Inquiry
  const handleWhatsAppProduct = (product: any) => {
    const title = product.title[language] || product.title.ar;
    const priceText = product.dealPriceUsd ? `$${product.dealPriceUsd}` : '';
    const msg = ar
      ? `مرحباً، أستفسر عن عرض التخفيض الخاص بالجهاز:\n${title}\nالسعر بالعرض: ${priceText}\nهل لا زال العرض متوفراً؟`
      : `Hello, I'm inquiring about the discounted deal on:\n${title}\nDeal Price: ${priceText}\nIs this offer still active?`;
    const phone = site?.whatsapp || '967771001044';
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let list = [...discountedProducts];

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'hard-drives' || selectedCategory === 'storage') {
        list = list.filter(p => p.category === 'hard-drives' || p.category === 'storage');
      } else if (selectedCategory === 'audio' || selectedCategory === 'accessories') {
        list = list.filter(p => p.category === 'audio' || p.category === 'accessories');
      } else {
        list = list.filter(p => p.category === selectedCategory);
      }
    }

    // Filter by query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => {
        const titleAr = p.title?.ar?.toLowerCase() || '';
        const titleEn = p.title?.en?.toLowerCase() || '';
        const model = p.model?.toLowerCase() || '';
        const brand = p.brand?.toLowerCase() || '';
        const summary = (p.summary?.[language] || p.summary?.ar || '').toLowerCase();
        return titleAr.includes(q) || titleEn.includes(q) || model.includes(q) || brand.includes(q) || summary.includes(q);
      });
    }

    // Sort
    if (sortBy === 'discount') {
      list.sort((a, b) => b.discountPct - a.discountPct);
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => a.dealPriceUsd - b.dealPriceUsd);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.dealPriceUsd - a.dealPriceUsd);
    }

    return list;
  }, [discountedProducts, selectedCategory, searchQuery, sortBy, language]);

  const hasProductFilters = selectedCategory !== 'all' || searchQuery.trim().length > 0;

  return (
    <main id="main-content" className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* ── Toast Notification with Cart Shortcut ── */}
      {toastMessage && (
        <div className="fixed bottom-6 start-1/2 transform -translate-x-1/2 z-50 bg-gray-900/95 dark:bg-purple-950/95 text-white border border-purple-500/30 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in text-sm font-bold">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <Link
            to={`/${language}/cart`}
            className="ms-2 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shrink-0 inline-flex items-center gap-1 shadow-md"
          >
            <ShoppingBag size={13} />
            <span>{ar ? 'السلة' : 'Cart'}</span>
          </Link>
        </div>
      )}

      {/* ── Breadcrumb & Cart Header ── */}
      <div className="flex items-center justify-between mb-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
          <Link to={`/${language}`} className="hover:text-purple-600 transition">
            {ar ? 'الرئيسية' : 'Home'}
          </Link>
          {ar ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          <span className="text-gray-900 dark:text-white font-medium">{ar ? 'العروض والتخفيضات' : 'Promotions & Deals'}</span>
        </nav>

        <Link
          to={`/${language}/cart`}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60 border border-purple-500/20 text-xs font-bold transition shadow-sm"
        >
          <ShoppingBag size={14} />
          <span>{ar ? 'عرض سلة المشتريات' : 'View Shopping Cart'}</span>
        </Link>
      </div>

      <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#151022] sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-bold text-purple-600 dark:text-purple-400">{ar ? 'تسوّق بوضوح' : 'Shop with clarity'}</p>
            <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white sm:text-3xl">
              {ar ? 'العروض والتخفيضات' : 'Offers and deals'}
            </h1>
            <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
              {ar ? 'استكشف المنتجات المخفضة والمجموعات المتاحة. الأسعار والتوفر حسب بيانات المتجر.' : 'Browse discounted products and available collections. Prices and availability follow the store catalog.'}
            </p>
          </div>
          <a href="#deals-grid" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 text-sm font-bold text-white transition hover:bg-purple-700">
            <ShoppingBag size={17} />{ar ? 'تصفح العروض' : 'Browse offers'}
          </a>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 dark:bg-white/5">{discountedProducts.length} {ar ? 'منتج مخفض' : 'discounted products'}</span>
          <span className="rounded-full bg-gray-100 px-3 py-1.5 dark:bg-white/5">{collections.length} {ar ? 'مجموعة متاحة' : 'available collections'}</span>
        </div>
      </section>
      {/* ── Coupons published from the store system ── */}
      {promoCoupons.length > 0 && <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {ar ? 'كوبونات المتجر' : 'Store coupons'}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {promoCoupons.map(coupon => {
            const discountLabel = coupon.discountType === 'free_shipping'
              ? (ar ? 'شحن مجاني' : 'Free shipping')
              : coupon.discountType === 'percentage'
                ? `${coupon.discountValue}% ${ar ? 'خصم' : 'off'}`
                : `${ar ? 'خصم' : 'off'} $${coupon.discountValue}`;
            return (
              <div
                key={coupon.code}
                className="relative bg-white dark:bg-[#151022] border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-purple-500/50 transition-all shadow-sm hover:shadow-lg flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-lg font-black text-purple-600 dark:text-purple-400">
                      {discountLabel}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    {coupon.title[language]}
                  </h3>
                  {coupon.description?.[language] && <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{coupon.description[language]}</p>}
                </div>

                <div className="pt-3 border-t border-dashed border-gray-200 dark:border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-400 font-mono">
                    {coupon.minOrderAmountUsd ? (ar ? `للطلبات من $${coupon.minOrderAmountUsd}` : `Orders over $${coupon.minOrderAmountUsd}`) : coupon.code}
                  </span>
                  {coupon.endDate && <span className="text-[11px] text-gray-400">{new Date(coupon.endDate).toLocaleDateString(language)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>}

      {/* ── Tabs & Filter Controls ── */}
      <section id="deals-grid" className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-5">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              <Sparkles size={16} />
              <span>{ar ? 'جميع العروض' : 'All Offers'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
                activeTab === 'products'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              <Flame size={16} className="text-orange-400" />
              <span>{ar ? 'تخفيضات الأجهزة' : 'Discounted Hardware'}</span>
              <span className="text-xs px-1.5 py-0.2 bg-white/20 rounded-full font-mono">{filteredProducts.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('collections')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
                activeTab === 'collections'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              <Boxes size={16} />
              <span>{ar ? 'المجموعات المنتقاة' : 'Curated Collections'}</span>
              <span className="text-xs px-1.5 py-0.2 bg-white/20 rounded-full font-mono">{collections.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bundles')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
                activeTab === 'bundles'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              <Layers size={16} />
              <span>{ar ? 'باقات التوفير' : 'Bundles'}</span>
              <span className="text-xs px-1.5 py-0.2 bg-white/20 rounded-full font-mono">{bundles.length}</span>
            </button>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={ar ? 'بحث في العروض…' : 'Search deals…'}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl ps-9 pe-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
              <ArrowUpDown size={14} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-xs sm:text-sm font-medium focus:outline-none cursor-pointer"
              >
                <option value="discount" className="dark:bg-[#151022] text-gray-900 dark:text-white">
                  {ar ? 'الأعلى خصماً' : 'Highest Discount'}
                </option>
                <option value="price-asc" className="dark:bg-[#151022] text-gray-900 dark:text-white">
                  {ar ? 'الأقل سعراً' : 'Price: Low to High'}
                </option>
                <option value="price-desc" className="dark:bg-[#151022] text-gray-900 dark:text-white">
                  {ar ? 'الأعلى سعراً' : 'Price: High to Low'}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Chips Bar (when in all or products tab) */}
        {(activeTab === 'all' || activeTab === 'products') && (
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
            {[
              { id: 'all', label: ar ? 'جميع الفئات' : 'All Categories', icon: Boxes },
              { id: 'laptops', label: ar ? 'لابتوبات' : 'Laptops', icon: Laptop },
              { id: 'storage', label: ar ? 'هاردات وتخزين' : 'Storage & HDDs', icon: Zap },
              { id: 'displays', label: ar ? 'شاشات' : 'Displays', icon: Monitor },
              { id: 'desktops', label: ar ? 'أجهزة مكتبية' : 'Desktops', icon: Monitor },
              { id: 'audio', label: ar ? 'صوتيات وملحقات' : 'Audio & Accessories', icon: Headphones },
            ].map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              const count = cat.id === 'all'
                ? discountedProducts.length
                : cat.id === 'storage'
                  ? discountedProducts.filter(p => p.category === 'storage' || p.category === 'hard-drives').length
                  : cat.id === 'audio'
                    ? discountedProducts.filter(p => p.category === 'audio' || p.category === 'accessories').length
                    : discountedProducts.filter(p => p.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon size={13} />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Section: Curated Collections ── */}
      {(activeTab === 'all' || activeTab === 'collections') && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Boxes className="text-purple-600 dark:text-purple-400" size={24} />
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {ar ? 'المجموعات الترويجية المنتقاة' : 'Curated Promotional Collections'}
              </h2>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {ar ? `${collections.length} مجموعات متاحة` : `${collections.length} available collections`}
            </span>
          </div>

          {collections.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
              <Boxes size={36} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {ar ? 'لا توجد مجموعات عروض منشورة حالياً.' : 'No published offer collections yet.'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {ar ? 'أنشئ مجموعة من لوحة الإدارة مع خصم اختياري (discountPct).' : 'Create a collection in admin with an optional discountPct rule.'}
              </p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map(col => {
              const accent = col.rules?.accentColor || '#7c3aed';
              const badge = col.rules?.badge;
              const discount = col.rules?.discountPct;
              const endsAt = col.rules?.endsAt;
              const title = col.title[language] || col.title.ar;
              const desc = col.description[language] || col.description.ar;
              const linkTarget = `/${language}/collection/${col.slug}`;

              return (
                <div
                  key={col.id}
                  className="group relative flex flex-col justify-between bg-white dark:bg-[#151022] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 overflow-hidden"
                  style={{
                    borderTop: `4px solid ${accent}`,
                  }}
                >
                  {/* Background light glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                    style={{ background: accent }}
                  />

                  <div>
                    {/* Top badges strip */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {badge && (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border"
                            style={{ background: `${accent}15`, borderColor: `${accent}40`, color: accent }}
                          >
                            <Tag size={11} />
                            <span>{badge}</span>
                          </span>
                        )}

                        {discount && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-sm">
                            <Percent size={11} />
                            <span>-{discount}%</span>
                          </span>
                        )}
                      </div>

                      {endsAt && <MiniCountdown endsAt={endsAt} compact />}
                    </div>

                    {/* Title & Desc */}
                    <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition mb-2 line-clamp-2">
                      {title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-5 leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs sm:text-sm font-bold">
                    <button
                      type="button"
                      onClick={() => handleShare(title, col.slug)}
                      className="p-1.5 text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 transition"
                      title={ar ? 'مشاركة العرض' : 'Share offer'}
                    >
                      <Share2 size={16} />
                    </button>

                    <Link
                      to={linkTarget}
                      className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:underline group-hover:translate-x-1 transition-transform"
                    >
                      <span>{ar ? 'تصفح التشكيلة' : 'View Collection'}</span>
                      {ar ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </section>
      )}

      {/* ── Section: Hot Deals / Discounted Hardware ── */}
      {(activeTab === 'all' || activeTab === 'products') && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Flame className="text-orange-500" size={24} />
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {ar ? 'أقوى أجهزة التخفيض المباشر' : 'Direct Hardware Deals'}
              </h2>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {ar ? `${filteredProducts.length} أجهزة مخفضة` : `${filteredProducts.length} deals on offer`}
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => {
                const title = product.title[language] || product.title.ar;
                const path = `/${language}/shop/${product.category}/${product.slug}`;
                const isAdded = cartFeedback[product.id];
                const yerFormatted = formatPriceYer(product.yerPrice, language);
                const originalYerFormatted = formatPriceYer(product.originalYer, language);

                return (
                  <article
                    key={product.id}
                    className="group relative flex flex-col justify-between bg-white dark:bg-[#151022] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl hover:border-purple-500/40 transition-all duration-300"
                  >
                    {/* Media Area */}
                    <div className="relative bg-gray-50 dark:bg-black/30 p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-center min-h-[190px]">
                      {/* Discount Tag */}
                      <div className="absolute top-3 start-3 z-10 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md">
                          <Percent size={11} />
                          <span>-{product.discountPct}%</span>
                        </span>
                      </div>

                      {/* Stock / Demo status badge */}
                      <div className="absolute top-3 end-3 z-10">
                        <span className="text-[10px] font-bold bg-white/80 dark:bg-black/60 backdrop-blur-sm text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/10">
                          {ar ? 'درجة أولى A' : 'Grade A'}
                        </span>
                      </div>

                      <Link to={path} className="w-full flex items-center justify-center overflow-hidden">
                        <div className="transform group-hover:scale-105 transition-transform duration-300">
                          <ProductImage
                            src={product.images[0]}
                            id={product.id}
                            alt={title}
                          />
                        </div>
                      </Link>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Brand & Category */}
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                          <span className="font-bold text-purple-600 dark:text-purple-400">{product.brand}</span>
                          <span>{product.model}</span>
                        </div>

                        {/* Product Title */}
                        <h4 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition mb-2">
                          <Link to={path}>{title}</Link>
                        </h4>

                        {/* Key Specs Pills */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {product.specsSummary.map((spec, i) => (
                            <span
                              key={i}
                              className="text-[11px] bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md font-mono"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Price & Action Strip */}
                      <div>
                        {/* Price Block */}
                        <div className="pt-3 border-t border-gray-100 dark:border-white/5 mb-3 flex items-baseline justify-between">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-black text-gray-900 dark:text-white">
                                ${product.dealPriceUsd}
                              </span>
                              <span className="text-xs text-gray-400 line-through">
                                ${product.originalPriceUsd}
                              </span>
                            </div>
                            {yerFormatted && (
                              <div className="text-[11px] text-gray-500 font-medium">
                                {yerFormatted}
                              </div>
                            )}
                          </div>

                          <div className="text-end">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              {ar ? `وفر $${product.originalPriceUsd - product.dealPriceUsd}` : `Save $${product.originalPriceUsd - product.dealPriceUsd}`}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                              isAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                            }`}
                          >
                            {isAdded ? <Check size={14} /> : <ShoppingBag size={14} />}
                            <span>{isAdded ? (ar ? 'أضيف للسلة' : 'Added') : (ar ? 'أضف للسلة' : 'Add to Cart')}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleWhatsAppProduct(product)}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                            title={ar ? 'استفسار عبر واتساب' : 'Inquire via WhatsApp'}
                          >
                            <MessageCircle size={14} />
                            <span>{ar ? 'طلب واتساب' : 'WhatsApp'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-white/10">
              <Search size={40} className="mx-auto text-gray-400 mb-2" />
              <p className="text-base font-bold text-gray-700 dark:text-gray-300">
                {hasProductFilters
                  ? (ar ? 'لم يتم العثور على أجهزة مطابقة للبحث' : 'No matching deals found')
                  : (ar ? 'لا توجد منتجات بخصم حقيقي حالياً' : 'No products with a real discount right now')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                {hasProductFilters
                  ? (ar ? 'جرّب تغيير الفئة أو البحث.' : 'Try another category or search term.')
                  : (ar
                    ? 'عيّن «السعر الأصلي» أعلى من سعر البيع في مدير الأسعار بالإدارة ليظهر الخصم هنا.'
                    : 'Set an original price above the sale price in admin Pricing Manager to list a deal here.')}
              </p>
              {hasProductFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-3 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                {ar ? 'إعادة ضبط الفلاتر' : 'Reset filters'}
              </button>
              )}
              {!hasProductFilters && (
                <Link
                  to={`/${language}/shop`}
                  className="mt-4 inline-flex text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  {ar ? 'تصفح المتجر' : 'Browse the shop'}
                </Link>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── Section: Hardware Value Bundles (باقات التوفير الشاملة) ── */}
      {(activeTab === 'all' || activeTab === 'bundles') && bundles && bundles.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Layers className="text-purple-600 dark:text-purple-400" size={24} />
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {ar ? 'باقات وحزم التوفير المتكاملة' : 'Integrated Value Bundles'}
              </h2>
            </div>
            <Link
              to={`/${language}/packages`}
              className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>{ar ? 'عرض كل الباقات' : 'View all packages'}</span>
              {ar ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.slice(0, 3).map(bundle => {
              const bundleTitle = bundle.title[language] || bundle.title.ar;
              const bundleSummary = bundle.summary[language] || bundle.summary.ar;

              return (
                <div
                  key={bundle.id}
                  className="bg-white dark:bg-[#151022] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                        {ar ? 'باقة عتاد متكاملة' : 'Complete Setup'}
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {ar ? 'توفير حتى 18%' : 'Save up to 18%'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                      {bundleTitle}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-3">
                      {bundleSummary}
                    </p>

                    {bundle.tiers && bundle.tiers.length > 0 && (
                      <div className="space-y-2 mb-4 bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
                        <span className="text-[11px] font-bold text-gray-400 block mb-1">
                          {ar ? 'المحتويات والمكونات:' : 'Package Components:'}
                        </span>
                        {bundle.tiers[0]?.items?.slice(0, 3).map((itId, idx) => {
                          const matched = allCatalogProducts.find(p => p.id === itId);
                          return (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                              <CheckCircle2 size={13} className="text-purple-500 shrink-0" />
                              <span className="truncate">{matched ? matched.title[language] || matched.title.ar : itId}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {ar ? 'تجهيز وضمان شامل' : 'Full Setup & Warranty'}
                    </span>
                    <Link
                      to={`/${language}/packages?bundle=${bundle.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      <span>{ar ? 'تخصيص الباقة' : 'Configure Bundle'}</span>
                      {ar ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Section: Buyer Guarantees & Trust Factors ── */}
      <section className="mb-16 bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-purple-900/10 border border-purple-500/20 rounded-3xl p-6 sm:p-10">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            {ar ? 'لماذا تتسوق عروض الجيل العربي؟' : 'Why Shop Al-Jeel Offers?'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            {ar
              ? 'نضمن لك عتاداً تقنياً احترافياً ومفحوصاً بعناية فائقة مع تجربة شراء آمنة وموثوقة.'
              : 'Engineered hardware inspected to military specs, fully backed by verified warranties across Yemen.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 dark:bg-[#151022]/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
              {ar ? 'ضمان استبدال حقيقي' : 'Verified Warranty'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {ar ? 'ضمان تشغيل وصيانة رسمي يضمن حقك في الفحص والتجربة والاستبدال.' : 'Official warranty covering full operation, trial, and replacement.'}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-[#151022]/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Zap size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
              {ar ? 'فحص بـ 28 نقطة فحص' : '28-Point Tech Audit'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {ar ? 'فحص شامل للمنافذ والبطارية والمعالج والحرارة والشاشة قبل التسليم.' : 'Rigorous audit covering ports, thermal load, battery cells, and screen.'}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-[#151022]/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Truck size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
              {ar ? 'شحن سريع وآمن' : 'Express Shipping'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {ar ? 'تغليف احترافي مضاد للصدمات مع كبرى شركات النقل لكافة المدن اليمنية.' : 'Shock-proof packaging dispatched with trusted shipping carriers in Yemen.'}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-[#151022]/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
              <MessageCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
              {ar ? 'استشارة واختيار مجاني' : 'Expert Consultation'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {ar ? 'مهندسونا يساعدونك عبر واتساب لاختيار الجهاز الأنسب لتخصصك وميزانيتك.' : 'Our hardware engineers guide you to the exact specs for your workflow.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── WhatsApp Deal Assistance CTA ── */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 border border-emerald-500/30 text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <MessageCircle size={14} />
            <span>{ar ? 'خدمة الاستشارات والعروض الخاصة' : 'Custom Corporate & Bulk Quotes'}</span>
          </div>
          <h3 className="text-2xl font-black mb-2">
            {ar ? 'هل تحتاج عرضاً مخصصاً لشركتك أو جامعتك؟' : 'Need a custom quote for enterprise or team?'}
          </h3>
          <p className="text-emerald-100/90 text-sm leading-relaxed">
            {ar
              ? 'تواصل مع فريق مبيعاتنا مباشرة لتجهيز عروض أسعار منافسة للأجهزة المتعددة والطلبيات الخاصة مع تسهيلات في الدفع والتوصيل.'
              : 'Chat with our sales engineers for tailored quotes, bulk discounts, and flexible corporate procurement.'}
          </p>
        </div>

        <a
          href={`https://wa.me/${(site?.whatsapp || '967770000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
            ar ? 'مرحباً، أود الاستفسار عن عروض الأجهزة الخاصة والتخفيضات المتاحة.' : 'Hello, I would like to inquire about current promotional deals and custom quotes.'
          )}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black px-6 py-3.5 rounded-xl shadow-lg transition-all shrink-0 text-sm transform hover:-translate-y-0.5"
        >
          <MessageCircle size={18} />
          <span>{ar ? 'محادثة عبر واتساب' : 'Chat on WhatsApp'}</span>
        </a>
      </section>
    </main>
  );
}

