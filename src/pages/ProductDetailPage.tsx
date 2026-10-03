import { useEffect, useState, useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Cpu,
  HardDrive,
  Monitor,
  Battery,
  ShoppingBag,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin,
  Share2,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCatalog } from '@/data/CatalogContext';
import {
  shopApi,
  addCart,
  commerceCopy,
  errorText,
  type CatalogItem,
  type Offer,
  specText,
  inspectionTitle
} from '@/data/commerce';
import '@/commerce.css';

export default function ProductDetailPage() {
  const { slug, category } = useParams();
  const { language, dir } = useLanguage();
  const { site, products: catalogProducts } = useCatalog();
  const t = commerceCopy[language];

  const [item, setItem] = useState<CatalogItem | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOfferIndex, setSelectedOfferIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'inspection' | 'warranty'>('specs');

  useEffect(() => {
    let active = true;
    setSelectedImage(0);
    setSelectedOfferIndex(0);
    setItem(null);
    setError('');
    setLoading(true);

    shopApi<CatalogItem>(`/products/${slug}?category=${encodeURIComponent(category ?? '')}`)
      .then((data) => {
        if (active) {
          setItem(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(errorText(err.message, language));
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [slug, category, language]);

  // Canonical redirect if product belongs to another category/slug
  if (item && (category !== item.product.category || slug !== item.product.slug)) {
    return <Navigate replace to={`/${language}/shop/${item.product.category}/${item.product.slug}`} />;
  }

  const product = item?.product;
  const offers = item?.offers ?? [];
  const currentOffer: Offer | undefined = offers[selectedOfferIndex] ?? offers[0];

  // Images resolution: offer-specific images take priority over general product images
  const images = useMemo(() => {
    if (currentOffer?.images?.length) return currentOffer.images;
    if (product?.images?.length) return product.images;
    return ['/placeholder.webp'];
  }, [currentOffer, product]);

  // Related products from catalog
  const relatedProducts = useMemo(() => {
    if (!product || !catalogProducts) return [];
    return catalogProducts
      .filter((p) => p.category === product.category && p.slug !== product.slug)
      .slice(0, 3);
  }, [product, catalogProducts]);

  const handleAddToCart = async () => {
    if (!currentOffer) return;
    setAddingToCart(true);
    try {
      await addCart({
        variantId: currentOffer.variantId,
        ...(currentOffer.unitId ? { unitId: currentOffer.unitId } : {}),
        quantity: 1
      });
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3500);
    } catch (e) {
      setError(errorText(e instanceof Error ? e.message : '', language));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title[language],
          url: window.location.href
        });
      } catch {
        // user cancelled or unsupported
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const whatsappPhone = site?.whatsapp || '967770000000';
  const whatsappUrl = useMemo(() => {
    if (!product) return '#';
    const textAr = `السلام عليكم ورحمة الله، أود الاستفسار عن الجهاز المتوفر لديكم في المعرض:\n- الجهاز: ${product.brand} ${product.model}\n- العنوان: ${product.title.ar}\n- السعر: $${currentOffer?.priceUsd ?? 'غير محدد'}\n- الرابط: ${window.location.href}`;
    const textEn = `Hello, I would like to inquire about this device:\n- Model: ${product.brand} ${product.model}\n- Title: ${product.title.en}\n- Price: $${currentOffer?.priceUsd ?? 'N/A'}\n- Link: ${window.location.href}`;
    return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(language === 'ar' ? textAr : textEn)}`;
  }, [product, currentOffer, whatsappPhone, language]);

  return (
    <main id="main-content" className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir={dir}>
      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
        <Link to={`/${language}`} className="hover:text-purple-600 transition-colors">
          {language === 'ar' ? 'الرئيسية' : 'Home'}
        </Link>
        <span className="opacity-50">/</span>
        <Link to={`/${language}/shop`} className="hover:text-purple-600 transition-colors">
          {t.shop}
        </Link>
        {product && (
          <>
            <span className="opacity-50">/</span>
            <Link to={`/${language}/shop/${product.category}`} className="hover:text-purple-600 transition-colors capitalize">
              {product.category}
            </Link>
            <span className="opacity-50">/</span>
            <span className="text-neutral-900 dark:text-neutral-100 font-medium truncate max-w-[200px] sm:max-w-xs">
              {product.title[language]}
            </span>
          </>
        )}
      </nav>

      {/* Error View */}
      {error && (
        <div role="alert" className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <Link to={`/${language}/shop`} className="font-semibold underline">
            {t.continue}
          </Link>
        </div>
      )}

      {/* Loading View */}
      {loading && !product && (
        <div className="py-28 flex flex-col items-center justify-center gap-4 text-neutral-500">
          <div className="w-10 h-10 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-sm font-medium">{t.loading}</p>
        </div>
      )}

      {product && (
        <>
          {/* Main Product Showcase Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
            {/* Gallery Column (7 cols on lg) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="relative aspect-[4/3] rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 flex items-center justify-center overflow-hidden shadow-sm group">
                {/* Floating Badges */}
                <div className="absolute top-4 start-4 flex flex-wrap gap-2 z-10">
                  {currentOffer?.condition && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white shadow-sm shadow-purple-600/30">
                      {currentOffer.condition}
                    </span>
                  )}
                  {currentOffer?.batteryHealthPct !== null && currentOffer?.batteryHealthPct !== undefined && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 backdrop-blur-sm">
                      <Battery className="w-3.5 h-3.5" />
                      {currentOffer.batteryHealthPct}% {language === 'ar' ? 'صحة البطارية' : 'Health'}
                    </span>
                  )}
                  {product.demo && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 backdrop-blur-sm">
                      {t.demo}
                    </span>
                  )}
                </div>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  aria-label="Share product"
                  className="absolute top-4 end-4 z-10 w-9 h-9 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-purple-600 transition-colors shadow-sm"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                </button>

                {/* Main Product Image */}
                <img
                  src={images[selectedImage] || '/placeholder.webp'}
                  alt={product.title[language]}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="eager"
                />
              </div>

              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={imgUrl + idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-16 rounded-xl p-1.5 flex-shrink-0 bg-neutral-100 dark:bg-neutral-900 border-2 transition-all ${
                        selectedImage === idx
                          ? 'border-purple-600 ring-2 ring-purple-600/20'
                          : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Certified Trust Bar Under Gallery */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-purple-50/50 dark:bg-neutral-900/50 border border-purple-100 dark:border-neutral-800 text-center">
                <div className="flex flex-col items-center justify-center gap-1">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    {language === 'ar' ? 'فحص بـ 7 نقاط' : '7-Point Inspected'}
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {language === 'ar' ? 'معتمد وموثق' : 'Certified testing'}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center gap-1 border-x border-purple-100 dark:border-neutral-800">
                  <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    {language === 'ar' ? 'ضمان المتجر' : 'Store Warranty'}
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {language === 'ar' ? 'استبدال وصيانة' : 'Repair & exchange'}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center gap-1">
                  <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    {language === 'ar' ? 'معاينة في صنعاء' : 'Sana\'a Showroom'}
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {language === 'ar' ? 'شارع صخر' : 'Sakhr Street'}
                  </span>
                </div>
              </div>
            </div>

            {/* Info & Purchase Column (5 cols on lg) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Brand and Model Header */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-purple-600 dark:text-purple-400 mb-2">
                  <span>{product.brand}</span>
                  <span className="opacity-40">·</span>
                  <span>{product.model}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-50 leading-tight mb-3">
                  {product.title[language]}
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {product.summary[language]}
                </p>
              </div>

              {/* Price & Currency Display */}
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-0.5">
                    {language === 'ar' ? 'السعر النقدي' : 'Cash Price'}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-purple-600 dark:text-purple-400">
                      {currentOffer?.priceUsd ? `$${currentOffer.priceUsd}` : t.ask}
                    </span>
                    {currentOffer?.priceYer && (
                      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        (~ {Number(currentOffer.priceYer).toLocaleString(language)} YER)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {currentOffer?.available ? (language === 'ar' ? 'متوفر للتسليم' : 'In Stock') : t.unavailable}
                </div>
              </div>

              {/* Multiple Offers / Units Selection (If applicable) */}
              {offers.length > 1 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                    {language === 'ar' ? 'اختر القطعة المتوفرة بالمعرض:' : 'Select Available Unit:'}
                  </label>
                  <div className="space-y-2">
                    {offers.map((off, idx) => (
                      <button
                        key={off.variantId + (off.unitId ?? idx)}
                        onClick={() => setSelectedOfferIndex(idx)}
                        className={`w-full p-3 rounded-xl border text-start flex items-center justify-between transition-all ${
                          selectedOfferIndex === idx
                            ? 'border-purple-600 bg-purple-50/30 dark:bg-purple-950/20 ring-1 ring-purple-600'
                            : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                            <span dir="ltr">{off.sku}</span>
                            {off.unitId && (
                              <span className="text-[10px] text-neutral-500 font-mono">
                                #{off.unitId.slice(-6)}
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            {off.condition} {off.batteryHealthPct ? `· ${off.batteryHealthPct}%` : ''}
                          </span>
                        </div>
                        <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                          {off.priceUsd ? `$${off.priceUsd}` : t.ask}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase & Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!currentOffer?.available || addingToCart}
                  className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    cartSuccess
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25 active:scale-[0.99]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {cartSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>{t.added}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>{currentOffer?.available ? t.add : t.unavailable}</span>
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-11 rounded-xl font-bold text-xs bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'ar' ? 'استفسار عبر واتساب' : 'Inquire via WhatsApp'}</span>
                  </a>

                  <Link
                    to={`/${language}/cart`}
                    className="h-11 px-4 rounded-xl font-bold text-xs bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>{t.cart}</span>
                  </Link>
                </div>

                <p className="text-[11px] text-center text-neutral-400 dark:text-neutral-500">
                  {t.noReservation}
                </p>
              </div>

              {/* Quick Specs Snapshot */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-3">
                  {language === 'ar' ? 'أبرز المواصفات الأساسية' : 'Key Specifications'}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {item.fields
                    .filter((f) => currentOffer?.specs[f.key] !== undefined)
                    .slice(0, 6)
                    .map((field) => (
                      <div key={field.key} className="p-2 rounded-lg bg-white dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
                        <span className="text-[10px] text-neutral-400 block mb-0.5">
                          {field.title[language]}
                        </span>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200 truncate block">
                          {specText(currentOffer?.specs[field.key], language)} {field.unit ?? ''}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Deep Tabs Section: Specs, Inspection, Warranty */}
          <div className="mt-8 border-t border-neutral-200 dark:border-neutral-800 pt-10">
            {/* Tabs Selector Header */}
            <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 mb-8 overflow-x-auto pb-px">
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'specs'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>{language === 'ar' ? 'المواصفات التقنية الكاملة' : 'Full Specifications'}</span>
              </button>

              <button
                onClick={() => setActiveTab('inspection')}
                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'inspection'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'ar' ? 'تقرير الفحص المعتمد بـ 7 نقاط' : '7-Point Inspection Report'}</span>
              </button>

              <button
                onClick={() => setActiveTab('warranty')}
                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'warranty'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{language === 'ar' ? 'سياسة الضمان والمعاينة' : 'Warranty & Trial'}</span>
              </button>
            </div>

            {/* Tab 1: Specs */}
            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.fields
                  .filter((f) => currentOffer?.specs[f.key] !== undefined)
                  .map((field) => (
                    <div
                      key={field.key}
                      className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
                    >
                      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        {field.title[language]}
                      </span>
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 text-end">
                        {specText(currentOffer?.specs[field.key], language)} {field.unit ?? ''}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Tab 2: Inspection */}
            {activeTab === 'inspection' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>{language === 'ar' ? 'فحص الأجهزة المعتمد قبل العرض' : 'Pre-listing Certified Hardware Inspection'}</span>
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        {language === 'ar'
                          ? 'يخضع كل جهاز لفحص ميداني بـ 7 نقاط في ورشة المتجر بصنعاء للتأكد من خلوه من العيوب المصنعية أو التلاعب.'
                          : 'Every device undergoes a 7-point hardware inspection in Sana\'a to guarantee factory-standard integrity.'}
                      </p>
                    </div>

                    {currentOffer?.batteryHealthPct && (
                      <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-medium">
                          {language === 'ar' ? 'صحة البطارية الحالية' : 'Battery Health'}
                        </span>
                        <strong className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                          {currentOffer.batteryHealthPct}%
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Inspection checks checklist */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: 'screen', title: language === 'ar' ? 'الشاشة والبيكسلات' : 'Display & Pixels' },
                      { key: 'keyboard', title: language === 'ar' ? 'لوحة المفاتيح واللمس' : 'Keyboard & Trackpad' },
                      { key: 'ports', title: language === 'ar' ? 'المنافذ والتوصيل' : 'Ports & Connectivity' },
                      { key: 'battery', title: language === 'ar' ? 'البطارية والشاحن' : 'Battery & Charger' },
                      { key: 'thermal', title: language === 'ar' ? 'التبريد والمراوح' : 'Thermal & Cooling' },
                      { key: 'chassis', title: language === 'ar' ? 'المفصلات والهيكل' : 'Hinges & Chassis' },
                      { key: 'camera_audio', title: language === 'ar' ? 'الصوت والكاميرا' : 'Audio & Camera' }
                    ].map((check) => (
                      <div
                        key={check.key}
                        className="p-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60 flex items-center gap-2.5"
                      >
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                          {check.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Defects / Condition Transparency */}
                  {currentOffer?.defects && currentOffer.defects.length > 0 && (
                    <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                        <Info className="w-4 h-4" />
                        <span>{language === 'ar' ? 'ملاحظات الأمانة والشفافية على هذه القطعة:' : 'Condition Transparency Notes:'}</span>
                      </h4>
                      <ul className="list-disc list-inside text-xs text-amber-800 dark:text-amber-300 space-y-0.5">
                        {currentOffer.defects.map((def, i) => (
                          <li key={i}>{def[language]}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Warranty */}
            {activeTab === 'warranty' && (
              <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  <span>{language === 'ar' ? 'ضمان الجيل العربي الرقمي المكتوب' : 'Written Store Warranty'}</span>
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {language === 'ar'
                    ? 'جميع الأجهزة المتوفرة لدى المتجر مشمولة بفترة فحص وضمان رسمي موثق بفاتورة الشراء. يحق للعميل تجربة الجهاز وتشغيل البرامج والتأكد من مطابقته الكاملة للمواصفات المعلنة.'
                    : 'All devices purchased from our store are covered by a written warranty and invoice. Customers have full rights to test hardware with their target software before commitment.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <span className="text-xs font-bold text-purple-600 block mb-1">
                      {language === 'ar' ? 'فحص تجريبي فوري' : 'Live In-Store Testing'}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {language === 'ar' ? 'في معرضنا بصنعاء شارع صخر' : 'At our Sakhr St showroom'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <span className="text-xs font-bold text-purple-600 block mb-1">
                      {language === 'ar' ? 'استبدال مباشر' : 'Direct Replacement'}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {language === 'ar' ? 'في حال وجود أي خلل مصنعي' : 'In case of manufacturing faults'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <span className="text-xs font-bold text-purple-600 block mb-1">
                      {language === 'ar' ? 'دعم فني مستمر' : 'Post-Purchase Support'}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {language === 'ar' ? 'ترقية الرامات والتخزين بأي وقت' : 'RAM & SSD upgrades anytime'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Related / Similar Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 border-t border-neutral-200 dark:border-neutral-800 pt-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>{language === 'ar' ? 'أجهزة أخرى من نفس الفئة' : 'Similar Devices in this Category'}</span>
                </h2>
                <Link
                  to={`/${language}/shop/${product.category}`}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <span>{language === 'ar' ? 'عرض الكل' : 'View all'}</span>
                  {language === 'ar' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {relatedProducts.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/${language}/shop/${rel.category}/${rel.slug}`}
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 hover:border-purple-600/40 transition-all flex items-center gap-4 group"
                  >
                    <div className="w-16 h-16 rounded-xl bg-white dark:bg-neutral-800 p-2 flex-shrink-0 flex items-center justify-center">
                      <img src={rel.images[0] || '/placeholder.webp'} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-neutral-400 font-bold block">{rel.brand}</span>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-purple-600 transition-colors">
                        {rel.title[language]}
                      </h4>
                      <span className="text-xs font-black text-purple-600 mt-1 block">
                        {rel.price?.usd ? `$${rel.price.usd}` : t.ask}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
