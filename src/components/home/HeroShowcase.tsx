import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import productsData from '@/data/products.json';
import site from '@/data/site.json';
import type { Product } from '@/data/types';
import ProductImage from '@/components/shop/ProductImage';
import {
  ShieldCheck,
  Zap,
  Cpu,
  ArrowUpLeft,
  ArrowUpRight,
  Sparkles,
  Layers,
  CheckCircle2,
  BatteryCharging,
  HardDrive,
  MonitorCheck
} from 'lucide-react';

export default function HeroShowcase() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const Arrow = ar ? ArrowUpLeft : ArrowUpRight;
  const products = productsData as Product[];

  // Select 3 showcase spotlight products
  const spotlightIds = ['lap-thinkpad-t490s-001', 'disp-dell-u2722de-004', 'net-tplink-deco-x50-007'];
  const spotlightItems = spotlightIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => Boolean(p));

  const [activeTab, setActiveTab] = useState(0);
  const currentProduct = spotlightItems[activeTab] || products[0];

  const tabs = [
    {
      label: ar ? 'لابتوبات الأعمال المعتمدة' : 'Verified Business Laptops',
      icon: Cpu,
      tag: ar ? 'ThinkPad / Latitude' : 'ThinkPad / Latitude'
    },
    {
      label: ar ? 'شاشات ومحطات العمل' : 'Displays & Workstations',
      icon: MonitorCheck,
      tag: ar ? 'Dell UltraSharp 2K' : 'Dell UltraSharp 2K'
    },
    {
      label: ar ? 'حلول الشبكات واستمرارية الطاقة' : 'Network & Power Setups',
      icon: Zap,
      tag: ar ? 'Wi-Fi 6 Mesh / UPS' : 'Wi-Fi 6 Mesh / UPS'
    }
  ];

  return (
    <section id="hero" className="hero-corporate page-shell">
      <div className="hero-corporate-grid">
        {/* Left Column (Copy & Value Proposition) */}
        <div className="hero-corporate-content">
          <div className="corporate-badge">
            <span className="corporate-pulse" aria-hidden="true" />
            <span className="corporate-badge-text">
              {ar ? 'مؤسسة الجيل العربي الرقمي · صنعاء' : 'Digital Arab Generation · Sana’a'}
            </span>
          </div>

          <h1 className="corporate-title">
            {ar ? (
              <>
                منظومة تقنية متكاملة..
                <br />
                <span className="title-gradient">تُبنى لاحتياجك وتعمل بتناغم.</span>
              </>
            ) : (
              <>
                Integrated Tech Systems..
                <br />
                <span className="title-gradient">Engineered to work in sync.</span>
              </>
            )}
          </h1>

          <p className="corporate-description">
            {ar
              ? 'المقر الرائد في صنعاء لتوريد وتجهيز حواسيب الأعمال ومحطات العمل وبيئات المكاتب والشركات. أداء حقيقي معلن، فحص مخبري شامل من 7 محاور، وضمان مستمر يحمي استثمارك.'
              : 'Sana’a’s premier provider for enterprise laptops, workstations, and corporate office infrastructure. Transparent verified hardware, rigorous 7-point lab inspections, and enduring warranty.'}
          </p>

          <div className="corporate-actions">
            <Link to={`/${language}/shop`} className="desk-action order-action">
              <span>{ar ? 'استعراض الأجهزة والكتالوج' : 'Explore Hardware Catalog'}</span>
              <Arrow size={18} />
            </Link>
            <a href="#setups" className="desk-action desk-action-secondary">
              <Layers size={18} />
              <span>{ar ? 'بيئات العمل الموصى بها' : 'Curated Workspaces'}</span>
            </a>
            <a href="#contact" className="desk-text-link">
              <span>{ar ? 'طلب عرض سعر مباشر' : 'Request Instant Quote'}</span>
              <Arrow size={16} />
            </a>
          </div>

          {/* Institutional Trust Highlights */}
          <div className="corporate-highlights">
            <div className="highlight-pill">
              <ShieldCheck className="highlight-icon text-status" size={18} />
              <div>
                <strong>{ar ? 'فحص مخبري من 7 مراحل' : '7-Point Lab Tested'}</strong>
                <span>{ar ? 'تقرير شفاف لكل جهاز' : 'Full diagnostic report'}</span>
              </div>
            </div>
            <div className="highlight-pill">
              <Zap className="highlight-icon text-amber" size={18} />
              <div>
                <strong>{ar ? 'استمرارية الطاقة والشبكات' : 'Power Resilient'}</strong>
                <span>{ar ? 'حلول مدروسة لبيئة صنعاء' : 'Tailored for local power'}</span>
              </div>
            </div>
            <div className="highlight-pill">
              <Sparkles className="highlight-icon text-violet" size={18} />
              <div>
                <strong>{ar ? 'جاهزية الشركات والأفراد' : 'Enterprise & Pros'}</strong>
                <span>{ar ? 'تجهيز متكامل مع الضمان' : 'Complete setup + support'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Interactive Verified Hardware Showcase) */}
        <div className="hero-corporate-visual">
          <div className="showcase-card">
            {/* Showcase Header & Tab Selector */}
            <div className="showcase-header">
              <div className="showcase-title-row">
                <span className="showcase-status-badge">
                  <CheckCircle2 size={14} />
                  {ar ? 'فحص معتمد وجاهز للتسليم' : 'Lab-Verified Hardware'}
                </span>
                <span className="showcase-brand-tag" dir="ltr">
                  {currentProduct.brand} · {currentProduct.model}
                </span>
              </div>

              {/* Tab Navigation */}
              <div className="showcase-tabs" role="tablist">
                {tabs.map((tab, idx) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={idx}
                      role="tab"
                      aria-selected={activeTab === idx}
                      onClick={() => setActiveTab(idx)}
                      className={`showcase-tab-btn ${activeTab === idx ? 'is-active' : ''}`}
                    >
                      <Icon size={15} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Media Display */}
            <div className="showcase-media-wrap">
              <div className="showcase-image-frame">
                <ProductImage
                  src={currentProduct.images[0]}
                  id={currentProduct.id}
                  alt={currentProduct.title[language]}
                  eager={true}
                />
              </div>

              <div className="showcase-overlay-specs">
                <div className="spec-bubble">
                  <Cpu size={14} />
                  <bdi dir="ltr">{currentProduct.specs.cpu || currentProduct.specs.wifiStandard || currentProduct.specs.panel}</bdi>
                </div>
                {currentProduct.specs.ramGB && (
                  <div className="spec-bubble">
                    <Layers size={14} />
                    <bdi dir="ltr">{currentProduct.specs.ramGB} GB {currentProduct.specs.ramType}</bdi>
                  </div>
                )}
                {currentProduct.specs.storageGB && (
                  <div className="spec-bubble">
                    <HardDrive size={14} />
                    <bdi dir="ltr">{currentProduct.specs.storageGB} GB {currentProduct.specs.storageType}</bdi>
                  </div>
                )}
                {currentProduct.specs.batteryHealthPct != null && (
                  <div className="spec-bubble">
                    <BatteryCharging size={14} />
                    <span>{ar ? 'صحة البطارية:' : 'Battery:'} <bdi dir="ltr">{currentProduct.specs.batteryHealthPct}%</bdi></span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Meta & Direct Action Footer */}
            <div className="showcase-footer">
              <div className="showcase-details">
                <h3>{currentProduct.title[language]}</h3>
                <p>{currentProduct.summary[language]}</p>
              </div>

              <div className="showcase-action-bar">
                <div className="showcase-price-tag">
                  <span className="price-label">{ar ? 'السعر التقديري' : 'Reference Price'}</span>
                  <strong>{currentProduct.price.usd == null ? (ar ? 'استفسر عبر المتجر' : 'Inquire for Price') : `$${currentProduct.price.usd}`}</strong>
                </div>

                <Link
                  to={`/${language}/shop/${currentProduct.category}/${currentProduct.slug}`}
                  className="showcase-link-btn"
                >
                  <span>{ar ? 'تفاصيل الفحص والمواصفات' : 'Inspection & Specs'}</span>
                  <Arrow size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
