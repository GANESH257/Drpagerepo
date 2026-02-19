import type { PracticeLocation } from '@/types/practice';

type DiffField =
  | 'name'
  | 'address'
  | 'city'
  | 'state'
  | 'zip'
  | 'phone'
  | 'hours'
  | 'directionsUrl'
  | 'lat'
  | 'lng';

export type LocationDiffItem = {
  field: DiffField;
  label: string;
  before: string; // always display-ready
  after: string;  // always display-ready
  changed: boolean;
};

const NA = '—';

function toStr(v: unknown): string {
  if (v === null || v === undefined) return NA;
  if (typeof v === 'string') {
    const s = v.trim();
    return s.length ? s : NA;
  }
  if (typeof v === 'number') {
    if (Number.isNaN(v)) return NA;
    return String(v);
  }
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v);
}

function roundCoord(n: number | null | undefined, decimals = 6): string {
  if (n === null || n === undefined) return NA;
  if (Number.isNaN(n)) return NA;
  return Number(n.toFixed(decimals)).toString();
}

function normZip(zip?: string): string {
  if (!zip) return '';
  const digits = zip.replace(/\D/g, '');
  return digits.slice(0, 5);
}

function normState(state?: string): string {
  return (state ?? '').trim().toUpperCase();
}

function normString(s?: string): string {
  return (s ?? '').trim();
}

/**
 * Normalizes a location into a stable string key for address comparisons.
 * Useful for duplicate address detection and admin warnings.
 */
export function normalizeLocationAddressKey(loc: Partial<PracticeLocation>): string {
  const address = normString(loc.address);
  const city = normString(loc.city);
  const state = normState(loc.state);
  const zip = normZip(loc.zip);
  return `${address}, ${city}, ${state} ${zip}`.trim().toLowerCase();
}

/**
 * Field-by-field diff (display-friendly).
 * - Trims strings
 * - Normalizes state/zip for comparisons
 * - Rounds coords for comparisons & display
 */
export function diffLocations(
  before: Partial<PracticeLocation> | null | undefined,
  after: Partial<PracticeLocation> | null | undefined,
  opts?: { coordDecimals?: number }
): LocationDiffItem[] {
  const coordDecimals = opts?.coordDecimals ?? 6;

  const b = before ?? {};
  const a = after ?? {};

  const bState = normState(b.state);
  const aState = normState(a.state);

  const bZip = normZip(b.zip);
  const aZip = normZip(a.zip);

  const bLat = typeof b.lat === 'number' ? b.lat : null;
  const aLat = typeof a.lat === 'number' ? a.lat : null;

  const bLng = typeof b.lng === 'number' ? b.lng : null;
  const aLng = typeof a.lng === 'number' ? a.lng : null;

  const items: LocationDiffItem[] = [
    {
      field: 'name',
      label: 'Name',
      before: toStr(b.name),
      after: toStr(a.name),
      changed: normString(b.name) !== normString(a.name),
    },
    {
      field: 'address',
      label: 'Address',
      before: toStr(b.address),
      after: toStr(a.address),
      changed: normString(b.address) !== normString(a.address),
    },
    {
      field: 'city',
      label: 'City',
      before: toStr(b.city),
      after: toStr(a.city),
      changed: normString(b.city) !== normString(a.city),
    },
    {
      field: 'state',
      label: 'State',
      before: toStr(bState || NA),
      after: toStr(aState || NA),
      changed: bState !== aState,
    },
    {
      field: 'zip',
      label: 'ZIP',
      before: toStr(bZip || NA),
      after: toStr(aZip || NA),
      changed: bZip !== aZip,
    },
    {
      field: 'phone',
      label: 'Phone',
      before: toStr(b.phone),
      after: toStr(a.phone),
      changed: normString(b.phone) !== normString(a.phone),
    },
    {
      field: 'hours',
      label: 'Hours',
      before: toStr(b.hours),
      after: toStr(a.hours),
      changed: normString(b.hours) !== normString(a.hours),
    },
    {
      field: 'directionsUrl',
      label: 'Directions URL',
      before: toStr(b.directionsUrl),
      after: toStr(a.directionsUrl),
      changed: normString(b.directionsUrl) !== normString(a.directionsUrl),
    },
    {
      field: 'lat',
      label: 'Latitude',
      before: roundCoord(bLat, coordDecimals),
      after: roundCoord(aLat, coordDecimals),
      changed:
        roundCoord(bLat, coordDecimals) !== roundCoord(aLat, coordDecimals),
    },
    {
      field: 'lng',
      label: 'Longitude',
      before: roundCoord(bLng, coordDecimals),
      after: roundCoord(aLng, coordDecimals),
      changed:
        roundCoord(bLng, coordDecimals) !== roundCoord(aLng, coordDecimals),
    },
  ];

  return items;
}

/** Convenience: only the changed fields */
export function diffLocationsChangedOnly(
  before: Partial<PracticeLocation> | null | undefined,
  after: Partial<PracticeLocation> | null | undefined,
  opts?: { coordDecimals?: number }
): LocationDiffItem[] {
  return diffLocations(before, after, opts).filter((x) => x.changed);
}
