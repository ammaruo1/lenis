import type { PrismaClient } from '@prisma/client';
import type { FastifyRequest } from 'fastify';
import type { AppConfig } from './config.js';
import { catalogSearch } from './commerce-catalog.js';
import { readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export interface PageMeta {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt?: string;
  imagePreloadUrl?: string;
  canonicalUrl: string;
  type: 'website' | 'product';
  siteName: string;
  locale: string;
  alternateUrls?: {
    ar: string;
    en: string;
  };
  keywords?: string[];
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

export const YEMEN_GOVERNORATES = [
  { ar: 'صنعاء (أمانة العاصمة)', en: "Sana'a (Capital)", code: 'YE-SA' },
  { ar: 'محافظة صنعاء', en: "Sana'a Governorate", code: 'YE-SN' },
  { ar: 'عدن', en: 'Aden', code: 'YE-AD' },
  { ar: 'تعز', en: 'Taiz', code: 'YE-TA' },
  { ar: 'حضرموت (المكلا وسيئون)', en: 'Hadhramaut (Mukalla & Sayun)', code: 'YE-HD' },
  { ar: 'إب', en: 'Ibb', code: 'YE-IB' },
  { ar: 'الحديدة', en: 'Al Hodeidah', code: 'YE-HU' },
  { ar: 'ذمار', en: 'Dhamar', code: 'YE-DH' },
  { ar: 'مأرب', en: 'Marib', code: 'YE-MA' },
  { ar: 'شبوة (عتق)', en: 'Shabwah (Ataq)', code: 'YE-SH' },
  { ar: 'صعدة', en: 'Saada', code: 'YE-SD' },
  { ar: 'لحج', en: 'Lahij', code: 'YE-LA' },
  { ar: 'أبين', en: 'Abyan', code: 'YE-AB' },
  { ar: 'المهرة (الغيضة)', en: 'Al Mahrah (Al Ghaydah)', code: 'YE-MR' },
  { ar: 'عمران', en: 'Amran', code: 'YE-AM' },
  { ar: 'حجة', en: 'Hajjah', code: 'YE-HJ' },
  { ar: 'البيضاء', en: 'Al Bayda', code: 'YE-BA' },
  { ar: 'الضالع', en: 'Al Dhale', code: 'YE-DA' },
  { ar: 'المحويت', en: 'Al Mahwit', code: 'YE-MW' },
  { ar: 'ريمة', en: 'Raymah', code: 'YE-RA' },
  { ar: 'الجوف', en: 'Al Jawf', code: 'YE-JA' },
  { ar: 'أرخبيل سقطرى', en: 'Socotra Archipelago', code: 'YE-SU' },
];

export const YEMEN_STORE_INFO = {
  nameAr: 'الجيل العربي الرقمي',
  nameEn: 'Al-Jeel Al-Arabi Digital',
  telephone: '+967771001044',
  addressLocalityAr: 'صنعاء',
  addressLocalityEn: "Sana'a",
  streetAddressAr: 'منتصف شارع صخر',
  streetAddressEn: 'Mid-Sakhr Street',
  addressRegion: 'أمانة العاصمة',
  addressCountry: 'YE',
  latitude: 15.3694,
  longitude: 44.1910,
  currenciesAccepted: 'USD, YER',
  paymentAccepted: 'Cash, Bank Transfer, Kuraimi, Floosak, OneCash, Jawali',
};

export function getYemenAreaServedSchema() {
  return [
    {
      '@type': 'Country',
      name: 'Yemen',
      alternateName: 'اليمن',
      identifier: 'YE',
    },
    ...YEMEN_GOVERNORATES.map(gov => ({
      '@type': 'AdministrativeArea',
      name: gov.ar,
      alternateName: gov.en,
      identifier: gov.code,
    })),
  ];
}

export function createSellerSchema(baseUrl: string, isAr: boolean) {
  return {
    '@type': 'ElectronicsStore',
    '@id': `${baseUrl}/#store`,
    name: isAr ? YEMEN_STORE_INFO.nameAr : YEMEN_STORE_INFO.nameEn,
    alternateName: isAr ? YEMEN_STORE_INFO.nameEn : YEMEN_STORE_INFO.nameAr,
    url: baseUrl,
    telephone: YEMEN_STORE_INFO.telephone,
    priceRange: '$$',
    currenciesAccepted: YEMEN_STORE_INFO.currenciesAccepted,
    paymentAccepted: YEMEN_STORE_INFO.paymentAccepted,
    address: {
      '@type': 'PostalAddress',
      streetAddress: isAr ? YEMEN_STORE_INFO.streetAddressAr : YEMEN_STORE_INFO.streetAddressEn,
      addressLocality: isAr ? YEMEN_STORE_INFO.addressLocalityAr : YEMEN_STORE_INFO.addressLocalityEn,
      addressRegion: YEMEN_STORE_INFO.addressRegion,
      addressCountry: 'YE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: YEMEN_STORE_INFO.latitude,
      longitude: YEMEN_STORE_INFO.longitude,
    },
    areaServed: getYemenAreaServedSchema(),
  };
}

export function createShippingDetailsSchema() {
  return {
    '@type': 'OfferShippingDetails',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: '0',
      currency: 'USD',
    },
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: 'YE',
    },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: {
        '@type': 'QuantitativeValue',
        minValue: 0,
        maxValue: 1,
        unitCode: 'DAY',
      },
      transitTime: {
        '@type': 'QuantitativeValue',
        minValue: 1,
        maxValue: 3,
        unitCode: 'DAY',
      },
    },
  };
}

export function createReturnPolicySchema() {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'YE',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 7,
    returnMethod: 'https://schema.org/ReturnInStore',
    returnFees: 'https://schema.org/FreeReturn',
  };
}

export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function merchantProductName(value: unknown, brand: unknown, model: unknown, isAr: boolean): string {
  const source = String(value ?? '').replace(/\s+/g, ' ').trim()
    || [brand, model].map(part => String(part ?? '').trim()).filter(Boolean).join(' ')
    || (isAr ? 'منتج من متجر الجيل العربي الرقمي' : 'Product from Al-Jeel Al-Arabi Digital');
  // Merchant Center titles are limited to 150 characters. Count Unicode code
  // points so Arabic characters are not split in the structured data.
  return Array.from(source).slice(0, 150).join('');
}

function manufacturerPartNumber(value: unknown): string | undefined {
  const mpn = String(value ?? '').trim();
  // Google accepts manufacturer part numbers up to 70 characters. Long freeform
  // catalog model strings are not reliable MPNs, so omit them instead of lying.
  return mpn && Array.from(mpn).length <= 70 ? mpn : undefined;
}

export function getBaseUrl(request: FastifyRequest, config: AppConfig): string {
  const forwardedProto = request.headers['x-forwarded-proto'];
  const proto = typeof forwardedProto === 'string'
    ? forwardedProto.split(',')[0].trim()
    : ('encrypted' in request.socket && request.socket.encrypted ? 'https' : 'http');
  const host = request.headers['x-forwarded-host'] || request.headers.host;
  if (typeof host === 'string' && host.length > 0) {
    return `${proto}://${host}`;
  }
  if (config.ALLOWED_ORIGINS && config.ALLOWED_ORIGINS.length > 0) {
    return config.ALLOWED_ORIGINS[0];
  }
  return 'https://aljeel-digital.com';
}

function formatCondition(c: string | undefined | null, isAr: boolean): string {
  if (!c) return '';
  switch (c) {
    case 'new': return isAr ? 'جديد كلياً' : 'Brand New';
    case 'open_box': return isAr ? 'صندوق مفتوح (أوبن بوكس)' : 'Open Box';
    case 'like_new': return isAr ? 'شبه جديد (كسر زيرو)' : 'Like New';
    case 'refurbished': return isAr ? 'مجدد مضمون' : 'Refurbished';
    case 'used': return isAr ? 'مستعمل بحالة ممتازة' : 'Used';
    case 'defective': return isAr ? 'تصفية' : 'Clearance';
    case 'A': return isAr ? 'درجة A ممتاز' : 'Grade A';
    case 'B': return isAr ? 'درجة B نظيف' : 'Grade B';
    case 'C': return isAr ? 'درجة C' : 'Grade C';
    default: return c;
  }
}

function getSchemaCondition(c: string | undefined | null): string {
  if (!c) return 'https://schema.org/UsedCondition';
  switch (c) {
    case 'new':
      return 'https://schema.org/NewCondition';
    case 'refurbished':
      return 'https://schema.org/RefurbishedCondition';
    case 'open_box':
    case 'like_new':
    case 'used':
    case 'A':
    case 'B':
    case 'C':
    default:
      return 'https://schema.org/UsedCondition';
  }
}

function getShopFilterSummary(searchParams: URLSearchParams, isAr: boolean): string {
  const labels: string[] = [];
  const add = (key: string, label: (value: string) => string) => {
    for (const raw of searchParams.getAll(key)) {
      for (const value of raw.split(',').map(item => item.trim()).filter(Boolean)) {
        labels.push(label(value));
      }
    }
  };

  add('brand', value => value);
  add('condition', value => `${isAr ? 'الحالة' : 'Condition'} ${formatCondition(value, isAr)}`);
  add('cpuFamily', value => `${isAr ? 'معالج' : 'CPU'} ${value}`);
  add('cpuBrand', value => value);
  add('cpuGen', value => `${isAr ? 'الجيل' : 'Gen'} ${value}`);
  add('ramGB', value => `${value} GB RAM`);
  add('storageGB', value => `${Number(value) >= 1000 ? `${Number(value) / 1000} TB` : `${value} GB`} SSD`);
  add('gpuType', value => value === 'dedicated' ? (isAr ? 'كرت شاشة منفصل' : 'Dedicated graphics') : (isAr ? 'كرت شاشة مدمج' : 'Integrated graphics'));
  add('screenSize', value => `${value}\"`);
  if (searchParams.get('touch') === 'true') labels.push(isAr ? 'شاشة لمس' : 'Touchscreen');
  if (searchParams.get('available') === 'true') labels.push(isAr ? 'متوفر الآن' : 'In stock');

  const min = searchParams.get('min');
  const max = searchParams.get('max');
  if (min || max) {
    labels.push(isAr
      ? `السعر ${min ? `من $${min}` : ''}${min && max ? ' إلى ' : ''}${max ? `حتى $${max}` : ''}`
      : `Price ${min ? `from $${min}` : ''}${min && max ? ' to ' : ''}${max ? `up to $${max}` : ''}`);
  }

  const specNames: Record<string, { ar: string; en: string }> = {
    sizeType: { ar: 'نوع الجهاز', en: 'Device type' },
    resolution: { ar: 'الدقة', en: 'Resolution' },
    refreshHz: { ar: 'معدل التحديث', en: 'Refresh rate' },
    panel: { ar: 'نوع اللوحة', en: 'Panel' },
    curved: { ar: 'شكل الشاشة', en: 'Screen shape' },
    feature: { ar: 'الميزة', en: 'Feature' },
    deviceType: { ar: 'نوع القطعة', en: 'Device type' },
    ddrGen: { ar: 'جيل الذاكرة', en: 'Memory generation' },
    speedMhz: { ar: 'السرعة', en: 'Speed' },
    storageType: { ar: 'نوع التخزين', en: 'Storage type' },
    accessoryType: { ar: 'نوع الملحق', en: 'Accessory type' },
    wifiGen: { ar: 'معيار Wi-Fi', en: 'Wi-Fi standard' },
    printerType: { ar: 'نوع الطابعة', en: 'Printer type' },
    audioType: { ar: 'نوع الصوت', en: 'Audio type' },
  };
  for (const [key, value] of searchParams.entries()) {
    if (!key.startsWith('spec_')) continue;
    const name = specNames[key.slice(5)];
    labels.push(name ? `${name[isAr ? 'ar' : 'en']}: ${value}` : value);
  }

  return labels.slice(0, 3).join(isAr ? '، ' : ', ');
}

// In-memory cache for resolved metadata (60s TTL)
interface MetaCacheEntry {
  meta: PageMeta;
  expiresAt: number;
}
const metaCache = new Map<string, MetaCacheEntry>();

export async function resolveSeoMeta(
  db: PrismaClient,
  path: string,
  baseUrl: string
): Promise<PageMeta> {
  const normalizedPath = path.split('?')[0].replace(/\/+$/, '') || '/';
  const searchParams = new URL(path, baseUrl).searchParams;
  const relevantSearch = [...searchParams.entries()]
    .filter(([key]) => !['page', 'sort', 'focusSearch'].includes(key))
    .sort(([aKey, aValue], [bKey, bValue]) => aKey.localeCompare(bKey) || aValue.localeCompare(bValue))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  const cacheKey = `${baseUrl}|${normalizedPath}${relevantSearch ? `?${relevantSearch}` : ''}`;
  const cached = metaCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.meta;
  }

  const langMatch = normalizedPath.match(/^\/(ar|en)(\/.*)?$/);
  const lang = langMatch ? langMatch[1] : 'ar';
  const subPath = langMatch && langMatch[2] ? langMatch[2] : (langMatch ? '/' : normalizedPath);
  const isAr = lang === 'ar';
  const siteName = isAr ? 'الجيل العربي الرقمي' : 'Al-Jeel Digital';
  const defaultLogo = `${baseUrl}/desktop-ar.png`;

  const cleanSubPath = subPath === '/' ? '' : subPath;
  const alternateUrls = {
    ar: `${baseUrl}/ar${cleanSubPath}`,
    en: `${baseUrl}/en${cleanSubPath}`,
  };

  let result: PageMeta | null = null;

  try {
    // ── 1. Product Detail Page ──────────────────────────────────────────────
    // Patterns: /shop/:category/:slug or /products/:slug or /product/:slug
    const prodMatch = subPath.match(/^\/shop\/[^/]+\/([^/?#]+)$/) || subPath.match(/^\/products?\/([^/?#]+)$/);
    if (prodMatch) {
      const slug = decodeURIComponent(prodMatch[1]);
      let product = await db.product.findUnique({
        where: { slug },
        include: {
          brand: { select: { name: true } },
          images: {
            orderBy: { sort: 'asc' },
            take: 4,
            include: { media: { select: { id: true, originalPath: true } } },
          },
          variants: {
            where: { active: true },
            select: { priceUsd: true, condition: true, images: true, specs: true, sku: true, active: true },
          },
        },
      });

      if (!product) {
        const redirect = await db.productRedirect.findFirst({
          where: { path: { endsWith: '/' + slug } },
        });
        if (redirect) {
          product = await db.product.findUnique({
            where: { id: redirect.productId },
            include: {
              brand: { select: { name: true } },
              images: {
                orderBy: { sort: 'asc' },
                take: 4,
                include: { media: { select: { id: true, originalPath: true } } },
              },
              variants: {
                where: { active: true },
                select: { priceUsd: true, condition: true, images: true, specs: true, sku: true, active: true },
              },
            },
          });
        }
      }

      if (product) {
        const titleJson = typeof product.title === 'object' && product.title ? (product.title as any) : {};
        const summaryJson = typeof product.summary === 'object' && product.summary ? (product.summary as any) : {};
        const prodTitle = (isAr ? titleJson.ar : titleJson.en) || titleJson.ar || titleJson.en || `${product.brand?.name ?? ''} ${product.model}`.trim();
        const baseSummary = (isAr ? summaryJson.ar : summaryJson.en) || summaryJson.ar || summaryJson.en || '';

        // Extract specs highlights
        const specs = typeof product.specs === 'object' && product.specs ? (product.specs as Record<string, any>) : {};
        const highlights: string[] = [];
        if (product.brand?.name) highlights.push(product.brand.name);
        if (specs.processor || specs.cpu) highlights.push(String(specs.processor || specs.cpu));
        if (specs.ramGB) highlights.push(`${specs.ramGB}GB RAM`);
        else if (specs.ram) highlights.push(String(specs.ram));
        if (specs.storageGB) highlights.push(`${specs.storageGB}GB SSD`);
        else if (specs.capacityGB) highlights.push(String(specs.capacityGB));
        else if (specs.storage) highlights.push(String(specs.storage));
        if (specs.gpu || specs.graphics) highlights.push(String(specs.gpu || specs.graphics));
        const conditionText = formatCondition(product.variants[0]?.condition || product.condition, isAr);
        if (conditionText) highlights.push(conditionText);

        // Price calculation in USD and YER
        const priced = product.variants.filter(v => v.priceUsd !== null).sort((a, b) => Number(a.priceUsd!) - Number(b.priceUsd!));
        const priceVal = priced[0]?.priceUsd ?? product.priceUsd;
        let priceStr = '';
        let yerNumber: number | null = null;
        if (priceVal) {
          priceStr = `$${Number(priceVal)}`;
          try {
            const pricing = await db.pricingConfig.findUnique({ where: { id: 1 } });
            if (pricing?.usdToYer) {
              yerNumber = Math.round(Number(priceVal) * Number(pricing.usdToYer));
              priceStr += ` (${yerNumber.toLocaleString('ar-YE')} ر.ي)`;
            }
          } catch {
            // ignore
          }
        }

        const descParts: string[] = [];
        if (highlights.length > 0) {
          descParts.push((isAr ? 'المواصفات: ' : 'Specs: ') + highlights.join(' | '));
        }
        if (priceStr) {
          descParts.push((isAr ? 'السعر: ' : 'Price: ') + priceStr);
        }
        if (baseSummary) {
          descParts.push(baseSummary);
        }

        // Image Resolution
        const allImages: string[] = [];
        for (const img of product.images) {
          const raw = img.media?.originalPath;
          if (raw) {
            allImages.push(raw.startsWith('http') ? raw : `${baseUrl}${raw.startsWith('/') ? '' : '/'}${raw}`);
          }
        }
        if (allImages.length === 0 && Array.isArray(product.variants[0]?.images)) {
          for (const raw of product.variants[0].images) {
            const str = String(raw);
            allImages.push(str.startsWith('http') ? str : `${baseUrl}${str.startsWith('/') ? '' : '/'}${str}`);
          }
        }
        const imageUrl = allImages[0] || defaultLogo;

        const productDetails = descParts.filter(Boolean).join(' | ');
        const pageTitle = isAr
          ? `${prodTitle} | ${siteName} — صنعاء`
          : `${prodTitle} | ${siteName}, Sana'a`;

        const pageDescription = isAr
          ? `${prodTitle} من متجر ${siteName} في صنعاء، اليمن. ${productDetails ? `${productDetails}. ` : ''}متجرنا في منتصف شارع صخر، مع توصيل وشحن إلى المحافظات.`
          : `${prodTitle} from ${siteName} in Sana'a, Yemen. ${productDetails ? `${productDetails}. ` : ''}Visit us on Mid-Sakhr Street. Delivery and shipping are available across the governorates.`;

        const keywords = [
          prodTitle,
          `لابتوب ${product.brand?.name || ''} في اليمن`,
          `لابتوبات صنعاء`,
          `شراء لابتوب عدن`,
          `لابتوبات حضرموت المكلا`,
          `لابتوبات تعز`,
          `أسعار اللابتوبات في اليمن`,
          `توصيل لابتوبات للمحافظات`,
          `شحن إلكترونيات اليمن`,
          siteName,
        ];

        const canonicalUrl = `${baseUrl}/${lang}/shop/${product.category}/${product.slug}`;
        const sellerSchema = createSellerSchema(baseUrl, isAr);
        const shippingDetailsSchema = createShippingDetailsSchema();
        const returnPolicySchema = createReturnPolicySchema();

        const breadcrumbs = createBreadcrumbSchema([
          { name: isAr ? 'الرئيسية' : 'Home', url: `${baseUrl}/${lang}` },
          { name: isAr ? 'المتجر' : 'Shop', url: `${baseUrl}/${lang}/shop` },
          { name: product.category, url: `${baseUrl}/${lang}/shop/${product.category}` },
          { name: prodTitle, url: canonicalUrl },
        ]);

        const offerStart = product.priceUpdatedAt ?? product.publishedAt;
        const productSchema = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          '@id': `${canonicalUrl}#product`,
          name: merchantProductName(prodTitle, product.brand?.name, product.model, isAr),
          description: pageDescription,
          image: allImages.length > 0 ? allImages : [imageUrl],
          sku: product.variants[0]?.sku || product.model || String(product.id),
          ...(manufacturerPartNumber(product.model) ? { mpn: manufacturerPartNumber(product.model) } : {}),
          brand: {
            '@type': 'Brand',
            name: product.brand?.name || siteName,
          },
          category: product.category,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: String(priceVal),
            ...(offerStart ? { validFrom: offerStart.toISOString().slice(0, 10) } : {}),
            url: canonicalUrl,
            itemCondition: getSchemaCondition(product.variants[0]?.condition || product.condition),
            availability: product.variants.length > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: sellerSchema,
            shippingDetails: shippingDetailsSchema,
            hasMerchantReturnPolicy: returnPolicySchema,
          },
        };

        result = {
          title: pageTitle,
          description: pageDescription,
          imageUrl,
          imageAlt: prodTitle,
          canonicalUrl,
          alternateUrls,
          type: 'product',
          siteName,
          locale: isAr ? 'ar_YE' : 'en_US',
          keywords,
          imagePreloadUrl: (product.variants[0]?.images?.[0]
            ? (String(product.variants[0].images[0]).startsWith('http') ? String(product.variants[0].images[0]) : `${baseUrl}${String(product.variants[0].images[0]).startsWith('/') ? '' : '/'}${String(product.variants[0].images[0])}`)
            : imageUrl),
          structuredData: [
            ...(priceVal !== null && priceVal !== undefined ? [productSchema] : []),
            breadcrumbs,
            sellerSchema,
          ],
        };
      }
    }

    // ── 2. Promotional Collection / Offer Page ──────────────────────────────
    if (!result) {
      const colMatch = subPath.match(/^\/(?:offers|collections?)\/([^/?#]+)$/);
      if (colMatch) {
        const slug = decodeURIComponent(colMatch[1]);
        const collection = await db.catalogCollection.findUnique({
          where: { slug },
          include: {
            products: {
              take: 1,
              include: {
                product: {
                  include: {
                    images: { take: 1, include: { media: { select: { originalPath: true } } } },
                  },
                },
              },
            },
          },
        });

        if (collection) {
          const titleJson = typeof collection.title === 'object' && collection.title ? (collection.title as any) : {};
          const descJson = typeof collection.description === 'object' && collection.description ? (collection.description as any) : {};
          const colTitle = (isAr ? titleJson.ar : titleJson.en) || titleJson.ar || titleJson.en || 'عرض خاص';
          const colDesc = (isAr ? descJson.ar : descJson.en) || descJson.ar || descJson.en || (isAr ? 'عروض وتخفيضات حصرية لدى الجيل العربي الرقمي.' : 'Exclusive offers and discounts at Al-Jeel Digital.');

          let imageUrl = defaultLogo;
          const prodImg = collection.products[0]?.product?.images[0]?.media?.originalPath;
          if (prodImg) {
            imageUrl = prodImg.startsWith('http') ? prodImg : `${baseUrl}${prodImg.startsWith('/') ? '' : '/'}${prodImg}`;
          }

          const canonicalUrl = `${baseUrl}/${lang}/offers/${collection.slug}`;
          const sellerSchema = createSellerSchema(baseUrl, isAr);
          const breadcrumbs = createBreadcrumbSchema([
            { name: isAr ? 'الرئيسية' : 'Home', url: `${baseUrl}/${lang}` },
            { name: isAr ? 'العروض الحصرية' : 'Offers', url: `${baseUrl}/${lang}/offers` },
            { name: colTitle, url: canonicalUrl },
          ]);

          result = {
            title: `${colTitle} في اليمن | ${isAr ? 'عروض الجيل العربي الرقمي صنعاء' : 'Al-Jeel Digital Deals Sana\'a'}`,
            description: `${colDesc} — ${isAr ? 'عروض حصرية مع ضمان معتمد وتوصيل لكافة المحافظات اليمنية (صنعاء، عدن، تعز، حضرموت، مأرب).' : 'Exclusive offers with certified warranty and delivery across all Yemeni governorates.'}`,
            imageUrl,
            canonicalUrl,
            alternateUrls,
            type: 'website',
            siteName,
            locale: isAr ? 'ar_YE' : 'en_US',
            keywords: [colTitle, 'عروض لابتوبات اليمن', 'تخفيضات أجهزة صنعاء', siteName],
            structuredData: [breadcrumbs, sellerSchema],
          };
        }
      }
    }

    // ── 3. Offers / Collections Landing Page ────────────────────────────────
    if (!result && /^\/(?:offers|collections)\/?$/.test(subPath)) {
      const canonicalUrl = `${baseUrl}/${lang}/offers`;
      const sellerSchema = createSellerSchema(baseUrl, isAr);
      const breadcrumbs = createBreadcrumbSchema([
        { name: isAr ? 'الرئيسية' : 'Home', url: `${baseUrl}/${lang}` },
        { name: isAr ? 'العروض الحصرية' : 'Exclusive Offers', url: canonicalUrl },
      ]);

      result = {
        title: isAr ? `العروض والتخفيضات الحصرية في اليمن | ${siteName} صنعاء` : `Exclusive Offers & Deals in Yemen | ${siteName} Sana'a`,
        description: isAr
          ? 'استكشف أحدث العروض والخصومات الحصرية على أجهزة اللابتوب والحلول التقنية المتطورة في اليمن مع ضمان حقيقي وتوصيل لكافة المحافظات.'
          : 'Explore exclusive deals, discounts, and packages on high-performance laptops and IT solutions in Yemen with nationwide delivery.',
        imageUrl: defaultLogo,
        canonicalUrl,
        alternateUrls,
        type: 'website',
        siteName,
        locale: isAr ? 'ar_YE' : 'en_US',
        keywords: ['عروض لابتوبات اليمن', 'خصومات لابتوب صنعاء', 'عروض إلكترونيات عدن', siteName],
        structuredData: [breadcrumbs, sellerSchema],
      };
    }

    // ── 4. Bundles / Packages Page ──────────────────────────────────────────
    if (!result && /^\/(?:bundles|setups)\/?$/.test(subPath)) {
      const canonicalUrl = `${baseUrl}/${lang}/bundles`;
      const sellerSchema = createSellerSchema(baseUrl, isAr);
      const breadcrumbs = createBreadcrumbSchema([
        { name: isAr ? 'الرئيسية' : 'Home', url: `${baseUrl}/${lang}` },
        { name: isAr ? 'الباقات وحلول التجهيز' : 'Complete Packages', url: canonicalUrl },
      ]);

      result = {
        title: isAr ? `الباقات وحلول التجهيز المتكاملة في اليمن | ${siteName}` : `Complete Workstation Packages in Yemen | ${siteName}`,
        description: isAr
          ? 'باقات وحزم تقنية متكاملة ومجهزة للشركات، المكاتب، وصناع المحتوى والمهندسين في اليمن بأعلى معايير الجودة والضمان وشحن لكافة المحافظات.'
          : 'All-in-one workstation packages and IT setups tailored for businesses, creators, and engineers in Yemen with nationwide shipping.',
        imageUrl: defaultLogo,
        canonicalUrl,
        alternateUrls,
        type: 'website',
        siteName,
        locale: isAr ? 'ar_YE' : 'en_US',
        keywords: ['باقات لابتوب اليمن', 'تجهيز مكاتب صنعاء', 'حلول شركات عدن', siteName],
        structuredData: [breadcrumbs, sellerSchema],
      };
    }

    // ── 5. Category Page ───────────────────────────────────────────────────
    if (!result) {
      const catMatch = subPath.match(/^\/shop\/([^/?#]+)\/?$/)
        || (subPath === '/shop' && searchParams.get('category') ? [null, searchParams.get('category')!] : null)
        || (subPath === '/laptops' ? [null, 'laptops'] : null);
      if (catMatch) {
        const catSlug = decodeURIComponent(catMatch[1]);
        const cat = await db.catalogCategory.findUnique({ where: { slug: catSlug } }).catch(() => null);
        const catTitle = cat
          ? (typeof cat.title === 'object' && cat.title ? (isAr ? (cat.title as any).ar : (cat.title as any).en) || catSlug : catSlug)
          : (catSlug === 'laptops' ? (isAr ? 'أجهزة لابتوب' : 'Laptops') : catSlug);
        const categoryName = catSlug === 'displays-projectors'
          ? (isAr ? 'أجهزة العرض والبروجكتورات' : 'Projectors')
          : catTitle;
        const filterSummary = getShopFilterSummary(searchParams, isAr);
        const searchTerm = searchParams.get('q')?.trim();
        const pageTitle = filterSummary
          ? `${categoryName} — ${filterSummary} في ${isAr ? 'صنعاء' : "Sana'a"} | ${siteName}`
          : searchTerm
            ? (isAr ? `نتائج «${searchTerm}» في ${categoryName} بصنعاء | ${siteName}` : `“${searchTerm}” in ${categoryName} in Sana'a | ${siteName}`)
            : (isAr ? `أفضل ${categoryName} في صنعاء | ${siteName}` : `${categoryName} in Sana'a | ${siteName}`);
        const pageDescription = filterSummary
          ? (isAr
            ? `تصفح ${categoryName} حسب المواصفات المختارة: ${filterSummary}، من متجر ${siteName} في صنعاء، اليمن. موقعنا في منتصف شارع صخر.`
            : `Browse ${categoryName} by selected specifications: ${filterSummary}, from ${siteName} in Sana'a, Yemen. Visit us on Mid-Sakhr Street.`)
          : searchTerm
            ? (isAr ? `نتائج البحث عن «${searchTerm}» ضمن ${categoryName} في صنعاء، اليمن. متجر الجيل العربي الرقمي، منتصف شارع صخر.` : `Search results for “${searchTerm}” in ${categoryName}, Sana'a, Yemen. Al-Jeel Digital, Mid-Sakhr Street.`)
            : (isAr
              ? `تصفح أفضل ${categoryName} من متجر ${siteName} في صنعاء، اليمن. قارن الأنواع والمواصفات، وزرنا في منتصف شارع صخر.`
              : `Browse ${categoryName} at ${siteName} in Sana'a, Yemen. Compare available types and specifications. Visit us on Mid-Sakhr Street.`);

        const catalogParams = new URLSearchParams(searchParams);
        catalogParams.set('category', searchParams.has('q') ? (searchParams.get('category') || catSlug) : catSlug);
        const filteredCatalog = await catalogSearch(db, catalogParams);
        const firstProduct = filteredCatalog.items[0];
        const firstOfferImage = firstProduct?.offers.find(offer => offer.images.length)?.images[0];
        const firstProductImage = firstOfferImage || firstProduct?.product.images[0];
        const categoryImage = cat && typeof cat.imageId === 'string'
          ? await db.mediaAsset.findUnique({ where: { id: cat.imageId }, select: { originalPath: true } })
          : null;
        const rawPreviewImage = firstProductImage || categoryImage?.originalPath;
        const previewImage = rawPreviewImage
          ? (rawPreviewImage.startsWith('http') ? rawPreviewImage : `${baseUrl}${rawPreviewImage.startsWith('/') ? '' : '/'}${rawPreviewImage}`)
          : defaultLogo;
        const firstProductTitle = firstProduct
          ? String((firstProduct.product.title as Record<string, unknown>)[lang] || (firstProduct.product.title as Record<string, unknown>).ar || '')
          : '';
        const itemListSchema = {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          numberOfItems: filteredCatalog.total,
          itemListElement: filteredCatalog.items.slice(0, 10).map((item, index) => {
            const productTitle = String((item.product.title as Record<string, unknown>)[lang] || (item.product.title as Record<string, unknown>).ar || item.product.model);
            const image = item.offers.find(offer => offer.images.length)?.images[0] || item.product.images[0];
            return {
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Thing',
                name: productTitle,
                description: String((item.product.summary as Record<string, unknown>)[lang] || (item.product.summary as Record<string, unknown>).ar || ''),
                url: `${baseUrl}/${lang}/shop/${item.product.category}/${item.product.slug}`,
                ...(image ? { image: image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}` } : {}),
              },
            };
          }),
        };

        const canonicalUrl = `${baseUrl}/${lang}/shop/${catSlug}`;
        const sellerSchema = createSellerSchema(baseUrl, isAr);
        const breadcrumbs = createBreadcrumbSchema([
          { name: isAr ? 'الرئيسية' : 'Home', url: `${baseUrl}/${lang}` },
          { name: isAr ? 'المتجر' : 'Shop', url: `${baseUrl}/${lang}/shop` },
          { name: catTitle, url: canonicalUrl },
        ]);

        const collectionSchema = {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: pageTitle,
          description: pageDescription,
          url: canonicalUrl,
        };

        result = {
          title: pageTitle,
          description: pageDescription,
          imageUrl: previewImage,
          imageAlt: firstProductTitle || categoryName,
          canonicalUrl,
          alternateUrls,
          type: 'website',
          siteName,
          locale: isAr ? 'ar_YE' : 'en_US',
          keywords: [
            `${catTitle} في اليمن`,
            `أسعار ${catTitle} في صنعاء`,
            `${catTitle} عدن`,
            `${catTitle} حضرموت`,
            `${catTitle} تعز`,
            'متجر كمبيوتر اليمن',
            siteName,
          ],
          structuredData: [collectionSchema, itemListSchema, breadcrumbs, sellerSchema],
        };
      }
    }

    // ── 6. Shop Main Page ───────────────────────────────────────────────────
    if (!result && /^\/shop\/?$/.test(subPath)) {
      const canonicalUrl = `${baseUrl}/${lang}/shop`;
      const sellerSchema = createSellerSchema(baseUrl, isAr);
      const breadcrumbs = createBreadcrumbSchema([
        { name: isAr ? 'الرئيسية' : 'Home', url: `${baseUrl}/${lang}` },
        { name: isAr ? 'المتجر الإلكتروني' : 'Online Store', url: canonicalUrl },
      ]);

      const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
          name: isAr ? 'متجر الإلكترونيات واللابتوبات في صنعاء' : "Electronics & Laptop Store in Sana'a",
        description: isAr
          ? 'المتجر الإلكتروني الشامل لأجهزة اللابتوب ومعدات تقنية المعلومات في اليمن. فحص فني وضمان حقيقي مع توصيل وشحن لكافة المحافظات.'
          : 'Premier online laptop and IT equipment store in Yemen with nationwide shipping.',
        url: canonicalUrl,
      };

      result = {
        title: isAr ? `متجر الإلكترونيات واللابتوبات في اليمن | ${siteName} صنعاء` : `Electronics & Laptop Store in Yemen | ${siteName} Sana'a`,
        description: isAr
          ? 'تسوق أفضل أجهزة اللابتوب ومعدات تقنية المعلومات في اليمن بمعايير فحص دقيقة وضمان حقيقي. أسعار منافسة بالدولار والريال مع توصيل فوري في صنعاء وشحن لكافة المحافظات (عدن، تعز، حضرموت، إب، مأرب).'
          : 'Shop premium laptops and IT hardware in Yemen with certified inspection, warranty, and express delivery to all governorates.',
        imageUrl: defaultLogo,
        canonicalUrl,
        alternateUrls,
        type: 'website',
        siteName,
        locale: isAr ? 'ar_YE' : 'en_US',
        keywords: [
          'متجر لابتوبات اليمن',
          'لابتوبات في صنعاء',
          'شراء لابتوب عدن',
          'لابتوبات حضرموت',
          'لابتوبات تعز',
          'أسعار اللابتوبات بالريال اليمني',
          'إلكترونيات اليمن',
          siteName,
        ],
        structuredData: [collectionSchema, breadcrumbs, sellerSchema],
      };
    }
  } catch (error) {
    console.error('[SEO] Error resolving metadata for path:', path, error);
  }

  // ── 7. Default Site Metadata Fallback (Home / General) ───────────────────
  if (!result) {
    const canonicalUrl = `${baseUrl}/${lang}`;
    const sellerSchema = createSellerSchema(baseUrl, isAr);

    result = {
      title: isAr
        ? `${siteName} | متجر كمبيوتر وإلكترونيات`
        : `${siteName} | Computer & Electronics Store`,
      description: isAr
        ? 'تسوق أجهزة الكمبيوتر واللابتوبات ومكوناتها وملحقاتها ومنتجات الشبكات من متجر الجيل العربي الرقمي. تصفح الكتالوج وقارن المنتجات.'
        : 'Shop computers, laptops, components, accessories and networking products from Al-Jeel Al-Arabi Al-Raqmi. Browse the catalog and compare products.',
      imageUrl: defaultLogo,
      canonicalUrl,
      alternateUrls,
      type: 'website',
      siteName,
      locale: isAr ? 'ar_YE' : 'en_US',
      keywords: [
        'متجر كمبيوتر وإلكترونيات',
        'لابتوبات ومكونات كمبيوتر',
        'شبكات وملحقات تقنية',
        siteName,
      ],
      structuredData: [sellerSchema],
    };
  }

  metaCache.set(cacheKey, { meta: result, expiresAt: Date.now() + 60000 });
  return result;
}

export function injectSeoMeta(templateHtml: string, meta: PageMeta): string {
  // Replace <title>
  let html = templateHtml.replace(
    /<title>.*?<\/title>/is,
    `<title>${escapeHtml(meta.title)}</title>`
  );

  // Remove existing <meta name="description">, <meta property="og:*">, <meta name="twitter:*">, <link rel="canonical">
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/gi, '');
  html = html.replace(/<meta\s+name=["']keywords["'][^>]*>/gi, '');
  html = html.replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '');
  html = html.replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '');
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '');
  html = html.replace(/<link\s+rel=["']alternate["'][^>]*>/gi, '');

  const altAr = meta.alternateUrls?.ar || meta.canonicalUrl;
  const altEn = meta.alternateUrls?.en || meta.canonicalUrl;

  const keywordsTag = meta.keywords && meta.keywords.length > 0
    ? `\n    <meta name="keywords" content="${escapeHtml(meta.keywords.join(', '))}" />`
    : '';

  const structuredDataTag = meta.structuredData
    ? `\n    <!-- Schema.org JSON-LD Structured Data for Google Rich Snippets -->\n    <script type="application/ld+json">\n${JSON.stringify(meta.structuredData, null, 2)}\n    </script>`
    : '';

  // Build complete meta tags block with Geo Targeting for Yemen
  const metaTags = `
    <!-- Primary SEO & Local Yemen Meta Tags -->
    <meta name="description" content="${escapeHtml(meta.description)}" />${keywordsTag}
    <link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />
    <link rel="alternate" hreflang="ar" href="${escapeHtml(altAr)}" />
    <link rel="alternate" hreflang="en" href="${escapeHtml(altEn)}" />
    <link rel="alternate" hreflang="x-default" href="${escapeHtml(altAr)}" />

    <!-- Google Regional & Geographic Targeting for Yemen -->
    <meta name="geo.region" content="YE" />
    <meta name="geo.placename" content="Sana'a, Yemen" />
    <meta name="geo.position" content="15.3694;44.1910" />
    <meta name="ICBM" content="15.3694, 44.1910" />

    <!-- Open Graph / WhatsApp / Facebook Previews -->
    <meta property="og:site_name" content="${escapeHtml(meta.siteName)}" />
    <meta property="og:type" content="${meta.type}" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(meta.imageUrl)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(meta.imageUrl)}" />
    <meta property="og:image:alt" content="${escapeHtml(meta.imageAlt || meta.title)}" />
    <meta property="og:locale" content="${meta.locale}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${escapeHtml(meta.imageUrl)}" />${structuredDataTag}
`;

  const imagePreloadTag = meta.type === 'product' && meta.imagePreloadUrl
    ? `<link rel="preload" as="image" href="${escapeHtml(meta.imagePreloadUrl)}" fetchpriority="high" />\n    `
    : '';

  // Inject right after <head> or before </head>
  if (html.includes('</head>')) {
    html = html.replace('</head>', `${imagePreloadTag}${metaTags}\n  </head>`);
  } else {
    html = `${imagePreloadTag}${metaTags}\n${html}`;
  }

  return html;
}

// In-memory template cache with mtime check
let cachedTemplate: { path: string; mtime: number; content: string } | null = null;

export function loadHtmlTemplate(distRoot: string): string {
  const filePath = join(distRoot, 'index.html');
  if (!existsSync(filePath)) {
    throw new Error(`index.html not found in ${distRoot}`);
  }
  const stat = statSync(filePath);
  if (cachedTemplate && cachedTemplate.path === filePath && cachedTemplate.mtime === stat.mtimeMs) {
    return cachedTemplate.content;
  }
  const content = readFileSync(filePath, 'utf-8');
  cachedTemplate = { path: filePath, mtime: stat.mtimeMs, content };
  return content;
}

export async function renderSeoHtml(options: {
  distRoot: string;
  path: string;
  request: FastifyRequest;
  config: AppConfig;
  db: PrismaClient;
}): Promise<string> {
  const { distRoot, path, request, config, db } = options;
  const template = loadHtmlTemplate(distRoot);
  const baseUrl = getBaseUrl(request, config);
  const meta = await resolveSeoMeta(db, path, baseUrl);
  return injectSeoMeta(template, meta);
}
