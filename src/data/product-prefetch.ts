import { shopApi, type CatalogItem } from './commerce';

const requests = new Map<string, Promise<CatalogItem>>();

function requestKey(category: string, slug: string) {
  return `${category}/${slug}`;
}

/** Start loading a directly opened product before the storefront bootstrap finishes. */
export function prefetchProduct(category: string, slug: string): Promise<CatalogItem> {
  const key = requestKey(category, slug);
  const existing = requests.get(key);
  if (existing) return existing;

  const request = shopApi<CatalogItem>(`/products/${encodeURIComponent(slug)}?category=${encodeURIComponent(category)}`);
  requests.set(key, request);
  if (requests.size > 12) {
    const oldestKey = requests.keys().next().value;
    if (oldestKey) requests.delete(oldestKey);
  }
  void request.catch(() => {
    if (requests.get(key) === request) requests.delete(key);
  });
  return request;
}

export function loadProduct(category: string, slug: string): Promise<CatalogItem> {
  return prefetchProduct(category, slug);
}
