import { useLanguage } from '@/i18n/LanguageContext'
import {useCatalog} from '@/data/CatalogContext'
export default function Trust(){
 const {t,language}=useLanguage()
 const {brands:managedBrands}=useCatalog()
 const brands=managedBrands.map(b=>b.name)
 return <section id="trust" className="trust-section"><div className="page-shell"><div className="trust-heading"><span className="eyebrow">{language==='ar'?'أسماء تعرفها. خيارات تثق بها.':'FAMILIAR NAMES. TRUSTED CHOICES.'}</span><span>{t.trust.brandsTitle}</span></div><div className="brand-track" aria-label={t.trust.brandsTitle}>{brands.map((brand,i)=><span className={`brand-name brand-${i}`} key={brand} dir="ltr">{brand}</span>)}</div><p className="trust-disclaimer">{t.trust.brandsDisclaimer}</p></div></section>
}
