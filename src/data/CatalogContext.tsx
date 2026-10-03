import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {z} from 'zod';
import {ProductsArraySchema,BrandsArraySchema,FAQArraySchema,SiteDataSchema,WarrantyDataSchema,BundlesArraySchema,LocalizedTextSchema} from '@aljeel/shared';
const CatalogSchema=z.object({products:ProductsArraySchema,brands:BrandsArraySchema,faq:FAQArraySchema,site:SiteDataSchema,warranty:WarrantyDataSchema,bundles:BundlesArraySchema,categories:z.array(z.object({slug:z.string(),title:LocalizedTextSchema})),specs:z.array(z.object({key:z.string(),title:LocalizedTextSchema,filterable:z.boolean()}))});
type Catalog=z.infer<typeof CatalogSchema>;
const Context=createContext<Catalog|null>(null);
export function useCatalog(){const data=useContext(Context);if(!data)throw new Error('Catalog not loaded');return data;}
export function CatalogProvider({children}:{children:ReactNode}){
  const [data,setData]=useState<Catalog|null>(null),[error,setError]=useState(false),[retry,setRetry]=useState(0);
  const ar=!location.pathname.startsWith('/en');
  useEffect(()=>{
    const abort=new AbortController();let active=true;
    const load=async()=>{try{const r=await fetch('/api/bootstrap',{signal:abort.signal,cache:'no-store'});if(!r.ok)throw new Error('catalog');const catalog=CatalogSchema.parse(await r.json());if(active){setData(catalog);setError(false);}}catch{if(active)setError(true);}};
    void load();const interval=setInterval(()=>{if(document.visibilityState==='visible')void load();},60000);
    const onFocus=()=>void load();window.addEventListener('focus',onFocus);
    return()=>{active=false;abort.abort();clearInterval(interval);window.removeEventListener('focus',onFocus);};
  },[retry]);
  if(!data)return <main id="main-content" className="page-shell" style={{paddingTop:140,minHeight:'100svh'}} aria-busy={!error}>{error?<><h1>{ar?'تعذّر تحميل بيانات المتجر':'Could not load store data'}</h1><p>{ar?'يرجى إعادة المحاولة.':'Please try again.'}</p><button onClick={()=>{setError(false);setRetry(v=>v+1);}}>{ar?'إعادة المحاولة':'Retry'}</button></>:<p role="status">{ar?'جارٍ تحميل بيانات المتجر…':'Loading store data…'}</p>}</main>;
  return <Context.Provider value={data}>{error&&<p role="status" className="page-shell">{ar?'تعذّر تحديث البيانات؛ تُعرض آخر نسخة محمّلة.':'Unable to refresh; showing the last loaded data.'}</p>}{children}</Context.Provider>;
}
