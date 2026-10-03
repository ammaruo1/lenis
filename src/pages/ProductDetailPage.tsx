import {useEffect,useState} from 'react';
import {Link,useParams,Navigate} from 'react-router-dom';
import {useLanguage} from '@/i18n/LanguageContext';
import {shopApi,commerceCopy,errorText,type CatalogItem,specText,inspectionTitle} from '@/data/commerce';
import {Purchase} from '@/components/shop/CommerceCard';
import '@/commerce.css';
export default function ProductDetailPage(){
  const {slug,category}=useParams(),{language}=useLanguage(),t=commerceCopy[language],[item,setItem]=useState<CatalogItem|null>(null),[error,setError]=useState(''),[image,setImage]=useState(0);
  useEffect(()=>{let active=true;setImage(0);setItem(null);setError('');shopApi<CatalogItem>('/products/'+slug+'?category='+encodeURIComponent(category??'')).then(v=>{if(active)setItem(v);}).catch(e=>{if(active)setError(errorText(e.message,language));});return()=>{active=false;};},[slug,category,language]);
  if(item&&(category!==item.product.category||slug!==item.product.slug))return <Navigate replace to={'/'+language+'/shop/'+item.product.category+'/'+item.product.slug}/>;
  const p=item?.product,o=item?.offers[0],images=o?.images.length?o.images:p?.images??[];
  return <main id="main-content" className="store-shell" dir={language==='ar'?'rtl':'ltr'}><div className="store-actions"><Link to={'/'+language+'/shop'}>{t.continue}</Link><Link to={'/'+language+'/cart'}>{t.cart}</Link></div>{error?<p role="alert" className="store-error">{error}</p>:!p||!item?<p>{t.loading}</p>:<><div className="store-detail-grid"><div>{images[image]&&<img src={images[image]} alt={p.title[language]} width={640} height={480}/>}<div className="store-toolbar">{images.map((src,i)=><button key={src} onClick={()=>setImage(i)} aria-label={String(i+1)}><img src={src} alt="" width={64} height={48} style={{width:64,height:48}}/></button>)}</div></div><div><small>{p.brand} · {p.model}</small><h1>{p.title[language]}</h1><p>{p.summary[language]}</p>{p.demo&&<p>{t.demo}</p>}<div className="store-price"><strong>{o?.priceUsd?'$'+o.priceUsd:t.ask}</strong></div><Purchase item={item}/><p className="store-notice">{t.noReservation}</p><dl>{item.fields.map(f=>o?.specs[f.key]!==undefined&&<div key={f.key}><dt>{f.title[language]}</dt><dd>{specText(o.specs[f.key],language)} {f.unit??''}</dd></div>)}</dl></div></div><section className="store-panel"><h2><strong>{t.inspection}</strong></h2>{item.offers.map(offer=><div key={offer.variantId+(offer.unitId??'')}><h3 dir="ltr">{offer.sku} {offer.unitId?'· '+t.unit+' '+offer.unitId.slice(-6):''}</h3><p>{offer.condition} {offer.batteryHealthPct!==null?' · '+t.battery+' '+offer.batteryHealthPct+'%':''}</p>{Object.entries(offer.inspection&&typeof offer.inspection==='object'?offer.inspection:{}).map(([key,value])=><p key={key}>{inspectionTitle(key,language)}: {specText(value,language)}</p>)}{offer.defects?.map((d,i)=><p key={i}>{d[language]}</p>)}</div>)}</section></>}</main>;
}


