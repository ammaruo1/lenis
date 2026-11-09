export function normalizeSearch(value: string): string {
  return value.normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/[ىئ]/g, 'ي').replace(/ة/g, 'ه').trim().toLowerCase();
}

const SKU_QUERY_PREFIX = /^(?:(?:sku|item|part)\s*(?:(?:number|no)\.?\s*)?|رقم\s*(?:(?:الصنف|المرجع)\s*)?)[:#-]?\s*/iu;

export function normalizeSkuCode(value: string): string {
  return normalizeSearch(value)
    .replace(/[٠-٩۰-۹]/g, digit => String(digit.codePointAt(0)! - (digit >= '۰' ? 0x06f0 : 0x0660)))
    .replace(SKU_QUERY_PREFIX, '')
    .replace(/[^a-z0-9]/g, '');
}

export function isSkuQuery(value: string): boolean {
  const normalized = normalizeSearch(value).replace(SKU_QUERY_PREFIX, '').trim();
  const compact = normalizeSkuCode(value);
  if (compact.length < 3 || !/\d/.test(compact)) return false;
  const hasSkuLabel = SKU_QUERY_PREFIX.test(normalizeSearch(value));
  return hasSkuLabel || !/\s/.test(normalized) || /^[\d\s]+$/u.test(normalized) || /[._/#-]/u.test(normalized);
}

export function skuMatchesQuery(sku: string, query: string): boolean {
  if (!isSkuQuery(query)) return false;
  const compactQuery = normalizeSkuCode(query);
  return compactQuery.length >= 3 && normalizeSkuCode(sku).includes(compactQuery);
}
