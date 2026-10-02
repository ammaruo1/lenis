import React, { useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowUpDown, Layers, SlidersHorizontal } from 'lucide-react';
import productsData from '@/data/products.json';
import { Product, Category } from '@/data/types';
import { useLanguage } from '@/i18n/LanguageContext';
import ProductCard from '@/components/shop/ProductCard';
import ProductFilters from '@/components/shop/ProductFilters';
import DemoBanner from '@/components/ui/DemoBanner';

const CATEGORIES_LIST: Array<{ id: Category | 'all'; labelAr: string; labelEn: string }> = [
  { id: 'all', labelAr: 'كل الفئات', labelEn: 'All Categories' },
  { id: 'laptops', labelAr: 'لابتوبات وأجهزة', labelEn: 'Laptops & PCs' },
  { id: 'displays', labelAr: 'شاشات وتجهيز مكتب', labelEn: 'Displays & Desk' },
  { id: 'audio', labelAr: 'صوت وصناعة محتوى', labelEn: 'Audio & Studio' },
  { id: 'gaming', labelAr: 'ألعاب وملحقات', labelEn: 'Gaming' },
  { id: 'network', labelAr: 'شبكات واتصال', labelEn: 'Networking' },
  { id: 'storage', labelAr: 'تخزين', labelEn: 'Storage' },
  { id: 'power', labelAr: 'طاقة وحماية', labelEn: 'Power & UPS' },
];

export const ShopPage: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language, t } = useLanguage();

  const brandFilter = searchParams.get('brand') || '';
  const cpuFilter = searchParams.get('cpu') || '';
  const ramFilter = searchParams.get('ram') || '';
  const storageFilter = searchParams.get('storage') || '';
  const conditionFilter = searchParams.get('condition') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const sort = searchParams.get('sort') || 'newest';

  const activeCategory = category || 'all';

  // Cast products array
  const allProducts = productsData as unknown as Product[];

  // Filter products
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Category filter
      if (activeCategory !== 'all' && product.category !== activeCategory) {
        return false;
      }

      // In stock
      if (inStockOnly && product.stock !== 'in_stock') {
        return false;
      }

      // Brand
      if (brandFilter && product.brand.toLowerCase() !== brandFilter.toLowerCase()) {
        return false;
      }

      // Condition
      if (conditionFilter && product.condition !== conditionFilter) {
        return false;
      }

      // RAM
      if (ramFilter && product.specs.ramGB !== Number(ramFilter)) {
        return false;
      }

      // Storage
      if (storageFilter && (product.specs.storageGB || 0) < Number(storageFilter)) {
        return false;
      }

      // CPU
      if (cpuFilter) {
        const cpuText = product.specs.cpu || '';
        if (!cpuText.toLowerCase().includes(cpuFilter.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [
    allProducts,
    activeCategory,
    inStockOnly,
    brandFilter,
    conditionFilter,
    ramFilter,
    storageFilter,
    cpuFilter,
  ]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sort === 'battery') {
      list.sort((a, b) => (b.specs.batteryHealthPct || 0) - (a.specs.batteryHealthPct || 0));
    }
    // Default newest order is preserved as in products array
    return list;
  }, [filteredProducts, sort]);

  const handleSortChange = (newSort: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', newSort);
    setSearchParams(next, { replace: true });
  };

  const currentCategoryObj = CATEGORIES_LIST.find((c) => c.id === activeCategory);
  const categoryTitle =
    currentCategoryObj?.id === 'all'
      ? t.shop.title
      : language === 'ar'
      ? currentCategoryObj?.labelAr
      : currentCategoryObj?.labelEn;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-neutral-50 dark:bg-neutral-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Notice Banner */}
        <div className="mb-6">
          <DemoBanner />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <div className="text-xs uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400 mb-1">
                {t.shop.title}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">
                {categoryTitle}
              </h1>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
                {t.shop.subtitle}
              </p>
            </div>

            {/* Sort & Count Header info */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-500 font-medium">
                {sortedProducts.length} {t.shop.productsCount}
              </span>

              <div className="flex items-center gap-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                <select
                  value={sort}
                  aria-label={t.shop.sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-transparent text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
                >
                  <option value="newest">{t.shop.sortNewest}</option>
                  <option value="battery">{t.shop.sortBattery}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Categories Pill Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
            {CATEGORIES_LIST.map((cat) => {
              const isActive = activeCategory === cat.id;
              const path =
                cat.id === 'all'
                  ? `/${language}/shop`
                  : `/${language}/shop/${cat.id}`;
              const label = language === 'ar' ? cat.labelAr : cat.labelEn;

              return (
                <Link
                  key={cat.id}
                  to={path}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content Layout: Filters Sidebar + Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <ProductFilters totalFilteredCount={sortedProducts.length} />

          {/* Products Grid */}
          <section aria-label={t.shop.title} className="flex-1 w-full">
            {sortedProducts.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <Layers className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  {t.shop.noProductsFound}
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5">
                  {t.shop.resetFilterPrompt}
                </p>
                <button
                  onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
                >
                  {t.shop.clearFilters}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
