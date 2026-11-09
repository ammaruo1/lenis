import type { Dispatch, SetStateAction } from 'react';

export const ARAB_COUNTRIES = [
  { id: 'DZ', ar: 'الجزائر', en: 'Algeria', dial: '213', flag: '🇩🇿' },
  { id: 'BH', ar: 'البحرين', en: 'Bahrain', dial: '973', flag: '🇧🇭' },
  { id: 'KM', ar: 'جزر القمر', en: 'Comoros', dial: '269', flag: '🇰🇲' },
  { id: 'DJ', ar: 'جيبوتي', en: 'Djibouti', dial: '253', flag: '🇩🇯' },
  { id: 'EG', ar: 'مصر', en: 'Egypt', dial: '20', flag: '🇪🇬' },
  { id: 'IQ', ar: 'العراق', en: 'Iraq', dial: '964', flag: '🇮🇶' },
  { id: 'JO', ar: 'الأردن', en: 'Jordan', dial: '962', flag: '🇯🇴' },
  { id: 'KW', ar: 'الكويت', en: 'Kuwait', dial: '965', flag: '🇰🇼' },
  { id: 'LB', ar: 'لبنان', en: 'Lebanon', dial: '961', flag: '🇱🇧' },
  { id: 'LY', ar: 'ليبيا', en: 'Libya', dial: '218', flag: '🇱🇾' },
  { id: 'MR', ar: 'موريتانيا', en: 'Mauritania', dial: '222', flag: '🇲🇷' },
  { id: 'MA', ar: 'المغرب', en: 'Morocco', dial: '212', flag: '🇲🇦' },
  { id: 'OM', ar: 'عُمان', en: 'Oman', dial: '968', flag: '🇴🇲' },
  { id: 'PS', ar: 'فلسطين', en: 'Palestine', dial: '970', flag: '🇵🇸' },
  { id: 'QA', ar: 'قطر', en: 'Qatar', dial: '974', flag: '🇶🇦' },
  { id: 'SA', ar: 'السعودية', en: 'Saudi Arabia', dial: '966', flag: '🇸🇦' },
  { id: 'SO', ar: 'الصومال', en: 'Somalia', dial: '252', flag: '🇸🇴' },
  { id: 'SD', ar: 'السودان', en: 'Sudan', dial: '249', flag: '🇸🇩' },
  { id: 'SY', ar: 'سوريا', en: 'Syria', dial: '963', flag: '🇸🇾' },
  { id: 'TN', ar: 'تونس', en: 'Tunisia', dial: '216', flag: '🇹🇳' },
  { id: 'AE', ar: 'الإمارات', en: 'United Arab Emirates', dial: '971', flag: '🇦🇪' },
  { id: 'YE', ar: 'اليمن', en: 'Yemen', dial: '967', flag: '🇾🇪' },
] as const;

export type ArabCountryId = (typeof ARAB_COUNTRIES)[number]['id'];

export function toE164Phone(countryId: string, localNumber: string): string {
  const country = ARAB_COUNTRIES.find(item => item.id === countryId) ?? ARAB_COUNTRIES[21];
  return `+${country.dial}${localNumber}`;
}

export function sanitizePhoneDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, '')
    .slice(0, 13);
}

type Props = {
  language: 'ar' | 'en';
  countryId: ArabCountryId;
  onCountryChange: Dispatch<SetStateAction<ArabCountryId>>;
  localNumber: string;
  onLocalNumberChange: Dispatch<SetStateAction<string>>;
};

export default function ArabPhoneField({ language, countryId, onCountryChange, localNumber, onLocalNumberChange }: Props) {
  const isAr = language === 'ar';

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)] gap-2" dir="ltr">
      <select
        required
        value={countryId}
        onChange={event => onCountryChange(event.target.value as ArabCountryId)}
        aria-label={isAr ? 'اختر الدولة العربية' : 'Choose an Arab country'}
        className="min-w-0 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 px-2.5 py-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600"
      >
        {ARAB_COUNTRIES.map(country => (
          <option key={country.id} value={country.id}>
            {country.flag} {isAr ? country.ar : country.en} (+{country.dial})
          </option>
        ))}
      </select>
      <input
        type="tel"
        required
        inputMode="tel"
        autoComplete="tel-national"
        pattern="[0-9]{6,13}"
        maxLength={13}
        title={isAr ? 'اكتب رقم الهاتف بدون مفتاح الدولة' : 'Enter your phone number without the country code'}
        value={localNumber}
        onChange={event => onLocalNumberChange(sanitizePhoneDigits(event.target.value))}
        placeholder={isAr ? 'رقم الهاتف' : 'Phone number'}
        aria-label={isAr ? 'رقم الهاتف بدون مفتاح الدولة' : 'Phone number without country code'}
        className="min-w-0 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 px-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 text-left font-mono"
      />
    </div>
  );
}
