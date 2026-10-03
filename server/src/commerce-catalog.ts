import {Prisma,type PrismaClient,type CatalogCategory} from '@prisma/client';
import {normalizeSearch,CollectionRules,SpecField,type SpecFieldInput} from '@aljeel/shared';
import {z} from 'zod';
import {productDto} from './catalog-service.js';
import {ApiError} from './errors.js';
export const variantInclude={units:true,product:{include:{brand:true,variants:{include:{units:{select:{available:true}}}},images:{orderBy:{sort:'asc' as const},include:{media:{select:{id:true,originalPath:true}}}},compatibleWith:true}}} satisfies Prisma.ProductVariantInclude;
export type VariantRow=Prisma.ProductVariantGetPayload<{include:typeof variantInclude}>;
export type Sellable={variantId:string;unitId?:string;sku:string;condition:string;priceUsd:string|null;priceYer?:string|null;specs:Record<string,unknown>;images:string[];warrantyMonths:number|null;available:boolean;batteryHealthPct:number|null;inspection:unknown;defects:unknown};
export const jsonObject=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
export const imagePaths=(v:unknown):string[]=>Array.isArray(v)?v.filter((s):s is string=>typeof s==='string'):[];
export const optionIdentity=(options:Record<string,unknown>)=>JSON.stringify(Object.entries(options).sort(([a],[b])=>a.localeCompare(b)).map(([key,value])=>[key,Array.isArray(value)?[...value].sort():value]));
export const priceInYer=(usd:string|null,rate:Prisma.Decimal|null|undefined)=>usd!==null&&rate?new Prisma.Decimal(usd).mul(rate).toFixed(2):null;
export function offers(v:VariantRow):Sellable[]{
  const parent=jsonObject(v.product.specs),display=jsonObject(parent.display);
  const specs:Record<string,unknown>={...(display.sizeIn!==undefined?{sizeInch:display.sizeIn}:{}),...(display.hz!==undefined?{refreshHz:display.hz}:{}),...(display.res!==undefined?{resolution:display.res}:{}),...parent,...jsonObject(v.specs),...jsonObject(v.options)};
  const base={variantId:v.id,sku:v.sku,priceUsd:v.priceUsd?.toFixed(2)??null,specs,images:imagePaths(v.images).length?imagePaths(v.images):v.product.images.map(i=>i.media.originalPath),warrantyMonths:v.warrantyMonths};
  if(v.inventoryMode==='serialized')return v.units.filter(u=>u.available).map(u=>({...base,unitId:u.id,condition:u.condition,images:imagePaths(u.images).length?imagePaths(u.images):base.images,available:v.inventoryReviewed&&v.active,batteryHealthPct:u.batteryHealthPct,specs:{...base.specs,...(u.batteryHealthPct!==null?{batteryHealthPct:u.batteryHealthPct}:{})},inspection:u.inspection,defects:u.defects}));
  return [{...base,condition:v.condition,available:v.active&&v.inventoryReviewed&&v.quantity>0,batteryHealthPct:typeof base.specs.batteryHealthPct==='number'?base.specs.batteryHealthPct:null,inspection:v.product.inspection,defects:[]}];
}
export function descendants(categories:{slug:string;parentSlug:string|null}[],root:string):Set<string>{
  const result=new Set([root]);let changed=true;
  while(changed){changed=false;for(const c of categories)if(c.parentSlug&&result.has(c.parentSlug)&&!result.has(c.slug)){result.add(c.slug);changed=true;}}
  return result;
}
export function validateSpecs(fields:SpecFieldInput[],specs:Record<string,unknown>,publishing:boolean){
  const missing:string[]=[];
  for(const f of fields){const v=specs[f.key];if(v===undefined||v===null||v===''){if(publishing&&f.required)missing.push(f.key);continue;}
    if(f.valueType==='number'&&(typeof v!=='number'||!Number.isFinite(v))||f.valueType==='boolean'&&typeof v!=='boolean'||['text','single'].includes(f.valueType)&&typeof v!=='string'||f.valueType==='multi'&&(!Array.isArray(v)||v.some(x=>typeof x!=='string')))throw new ApiError(400,'invalid_spec_'+f.key);
    if(['single','multi'].includes(f.valueType)&&(Array.isArray(v)?v:[v]).some(x=>!f.options.includes(String(x))))throw new ApiError(400,'invalid_spec_option_'+f.key);
  }
  return missing;
}
export async function effectiveFields(db:PrismaClient|Prisma.TransactionClient,product:{category:string;productTypeId?:string|null}){
  let typeId=product.productTypeId;let slug:string|null=product.category;const seen=new Set<string>();
  while(!typeId&&slug&&!seen.has(slug)){seen.add(slug);const c:CatalogCategory|null=await db.catalogCategory.findUnique({where:{slug}});typeId=c?.productTypeId;slug=c?.parentSlug??null;}
  const type=typeId?await db.productType.findUnique({where:{id:typeId}}):null;
  return type?z.array(SpecField).parse(type.fields):[];
}
export async function publishedRows(db:PrismaClient){
  const categories=await db.catalogCategory.findMany();
  const allowed=new Set(categories.filter(c=>c.status==='published').map(c=>c.slug));
  for(const c of categories)if(c.status!=='published')for(const slug of descendants(categories,c.slug))allowed.delete(slug);
  const rows=await db.productVariant.findMany({where:{active:true,product:{status:'published',deletedAt:null,brand:{published:true},category:{in:[...allowed]}}},include:variantInclude});
  return {rows,categories:categories.filter(c=>allowed.has(c.slug))};
}
export function ruleMatches(rule:unknown,v:VariantRow,o:Sellable,categories:{slug:string;parentSlug:string|null}[]){
  const r=CollectionRules.parse(rule);
  return (!r.categories.length||r.categories.some(c=>descendants(categories,c).has(v.product.category)))&&(!r.brands.length||r.brands.includes(v.product.brandId))&&(!r.conditions.length||r.conditions.includes(o.condition as 'new'|'A'|'B'|'C'))&&(r.available===null||r.available===o.available)&&(!r.min||o.priceUsd!==null&&new Prisma.Decimal(o.priceUsd).gte(r.min))&&(!r.max||o.priceUsd!==null&&new Prisma.Decimal(o.priceUsd).lte(r.max));
}
export async function catalogSearch(db:PrismaClient,params:URLSearchParams){
  const {rows,categories}=await publishedRows(db);
  const [collections,types,pricing]=await Promise.all([db.catalogCollection.findMany({where:{published:true},include:{products:true},orderBy:{sort:'asc'}}),db.productType.findMany(),db.pricingConfig.findUnique({where:{id:1}})]);
  const selected=(key:string)=>params.getAll(key).flatMap(v=>v.split(',')).filter(Boolean);
  const category=params.get('category');const allowed=category?descendants(categories,category):null;
  const entries=rows.flatMap(v=>offers(v).map(o=>({v,o})));
  const query=normalizeSearch(params.get('q')??'');
  const match=(e:typeof entries[number],skip='')=>{
    const {v,o}=e,p=v.product;
    if(allowed&&!allowed.has(p.category))return false;
    if(query&&!normalizeSearch([JSON.stringify(p.title),p.model,p.brand.name,o.sku,...imagePaths(p.tags)].join(' ')).includes(query))return false;
    if(skip!=='brand'&&selected('brand').length&&!selected('brand').includes(p.brandId))return false;
    if(skip!=='condition'&&selected('condition').length&&!selected('condition').includes(o.condition))return false;
    if(skip!=='available'&&params.get('available')==='true'&&!o.available)return false;
    if(skip!=='price'&&((params.get('min')&&(!o.priceUsd||new Prisma.Decimal(o.priceUsd).lt(params.get('min')!)))||(params.get('max')&&(!o.priceUsd||new Prisma.Decimal(o.priceUsd).gt(params.get('max')!)))))return false;
    if(skip!=='collection'&&selected('collection').length&&!collections.some(c=>selected('collection').includes(c.id)&&(c.mode==='manual'?c.products.some(x=>x.productId===p.id):ruleMatches(c.rules,v,o,categories))))return false;
    for(const key of new Set([...params.keys()].filter(k=>k.startsWith('spec_')))){if(skip===key)continue;const values=selected(key),actual=o.specs[key.slice(5)];if(values.length&&!(Array.isArray(actual)?actual:[actual]).some(a=>values.includes(String(a))))return false;}
    return true;
  };
  const grouped=new Map<string,{product:ReturnType<typeof productDto>;brandId:string;offers:Sellable[];fields:SpecFieldInput[]}>();
  const fieldsByCategory=new Map<string,SpecFieldInput[]>();
  for(const c of categories){let typeId=c.productTypeId,parent=c.parentSlug;while(!typeId&&parent){const pc=categories.find(x=>x.slug===parent);typeId=pc?.productTypeId??null;parent=pc?.parentSlug??null;}fieldsByCategory.set(c.slug,z.array(SpecField).parse(types.find(t=>t.id===typeId)?.fields??[]));}
  const fieldsFor=(v:VariantRow)=>v.product.productTypeId?z.array(SpecField).parse(types.find(t=>t.id===v.product.productTypeId)?.fields??[]):fieldsByCategory.get(v.product.category)??[];
  for(const e of entries.filter(e=>match(e))){const id=e.v.productId;const item=grouped.get(id)??{product:productDto(e.v.product),brandId:e.v.product.brandId,offers:[],fields:fieldsFor(e.v)};item.offers.push({...e.o,priceYer:priceInYer(e.o.priceUsd,pricing?.usdToYer)});grouped.set(id,item);}
  const items=[...grouped.values()];
  const minPrice=(x:typeof items[number])=>Math.min(...x.offers.filter(o=>o.priceUsd!==null).map(o=>Number(o.priceUsd)),Infinity);
  const sort=params.get('sort')??'newest';
  items.sort((a,b)=>sort==='price_asc'?minPrice(a)-minPrice(b):sort==='price_desc'?((Number.isFinite(minPrice(b))?minPrice(b):-1)-(Number.isFinite(minPrice(a))?minPrice(a):-1)):sort==='name'?String(jsonObject(a.product.title).ar).localeCompare(String(jsonObject(b.product.title).ar),'ar'):sort==='battery'?Math.max(...b.offers.map(o=>o.batteryHealthPct??-1))-Math.max(...a.offers.map(o=>o.batteryHealthPct??-1)):rows.find(r=>r.productId===b.product.id)!.product.createdAt.getTime()-rows.find(r=>r.productId===a.product.id)!.product.createdAt.getTime());
  const facet=(key:string,get:(e:typeof entries[number])=>string[])=>{
    const counts=new Map<string,Set<string>>();
    for(const e of entries.filter(e=>match(e,key)))for(const val of get(e)){if(!counts.has(val))counts.set(val,new Set());counts.get(val)!.add(e.v.productId);}
    for(const val of selected(key))if(!counts.has(val))counts.set(val,new Set());
    return [...counts].map(([value,ids])=>({value,count:ids.size})).sort((a,b)=>a.value.localeCompare(b.value,undefined,{numeric:true}));
  };
  const specFields=[...new Map(entries.filter(e=>!allowed||allowed.has(e.v.product.category)).flatMap(e=>fieldsFor(e.v)).filter(f=>f.filterable&&f.valueType!=='text').map(f=>[f.key,f])).values()].sort((a,b)=>a.sort-b.sort);
  const page=Math.max(1,Number(params.get('page'))||1),pageSize=24,total=items.length;
  return {items:items.slice((page-1)*pageSize,page*pageSize),total,page,pageSize,hasCatalog:rows.length>0,categories,collections:collections.map(c=>({id:c.id,title:c.title})),facets:{brand:facet('brand',e=>[e.v.product.brandId]).map(f=>({...f,title:rows.find(r=>r.product.brandId===f.value)?.product.brand.name??f.value})),condition:facet('condition',e=>[e.o.condition]),collection:facet('collection',e=>collections.filter(c=>c.mode==='manual'?c.products.some(p=>p.productId===e.v.productId):ruleMatches(c.rules,e.v,e.o,categories)).map(c=>c.id)),specs:specFields.map(f=>({...f,values:facet('spec_'+f.key,e=>(Array.isArray(e.o.specs[f.key])?e.o.specs[f.key] as unknown[]:[e.o.specs[f.key]]).filter(v=>v!==undefined&&v!==null).map(String))}))},pricing:pricing?{usdToYer:pricing.usdToYer?.toString()??null,updatedAt:pricing.updatedAt.toISOString()}:null};
}

