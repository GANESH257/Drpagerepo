import { CertificationItem } from '@/types';

/**
 * Normalize legacy string or CertificationItem to CertificationItem
 */
export function toCertificationItem(item: string | CertificationItem): CertificationItem {
  if (typeof item === 'string') {
    return { name: item };
  }
  return { name: item.name, imageUrl: item.imageUrl, year: item.year };
}

/**
 * Normalize array of string | CertificationItem to CertificationItem[]
 */
export function toCertificationItems(items: (string | CertificationItem)[] | undefined): CertificationItem[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map(toCertificationItem);
}
