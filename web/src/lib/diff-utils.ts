export interface DiffResult {
    key: string
    oldValue: unknown
    newValue: unknown
    isChanged: boolean
}

export function getSmartDiff(oldObj: Record<string, unknown>, newObj: Record<string, unknown>): DiffResult[] {
    const allKeys = Array.from(new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]))

    return allKeys.map(key => ({
        key,
        oldValue: oldObj?.[key],
        newValue: newObj?.[key],
        isChanged: JSON.stringify(oldObj?.[key]) !== JSON.stringify(newObj?.[key]),
    }))
}

export function humanizeValue(value: unknown, key?: string): string {
    if (value === null || value === undefined) return '—'

    // Date check
    if (key?.includes('at') || key?.includes('date') || key?.includes('deadline')) {
        try {
            const d = new Date(value as string)
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
            }
        } catch { /* ignore */ }
    }

    // Currency check
    if (key?.includes('amount')) {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value as number)
    }

    if (typeof value === 'object') return JSON.stringify(value)

    return String(value)
}
