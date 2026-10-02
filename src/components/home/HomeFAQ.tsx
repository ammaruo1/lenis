import { useLanguage } from '@/i18n/LanguageContext';
import faqData from '@/data/faq.json';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function HomeFAQ() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const questions = faqData.slice(0, 6);

  return (
    <section id="faq" className="home-faq-section page-shell">
      <div className="section-head-wrap">
        <div>
          <div className="eyebrow-chip">
            <HelpCircle size={15} />
            <span>{ar ? 'إجابات مباشرة' : 'Frequently Asked Questions'}</span>
          </div>
          <h2>{ar ? 'أسئلة شائعة قبل الشراء والتجهيز' : 'Frequently Asked Questions Before You Buy'}</h2>
        </div>
        <p className="section-head-desc">
          {ar
            ? 'إجابات واضحة حول سياسة الفحص، الضمان، إمكانية الترقية، والتوصيل داخل صنعاء وخارجها.'
            : 'Clear answers regarding testing protocols, written warranty coverage, custom upgrades, and delivery in Sana’a.'}
        </p>
      </div>

      <div className="faq-accordion-list">
        {questions.map((q) => (
          <details key={q.id} className="modern-faq-item">
            <summary className="faq-summary-btn">
              <span>{q.question[language]}</span>
              <ChevronDown className="faq-chevron" size={18} />
            </summary>
            <div className="faq-answer-content">
              <p>{q.answer[language]}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
