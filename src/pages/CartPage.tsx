import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Store,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  User,
  Info
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  shopApi,
  commerceCopy,
  errorText,
  type Preview,
  type Customer,
  type Order
} from '@/data/commerce';
import '@/commerce.css';

export default function CartPage() {
  const { language, dir } = useLanguage();
  const t = commerceCopy[language];
  const navigate = useNavigate();

  const [cart, setCart] = useState<Preview | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'YER'>('USD');
  const [method, setMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const idempotencyKey = useRef(crypto.randomUUID());

  const loadCart = () => shopApi<Preview>('/cart').then(setCart);

  useEffect(() => {
    void loadCart().catch((e) => setError(errorText(e.message, language)));
    void shopApi<{ customer: Customer | null }>('/account')
      .then((r) => setCustomer(r.customer))
      .catch(() => {});
  }, [language]);

  const handleRemove = async (index: number) => {
    setBusy(true);
    setError('');
    try {
      await shopApi(`/cart/${index}`, 'DELETE');
      await loadCart();
      window.dispatchEvent(new Event('store-cart-changed'));
    } catch (e) {
      setError(errorText(e instanceof Error ? e.message : '', language));
    } finally {
      setBusy(false);
    }
  };

  const handleQuantity = async (index: number, newQty: number) => {
    if (!cart || !Number.isInteger(newQty) || newQty < 1) return;
    setBusy(true);
    setError('');
    try {
      await shopApi('/cart', 'POST', {
        items: cart.rawLines.map((line, i) =>
          i === index ? { ...line, quantity: newQty } : line
        )
      });
      await loadCart();
      window.dispatchEvent(new Event('store-cart-changed'));
    } catch (e) {
      setError(errorText(e instanceof Error ? e.message : '', language));
    } finally {
      setBusy(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) {
      navigate(`/${language}/account?return=cart`);
      return;
    }
    if (!cart?.previewToken) return;

    setBusy(true);
    setError('');
    try {
      const order = await shopApi<Order>('/orders', 'POST', {
        previewToken: cart.previewToken,
        idempotencyKey: idempotencyKey.current,
        currency,
        fulfillment: { method, address, notes }
      });
      window.dispatchEvent(new Event('store-cart-changed'));
      navigate(`/${language}/orders/${order.id}`);
    } catch (e) {
      const code = e instanceof Error ? e.message : '';
      setError(errorText(code, language));
      if (code === 'prices_changed' || code === 'insufficient_stock') {
        await loadCart();
      }
    } finally {
      setBusy(false);
    }
  };

  const isCartEmpty = !cart || cart.rawLines.length === 0;

  return (
    <main id="main-content" className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir={dir}>
      {/* Top Header and Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
            <Link to={`/${language}`} className="hover:text-purple-600 transition-colors">
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <span>/</span>
            <Link to={`/${language}/shop`} className="hover:text-purple-600 transition-colors">
              {t.shop}
            </Link>
            <span>/</span>
            <span className="text-neutral-900 dark:text-neutral-100 font-semibold">{t.cart}</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-50">
            {t.cart}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/${language}/shop`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
          >
            {language === 'ar' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{t.continue}</span>
          </Link>

          <Link
            to={`/${language}/account`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>{customer ? customer.name : t.account}</span>
          </Link>
        </div>
      </div>

      {/* Progress Steps Indicator */}
      <div className="mb-8 grid grid-cols-3 gap-2 max-w-xl">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-purple-600 text-purple-600 dark:text-purple-400">
          <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center">
            1
          </span>
          <span className="text-xs font-bold truncate">
            {language === 'ar' ? 'مراجعة السلة' : 'Review Cart'}
          </span>
        </div>
        <div className="flex items-center gap-2 pb-2 border-b-2 border-neutral-200 dark:border-neutral-800 text-neutral-400">
          <span className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[11px] font-bold flex items-center justify-center">
            2
          </span>
          <span className="text-xs font-semibold truncate">
            {language === 'ar' ? 'الاستلام والتوصيل' : 'Fulfillment'}
          </span>
        </div>
        <div className="flex items-center gap-2 pb-2 border-b-2 border-neutral-200 dark:border-neutral-800 text-neutral-400">
          <span className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[11px] font-bold flex items-center justify-center">
            3
          </span>
          <span className="text-xs font-semibold truncate">
            {language === 'ar' ? 'اعتماد الطلب' : 'Confirmation'}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div role="alert" className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => void loadCart()}
            className="text-xs underline font-bold"
          >
            {t.retry}
          </button>
        </div>
      )}

      {/* Loading state */}
      {!cart && (
        <div className="py-24 flex flex-col items-center justify-center gap-4 text-neutral-500">
          <div className="w-10 h-10 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-sm font-medium">{t.loading}</p>
        </div>
      )}

      {/* Empty Cart State */}
      {cart && isCartEmpty && (
        <div className="text-center py-20 px-4 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            {t.emptyCart}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-6">
            {language === 'ar'
              ? 'لم تقم بإضافة أي أجهزة أو باقات إلى سلتك بعد. تصفح أحدث الأجهزة المفحوصة والمتاحة في المعرض.'
              : 'You have not added any devices or bundles to your cart yet. Explore our verified tech catalog.'}
          </p>
          <Link
            to={`/${language}/shop`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/25"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.continue}</span>
          </Link>
        </div>
      )}

      {/* Active Cart View: 2 Columns */}
      {cart && !isCartEmpty && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {cart.errors?.map((code) => (
              <p key={code} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                {errorText(code, language)}
              </p>
            ))}

            {cart.rawLines.map((line, index) => {
              const matchedItems = cart.items.filter((i) =>
                line.packageId
                  ? i.packageId === line.packageId
                  : i.variantId === line.variantId && i.unitId === (line.unitId ?? null)
              );
              const firstItem = matchedItems[0];
              const isSerialized = Boolean(line.unitId || (line.unitIds && line.unitIds.length > 0));

              return (
                <article
                  key={index}
                  className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-20 h-20 rounded-xl bg-white dark:bg-neutral-800 p-2 flex-shrink-0 flex items-center justify-center border border-neutral-200/60 dark:border-neutral-700/60">
                      <img
                        src={firstItem?.images?.[0] || '/placeholder.webp'}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      {matchedItems.length > 0 ? (
                        matchedItems.map((item, i) => (
                          <div key={i} className="mb-1">
                            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                              {item.title[language]}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                              <span dir="ltr" className="font-mono bg-neutral-200/60 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                                {item.sku}
                              </span>
                              {item.unitId && (
                                <span className="text-purple-600 dark:text-purple-400 font-semibold">
                                  {t.unit} #{item.unitId.slice(-6)}
                                </span>
                              )}
                              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                {item.linePriceUsd ? `$${item.linePriceUsd}` : item.priceIncluded ? t.included : t.unknown}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <h2 dir="ltr" className="text-sm font-bold font-mono">
                          {line.variantId ?? line.packageId}
                        </h2>
                      )}

                      {isSerialized && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full mt-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {language === 'ar' ? 'قطعة وحيدة برقم تسلسلي معتمد' : 'Verified Serialized Unit'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity and Remove Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      {!isSerialized ? (
                        <div className="flex items-center rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
                          <button
                            type="button"
                            disabled={busy || line.quantity <= 1}
                            onClick={() => void handleQuantity(index, line.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-neutral-900 dark:text-neutral-100">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={busy || line.quantity >= 100}
                            onClick={() => void handleQuantity(index, line.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-neutral-500 bg-neutral-200/50 dark:bg-neutral-800 px-2.5 py-1 rounded-lg">
                          × 1
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleRemove(index)}
                      className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title={t.remove}
                      aria-label={t.remove}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              );
            })}

            {/* In-Store Reassurance */}
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-neutral-900/50 border border-purple-100 dark:border-neutral-800 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                <span className="font-bold text-neutral-900 dark:text-neutral-100 block mb-0.5">
                  {language === 'ar' ? 'فحص كامل وضمان الاستبدال' : 'Full Inspection & Replacement Warranty'}
                </span>
                {language === 'ar'
                  ? 'يمكنك تجربة وتشغيل جميع الأجهزة في معرضنا بصنعاء شارع صخر قبل الدفع. لا توجد أي مبالغ مخصومة مسبقًا.'
                  : 'You can test and inspect all hardware at our Sana\'a Sakhr St store before paying. No pre-charging required.'}
              </div>
            </div>
          </div>

          {/* Sticky Checkout & Summary Sidebar (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                {language === 'ar' ? 'ملخص الطلب والاستلام' : 'Order & Fulfillment Summary'}
              </h2>

              <form onSubmit={handleCheckout} className="space-y-5">
                {/* Currency Selector */}
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                    {t.currency}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrency('USD')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        currency === 'USD'
                          ? 'border-purple-600 bg-purple-600 text-white'
                          : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
                      }`}
                    >
                      USD ($)
                    </button>
                    <button
                      type="button"
                      disabled={!cart.usdToYer}
                      onClick={() => setCurrency('YER')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        currency === 'YER'
                          ? 'border-purple-600 bg-purple-600 text-white'
                          : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      YER (ريال يمني)
                    </button>
                  </div>
                </div>

                {/* Subtotal Calculation */}
                <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80">
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                    <span>{t.subtotal}</span>
                    {cart.hasUnpriced && <span className="text-amber-500">{t.unknown}</span>}
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      {language === 'ar' ? 'المجموع المستحق:' : 'Total Amount:'}
                    </span>
                    <strong className="text-2xl font-black text-purple-600 dark:text-purple-400" dir="ltr">
                      {currency === 'USD'
                        ? `$${cart.subtotalUsd ?? '—'}`
                        : `${cart.subtotalYer ?? '—'} YER`}
                    </strong>
                  </div>
                </div>

                {/* Fulfillment Method Toggle */}
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                    {language === 'ar' ? 'طريقة الاستلام:' : 'Fulfillment Method:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMethod('pickup')}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                        method === 'pickup'
                          ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 ring-1 ring-purple-600'
                          : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span className="text-xs font-bold">{t.pickup}</span>
                      <span className="text-[10px] opacity-75">{language === 'ar' ? 'صنعاء (مجاناً)' : 'Sana\'a (Free)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMethod('delivery')}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                        method === 'delivery'
                          ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 ring-1 ring-purple-600'
                          : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span className="text-xs font-bold">{t.delivery}</span>
                      <span className="text-[10px] opacity-75">{language === 'ar' ? 'صنعاء والمحافظات' : 'Courier delivery'}</span>
                    </button>
                  </div>
                </div>

                {/* Delivery Fields */}
                {method === 'delivery' && (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-white dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                    <div>
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                        {t.address} *
                      </label>
                      <textarea
                        required
                        minLength={10}
                        maxLength={1000}
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={language === 'ar' ? 'اسم الحي، الشارع، أقرب معلم في صنعاء...' : 'Street name, landmark, city...'}
                        className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-purple-600" />
                      {t.deliveryFee}
                    </p>
                  </div>
                )}

                {/* Additional Notes */}
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {t.notes} ({language === 'ar' ? 'اختياري' : 'optional'})
                  </label>
                  <textarea
                    maxLength={1000}
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={language === 'ar' ? 'أي ملاحظات بخصوص موعد الاستلام أو التجهيز...' : 'Any preferences or pickup timing notes...'}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                </div>

                {/* Customer Account Notice / Status */}
                {customer ? (
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">{customer.name}</span>
                    </div>
                    <span dir="ltr" className="text-neutral-500 font-mono text-[11px]">{customer.phone}</span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                    <p className="font-semibold mb-1">
                      {language === 'ar' ? 'يلزم تسجيل الدخول برقم الهاتف لربط الطلب' : 'Sign in is required to submit your order'}
                    </p>
                    <p className="text-[11px] opacity-90">
                      {language === 'ar'
                        ? 'خطوة سريعة برقم هاتفك لتمكينك من متابعة حالة الطلب واستلام فاتورتك.'
                        : 'A quick 1-step sign in with your phone to track order status.'}
                    </p>
                  </div>
                )}

                {/* Checkout Submit CTA */}
                <button
                  type="submit"
                  disabled={busy || !cart.previewToken || Boolean(cart.errors?.length)}
                  className="w-full h-12 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {busy ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : customer ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{t.checkout}</span>
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5" />
                      <span>{t.loginRequired}</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-neutral-400 dark:text-neutral-500">
                  {t.noReservation}
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
