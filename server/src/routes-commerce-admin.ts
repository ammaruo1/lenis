import type {FastifyInstance} from 'fastify';
import {Prisma,type PrismaClient} from '@prisma/client';
import {z} from 'zod';
import {can,CategoryEdit,TypeEdit,VariantEdit,UnitEdit,CollectionEdit,PackageEdit,OrderStatuses} from '@aljeel/shared';
import {importCsv} from './commerce-csv.js';
import type {AppConfig} from './config.js';
import {transaction} from './db.js';
import {audit} from './audit.js';
import {ApiError} from './errors.js';
import {effectiveFields,validateSpecs,jsonObject,optionIdentity} from './commerce-catalog.js';
import {changeOrder} from './commerce-cart.js';
import {randomToken,hashToken} from './security.js';
import {productInclude,productDto} from './catalog-service.js';
const catalog={permission:'catalog.edit' as const},inventory={permission:'inventory.manage' as const},orders={permission:'orders.manage' as const};
const revision=(row:{updatedAt:Date}|null,value?:string)=>{if(row&&row.updatedAt.toISOString()!==value)throw new ApiError(409,'content_changed');};
export async function commerceAdminRoutes(app:FastifyInstance,db:PrismaClient,config:AppConfig){
  app.get('/commerce/products',{config:catalog},async request=>{
    const q=z.object({q:z.string().max(200).default(''),status:z.enum(['draft','published','archived']).optional(),page:z.coerce.number().int().positive().default(1),sort:z.enum(['updated','name']).default('updated')}).parse(request.query);
    const where:Prisma.ProductWhereInput={deletedAt:null,...(q.status?{status:q.status}:{}),...(q.q?{OR:[{model:{contains:q.q}},{slug:{contains:q.q}},{brand:{name:{contains:q.q}}},{variants:{some:{sku:{contains:q.q}}}},{title:{path:'$.ar',string_contains:q.q}},{title:{path:'$.en',string_contains:q.q}}]}:{})};
    return {items:(await db.product.findMany({where,include:productInclude,skip:(q.page-1)*24,take:24,orderBy:q.sort==='name'?{model:'asc'}:{updatedAt:'desc'}})).map(p=>productDto(p,true)),total:await db.product.count({where})};
  });
  app.get('/commerce/reference',{config:catalog},async()=>({products:await db.product.findMany({select:{id:true,title:true,brandId:true,category:true,productTypeId:true,status:true}}),brands:await db.brand.findMany(),categories:await db.catalogCategory.findMany({orderBy:{sort:'asc'}}),types:await db.productType.findMany(),variants:await db.productVariant.findMany({include:{units:true},orderBy:{sku:'asc'}}),collections:await db.catalogCollection.findMany({include:{products:true}}),packages:await db.catalogPackage.findMany({include:{items:true}})}));
  app.post('/commerce/categories',{config:catalog},async request=>{
    const input=CategoryEdit.parse(request.body);
    return transaction(db,async tx=>{
      let parent=input.parentSlug;const seen=new Set([input.slug]);
      while(parent){if(seen.has(parent))throw new ApiError(400,'category_cycle');seen.add(parent);const row=await tx.catalogCategory.findUnique({where:{slug:parent}});if(!row)throw new ApiError(400,'unknown_category');parent=row.parentSlug;}
      if(input.productTypeId&&!await tx.productType.findUnique({where:{id:input.productTypeId}}))throw new ApiError(400,'unknown_type');
      if(input.imageId&&!await tx.mediaAsset.findUnique({where:{id:input.imageId}}))throw new ApiError(400,'unknown_image');
      const before=await tx.catalogCategory.findUnique({where:{slug:input.slug}});
      revision(before,input.revision);
      const {revision:_r,...data}=input;void _r;
      const after=await tx.catalogCategory.upsert({where:{slug:input.slug},create:data,update:data});await audit(tx,config,request,{action:'category.saved',entity:'CatalogCategory',entityId:input.slug,before,after});return after;
    });
  });
  app.post('/commerce/types',{config:catalog},async request=>{
    const input=TypeEdit.parse(request.body);
    if(new Set(input.fields.map(f=>f.key)).size!==input.fields.length)throw new ApiError(400,'duplicate_spec');
    return transaction(db,async tx=>{const before=await tx.productType.findUnique({where:{id:input.id}});revision(before,input.revision);const data={title:input.title,fields:input.fields as Prisma.InputJsonValue};const after=await tx.productType.upsert({where:{id:input.id},create:{id:input.id,...data},update:data});await audit(tx,config,request,{action:'type.saved',entity:'ProductType',entityId:input.id,before,after});return after;});
  });
  app.post('/commerce/variants',{config:catalog},async request=>{
    const input=VariantEdit.parse(request.body);
    return transaction(db,async tx=>{
      const before=await tx.productVariant.findUnique({where:{id:input.id}});revision(before,input.revision);
      if(before&&before.productId!==input.productId)throw new ApiError(400,'variant_product_locked');
      if(input.priceUsd!==before?.priceUsd?.toFixed(2)&&!(input.priceUsd===null&&before?.priceUsd==null)&&!can(request.auth!.user.role,'prices.edit'))throw new ApiError(403,'forbidden');
      if(before&&before.inventoryMode!==input.inventoryMode){const movements=await tx.inventoryMovement.count({where:{variantId:before.id}}),units=await tx.inventoryUnit.count({where:{variantId:before.id}});if(movements||units||before.quantity)throw new ApiError(409,'inventory_mode_locked');}
      const p=await tx.product.findUniqueOrThrow({where:{id:input.productId}}),fields=await effectiveFields(tx,p);
      const missing=validateSpecs(fields,{...jsonObject(p.specs),...input.specs,...input.options},p.status==='published');
      if(missing.length)throw new ApiError(400,'missing_specs:'+missing.join(','));
      for(const path of input.images)if(!await tx.mediaAsset.findFirst({where:{originalPath:path}}))throw new ApiError(400,'unknown_image');
      const optionKey=optionIdentity(input.options);
      const {revision:_revision,...values}=input;void _revision;
      const after=await tx.productVariant.upsert({where:{id:input.id},create:{...values,optionKey},update:{...values,optionKey}});
      await audit(tx,config,request,{action:'variant.saved',entity:'ProductVariant',entityId:input.id,before,after});return after;
    });
  });
  app.get('/commerce/inventory',{config:inventory},async request=>{
    const query=z.object({q:z.string().default(''),page:z.coerce.number().int().positive().default(1)}).parse(request.query),where:Prisma.ProductVariantWhereInput=query.q?{OR:[{sku:{contains:query.q}},{productId:query.q}]}:{};
    return {items:await db.productVariant.findMany({where,include:{units:true,product:{select:{title:true}}},orderBy:{sku:'asc'},skip:(query.page-1)*24,take:24}),total:await db.productVariant.count({where}),movements:await db.inventoryMovement.findMany({orderBy:{createdAt:'desc'},take:100})};
  });
  app.post('/commerce/inventory/adjust',{config:inventory},async request=>{
    const input=z.object({variantId:z.string(),delta:z.number().int().min(-100000).max(100000),reason:z.string().trim().min(5).max(500),revision:z.string()}).parse(request.body);
    return transaction(db,async tx=>{const v=await tx.productVariant.findUniqueOrThrow({where:{id:input.variantId}});revision(v,input.revision);if(v.inventoryMode!=='quantity')throw new ApiError(400,'serialized_inventory');if(v.quantity+input.delta<0)throw new ApiError(409,'negative_stock');await tx.productVariant.update({where:{id:v.id},data:{quantity:{increment:input.delta},inventoryReviewed:true}});await tx.inventoryMovement.create({data:{variantId:v.id,delta:input.delta,reason:input.reason,userId:request.auth!.user.id}});await audit(tx,config,request,{action:'inventory.adjusted',entity:'ProductVariant',entityId:v.id,before:{quantity:v.quantity},after:{quantity:v.quantity+input.delta,reason:input.reason}});return {ok:true};});
  });
  app.post('/commerce/units',{config:inventory},async request=>{
    const input=UnitEdit.parse(request.body);
    return transaction(db,async tx=>{const before=await tx.inventoryUnit.findUnique({where:{id:input.id}});revision(before,input.revision);if(before?.soldOrderId)throw new ApiError(409,'unit_sold');if(before&&before.variantId!==input.variantId)throw new ApiError(400,'unit_variant_locked');const v=await tx.productVariant.findUniqueOrThrow({where:{id:input.variantId}});if(v.inventoryMode!=='serialized')throw new ApiError(400,'quantity_inventory');for(const path of input.images)if(!await tx.mediaAsset.findFirst({where:{originalPath:path}}))throw new ApiError(400,'unknown_image');const {revision:_r,...data}=input;void _r;const after=await tx.inventoryUnit.upsert({where:{id:input.id},create:data,update:data});await tx.productVariant.update({where:{id:v.id},data:{inventoryReviewed:true}});if(!before)await tx.inventoryMovement.create({data:{variantId:v.id,unitId:input.id,delta:1,userId:request.auth!.user.id,reason:'Individual unit received and inspected'}});await audit(tx,config,request,{action:'unit.saved',entity:'InventoryUnit',entityId:input.id,before,after});return after;});
  });
  app.post('/commerce/collections',{config:catalog},async request=>{
    const input=CollectionEdit.parse(request.body);
    return transaction(db,async tx=>{const before=await tx.catalogCollection.findUnique({where:{id:input.id}});revision(before,input.revision);const {productIds,revision:_r,...data}=input;void _r;const after=await tx.catalogCollection.upsert({where:{id:input.id},create:data,update:data});await tx.collectionProduct.deleteMany({where:{collectionId:input.id}});for(const productId of new Set(productIds))await tx.collectionProduct.create({data:{collectionId:input.id,productId}});await audit(tx,config,request,{action:'collection.saved',entity:'CatalogCollection',entityId:input.id,before,after});return after;});
  });
  app.post('/commerce/packages',{config:catalog},async request=>{
    const input=PackageEdit.parse(request.body);
    return transaction(db,async tx=>{const before=await tx.catalogPackage.findUnique({where:{id:input.id}});revision(before,input.revision);if(input.priceUsd!==before?.priceUsd?.toFixed(2)&&!(input.priceUsd===null&&before?.priceUsd==null)&&!can(request.auth!.user.role,'prices.edit'))throw new ApiError(403,'forbidden');if(new Set(input.items.map(i=>i.variantId)).size!==input.items.length)throw new ApiError(400,'duplicate_component');const {items,revision:_r,...data}=input;void _r;const after=await tx.catalogPackage.upsert({where:{id:input.id},create:data,update:data});await tx.packageItem.deleteMany({where:{packageId:input.id}});for(const item of items)await tx.packageItem.create({data:{packageId:input.id,...item}});await audit(tx,config,request,{action:'package.saved',entity:'CatalogPackage',entityId:input.id,before,after});return after;});
  });
  app.get('/commerce/orders',{config:orders},async request=>{
    const q=z.object({page:z.coerce.number().int().positive().default(1),q:z.string().default(''),status:z.enum(OrderStatuses).optional()}).parse(request.query),where:Prisma.CommerceOrderWhereInput={...(q.status?{status:q.status}:{}),...(q.q?{OR:[{number:{contains:q.q}},{customer:{phone:{contains:q.q}}}]}:{})};
    return {items:await db.commerceOrder.findMany({where,skip:(q.page-1)*24,take:24,orderBy:{createdAt:'desc'}}),total:await db.commerceOrder.count({where})};
  });
  app.post('/commerce/orders/:id/status',{config:orders},async request=>{const input=z.object({status:z.enum(OrderStatuses),revision:z.string()}).parse(request.body);return changeOrder(db,config,request,(request.params as {id:string}).id,input.status,input.revision);});
  app.get('/commerce/customers',{config:{permission:'customers.manage'}},async request=>{
    const q=z.object({q:z.string().default(''),page:z.coerce.number().int().positive().default(1)}).parse(request.query),where:Prisma.CustomerAccountWhereInput=q.q?{OR:[{phone:{contains:q.q}},{name:{contains:q.q}}]}:{};
    return {items:await db.customerAccount.findMany({where,skip:(q.page-1)*24,take:24,select:{id:true,name:true,phone:true,phoneVerified:true,active:true,createdAt:true,_count:{select:{orders:true}}}}),total:await db.customerAccount.count({where})};
  });
  app.post('/commerce/customers/:id/recovery',{config:{permission:'customers.manage'}},async request=>{
    const input=z.object({verificationNote:z.string().trim().min(10).max(500)}).parse(request.body),customerId=(request.params as {id:string}).id,token=randomToken();
    await transaction(db,async tx=>{await tx.customerReset.deleteMany({where:{customerId,usedAt:null}});await tx.customerReset.create({data:{id:hashToken(token),customerId,expiresAt:new Date(Date.now()+30*60000)}});await audit(tx,config,request,{action:'customer.recovery_issued',entity:'CustomerAccount',entityId:customerId,after:{verificationNote:input.verificationNote}});});
    return {token,expiresInMinutes:30};
  });
  app.get('/commerce/pricing',{config:{permission:'prices.edit'}},async()=>await db.pricingConfig.findUnique({where:{id:1}})??{usdToYer:null,whatsapp:null});
  app.post('/commerce/pricing',{config:{permission:'prices.edit'}},async request=>{
    const input=z.object({usdToYer:z.string().regex(/^\d{1,12}(\.\d{1,6})?$/).refine(v=>Number(v)>0).nullable(),whatsapp:z.string().regex(/^[1-9]\d{7,14}$/).nullable(),revision:z.string().optional()}).parse(request.body);
    return transaction(db,async tx=>{const before=await tx.pricingConfig.findUnique({where:{id:1}});revision(before,input.revision);const after=await tx.pricingConfig.upsert({where:{id:1},create:{usdToYer:input.usdToYer,whatsapp:input.whatsapp},update:{usdToYer:input.usdToYer,whatsapp:input.whatsapp}});await audit(tx,config,request,{action:'pricing.saved',entity:'PricingConfig',before,after});return after;});
  });
  app.post('/commerce/bulk',{config:catalog},async request=>{
    const input=z.object({ids:z.array(z.string()).min(1).max(200),action:z.enum(['published','archived','collection']),collectionId:z.string().optional()}).parse(request.body);
    if(input.action!=='collection'&&!can(request.auth!.user.role,'catalog.publish'))throw new ApiError(403,'forbidden');
    return transaction(db,async tx=>{for(const id of input.ids){const p=await tx.product.findUniqueOrThrow({where:{id},include:{images:true,variants:true,brand:true}});if(input.action==='published'){const c=await tx.catalogCategory.findUniqueOrThrow({where:{slug:p.category}});if(!p.images.length||!p.brand.published||c.status!=='published'||!p.variants.some(v=>v.active))throw new ApiError(400,'publish_incomplete');for(const v of p.variants.filter(v=>v.active)){if(validateSpecs(await effectiveFields(tx,p),{...jsonObject(p.specs),...jsonObject(v.specs),...jsonObject(v.options)},true).length)throw new ApiError(400,'publish_incomplete');}}if(input.action==='collection'){if(!input.collectionId)throw new ApiError(400,'unknown_collection');await tx.collectionProduct.upsert({where:{collectionId_productId:{collectionId:input.collectionId,productId:id}},create:{collectionId:input.collectionId,productId:id},update:{}});}else await tx.product.update({where:{id},data:{status:input.action,...(input.action==='published'?{publishedAt:p.publishedAt??new Date()}: {})}});await audit(tx,config,request,{action:'catalog.bulk_'+input.action,entity:'Product',entityId:id});}return {ok:true};});
  });
  app.get('/commerce/export',{config:catalog},async(request,reply)=>{
    const kind=z.object({kind:z.enum(['variants','units']).default('variants')}).parse(request.query).kind;
    if(kind==='units'){
      if(!can(request.auth!.user.role,'inventory.manage'))throw new ApiError(403,'forbidden');
      const rows=await db.inventoryUnit.findMany({where:{soldOrderId:null}});
      const quote=(v:unknown)=>'"'+String(v??'').replaceAll('"','""')+'"';
      const csv=[['id','variantId','serialNumber','condition','batteryHealthPct','inspection','defects','images'],...rows.map(u=>[u.id,u.variantId,u.serialNumber,u.condition,u.batteryHealthPct,JSON.stringify(u.inspection),JSON.stringify(u.defects),JSON.stringify(u.images)])].map(row=>row.map(quote).join(',')).join('\r\n');
      return reply.type('text/csv; charset=utf-8').header('Content-Disposition','attachment; filename=units.csv').send('\uFEFF'+csv);
    }
    const rows=await db.productVariant.findMany({include:{product:true}});
    const quote=(v:unknown)=>'"'+String(v??'').replaceAll('"','""')+'"';
    const csv=[['id','productId','sku','priceUsd','quantity','inventoryMode','inventoryReviewed','options','specs','titleAr','titleEn','category','brandId'],...rows.map(v=>[v.id,v.productId,v.sku,v.priceUsd?.toFixed(2),v.quantity,v.inventoryMode,v.inventoryReviewed,JSON.stringify(v.options),JSON.stringify(v.specs),jsonObject(v.product.title).ar,jsonObject(v.product.title).en,v.product.category,v.product.brandId])].map(row=>row.map(quote).join(',')).join('\r\n');
    return reply.type('text/csv; charset=utf-8').header('Content-Disposition','attachment; filename=catalog.csv').send('\uFEFF'+csv);
  });
  app.post('/commerce/import',{config:inventory,bodyLimit:1024*1024},async request=>{
    if(!can(request.auth!.user.role,'catalog.edit')||!can(request.auth!.user.role,'prices.edit'))throw new ApiError(403,'forbidden');
    return importCsv(db,config,request);
  });
  app.post('/commerce/compatibility',{config:catalog},async request=>{
    const input=z.object({productId:z.string(),otherProductId:z.string(),verified:z.boolean(),portType:z.string().min(1).max(100),source:z.string().trim().min(5).max(2000),watts:z.string().regex(/^\d+(\.\d{1,2})?$/).refine(v=>Number(v)>0).nullable(),note:z.string().max(1000)}).parse(request.body);
    if(input.productId===input.otherProductId)throw new ApiError(400,'invalid_compatibility');
    return transaction(db,async tx=>{const before=await tx.productCompat.findUnique({where:{productId_otherProductId:{productId:input.productId,otherProductId:input.otherProductId}}});const after=await tx.productCompat.upsert({where:{productId_otherProductId:{productId:input.productId,otherProductId:input.otherProductId}},create:input,update:input});await audit(tx,config,request,{action:'compatibility.evidence_saved',entity:'ProductCompat',entityId:after.id,before,after});return {ok:true};});
  });
  app.post('/commerce/units/:id/availability',{config:inventory},async request=>{
    const input=z.object({available:z.boolean(),revision:z.string(),reason:z.string().trim().min(5).max(500)}).parse(request.body),id=(request.params as {id:string}).id;
    return transaction(db,async tx=>{const before=await tx.inventoryUnit.findUniqueOrThrow({where:{id}});revision(before,input.revision);if(before.soldOrderId)throw new ApiError(409,'unit_sold');const after=await tx.inventoryUnit.update({where:{id},data:{available:input.available}});if(before.available!==input.available)await tx.inventoryMovement.create({data:{variantId:before.variantId,unitId:id,delta:input.available?1:-1,reason:input.reason,userId:request.auth!.user.id}});await audit(tx,config,request,{action:'unit.availability_changed',entity:'InventoryUnit',entityId:id,before:{available:before.available},after:{available:input.available,reason:input.reason}});return after;});
  });
}
