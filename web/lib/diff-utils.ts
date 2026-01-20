export interface DiffResult {
  key: string;
  oldValue: any;
  newValue: any;
  isChanged: boolean;
}

/**
 * Simple object comparison to find differences.
 * Only compares top-level keys for now (can be recursive later).
 */
export function getSmartDiff(oldObj: any, newObj: any): DiffResult[] {
  const allKeys = Array.from(new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]));
  
  return allKeys.map(key => ({
    key,
    oldValue: oldObj?.[key],
    newValue: newObj?.[key],
    isChanged: JSON.stringify(oldObj?.[key]) !== JSON.stringify(newObj?.[key])
  }));
}

/**
 * Humanize values for display (Dates, Currencies, etc.)
 */
export function humanizeValue(value: any, key?: string): string {
  if (value === null || value === undefined) return "—";
  
  // Date check (very basic)
  if (key?.includes('at') || key?.includes('date') || key?.includes('deadline')) {
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch { /* ignore */ }
  }

  // Currency check
  if (key?.includes('amount')) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  }

  if (typeof value === 'object') return JSON.stringify(value);
  
  return String(value);
}
