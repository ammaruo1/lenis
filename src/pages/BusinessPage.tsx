import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Server,
  Network,
  ShieldCheck,
  Zap,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  FileSpreadsheet,
  Headphones,
  Laptop,
  HardDrive,
  Users,
  Send,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCatalog } from '@/data/CatalogContext';

export default function BusinessPage() {
  const { language, dir } = useLanguage();
  const { site } = useCatalog();

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('+967');
  const [teamSize, setTeamSize] = useState('5-15');
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(['workstations']);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleNeed = (id: string) => {
    setSelectedNeeds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const whatsappPhone = site?.whatsapp || '967770000000';

  const needsList = [
    {
      id: 'workstations',
      title: language === 'ar' ? 'محطات عمل ولابتوبات هندسية' : 'Engineering Laptops & Workstations',
      desc: language === 'ar' ? 'أجهزة عالية الأداء للمهندسين والمصممين والمحاسبين' : 'High-performance rigs for engineering, CAD & finance'
    },
    {
      id: 'networking',
      title: language === 'ar' ? 'تجهيز شبكات وراوترات متقدمة' : 'Enterprise Networking & Routing',
      desc: language === 'ar' ? 'توزيع إنترنت مستقر، سويتشات، وكبائن شبكة للمكاتب' : 'Stable multi-WAN routing, managed switches & racks'
    },
    {
      id: 'storage',
      title: language === 'ar' ? 'سيرفرات وتخزين مشترك NAS' : 'Centralized NAS & File Servers',
      desc: language === 'ar' ? 'حفظ ملفات الشركة المشتركة ونسخ احتياطي تلقائي' : 'Team shared storage, auto-backups and access control'
    },
    {
      id: 'power',
      title: language === 'ar' ? 'أنظمة حماية وطاقة UPS' : 'Pure Sine Wave UPS & Power Protection',
      desc: language === 'ar' ? 'حماية خوادم وأجهزة الفريق من تذبذب وانقطاع التيار' : 'Zero-transfer UPS protection against voltage fluctuations'
    }
  ];

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const needsTitles = needsList
      .filter((n) => selectedNeeds.includes(n.id))
      .map((n) => n.title)
      .join('، ');

    const msg = [
      language === 'ar' ? 'طلب عرض سعر B2B لحلول الشركات من موقع الجيل العربي الرقمي:' : 'B2B Corporate Quote Request:',
      `${language === 'ar' ? 'اسم الشركة/الجهة' : 'Company'}: ${companyName}`,
      `${language === 'ar' ? 'الشخص المسؤول' : 'Contact Person'}: ${contactPerson}`,
      `${language === 'ar' ? 'الهاتف' : 'Phone'}: ${phone}`,
      `${language === 'ar' ? 'حجم الفريق' : 'Team Size'}: ${teamSize}`,
      `${language === 'ar' ? 'الاحتياجات المطلوبة' : 'Required Solutions'}: ${needsTitles}`,
      notes ? `${language === 'ar' ? 'ملاحظات إضافية' : 'Notes'}: ${notes}` : ''
    ]
      .filter(Boolean)
      .join('\n');

    setSubmitted(true);
    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <main id="main-content" className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir={dir}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-neutral-500">
        <Link to={`/${language}`} className="hover:text-purple-600 transition-colors">
          {language === 'ar' ? 'الرئيسية' : 'Home'}
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-semibold">
          {language === 'ar' ? 'حلول الشركات والأعمال' : 'Business Solutions'}
        </span>
      </nav>

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#120B24] via-[#1F1238] to-[#0D0818] text-white p-8 sm:p-12 mb-16 border border-purple-500/20 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold backdrop-blur-md">
            <Building2 className="w-4 h-4" />
            <span>{language === 'ar' ? 'قطاع الأعمال والشركات في صنعاء' : 'B2B & Enterprise Solutions in Sana\'a'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {language === 'ar' ? (
              <>
                تجهيز تقني متكامل لمكتبك، <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">بأعلى جاهزية وموثوقية</span>
              </>
            ) : (
              <>
                Complete Tech Ecosystem for Your Office, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">Engineered for Reliability</span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
            {language === 'ar'
              ? 'نوفر للشركات والمكاتب والمؤسسات في صنعاء والمحافظات حلولاً تقنية متكاملة: محطات عمل معتمدة، شبكات مستقرة، خوادم تخزين مركزي، وحماية طاقة متقدمة مع ضمان مكتوب وخدمة دعم ميداني.'
              : 'End-to-end hardware deployment for enterprises and startups: certified workstations, managed networks, centralized NAS, and pure sine wave power protection.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="#quote-form"
              className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{language === 'ar' ? 'طلب عرض سعر مخصص' : 'Request Custom Quote'}</span>
            </a>

            <a
              href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                language === 'ar'
                  ? 'السلام عليكم، أود استشارة مسؤول مبيعات الشركات B2B لتجهيز أجهزة مكتبنا.'
                  : 'Hello, I would like to consult your B2B sales team.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all backdrop-blur-md flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ar' ? 'استشارة مباشرة عبر واتساب' : 'WhatsApp Consultation'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars of Business Infrastructure */}
      <div className="mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-2">
            {language === 'ar' ? 'مجالات التجهيز المتخصصة' : 'Core Infrastructure Areas'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
            {language === 'ar' ? 'حلول مصممة لضمان استمرارية وإنتاجية فريقك' : 'Engineered for Uncompromised Business Uptime'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 space-y-4 hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <Laptop className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {language === 'ar' ? 'محطات العمل ولابتوبات الأعمال' : 'Business Workstations'}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {language === 'ar'
                ? 'فئات الأعمال الموثوقة (Dell Latitude/Precision، ThinkPad T/P، HP EliteBook/ZBook) بهياكل متينة، حماية بيانات، وإمكانية ترقية مستمرة.'
                : 'Enterprise-grade Dell, ThinkPad, and HP workstations designed for high reliability, security, and scalability.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 space-y-4 hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {language === 'ar' ? 'الشبكات وتوزيع الإنترنت' : 'Enterprise Networking'}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {language === 'ar'
                ? 'حلول دمج خطوط الإنترنت المتعددة (Multi-WAN)، سويتشات PoE، نقاط اتصال موحدة (Access Points) لتغطية كاملة للمكتب دون انقطاع.'
                : 'Multi-WAN load balancing, managed PoE switches, and unified access points for seamless office-wide WiFi.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 space-y-4 hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center">
              <HardDrive className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {language === 'ar' ? 'سيرفرات التخزين المشترك NAS' : 'Shared NAS & Storage'}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {language === 'ar'
                ? 'خوادم تخزين محلية للمستندات ومشاريع التصميم مع صلاحيات محددة لكل قسم، ونسخ احتياطي دوري آمن لحماية بيانات المؤسسة.'
                : 'Centralized on-premise storage servers with permission management and automated backup strategies.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 space-y-4 hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {language === 'ar' ? 'حلول الطاقة والـ UPS المستمرة' : 'UPS & Pure Power'}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {language === 'ar'
                ? 'أنظمة UPS بموجة جيبية نقية (Pure Sine Wave) لحماية الأجهزة الحساسة والسيرفرات من الصدمات الكهربائية الشائعة في اليمن.'
                : 'Pure Sine Wave UPS systems preventing hardware damage from Yemen\'s electrical fluctuations.'}
            </p>
          </div>
        </div>
      </div>

      {/* B2B Perks / Why Partner With Us */}
      <div className="p-8 sm:p-10 rounded-3xl bg-purple-50/50 dark:bg-neutral-900 border border-purple-100 dark:border-neutral-800 mb-20">
        <h3 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-6 text-center">
          {language === 'ar' ? 'مزايا اتفاقيات الشراكة والتوريد مع الجيل العربي الرقمي' : 'Why Companies Choose Us as Their Hardware Partner'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block mb-1">
                {language === 'ar' ? 'فحص شامل 7 نقاط قبل التسليم' : '7-Point Certification'}
              </strong>
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                {language === 'ar' ? 'كل جهاز مفحوص ومطابق للمواصفات وموثق بتقرير فحص رسمي.' : 'Every rig is certified with test benchmark logs.'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block mb-1">
                {language === 'ar' ? 'ضمان استبدال وصيانة سريعة' : 'Priority Replacement Warranty'}
              </strong>
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                {language === 'ar' ? 'أولوية قصوى لعملاء الشركات في الصيانة وتوفير أجهزة بديلة.' : 'Zero downtime commitment with on-site device swap.'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Headphones className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block mb-1">
                {language === 'ar' ? 'استشارات ترقية مجانية' : 'Complimentary Upgrade Consulting'}
              </strong>
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                {language === 'ar' ? 'تقييم بيئة العمل وتقديم حلول موفرة تمنع الإنفاق الزائد.' : 'Optimized budget allocation tailored to your app stack.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quote Builder Section */}
      <div id="quote-form" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'دراسة سريعة لاحتياجك' : 'Fast Quotation'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
            {language === 'ar' ? 'اطلب عرض سعر مخصص لمنشأتك' : 'Get a Tailored Enterprise Quote'}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {language === 'ar'
              ? 'حدد احتياجات فريقك وحجم المكتب، وسيقوم مستشار مبيعات الشركات بإعداد عرض سعر رسمي مفصل مع خيارات الأجهزة المناسبة لميزانيتك خلال وقت قياسي.'
              : 'Select your team requirements. Our enterprise sales engineer will prepare an official invoice and proposal tailored to your specifications.'}
          </p>

          <div className="p-5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <strong className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block">
              {language === 'ar' ? 'مركز خدمات الشركات الميداني:' : 'Corporate Service Center:'}
            </strong>
            <p className="text-xs text-neutral-500">
              {language === 'ar' ? 'صنعاء — شارع صخر، بالقرب من مركز تقنية المعلومات' : 'Sakhr Street, Sana\'a, Yemen'}
            </p>
            <p dir="ltr" className="text-xs font-mono font-bold text-purple-600 text-start">
              Tel: +967 1 200 000
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {language === 'ar' ? 'تم تجهيز طلب عرض السعر!' : 'Quote Request Prepared!'}
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  {language === 'ar'
                    ? 'تم فتح واتساب المتجر لتسليم بيانات الطلب مباشرة لمسؤول المبيعات. يمكنك أيضاً إرسال طلب جديد بأي وقت.'
                    : 'WhatsApp has been launched with your quote details to chat directly with our team.'}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
                >
                  {language === 'ar' ? 'طلب عرض سعر آخر' : 'Submit Another Request'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      {language === 'ar' ? 'اسم الشركة أو المنشأة *' : 'Company Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: شركة التطوير الهندسي' : 'e.g. Acme Tech'}
                      className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      {language === 'ar' ? 'الشخص المسؤول *' : 'Contact Person *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder={language === 'ar' ? 'الاسم والمنصب' : 'Name & Title'}
                      className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      {language === 'ar' ? 'رقم الهاتف / واتساب *' : 'Phone / WhatsApp *'}
                    </label>
                    <input
                      dir="ltr"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-start"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      {language === 'ar' ? 'حجم الفريق / الأجهزة المطلوبة' : 'Team / Hardware Count'}
                    </label>
                    <select
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                    >
                      <option value="1-5">{language === 'ar' ? '1 إلى 5 أجهزة (مكتب ناشئ)' : '1 - 5 Devices'}</option>
                      <option value="5-15">{language === 'ar' ? '5 إلى 15 جهاز (شركة متوسطة)' : '5 - 15 Devices'}</option>
                      <option value="15-50">{language === 'ar' ? '15 إلى 50 جهاز (مؤسسة)' : '15 - 50 Devices'}</option>
                      <option value="50+">{language === 'ar' ? 'أكثر من 50 جهاز (مشاريع كبرى)' : '50+ Enterprise'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-2">
                    {language === 'ar' ? 'الخدمات والتجهيزات المطلوبة:' : 'Required Solutions:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {needsList.map((need) => (
                      <label
                        key={need.id}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                          selectedNeeds.includes(need.id)
                            ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30'
                            : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedNeeds.includes(need.id)}
                          onChange={() => toggleNeed(need.id)}
                          className="accent-purple-600 w-4 h-4 mt-0.5"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                            {need.title}
                          </span>
                          <span className="text-[10px] text-neutral-500 block">
                            {need.desc}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {language === 'ar' ? 'ملاحظات أو مواصفات خاصة' : 'Additional Notes / Requirements'}
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: نحتاج أجهزة تدعم برامج AutoCAD مع شاشات 27 بوصة...' : 'e.g. AutoCAD capable laptops with 27-inch dual monitors...'}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إرسال طلب عرض السعر' : 'Submit Quote Request'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
