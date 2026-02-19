type DiffField =
  | 'name'
  | 'description'
  | 'phone'
  | 'website'
  | 'insurances'
  | 'services';

export type PracticeDiffItem = {
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

function normString(s?: string): string {
  return (s ?? '').trim();
}

/**
 * Normalize array for comparison: sort and convert to comma-separated string
 */
function normalizeArray(arr: string[] | undefined | null): string {
  if (!arr || arr.length === 0) return NA;
  return arr
    .filter(Boolean)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .sort()
    .join(', ');
}

/**
 * Compare two arrays for equality (order-independent)
 */
function arraysEqual(arr1: string[] | undefined | null, arr2: string[] | undefined | null): boolean {
  const a1 = normalizeArray(arr1);
  const a2 = normalizeArray(arr2);
  return a1 === a2;
}

type PracticeSnapshot = {
  name: string;
  description?: string;
  phone?: string;
  website?: string;
  insurances?: string[];
  services?: string[];
};

/**
 * Field-by-field diff (display-friendly).
 * - Trims strings
 * - Normalizes arrays (sort, comma-separated) for comparison
 * - Returns ALL fields with changed: true/false flag
 */
export function diffPractice(
  before: PracticeSnapshot | null | undefined,
  after: PracticeSnapshot | null | undefined
): PracticeDiffItem[] {
  const b: PracticeSnapshot = before ?? { name: '' };
  const a: PracticeSnapshot = after ?? { name: '' };

  const items: PracticeDiffItem[] = [
    {
      field: 'name',
      label: 'Name',
      before: toStr(b.name),
      after: toStr(a.name),
      changed: normString(b.name) !== normString(a.name),
    },
    {
      field: 'description',
      label: 'Description',
      before: toStr(b.description),
      after: toStr(a.description),
      changed: normString(b.description) !== normString(a.description),
    },
    {
      field: 'phone',
      label: 'Phone',
      before: toStr(b.phone),
      after: toStr(a.phone),
      changed: normString(b.phone) !== normString(a.phone),
    },
    {
      field: 'website',
      label: 'Website',
      before: toStr(b.website),
      after: toStr(a.website),
      changed: normString(b.website) !== normString(a.website),
    },
    {
      field: 'insurances',
      label: 'Insurances',
      before: normalizeArray(b.insurances),
      after: normalizeArray(a.insurances),
      changed: !arraysEqual(b.insurances, a.insurances),
    },
    {
      field: 'services',
      label: 'Services',
      before: normalizeArray(b.services),
      after: normalizeArray(a.services),
      changed: !arraysEqual(b.services, a.services),
    },
  ];

  return items;
}

/** Convenience: only the changed fields */
export function diffPracticeChangedOnly(
  before: PracticeSnapshot | null | undefined,
  after: PracticeSnapshot | null | undefined
): PracticeDiffItem[] {
  return diffPractice(before, after).filter((x) => x.changed);
}
