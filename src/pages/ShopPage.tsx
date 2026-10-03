import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import {
  SlidersHorizontal,
  X,
  Search,
  ShoppingBag,
  UserRound,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  PackageSearch,
  Layers,
  ChevronDown,
  Tag
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCatalog } from '@/data/CatalogContext';
import { commerceCopy, shopApi, errorText, type SearchResult, type Facet, type CatalogItem } from '@/data/commerce';
import CommerceCard from '@/components/shop/CommerceCard';
import LaptopFilterSidebar from '@/components/shop/LaptopFilterSidebar';
import '@/commerce.css';

export default function ShopPage({ initialCategory }: { initialCategory?: string } = {}) {
  const { category: rawCategory } = useParams();
  const [params, setParams] = useSearchParams();
  const { language } = useLanguage();
  const catalog = useCatalog();
  const t = commerceCopy[language];

  // If the URL is /shop/browser, treat it as the main catalog browse route
  const category = initialCategory || (rawCategory === 'browser' ? undefined : rawCategory);

  const [data, setData] = useState<SearchResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(new URLSearchParams(params));
  const [search, setSearch] = useState(params.get('q') ?? '');

  const query = params.toString();

  const fallbackItems: CatalogItem[] = useMemo(() => {
    return catalog.products.map(p => ({
      product: {
        id: p.id,
        slug: p.slug,
        category: p.category,
        brand: p.brand,
        model: p.model,
        title: p.title,
        summary: p.summary,
        images: p.images,
        demo: p.demo
      },
      offers: [{
        variantId: p.id,
        sku: p.slug,
        condition: p.condition,
        priceUsd: p.price.usd ? String(p.price.usd) : null,
        priceYer: p.price.yer ? String(p.price.yer) : null,
        specs: p.specs,
        images: p.images,
        available: p.stock === 'in_stock',
        batteryHealthPct: typeof (p.specs as Record<string, unknown>)?.batteryHealthPct === 'number' ? (p.specs as Record<string, unknown>).batteryHealthPct as number : null,
        inspection: null,
        defects: [],
        warrantyMonths: p.warrantyMonths
      }],
      fields: []
    }));
  }, [catalog.products]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const q = new URLSearchParams(query);
    if (category) q.set('category', category);
    shopApi<SearchResult>('/catalog?' + q)
      .then(result => {
        if (active) setData(result);
      })
      .catch(() => {
        if (!active) return;
        let items = fallbackItems;
        if (category) {
          items = items.filter(i => i.product.category === category);
        }
        const searchQ = (params.get('q') ?? '').trim().toLowerCase();
        if (searchQ) {
          items = items.filter(i =>
            (i.product.title.ar + ' ' + i.product.title.en + ' ' + i.product.model + ' ' + i.product.brand)
              .toLowerCase().includes(searchQ)
          );
        }
        const brandFilter = params.getAll('brand');
        if (brandFilter.length) {
          items = items.filter(i => brandFilter.includes(i.product.brand));
        }
        const condFilter = params.getAll('condition');
        if (condFilter.length) {
          items = items.filter(i => condFilter.includes(i.offers[0]?.condition));
        }
        if (params.get('available') === 'true') {
          items = items.filter(i => i.offers[0]?.available);
        }

        const brandsFacet: Facet[] = Array.from(new Set(catalog.products.map(p => p.brand))).map(b => ({
          value: b,
          count: catalog.products.filter(p => p.brand === b).length
        }));
        const condFacet: Facet[] = ['new', 'A', 'B', 'C'].map(c => ({
          value: c,
          count: catalog.products.filter(p => p.condition === c).length
        })).filter(f => f.count > 0);

        setData({
          items,
          total: items.length,
          page: 1,
          pageSize: 50,
          hasCatalog: true,
          categories: catalog.categories.map(c => ({ slug: c.slug, parentSlug: null, title: c.title })),
          collections: [],
          facets: {
            brand: brandsFacet,
            condition: condFacet,
            collection: [],
            specs: []
          },
          pricing: null
        });
        setError('');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [query, category, language, fallbackItems, catalog.categories, catalog.products, params]);

  useEffect(() => setSearch(params.get('q') ?? ''), [query, params]);

  const activeFilterCount = useMemo(() => {
    return [...params.keys()].filter(k => !['q', 'page', 'sort'].includes(k)).length;
  }, [params]);

  const draftFilterCount = useMemo(() => {
    return [...draft.keys()].filter(k => !['q', 'sort', 'page'].includes(k)).length;
  }, [draft]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const removeFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    const values = next.getAll(key);
    next.delete(key);
    values.filter(x => x !== value).forEach(x => next.append(key, x));
    next.delete('page');
    setParams(next);
  };

  const clearAllFilters = () => {
    setParams(new URLSearchParams(params.get('q') ? { q: params.get('q')! } : {}));
  };

  const filterChips = useMemo(() => {
    return [...params.entries()].filter(([k]) => !['page', 'sort'].includes(k));
  }, [params]);

  const getChipLabel = (k: string, v: string) => {
    if (k === 'q') return `${language === 'ar' ? 'بحث' : 'Search'}: "${v}"`;
    if (k === 'available') return t.available;
    if (k === 'min') return `${t.min} ${v}`;
    if (k === 'max') return `${t.max} ${v}`;
    if (k === 'brand') return data?.facets.brand.find(b => b.value === v)?.title ?? v;
    if (k === 'condition') return v;
    if (k === 'collection') return data?.collections.find(c => c.id === v)?.title[language] ?? v;
    if (k === 'cpuFamily') return `${t.cpuFamily}: ${v}`;
    if (k === 'cpuBrand') return v;
    if (k === 'cpuGen') return `${t.cpuGen}: ${v}`;
    if (k === 'ramGB') return `${v} GB RAM`;
    if (k === 'storageGB') return `${Number(v) >= 1000 ? Math.round(Number(v) / 1000) + ' TB' : v + ' GB'} SSD`;
    if (k === 'gpuType') return v === 'dedicated' ? (language === 'ar' ? 'كرت منفصل' : 'Dedicated GPU') : (language === 'ar' ? 'كرت مدمج' : 'Integrated GPU');
    if (k === 'screenSize') return `${v}"`;
    if (k === 'touch') return t.touch;
    return v;
  };

  const sortOptions: [string, string][] = useMemo(() => [
    ['newest', t.newest],
    ['price_asc', t.priceAsc],
    ['price_desc', t.priceDesc],
    ['name', t.name],
    ...(category === 'laptops' ? [
      ['performance', t.performance] as [string, string],
      ['ram', t.highestRam] as [string, string]
    ] : []),
    ...(data?.facets.specs.some(s => s.key === 'batteryHealthPct') ? [['battery', t.battery] as [string, string]] : [])
  ], [t, data, category]);

  function renderFilterContent(current: URLSearchParams, onChange: (p: URLSearchParams) => void, isDialog = false) {
    if (category === 'laptops') {
      return (
        <LaptopFilterSidebar
          current={current}
          onChange={onChange}
          facets={data?.laptopFacets}
          language={language}
          isDialog={isDialog}
        />
      );
    }

    const toggle = (key: string, value: string) => {
      const next = new URLSearchParams(current);
      const values = next.getAll(key);
      next.delete(key);
      (values.includes(value) ? values.filter(v => v !== value) : [...values, value]).forEach(v => next.append(key, v));
      next.delete('page');
      onChange(next);
    };

    const group = (key: string, label: string, values: Facet[]) =>
      values.length > 0 && (
        <fieldset key={key} className="store-filter-group">
          <legend className="store-filter-legend">{label}</legend>
          <div className="store-filter-options">
            {values.map(v => (
              <label key={v.value} className="store-filter-item">
                <input
                  type="checkbox"
                  checked={current.getAll(key).includes(v.value)}
                  onChange={() => toggle(key, v.value)}
                />
                <span className="store-filter-label">{v.title ?? v.value}</span>
                <span className="store-filter-count">{v.count}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );

    return (
      <aside className="store-filters" aria-label={t.filters}>
        <div className="store-filters-header">
          <h2><strong>{t.filters}</strong></h2>
          {current.toString() && (
            <button
              type="button"
              className="store-filters-reset-link"
              onClick={() => onChange(new URLSearchParams(current.get('q') ? { q: current.get('q')! } : {}))}
            >
              {t.reset}
            </button>
          )}
        </div>

        <fieldset className="store-filter-group">
          <legend className="store-filter-legend">{t.priceAsc.split(':')[0]}</legend>
          <div className="store-range">
            {['min', 'max'].map(key => (
              <div key={key} className="store-range-input-wrapper">
                <span className="store-range-cur">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  aria-label={key === 'min' ? t.min : t.max}
                  placeholder={key === 'min' ? t.min.replace('$', '').trim() : t.max.replace('$', '').trim()}
                  value={current.get(key) ?? ''}
                  onChange={e => {
                    const next = new URLSearchParams(current);
                    if (e.target.value) next.set(key, e.target.value);
                    else next.delete(key);
                    next.delete('page');
                    onChange(next);
                  }}
                />
              </div>
            ))}
          </div>
        </fieldset>

        <label className="store-filter-toggle">
          <input
            type="checkbox"
            checked={current.get('available') === 'true'}
            onChange={e => {
              const next = new URLSearchParams(current);
              if (e.target.checked) next.set('available', 'true');
              else next.delete('available');
              next.delete('page');
              onChange(next);
            }}
          />
          <span className="store-filter-label">{t.available}</span>
        </label>

        {data && (
          <>
            {group('brand', t.brand, data.facets.brand)}
            {group('condition', t.condition, data.facets.condition)}
            {group('collection', t.collection, data.facets.collection.map(f => ({
              ...f,
              title: data.collections.find(c => c.id === f.value)?.title[language] ?? f.value
            })))}
            {data.facets.specs.map(f => group('spec_' + f.key, f.title[language], f.values))}
          </>
        )}
      </aside>
    );
  }

  return (
    <main id="main-content" className="store-shell" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Store Header / Quick Navigation Bar */}
      <header className="store-header">
        <div className="store-subnav">
          <div className="store-brand-pill">
            <span className="store-brand-dot" />
            <span className="store-brand-name">
              {language === 'ar' ? 'متجر الجيل العربي الرقمي' : 'Al-Jeel Digital Store'}
            </span>
          </div>

          <div className="store-quick-actions">
            <Link to={'/' + language + '/bundles'} className="store-quick-btn">
              <Sparkles size={14} />
              <span>{t.packages}</span>
            </Link>
            <Link to={'/' + language + '/account'} className="store-quick-btn">
              <UserRound size={14} />
              <span>{t.account}</span>
            </Link>
            <Link to={'/' + language + '/cart'} className="store-quick-btn store-cart-btn">
              <ShoppingBag size={14} />
              <span>{t.cart}</span>
            </Link>
          </div>
        </div>

        <div className="store-hero-row">
          <div className="store-hero-text">
            <h1 className="store-title">{category === 'laptops' ? t.laptopsSection : t.shop}</h1>
            <p className="store-subtitle">{category === 'laptops' ? t.laptopsIntro : t.intro}</p>
          </div>
        </div>
      </header>

      {/* Modern Compact Search Bar */}
      <form
        className="store-search-bar"
        onSubmit={e => {
          e.preventDefault();
          update('q', search);
        }}
      >
        <div className="store-search-field">
          <Search size={17} className="store-search-icon" />
          <input
            type="search"
            className="store-search-input"
            aria-label={t.search}
            placeholder={t.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="store-search-clear"
              aria-label="Clear"
              onClick={() => {
                setSearch('');
                update('q', '');
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button type="submit" className="store-search-btn" aria-label={t.search}>
          <span>{language === 'ar' ? 'بحث' : 'Search'}</span>
        </button>
      </form>

      {/* Smooth Horizontal Category Navigation */}
      <div className="store-category-wrapper">
        <nav className="store-category-bar" aria-label={t.all}>
          <Link
            className={`store-category-pill ${!category ? 'active' : ''}`}
            to={'/' + language + '/shop' + (query ? '?' + query : '')}
          >
            <Layers size={13} />
            <span>{t.all}</span>
          </Link>
          {data?.categories.map(c => (
            <Link
              key={c.slug}
              className={`store-category-pill ${category === c.slug ? 'active' : ''}`}
              to={'/' + language + '/shop/' + c.slug + (query ? '?' + query : '')}
            >
              <span>{c.parentSlug ? '↳ ' : ''}{c.title[language]}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Single-Row Action Bar: Filters Trigger + Count + Sort Select */}
      <div className="store-action-row">
        <div className="store-action-start">
          <button
            type="button"
            className="store-filter-toggle-btn"
            onClick={() => {
              setDraft(new URLSearchParams(params));
              setOpen(true);
            }}
          >
            <SlidersHorizontal size={14} />
            <span>{t.filters}</span>
            {activeFilterCount > 0 && (
              <span className="store-filter-badge">{activeFilterCount}</span>
            )}
          </button>

          <div className="store-count-chip">
            <span className="store-count-num">{data?.total ?? 0}</span>
            <span className="store-count-label">{t.results}</span>
          </div>
        </div>

        <div className="store-sort-container">
          <ArrowUpDown size={13} className="store-sort-icon" />
          <select
            className="store-sort-select"
            aria-label={t.newest}
            value={params.get('sort') ?? 'newest'}
            onChange={e => update('sort', e.target.value)}
          >
            {sortOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {filterChips.length > 0 && (
        <div className="store-chips-row">
          <div className="store-chips-list">
            <Tag size={13} className="store-chips-icon" />
            {filterChips.map(([k, v], i) => (
              <button
                key={`${k}-${v}-${i}`}
                type="button"
                className="store-chip-tag"
                onClick={() => removeFilter(k, v)}
              >
                <span>{getChipLabel(k, v)}</span>
                <X size={12} />
              </button>
            ))}
            <button
              type="button"
              className="store-chip-clear-all"
              onClick={clearAllFilters}
            >
              <RotateCcw size={11} />
              <span>{t.reset}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="store-layout">
        {renderFilterContent(params, p => setParams(p))}

        <section className="store-catalog-section" aria-busy={loading}>
          {error ? (
            <div className="store-error-box" role="alert">
              <p>{error}</p>
              <button
                type="button"
                className="store-button secondary"
                onClick={() => update('retry', String(Date.now()))}
              >
                {t.retry}
              </button>
            </div>
          ) : loading ? (
            <div className="store-loading-box" role="status">
              <div className="store-spinner" />
              <span>{t.loading}</span>
            </div>
          ) : data?.items.length ? (
            <div className="store-grid">
              {data.items.map(item => (
                <CommerceCard key={item.product.id} item={item} rate={data.pricing?.usdToYer} />
              ))}
            </div>
          ) : (
            <div className="store-empty-box">
              <div className="store-empty-icon-wrap">
                <PackageSearch size={32} />
              </div>
              <h2>{data?.hasCatalog ? t.noResults : t.empty}</h2>
              <p>{data?.hasCatalog ? t.reset : t.emptyNote}</p>
              {data?.hasCatalog ? (
                <button type="button" className="store-button" onClick={() => setParams({})}>
                  <RotateCcw size={15} />
                  <span>{t.reset}</span>
                </button>
              ) : (
                <Link to={'/' + language + '/bundles'} className="store-button secondary">
                  <Sparkles size={15} />
                  <span>{t.packages}</span>
                </Link>
              )}
            </div>
          )}

          {data && data.total > 24 && (
            <nav className="store-pagination" aria-label="Pagination">
              <button
                disabled={data.page <= 1}
                className="store-button secondary"
                onClick={() => update('page', String(data.page - 1))}
              >
                {t.previous}
              </button>
              <span className="store-page-info">{data.page} / {Math.ceil(data.total / 24)}</span>
              <button
                disabled={data.page * 24 >= data.total}
                className="store-button secondary"
                onClick={() => update('page', String(data.page + 1))}
              >
                {t.next}
              </button>
            </nav>
          )}
        </section>
      </div>

      {/* Mobile Drawer Filter Dialog */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="store-overlay" />
          <Dialog.Content className="store-dialog" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="store-dialog-drag-handle" />
            <div className="store-dialog-head">
              <Dialog.Title className="store-dialog-title">
                {t.filters}
                {draftFilterCount > 0 && (
                  <span className="store-dialog-badge">({draftFilterCount})</span>
                )}
              </Dialog.Title>
              <Dialog.Close className="store-close" aria-label={t.close}>
                <X size={18} />
              </Dialog.Close>
            </div>
            <Dialog.Description className="store-dialog-desc">
              {t.filterHint}
            </Dialog.Description>

            <div className="store-dialog-scroll-body">
              {renderFilterContent(draft, setDraft, true)}
            </div>

            <div className="store-dialog-bottom-actions">
              <button
                type="button"
                className="store-button secondary store-dialog-reset-btn"
                onClick={() => setDraft(new URLSearchParams(draft.get('q') ? { q: draft.get('q')! } : {}))}
              >
                {t.reset}
              </button>
              <button
                type="button"
                className="store-button store-dialog-apply-btn"
                onClick={() => {
                  setParams(draft);
                  setOpen(false);
                }}
              >
                {t.apply}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}
