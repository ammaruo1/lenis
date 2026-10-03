import { useCatalog } from '@/data/CatalogContext';
import { Link } from 'react-router-dom';
import type { Product } from '@/data/types';
import { useLanguage } from '@/i18n/LanguageContext';
import ProductImage from './ProductImage';
export default function ProductCard({ product }: { product: Product }) {
  const { site: site } = useCatalog();
  const { language, t } = useLanguage();
  const path = `/${language}/shop/${product.category}/${product.slug}`;
  const specs = [product.specs.cpu, product.specs.ramGB ? `${product.specs.ramGB} GB RAM` : null, product.specs.storageGB ? `${product.specs.storageGB} GB ${product.specs.storageType}` : null, product.specs.display ? `${product.specs.display.sizeIn}″ · ${product.specs.display.hz} Hz` : null, product.specs.wifiStandard, product.specs.capacityGB ? `${product.specs.capacityGB} GB · ${product.specs.interface}` : null, product.specs.connectionType].filter(Boolean);
  const title = product.title[language];
  return <article className="catalog-card"><Link className="catalog-media" to={path} viewTransition aria-label={title}><ProductImage src={product.images[0]} id={product.id} alt={title} shared/><span className="catalog-demo">{product.demo ? (language==='ar'?'نموذج تجريبي':'Demo model') : t.shop.conditionLabels[product.condition]}</span></Link><div className="catalog-body"><span className="catalog-brand">{product.brand}</span><h3><Link to={path} viewTransition>{title}</Link></h3><p className="catalog-summary">{product.summary[language]}</p><ul className="catalog-specs">{specs.slice(0,4).map((value,i)=><li key={i}><bdi>{value}</bdi></li>)}</ul><div className="catalog-condition"><span>{t.shop.conditionLabels[product.condition]}</span><span>{product.demo ? (language==='ar'?'التوفر يحتاج تأكيدًا':'Stock unconfirmed') : t.shop.stockLabels[product.stock]}</span></div><p className="catalog-warranty">{product.warrantyMonths == null ? t.shop.warrantyTBD : `${product.warrantyMonths} ${language==='ar'?'شهر':'months'}`}</p><div className="catalog-footer"><strong>{product.price.usd == null ? t.shop.askForPrice : `$${product.price.usd}`}</strong><Link to={path} viewTransition>{t.shop.viewDetails} <span aria-hidden="true">{language==='ar'?'↖':'↗'}</span></Link></div>{product.price.updatedAt && <small>{product.price.updatedAt}</small>}{site.whatsapp && <a className="desk-text-link" href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`${title}\n${location.origin}${path}`)}`} target="_blank" rel="noreferrer">{t.shop.askAboutProduct}</a>}</div></article>;
}
