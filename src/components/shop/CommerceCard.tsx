import {useState} from 'react';
import {Link} from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import {ShoppingBag,X,Check} from 'lucide-react';
import {useLanguage} from '@/i18n/LanguageContext';
import {commerceCopy,addCart,errorText,type CatalogItem,type Offer,specText} from '@/data/commerce';
export function Purchase({item}:{item:CatalogItem}){
  const {language}=useLanguage(),t=commerceCopy[language];
  const [open,setOpen]=useState(false),[selected,setSelected]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[added,setAdded]=useState(false);
  const available=item.offers.filter(o=>o.available);
  const key=(o:Offer)=>o.variantId+':'+(o.unitId??'');
  async function add(o:Offer){setBusy(true);setError('');try{await addCart({variantId:o.variantId,...(o.unitId?{unitId:o.unitId}:{}),quantity:1});setAdded(true);setOpen(false);}catch(e){setError(errorText(e instanceof Error?e.message:'',language));}finally{setBusy(false);}}
  return <><button className="store-button" disabled={!available.length||busy} onClick={()=>{setAdded(false);if(available.length===1)void add(available[0]);else {setSelected(key(available[0]));setOpen(true);}}}>{added?<Check size={17}/>:<ShoppingBag size={17}/>} {added?t.added:available.length>1?t.choose:available.length?t.add:t.unavailable}</button>{error&&<p role="alert" className="store-error">{error}</p>}<Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Portal><Dialog.Overlay className="store-overlay"/><Dialog.Content className="store-dialog" dir={language==="ar"?"rtl":"ltr"}><Dialog.Title>{t.choose}</Dialog.Title><Dialog.Description>{item.product.title[language]}</Dialog.Description><Dialog.Close className="store-close" aria-label={t.close}><X/></Dialog.Close><div className="offer-list">{available.map(o=><label key={key(o)} className="offer-row"><input type="radio" name="offer" checked={selected===key(o)} onChange={()=>setSelected(key(o))}/><span><strong dir="ltr">{o.sku}</strong><span className="offer-specs">{Object.entries(o.specs).slice(0,6).map(([k,v])=><span key={k}>{item.fields.find(f=>f.key===k)?.title[language]??k}: {specText(v,language)}</span>)}</span><span>{o.condition} · {o.priceUsd?'$'+o.priceUsd:t.ask}{o.batteryHealthPct!==null?' · '+o.batteryHealthPct+'%':''}</span>{o.unitId&&<small>{t.unit}: {o.unitId.slice(-6)}</small>}{o.defects?.map((d,i)=><small key={i}>{d[language]}</small>)}</span></label>)}</div><button className="store-button" disabled={busy||!selected} onClick={()=>{const o=available.find(o=>key(o)===selected);if(o)void add(o);}}>{t.add}</button><Link to={'/'+language+'/cart'}>{t.cart}</Link></Dialog.Content></Dialog.Portal></Dialog.Root></>;
}
export default function CommerceCard({item,rate}:{item:CatalogItem;rate?:string|null}){
  const {language}=useLanguage(),t=commerceCopy[language],p=item.product;
  const priced=item.offers.filter(o=>o.priceUsd!==null).sort((a,b)=>Number(a.priceUsd)-Number(b.priceUsd)),o=priced[0]??item.offers[0];
  const fields=item.fields.filter(f=>f.card&&o?.specs[f.key]!==undefined).sort((a,b)=>a.sort-b.sort).slice(0,4);
  return <article className="store-card"><Link to={'/'+language+'/shop/'+p.category+'/'+p.slug} className="store-card-image">{(o?.images[0]??p.images[0])&&<img src={o?.images[0]??p.images[0]} alt={p.title[language]} width={480} height={360} loading="lazy"/>}{p.demo&&<span className="store-badge">{t.demo}</span>}</Link><div className="store-card-body"><small>{p.brand} · {o?.condition}</small><h2><Link to={'/'+language+'/shop/'+p.category+'/'+p.slug}>{p.title[language]}</Link></h2><dl>{fields.map(f=><div key={f.key}><dt>{f.title[language]}</dt><dd>{specText(o.specs[f.key],language)} {f.unit??''}</dd></div>)}</dl><div className="store-price"><strong dir="ltr">{o?.priceUsd?'$'+o.priceUsd:t.ask}</strong>{rate&&o?.priceYer&&<small>{(Number(o.priceYer)).toLocaleString(language)} YER</small>}</div><Purchase item={item}/></div></article>;
}



