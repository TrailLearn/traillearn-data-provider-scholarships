import type { ScholarshipRow, Scholarship } from './types'

export function mapScholarshipToCamelCase(row: ScholarshipRow): Scholarship {
    return {
        id: row.id,
        name: row.name,
        sourceUrl: row.source_url,
        status: row.status,
        provider: row.provider ?? null,
        scholarshipType: row.scholarship_type ?? 'OTHER',
        level: row.level ?? 'ANY',
        domain: row.domain ?? [],
        country: row.country ?? 'France',
        tags: row.tags ?? [],
        description: row.description ?? null,
        deadlineAt: row.deadline_at,
        amountMin: row.amount_min,
        amountMax: row.amount_max,
        currency: row.currency ?? 'EUR',
        healthScore: row.health_score ?? 0,
        lastVerifiedAt: row.last_verified_at,
        data: row.data ?? {},
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

export function mapScholarshipListToCamelCase(rows: ScholarshipRow[]): Scholarship[] {
    return rows.map(mapScholarshipToCamelCase)
}
