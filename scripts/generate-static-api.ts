import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const root = join(dirname(__filename), '..');

const loadJson = (name: string) => JSON.parse(readFileSync(join(root, 'src', 'data', `${name}.json`), 'utf-8'));

const products = loadJson('products');
const brands = loadJson('brands');
const faq = loadJson('faq');
const site = loadJson('site');
const warranty = loadJson('warranty');
const bundles = loadJson('bundles');

const categories = [
  { slug: 'laptops', title: { ar: 'لابتوبات', en: 'Laptops' } },
  { slug: 'displays', title: { ar: 'شاشات', en: 'Displays' } },
  { slug: 'audio', title: { ar: 'صوتيات', en: 'Audio' } },
  { slug: 'gaming', title: { ar: 'ألعاب', en: 'Gaming' } },
  { slug: 'network', title: { ar: 'شبكات', en: 'Networking' } },
  { slug: 'storage', title: { ar: 'تخزين', en: 'Storage' } },
  { slug: 'power', title: { ar: 'طاقة', en: 'Power' } }
];

const specs = [
  { key: 'cpu', title: { ar: 'المعالج', en: 'CPU' }, filterable: true },
  { key: 'cpuGen', title: { ar: 'جيل المعالج', en: 'CPU generation' }, filterable: true },
  { key: 'ramGB', title: { ar: 'الرام GB', en: 'RAM GB' }, filterable: true },
  { key: 'ramType', title: { ar: 'نوع الرام', en: 'RAM type' }, filterable: true },
  { key: 'storageGB', title: { ar: 'التخزين GB', en: 'Storage GB' }, filterable: true },
  { key: 'storageType', title: { ar: 'نوع التخزين', en: 'Storage type' }, filterable: true },
  { key: 'ports', title: { ar: 'المنافذ', en: 'Ports' }, filterable: true },
  { key: 'gpu', title: { ar: 'كرت الشاشة', en: 'GPU' }, filterable: true },
  { key: 'display', title: { ar: 'الشاشة', en: 'Display' }, filterable: false },
  { key: 'batteryHealthPct', title: { ar: 'صحة البطارية %', en: 'Battery health %' }, filterable: false },
  { key: 'wifiStandard', title: { ar: 'معيار الشبكة اللاسلكية', en: 'Wi-Fi standard' }, filterable: true },
  { key: 'capacityGB', title: { ar: 'السعة GB', en: 'Capacity GB' }, filterable: true },
  { key: 'capacityVA', title: { ar: 'سعة الطاقة VA', en: 'Power capacity VA' }, filterable: true },
  { key: 'capacityWatts', title: { ar: 'القدرة W', en: 'Power capacity W' }, filterable: true },
  { key: 'connectionType', title: { ar: 'نوع الاتصال', en: 'Connection type' }, filterable: true },
  { key: 'interface', title: { ar: 'واجهة التوصيل', en: 'Interface' }, filterable: true }
];

const catalog = {
  products,
  brands,
  faq,
  site,
  warranty,
  bundles,
  categories,
  specs,
  homeImages: {}
};

const payload = JSON.stringify(catalog);

const apiDir = join(root, 'public', 'api');
const shopDir = join(apiDir, 'shop');
const shopProductsDir = join(shopDir, 'products');
mkdirSync(apiDir, { recursive: true });
mkdirSync(shopDir, { recursive: true });
mkdirSync(shopProductsDir, { recursive: true });

writeFileSync(join(apiDir, 'bootstrap'), payload, 'utf-8');
writeFileSync(join(apiDir, 'bootstrap.json'), payload, 'utf-8');
writeFileSync(join(apiDir, 'catalog'), payload, 'utf-8');
writeFileSync(join(apiDir, 'catalog.json'), payload, 'utf-8');

// Build SearchResult for /api/shop/catalog
const shopItems = products.map((p: any) => ({
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
    batteryHealthPct: typeof p.specs?.batteryHealthPct === 'number' ? p.specs.batteryHealthPct : null,
    inspection: null,
    defects: [],
    warrantyMonths: p.warrantyMonths
  }],
  fields: []
}));

const brandsFacet = Array.from(new Set(products.map((p: any) => p.brand))).map(b => ({
  value: b,
  count: products.filter((p: any) => p.brand === b).length
}));
const condFacet = ['new', 'A', 'B', 'C'].map(c => ({
  value: c,
  count: products.filter((p: any) => p.condition === c).length
})).filter(f => f.count > 0);

const shopCatalog = {
  items: shopItems,
  total: shopItems.length,
  page: 1,
  pageSize: 50,
  hasCatalog: true,
  categories: categories.map(c => ({ slug: c.slug, parentSlug: null, title: c.title })),
  collections: [],
  facets: {
    brand: brandsFacet,
    condition: condFacet,
    collection: [],
    specs: []
  },
  pricing: null
};

const shopPayload = JSON.stringify(shopCatalog);
writeFileSync(join(shopDir, 'catalog'), shopPayload, 'utf-8');
writeFileSync(join(shopDir, 'catalog.json'), shopPayload, 'utf-8');

// Generate static endpoints for each individual product
for (const item of shopItems) {
  const pPayload = JSON.stringify(item);
  writeFileSync(join(shopProductsDir, item.product.slug), pPayload, 'utf-8');
  writeFileSync(join(shopProductsDir, `${item.product.slug}.json`), pPayload, 'utf-8');
}

console.log('✅ Generated static /api/bootstrap and /api/shop/catalog fallback successfully!');

