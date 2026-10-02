import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  Shield,
  CheckCircle2,
  Cpu,
  HardDrive,
  Monitor,
  MessageCircle,
  ArrowRight,
  AlertCircle,
  Layers,
  Sparkles,
} from 'lucide-react';
import productsData from '@/data/products.json';
import warrantyData from '@/data/warranty.json';
import siteData from '@/data/site.json';
import { Product } from '@/data/types';
import { useLanguage } from '@/i18n/LanguageContext';
import DemoBanner from '@/components/ui/DemoBanner';
import ProductCard from '@/components/shop/ProductCard';
import ProductImage from '@/components/shop/ProductImage';
import { home } from '@/data/home';

export const ProductDetailPage: React.FC = () => {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const { language, dir, t } = useLanguage();

  const allProducts = productsData as unknown as Product[];
  const product = allProducts.find(
    (p) => p.slug === slug || (category && p.category === category && p.slug === slug)
  );

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  useEffect(() => setSelectedImageIndex(0), [slug]);

  if (!product) {
    return (
      <div className="min-h-screen pt-36 pb-20 flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center p-8 max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            {language === 'ar' ? 'الجهاز غير موجود' : 'Product Not Found'}
          </h1>
          <p className="text-xs text-neutral-500 mb-6">
            {language === 'ar'
              ? 'لم يتم العثور على الجهاز المطلوب أو ربما تم تغيير الرابط.'
              : 'The requested hardware was not found or the URL has changed.'}
          </p>
          <Link
            to={`/${language}/shop`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors"
          >
            <span>{t.product.backToShop}</span>
          </Link>
        </div>
      </div>
    );
  }

  const title = product.title[language] || product.title.ar;
  const summary = product.summary[language] || product.summary.ar;
  const categoryLabel = t.shop.categories[product.category] || product.category;
  const conditionLabel = t.shop.conditionLabels[product.condition] || product.condition;
  const stockLabel = product.demo ? home.stockUnknown[language] : t.shop.stockLabels[product.stock] || product.stock;

  // Find condition definition from warranty data
  const conditionInfo = warrantyData.conditionGrades.find((c) => c.grade === product.condition);
  const conditionMeaning = conditionInfo?.meaning[language] || conditionInfo?.meaning.ar;
  const conditionCriteria = conditionInfo?.criteria[language] || conditionInfo?.criteria.ar;

  // WhatsApp handling
  const whatsappNumber = siteData.whatsapp as string | null;
  const hasWhatsapp = Boolean(whatsappNumber && whatsappNumber.trim().length > 0);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const whatsappUrl = hasWhatsapp && whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        language === 'ar'
          ? `السلام عليكم، أود الاستفسار عن الجهاز المعروض في الموقع:\n- الاسم: ${title}\n- الموديل: ${product.model}\n- الرابط: ${currentUrl}`
          : `Hello, I'd like to ask about the listed device:\n- Model: ${title} (${product.model})\n- Link: ${currentUrl}`
      )}`
    : undefined;

  // Find compatible products
  const compatibleProducts = allProducts.filter((p) =>
    product.compatibleWith.includes(p.id)
  );

  // Specifications table rows
  const specRows: Array<{ label: string; value: string | React.ReactNode }> = [];

  if (product.specs.cpu) {
    specRows.push({
      label: language === 'ar' ? 'المعالج (CPU)' : 'Processor (CPU)',
      value: `${product.specs.cpu}${product.specs.cpuGen ? ` (الجيل ${product.specs.cpuGen})` : ''}`,
    });
  }
  if (product.specs.ramGB) {
    specRows.push({
      label: language === 'ar' ? 'الذاكرة العشوائية (RAM)' : 'System Memory (RAM)',
      value: `${product.specs.ramGB} GB ${product.specs.ramType || ''} ${
        product.specs.ramUpgradable
          ? language === 'ar'
            ? '(قابلة للترقية)'
            : '(Upgradable)'
          : language === 'ar'
          ? '(مدمجة)'
          : '(Soldered)'
      }`,
    });
  }
  if (product.specs.storageGB) {
    specRows.push({
      label: language === 'ar' ? 'وحدة التخزين' : 'Storage Drive',
      value: `${
        product.specs.storageGB >= 1000
          ? `${product.specs.storageGB / 1000} TB`
          : `${product.specs.storageGB} GB`
      } ${product.specs.storageType || ''}`,
    });
  }
  if (product.specs.display) {
    specRows.push({
      label: language === 'ar' ? 'الشاشة والعرض' : 'Display Specs',
      value: `${product.specs.display.sizeIn}" (${product.specs.display.res}) - ${
        product.specs.display.panel || 'IPS'
      } ${product.specs.display.hz ? `@ ${product.specs.display.hz}Hz` : ''} ${
        product.specs.display.touch ? (language === 'ar' ? '- تدعم اللمس' : '- Touchscreen') : ''
      }`,
    });
  }
  if (product.specs.gpu) {
    specRows.push({
      label: language === 'ar' ? 'معالج الرسوميات (GPU)' : 'Graphics (GPU)',
      value: product.specs.gpu,
    });
  }
  if (product.specs.ports && product.specs.ports.length > 0) {
    specRows.push({
      label: language === 'ar' ? 'المنافذ والتوصيل' : 'Ports & I/O',
      value: product.specs.ports.join(' • '),
    });
  }
  if (product.specs.os) {
    specRows.push({
      label: language === 'ar' ? 'نظام التشغيل' : 'Operating System',
      value: product.specs.os,
    });
  }
  if (product.specs.weightKg) {
    specRows.push({
      label: language === 'ar' ? 'الوزن' : 'Weight',
      value: `${product.specs.weightKg} kg`,
    });
  }
  if (product.specs.batteryHealthPct !== null && product.specs.batteryHealthPct !== undefined) {
    specRows.push({
      label: language === 'ar' ? 'صحة البطارية المقاسة' : 'Measured Battery Health',
      value: `${product.specs.batteryHealthPct}%`,
    });
  }
  if (product.specs.wifiStandard) {
    specRows.push({
      label: language === 'ar' ? 'معيار الواي فاي' : 'Wi-Fi Standard',
      value: product.specs.wifiStandard,
    });
  }
  if (product.specs.capacityVA) {
    specRows.push({
      label: language === 'ar' ? 'القدرة الكهربائية' : 'Power Capacity',
      value: `${product.specs.capacityVA} VA / ${product.specs.capacityWatts} W`,
    });
  }

  // Schema.org JSON-LD for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: summary,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    category: categoryLabel,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.price.usd || 'Contact for price',
      availability:
        product.stock === 'in_stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/LimitedAvailability',
    },
  };

  return (
    <div className="min-h-screen pt-28 pb-24 bg-neutral-50 dark:bg-neutral-950">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-6"
        >
          <Link to={`/${language}`} className="hover:text-purple-600 transition-colors">
            {t.product.breadcrumbHome}
          </Link>
          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          <Link to={`/${language}/shop`} className="hover:text-purple-600 transition-colors">
            {t.product.breadcrumbShop}
          </Link>
          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          <Link
            to={`/${language}/shop/${product.category}`}
            className="hover:text-purple-600 transition-colors"
          >
            {categoryLabel}
          </Link>
          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate max-w-[200px]">
            {title}
          </span>
        </nav>

        {/* Demo Alert if demo */}
        {product.demo && (
          <div className="mb-8">
            <DemoBanner />
          </div>
        )}

        {/* Top Section: Media Gallery + Primary Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          {/* Gallery Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <ProductImage src={product.images[selectedImageIndex]} alt={title} id={product.id} shared eager />
              <div className="absolute top-4 start-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-900/80 backdrop-blur-md text-white border border-white/10">
                  {conditionLabel}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-600/90 text-white backdrop-blur-md">
                  {categoryLabel}
                </span>
              </div>
            </div>

            {/* Thumbnails if multiple images exist */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-purple-600 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Overview & Action Box */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  {product.brand}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.stock === 'in_stock'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-neutral-700/60 text-neutral-200'
                  }`}
                >
                  {stockLabel}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight leading-snug">
                {title}
              </h1>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {summary}
              </p>

              {/* Condition Grade Info Card */}
              {conditionInfo && (
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300">
                    <Sparkles className="w-4 h-4" />
                    <span>{conditionInfo.label[language] || conditionInfo.label.ar}</span>
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400">
                    {conditionMeaning}: {conditionCriteria}
                  </div>
                </div>
              )}

              {/* Price and Warranty Summary Box */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <div>
                  <div className="text-xs text-neutral-400 mb-0.5">
                    {language === 'ar' ? 'السعر والعملة' : 'Pricing'}
                  </div>
                  <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {product.price.usd !== null ? (
                      `$${product.price.usd}`
                    ) : (
                      <span className="text-purple-600 dark:text-purple-400 text-sm">
                        {t.shop.askForPrice}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-neutral-400 mb-0.5">
                    {language === 'ar' ? 'الضمان' : 'Warranty'}
                  </div>
                  <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {product.warrantyMonths !== null
                      ? `${product.warrantyMonths} ${language === 'ar' ? 'شهر' : 'Months'}`
                      : t.shop.warrantyTBD}
                  </div>
                </div>
              </div>
            </div>

            {/* Order / WhatsApp CTA */}
            <div className="mt-8 space-y-3 pt-6 border-t border-neutral-200 dark:border-neutral-800">
              {hasWhatsapp ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{t.product.orderViaWhatsApp}</span>
                </a>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled
                    className="flex items-center justify-center gap-2.5 w-full py-3.5 px-6 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-400 font-bold text-sm cursor-not-allowed opacity-75"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{t.product.orderViaWhatsApp}</span>
                  </button>
                  <p className="text-[11px] text-neutral-500 text-center leading-relaxed">
                    ℹ️ {t.product.whatsappDisabledNotice}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Tabs / Grids: Specifications & Inspection Report */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Full Specifications Table */}
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-600" />
              <span>{t.product.specsTitle}</span>
            </h2>

            <dl className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
              {specRows.map((row, idx) => (
                <div key={idx} className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <dt className="text-neutral-500 dark:text-neutral-400 font-medium">
                    {row.label}
                  </dt>
                  <dd className="sm:col-span-2 text-neutral-900 dark:text-neutral-100 font-semibold">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Pre-Delivery Inspection Report */}
          <div className="lg:col-span-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-2">
              {product.inspection.passed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-neutral-500" />}
              <span>{t.product.inspectionTitle}</span>
            </h2>

            <p className="text-xs text-neutral-500 mb-6">
              {product.inspection.notes[language] || product.inspection.notes.ar}
            </p>

            {/* Checklist items */}
            <div className="space-y-3">
              {warrantyData.inspectionChecklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800"
                >
                  {product.inspection.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> : <span className="w-4 h-4 border border-neutral-400 rounded shrink-0 mt-0.5" aria-hidden="true" />}
                  <div className="text-xs">
                    <div className="font-bold text-neutral-800 dark:text-neutral-200">
                      {item.title[language] || item.title.ar}
                    </div>
                    <div className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {item.description[language] || item.description.ar}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compatible Accessories Section */}
        {compatibleProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {home.connections[language]}
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  {home.compatibilityUnknown[language]}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {compatibleProducts.map((compProd) => (
                <ProductCard key={compProd.id} product={compProd} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
