import {Prisma, type PrismaClient} from '@prisma/client';
import {ProductEditSchema,type ProductEdit,can} from '@aljeel/shared';
import type {FastifyRequest} from 'fastify';
import type {AppConfig} from './config.js';
import {transaction} from './db.js';
import {audit} from './audit.js';
import {ApiError} from './errors.js';
import {effectiveFields,validateSpecs,jsonObject} from './commerce-catalog.js';
export const productInclude={brand:true,variants:{include:{units:{select:{available:true}}}},images:{orderBy:{sort:'asc' as const},include:{media:{select:{id:true,originalPath:true}}}},compatibleWith:true} satisfies Prisma.ProductInclude;
type Row=Prisma.ProductGetPayload<{include:typeof productInclude}>;
export function productDto(p:Row,admin=false){
  const variants=p.variants.filter(v=>v.active),priced=variants.filter(v=>v.priceUsd!==null).sort((a,b)=>a.priceUsd!.cmp(b.priceUsd!)),publicUsd=priced[0]?.priceUsd??null;
  const available=variants.some(v=>v.inventoryReviewed&&(v.inventoryMode==='quantity'?v.quantity>0:v.units.some(u=>u.available)));
  return {id:p.id,slug:p.slug,category:p.category,brand:p.brand.name,model:p.model,title:p.title,summary:p.summary,condition:p.condition,warrantyMonths:p.warrantyMonths,
    price:{usd:admin?p.priceUsd?.toFixed(2)??null:publicUsd===null?null:Number(publicUsd),yer:admin?p.priceYer?.toFixed(2)??null:null,updatedAt:p.priceUpdatedAt?.toISOString()??null,negotiable:p.negotiable},
    stock:admin?p.stock:available?'in_stock':'order',specs:p.specs,bestFor:p.bestFor,compatibleWith:p.compatibleWith.map(c=>c.otherProductId),specSources:p.specSources,inspection:p.inspection,
    images:p.images.map(i=>i.media.originalPath),tags:p.tags,demo:p.demo,...(admin?{brandId:p.brandId,productTypeId:p.productTypeId,status:p.status,revision:p.updatedAt.toISOString()}:{}),};
}
export async function saveProduct(db:PrismaClient,config:AppConfig,request:FastifyRequest|null,input:ProductEdit,create=false,importing=false){
  const p=ProductEditSchema.parse(input);
  return transaction(db,async tx=>{
    const before=await tx.product.findUnique({where:{id:p.id},include:productInclude});
    if(create&&before) throw new ApiError(409,'already_exists');
    if(!create&&!before) throw new ApiError(404,'not_found');
    if(before&&request&&input.revision!==before.updatedAt.toISOString()) throw new ApiError(409,'content_changed');
    if(before?.publishedAt&&(before.slug!==p.slug||before.category!==p.category))await tx.productRedirect.upsert({where:{path:before.category+'/'+before.slug},create:{path:before.category+'/'+before.slug,productId:p.id},update:{productId:p.id}});
    if(request&&!can(request.auth!.user.role,'catalog.publish')&&(p.status!==before?.status||p.status==='published')) throw new ApiError(403,'forbidden');
    const priceChanged=(!before&& (p.price.usd!==null||p.price.yer!==null)) || Boolean(before&&(before.priceUsd?.toFixed(2)!==(p.price.usd===null?undefined:new Prisma.Decimal(p.price.usd).toFixed(2))||before.priceYer?.toFixed(2)!==(p.price.yer===null?undefined:new Prisma.Decimal(p.price.yer).toFixed(2))));
    if(priceChanged&&request&&!can(request.auth!.user.role,'prices.edit')) throw new ApiError(403,'forbidden');
    const brand=p.brandId?await tx.brand.findUnique({where:{id:p.brandId}}):await tx.brand.findFirst({where:{name:p.brand}});
    if(!brand) throw new ApiError(400,'unknown_brand');
    if(p.status==='published'&&!brand.published) throw new ApiError(400,'brand_not_published');
    const category=await tx.catalogCategory.findUnique({where:{slug:p.category}});
    if(!category) throw new ApiError(400,'unknown_category');
    if(p.status==='published'&&category.status!=='published')throw new ApiError(400,'category_not_published');
    if(p.productTypeId&&!await tx.productType.findUnique({where:{id:p.productTypeId}}))throw new ApiError(400,'unknown_type');
    const variants=await tx.productVariant.findMany({where:{productId:p.id,active:true}});
    const fields=await effectiveFields(tx,{category:p.category,productTypeId:p.productTypeId===undefined?before?.productTypeId:p.productTypeId});
    if(p.status==='published'&&!variants.length&&before)throw new ApiError(400,'publish_incomplete');
    for(const variant of variants.length?variants:[{specs:{},options:{}}])if(validateSpecs(fields,{...p.specs,...jsonObject(variant.specs),...jsonObject(variant.options)},p.status==='published').length)throw new ApiError(400,'publish_incomplete');
    const now=new Date();
    const values={slug:p.slug,category:p.category,brandId:brand.id,productTypeId:(p.productTypeId===undefined?before?.productTypeId:p.productTypeId)??null,model:p.model,title:p.title,summary:p.summary,condition:p.condition,status:p.status,demo:p.demo??false,warrantyMonths:p.warrantyMonths,
      priceUsd:p.price.usd,priceYer:p.price.yer,priceUpdatedAt:priceChanged?now:before?.priceUpdatedAt??(p.price.updatedAt?new Date(p.price.updatedAt):null),negotiable:p.price.negotiable,stock:p.stock,
      specs:p.specs as Prisma.InputJsonValue,bestFor:p.bestFor,specSources:p.specSources??[],tags:p.tags,inspection:p.inspection,publishedAt:p.status==='published'?before?.publishedAt??now:before?.publishedAt??null};
    if(before) await tx.product.update({where:{id:p.id},data:values}); else await tx.product.create({data:{id:p.id,...values}});
    if(!await tx.productVariant.count({where:{productId:p.id}}))await tx.productVariant.create({data:{id:p.id+'-default',productId:p.id,sku:p.id.slice(0,92)+'-default',optionKey:'[]',options:{},specs:{},images:[],priceUsd:p.price.usd,warrantyMonths:p.warrantyMonths,condition:p.condition,inventoryReviewed:false}});
    else if(priceChanged&&variants.length===1&&variants[0].optionKey==='[]')await tx.productVariant.update({where:{id:variants[0].id},data:{priceUsd:p.price.usd}});
    await tx.productImage.deleteMany({where:{productId:p.id}});
    for(const [sort,path] of p.images.entries()){
      const media=await tx.mediaAsset.findFirst({where:{originalPath:path}});
      if(!media) throw new ApiError(400,'unknown_image');
      await tx.productImage.create({data:{productId:p.id,mediaId:media.id,sort,shot:'front_closed',altAr:p.title.ar,altEn:p.title.en}});
    }
    await tx.productCompat.deleteMany({where:{productId:p.id}});
    for(const id of new Set(p.compatibleWith)){
      if(id===p.id) throw new ApiError(400,'invalid_compatibility');
      if(await tx.product.findUnique({where:{id}})){const old=before?.compatibleWith.find(c=>c.otherProductId===id);await tx.productCompat.create({data:{productId:p.id,otherProductId:id,...(old?{verified:old.verified,source:old.source,portType:old.portType,watts:old.watts,note:old.note}:{})}});}
      else if(!importing) throw new ApiError(400,'unknown_product');
    }
    await tx.productLabel.deleteMany({where:{productId:p.id}});
    for(const [kind,values] of Object.entries({tag:p.tags,bestFor:p.bestFor})) for(const value of new Set(values)) await tx.productLabel.create({data:{productId:p.id,kind,value}});
    await tx.productFacet.deleteMany({where:{productId:p.id}});
    const definitions=await tx.specDefinition.findMany({where:{filterable:true}});
    for(const definition of definitions){const value=p.specs[definition.key];for(const v of Array.isArray(value)?value:[value]) if(typeof v==='string'||typeof v==='number'||typeof v==='boolean') await tx.productFacet.create({data:{productId:p.id,key:definition.key,value:String(v).slice(0,160)}});}
    if(priceChanged&&request) await tx.priceHistory.create({data:{productId:p.id,priceUsd:p.price.usd,priceYer:p.price.yer,changedBy:request.auth!.user.id}});
    const after=await tx.product.findUniqueOrThrow({where:{id:p.id},include:productInclude});
    await audit(tx,config,request,{action:importing?'catalog.imported':before?'catalog.updated':'catalog.created',entity:'Product',entityId:p.id,before:before?productDto(before,true):undefined,after:productDto(after,true)});
    return productDto(after,true);
  });
}


