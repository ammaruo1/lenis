import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { X, AlertCircle, CheckCircle2, LoaderCircle, Languages, Sun, Moon } from 'lucide-react';
import { useI18n } from './i18n';
const ToastContext = createContext<(message: string, failed?: boolean) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; failed: boolean } | null>(null);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(null), 5000); return () => clearTimeout(timer); } }, [toast]);
  return <ToastContext.Provider value={(message, failed = false) => setToast({ message, failed })}>{children}<div className="toast-region" aria-live="polite" aria-atomic="true">{toast && <div className={`toast ${toast.failed ? 'error' : ''}`}>{toast.failed ? <AlertCircle size={20}/> : <CheckCircle2 size={20}/>}<span>{toast.message}</span><button className="icon-button" aria-label="×" onClick={() => setToast(null)}><X size={16}/></button></div>}</div></ToastContext.Provider>;
}
export const useToast = () => useContext(ToastContext);
export function PreferencesButtons() { const { t, theme, toggleTheme, toggleLanguage } = useI18n(); return <div className="preferences"><button className="language-button" onClick={toggleLanguage}><Languages size={16}/>{t('language')}</button><button className="icon-button" title={t('theme')} aria-label={t('theme')} onClick={toggleTheme}>{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button></div>; }
export function Loading() { const { t } = useI18n(); return <div className="loading" role="status"><LoaderCircle className="spin" size={24}/>{t('loading')}</div>; }
export function ErrorBox({ code }: { code?: string }) { const { t } = useI18n(); return code ? <div className="error-box" role="alert"><AlertCircle size={18}/>{t(code)}</div> : null; }
export function Modal({ open, onOpenChange, title, description, children }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children: ReactNode }) { const { t } = useI18n(); return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="overlay"/><Dialog.Content className="modal"><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{description ?? t('sessionWarning')}</Dialog.Description><Dialog.Close className="icon-button modal-close" aria-label={t('close')}><X size={20}/></Dialog.Close>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>; }
export function Confirm({ title, description, onConfirm, children, disabled }: { title: string; description: string; onConfirm: () => Promise<void>; children: ReactNode; disabled?: boolean }) {
  const { t } = useI18n(); const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false);
  return <AlertDialog.Root open={open} onOpenChange={setOpen}><AlertDialog.Trigger asChild><button className="button subtle" disabled={disabled}>{children}</button></AlertDialog.Trigger><AlertDialog.Portal><AlertDialog.Overlay className="overlay"/><AlertDialog.Content className="modal"><AlertDialog.Title>{title}</AlertDialog.Title><AlertDialog.Description>{description}</AlertDialog.Description><div className="dialog-actions"><AlertDialog.Cancel className="button secondary" disabled={busy}>{t('cancel')}</AlertDialog.Cancel><button className="button danger" disabled={busy} onClick={async () => { setBusy(true); try { await onConfirm(); setOpen(false); } finally { setBusy(false); } }}>{busy ? t('saving') : t('confirm')}</button></div></AlertDialog.Content></AlertDialog.Portal></AlertDialog.Root>;
}
export function FieldError({ message }: { message?: string }) { const { t } = useI18n(); return message ? <span className="field-error">{t(['password_short', 'password_long', 'password_common', 'totp_invalid'].includes(message) ? message : 'fieldInvalid')}</span> : null; }
