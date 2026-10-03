import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Boxes,
  ShoppingBag,
  Check,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Battery,
  ShieldCheck,
  Laptop,
  CheckCircle2,
  MessageCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCatalog } from '@/data/CatalogContext';
import {
  shopApi,
  addCart,
  commerceCopy,
  errorText,
  type Localized,
  type Offer
} from '@/data/commerce';
import '@/commerce.css';

type PackageItem = {
  variantId: string;
  title: Localized;
  sku: string;
  inventoryMode: string;
  quantity: number;
  offers: Offer[];
};

type Package = {
  id: string;
  title: Localized;
  description: Localized;
  priceUsd: string | null;
  available: boolean;
  items: PackageItem[];
};

export default function PackagesPage() {
  const { language, dir } = useLanguage();
  const { site } = useCatalog();
  const t = commerceCopy[language];

  const [items, setItems] = useState<Package[] | null>(null);
  const [selected, setSelected] = useState<Package | null>(null);
  const [units, setUnits] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [added, setAdded] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    shopApi<{ items: Package[] }>('/packages')
      .then((r) => setItems(r.items))
      .catch((e) => setError(errorText(e.message, language)));
  }, [language]);

  const handleAdd = async (pkg: Package, unitIds: string[] = []) => {
    setBusy(true);
    setError('');
    try {
      await addCart({
        packageId: pkg.id,
        quantity: 1,
        ...(unitIds.length ? { unitIds } : {})
      });
      setAdded(pkg.id);
      setSelected(null);
      setTimeout(() => setAdded(''), 3000);
      window.dispatchEvent(new Event('store-cart-changed'));
    } catch (e) {
      setError(errorText(e instanceof Error ? e.message : '', language));
    } finally {
      setBusy(false);
    }
  };

  const whatsappPhone = site?.whatsapp || '967770000000';
  const customPackageUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    language === 'ar'
      ? 'السلام عليكم، أود استشارة فريق المتجر لتجهيز باقة مخصصة لاحتياجاتي وميزانيتي.'
      : 'Hello, I would like to consult your team regarding a custom hardware setup.'
  )}`;

  return (
    <main id="main-content" className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir={dir}>
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
            <Link to={`/${language}`} className="hover:text-purple-600 transition-colors">
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <span>/</span>
            <span className="text-neutral-900 dark:text-neutral-100 font-semibold">{t.packages}</span>
          </nav>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">
            {t.packages}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
            {language === 'ar'
              ? 'تجهيزات متكاملة مدروسة بعناية تضم أجهزة وشاشات وملحقات متوافقة تمامًا، مع فحص شامل وضمان مكتوب.'
              : 'Curated tech bundles combining verified hardware, monitors, and docks with full compatibility.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/${language}/shop`}
            className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 transition-colors"
          >
            {t.shop}
          </Link>
          <Link
            to={`/${language}/cart`}
            className="px-4 py-2 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t.cart}</span>
          </Link>
        </div>
      </div>

      {/* Error View */}
      {error && (
        <div role="alert" className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {items === null && (
        <div className="py-28 flex flex-col items-center justify-center gap-4 text-neutral-500">
          <div className="w-10 h-10 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-sm font-medium">{t.loading}</p>
        </div>
      )}

      {/* Empty packages */}
      {items && items.length === 0 && (
        <div className="text-center py-20 px-4 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 max-w-lg mx-auto">
          <Boxes className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            {t.empty}
          </h2>
          <p className="text-xs text-neutral-500 mb-4">
            {t.emptyNote}
          </p>
          <Link
            to={`/${language}/shop`}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
          >
            <span>{t.continue}</span>
          </Link>
        </div>
      )}

      {/* Packages Grid */}
      {items && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((pkg) => {
            const hasSerialized = pkg.items.some((i) => i.inventoryMode === 'serialized');

            return (
              <article
                key={pkg.id}
                className="rounded-3xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col justify-between hover:border-purple-600/40 transition-all shadow-sm hover:shadow-lg hover:shadow-purple-600/5 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-purple-600 text-white shadow-sm shadow-purple-600/20">
                      {language === 'ar' ? 'باقة متكاملة' : 'Full Setup'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {language === 'ar' ? 'فحص شامل 7 نقاط' : '7-Point Certified'}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-purple-600 transition-colors">
                    {pkg.title[language]}
                  </h2>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                    {pkg.description[language]}
                  </p>

                  {/* Included Items Checklist */}
                  <div className="space-y-2 mb-6 p-4 rounded-2xl bg-white dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                      {language === 'ar' ? 'المكونات المشمولة في الباقة:' : 'Package Components:'}
                    </span>
                    <ul className="space-y-2">
                      {pkg.items.map((item) => (
                        <li key={item.variantId} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                              {item.title[language]}
                            </span>
                            <span className="text-neutral-400 text-[11px] ms-1">
                              × {item.quantity}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-[10px] text-neutral-400 block">
                        {language === 'ar' ? 'سعر الباقة كاملة' : 'Bundle Price'}
                      </span>
                      <strong className="text-2xl font-black text-purple-600 dark:text-purple-400" dir="ltr">
                        {pkg.priceUsd ? `$${pkg.priceUsd}` : t.ask}
                      </strong>
                    </div>

                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      {language === 'ar' ? 'توفير عن الشراء المنفصل' : 'Special bundle value'}
                    </span>
                  </div>

                  <button
                    disabled={!pkg.available || busy}
                    onClick={() => {
                      if (hasSerialized) {
                        setSelected(pkg);
                        setUnits([]);
                      } else {
                        void handleAdd(pkg);
                      }
                    }}
                    className="w-full h-11 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {added === pkg.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{t.added}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>{pkg.available ? t.add : t.unavailable}</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Custom Setup Consultation CTA Banner */}
      <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-purple-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-purple-900/10">
        <div className="space-y-2 text-center sm:text-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>{language === 'ar' ? 'خدمة تجهيز مخصصة' : 'Custom Tailored Setup'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold">
            {language === 'ar'
              ? 'هل تحتاج باقة خاصة بميزانيتك أو مجال عملك؟'
              : 'Need a custom setup tailored to your workflow and budget?'}
          </h3>
          <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
            {language === 'ar'
              ? 'تواصل مباشرة مع المستشار التقني في معرض صنعاء لنساعدك في اختيار الأجهزة المتوافقة تمامًا مع برامجك.'
              : 'Chat with our Sana\'a hardware consultants to match the perfect gear for your apps and team.'}
          </p>
        </div>

        <a
          href={customPackageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-purple-900 hover:bg-purple-50 text-xs font-black transition-all shadow-lg flex-shrink-0"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>{language === 'ar' ? 'استشارة مجانية عبر واتساب' : 'Free WhatsApp Consultation'}</span>
        </a>
      </div>

      {/* Serialized Unit Selection Dialog */}
      <Dialog.Root
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="store-overlay" />
          <Dialog.Content className="store-dialog" dir={dir}>
            <div className="flex items-center justify-between mb-2">
              <Dialog.Title className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {t.chooseUnit}
              </Dialog.Title>
              <Dialog.Close className="store-close" aria-label={t.close}>
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>

            <Dialog.Description className="text-xs text-neutral-500 mb-4">
              {selected?.title[language]}
            </Dialog.Description>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pe-1">
              {selected?.items
                .filter((i) => i.inventoryMode === 'serialized')
                .map((item) => (
                  <fieldset key={item.variantId} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <legend className="text-xs font-bold text-neutral-800 dark:text-neutral-200 px-1">
                      {item.title[language]} × {item.quantity}
                    </legend>

                    <div className="space-y-2 mt-2">
                      {item.offers
                        .filter((o) => o.available && o.unitId)
                        .map((o) => (
                          <label
                            key={o.unitId}
                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                              units.includes(o.unitId!)
                                ? 'border-purple-600 bg-purple-50/40 dark:bg-purple-950/30'
                                : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={units.includes(o.unitId!)}
                              onChange={(e) =>
                                setUnits(
                                  e.target.checked
                                    ? [...units, o.unitId!]
                                    : units.filter((id) => id !== o.unitId)
                                )
                              }
                              className="accent-purple-600 w-4 h-4"
                            />
                            <div className="text-xs flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                                  {t.unit} #{o.unitId?.slice(-6)}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 font-semibold">
                                  {o.condition}
                                </span>
                                {o.batteryHealthPct !== null && (
                                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                    <Battery className="w-3 h-3" />
                                    {o.batteryHealthPct}%
                                  </span>
                                )}
                              </div>
                              {o.defects?.map((d, idx) => (
                                <p key={idx} className="text-[11px] text-amber-600 mt-1">
                                  {d[language]}
                                </p>
                              ))}
                            </div>
                          </label>
                        ))}
                    </div>
                  </fieldset>
                ))}
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                {t.close}
              </button>
              <button
                type="button"
                disabled={
                  busy ||
                  !selected?.items
                    .filter((i) => i.inventoryMode === 'serialized')
                    .every(
                      (i) =>
                        i.offers.filter((o) => o.unitId && units.includes(o.unitId)).length ===
                        i.quantity
                    )
                }
                onClick={() => {
                  if (selected) void handleAdd(selected, units);
                }}
                className="px-6 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md disabled:opacity-50"
              >
                {t.add}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}
