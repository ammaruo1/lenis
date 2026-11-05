import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ListChecks, RotateCcw, Trash2, AlertTriangle, RefreshCw, History } from 'lucide-react';
import { api } from './api';
import { useI18n } from './i18n';
import { Loading } from './components';

interface PricingRuleRow {
  id: string;
  action: string;
  summary: string;
  itemCount: number;
  revertedAt: string | null;
  createdAt: string;
  user: { name: string; role: string };
}

interface RulesResponse {
  total: number;
  page: number;
  pageSize: number;
  items: PricingRuleRow[];
}

const actionLabels: Record<string, { ar: string; en: string }> = {
  adjust_price: { ar: 'تعديل سعر البيع', en: 'Sale price adjustment' },
  adjust_percent: { ar: 'تعديل بنسبة (قديم)', en: 'Percent adjust (legacy)' },
  apply_discount: { ar: 'تطبيق خصم', en: 'Apply discount' },
  set_fixed: { ar: 'سعر ثابت', en: 'Fixed price' },
  clear_discounts: { ar: 'مسح الخصومات', en: 'Clear discounts' },
};

export function AppliedPricingRules({
  onRestoreLegacy,
  legacyBusy,
}: {
  onRestoreLegacy: () => void;
  legacyBusy: boolean;
}) {
  const { lang } = useI18n();
  const ar = lang === 'ar';
  const say = (a: string, e: string) => (ar ? a : e);
  const client = useQueryClient();
  const [includeReverted, setIncludeReverted] = useState(false);

  const rulesQuery = useQuery<RulesResponse>({
    queryKey: ['pricing-rules', { includeReverted }],
    queryFn: () => {
      const params = new URLSearchParams({
        page: '1',
        pageSize: '30',
        includeReverted: String(includeReverted),
      });
      return api<RulesResponse>(`/commerce/pricing/rules?${params.toString()}`);
    },
    staleTime: 15_000,
  });

  const revertMutation = useMutation({
    mutationFn: (id: string) => api<{ ok: boolean; restoredCount: number }>(`/commerce/pricing/rules/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['pricing-rules'] });
      await client.invalidateQueries({ queryKey: ['pricing'] });
      await client.invalidateQueries({ queryKey: ['pricing-history'] });
      await client.invalidateQueries({ queryKey: ['commerce-reference'] });
    },
  });

  const handleRevert = async (rule: PricingRuleRow) => {
    const msg = say(
      `تراجع عن القاعدة "${rule.summary}"؟\nسيتم استعادة ${rule.itemCount} عنصر كما كان قبل تطبيق هذه القاعدة.\nإذا وُجدت قواعد أحدث على نفس المنتجات، احذف الأحدث أولاً.`,
      `Revert rule "${rule.summary}"?\nThis restores ${rule.itemCount} items to their state before this rule.\nIf newer rules touched the same items, revert those first.`
    );
    if (!window.confirm(msg)) return;
    try {
      await revertMutation.mutateAsync(rule.id);
    } catch (e: unknown) {
      const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: string }).code) : '';
      if (code === 'revert_newer_first') {
        alert(say('يوجد قاعدة أحدث على نفس المنتجات — احذف/تراجع عن القواعد الأحدث أولاً (من الأعلى للأسفل).', 'A newer rule affects the same items — revert newer rules first (top to bottom).'));
      } else {
        alert(say('تعذر التراجع عن القاعدة', 'Could not revert rule'));
      }
    }
  };

  if (rulesQuery.isPending) return <Loading />;

  const items = rulesQuery.data?.items ?? [];

  return (
    <section className="pricing-panel" style={{ marginTop: '1rem' }}>
      <div className="pricing-panel__head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ListChecks size={20} />
          </div>
          <div>
            <h2 className="pricing-panel__title" style={{ margin: 0 }}>
              {say('قواعد التسعير والخصومات المطبّقة', 'Applied pricing & discount rules')}
            </h2>
            <span className="pricing-panel__sub">
              {say(
                'تعديل السعر، تطبيق خصم، ومسح الخصومات — الحذف يعيد كل عنصر كما كان قبل تلك القاعدة',
                'Price adjust, apply discount, and clear discounts — delete reverts each item to before that rule'
              )}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="button secondary"
            style={{ fontSize: '12px' }}
            onClick={() => rulesQuery.refetch()}
            disabled={rulesQuery.isFetching}
          >
            <RefreshCw size={14} className={rulesQuery.isFetching ? 'animate-spin' : ''} />
            <span>{say('تحديث', 'Refresh')}</span>
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
            <input type="checkbox" checked={includeReverted} onChange={e => setIncludeReverted(e.target.checked)} />
            {say('إظهار الملغاة', 'Show reverted')}
          </label>
        </div>
      </div>

      <div className="pricing-callout pricing-callout--warn" style={{ margin: '0 0 12px' }}>
        <strong>{say('الأسعار مختلطة قبل هذا التحديث؟', 'Prices wrong before this update?')}</strong>
        <p style={{ margin: '6px 0 8px', fontSize: '13px' }}>
          {say(
            'القواعد القديمة لم تُحفظ في جدول — استخدم استعادة من سجل التعديلات الجماعية (عكس كل +% / −% المسجّلة في السجل).',
            'Older bulk runs were not stored as rules — use restore from bulk history (reverses logged ±% adjustments).'
          )}
        </p>
        <button
          type="button"
          className="button"
          style={{ background: '#b45309', fontSize: '12px' }}
          disabled={legacyBusy}
          onClick={onRestoreLegacy}
        >
          {legacyBusy ? <RefreshCw size={14} className="animate-spin" /> : <History size={14} />}
          <span>{say('استعادة الأسعار قبل التعديلات الجماعية', 'Restore pre-bulk prices')}</span>
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
        {items.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
            <AlertTriangle size={28} style={{ opacity: 0.5, marginBottom: 8 }} />
            <p>{say('لا توجد قواعد مسجّلة بعد — القواعد الجديدة ستظهر هنا تلقائياً.', 'No rules yet — new bulk applies will appear here.')}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: ar ? 'right' : 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-soft)', borderBottom: '1px solid var(--border)', fontSize: '11px', color: 'var(--muted)' }}>
                <th style={{ padding: '10px 12px' }}>{say('التاريخ', 'Date')}</th>
                <th style={{ padding: '10px 12px' }}>{say('النوع', 'Type')}</th>
                <th style={{ padding: '10px 12px' }}>{say('التفاصيل', 'Details')}</th>
                <th style={{ padding: '10px 12px' }}>{say('العناصر', 'Items')}</th>
                <th style={{ padding: '10px 12px' }}>{say('بواسطة', 'By')}</th>
                <th style={{ padding: '10px 12px' }}>{say('إجراء', 'Action')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map(rule => {
                const typeLabel = actionLabels[rule.action]?.[lang] ?? rule.action;
                const reverted = Boolean(rule.revertedAt);
                return (
                  <tr key={rule.id} style={{ borderBottom: '1px solid var(--border)', opacity: reverted ? 0.55 : 1 }}>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      {new Date(rule.createdAt).toLocaleString(lang === 'ar' ? 'ar-YE' : 'en-US')}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'var(--surface-soft)' }}>
                        {typeLabel}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '12px' }}>{rule.summary}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{rule.itemCount}</td>
                    <td style={{ padding: '10px 12px' }}>{rule.user.name}</td>
                    <td style={{ padding: '10px 12px' }}>
                      {reverted ? (
                        <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <RotateCcw size={12} />
                          {say('تم التراجع', 'Reverted')}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="button secondary"
                          style={{ padding: '5px 10px', fontSize: '11px', color: '#dc2626' }}
                          disabled={revertMutation.isPending}
                          onClick={() => handleRevert(rule)}
                        >
                          <Trash2 size={13} />
                          <span>{say('تراجع / حذف', 'Revert')}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default AppliedPricingRules;
