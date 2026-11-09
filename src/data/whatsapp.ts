export type WhatsappCategory = { slug: string; whatsapp?: string | null };

function digits(value: string | null | undefined): string {
  if (!value) return '';
  const normalized = value
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x06f0));
  let result = normalized.replace(/\D/g, '');
  if (result.startsWith('00')) result = result.slice(2);
  if (result.length === 10 && result.startsWith('07')) result = result.slice(1);
  if (result.length === 9 && result.startsWith('7')) result = `967${result}`;
  return result;
}

export function whatsappPhoneForCategory(
  categories: readonly WhatsappCategory[],
  categorySlug: string | null | undefined,
  generalPhone: string | null | undefined,
): string {
  const categoryPhone = categorySlug
    ? categories.find(category => category.slug === categorySlug)?.whatsapp
    : null;
  return digits(categoryPhone) || digits(generalPhone) || '967771001044';
}

export function whatsappPhoneForItems(
  categories: readonly WhatsappCategory[],
  itemCategories: readonly (string | null | undefined)[],
  generalPhone: string | null | undefined,
): string {
  if (!itemCategories.length || itemCategories.some(slug => !slug)) {
    return digits(generalPhone) || '967771001044';
  }
  const unique = new Set(itemCategories as readonly string[]);
  if (unique.size !== 1) return digits(generalPhone) || '967771001044';
  return whatsappPhoneForCategory(categories, [...unique][0], generalPhone);
}
