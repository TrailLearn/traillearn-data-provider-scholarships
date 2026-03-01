export type ScholarshipStatus = 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'DEPRECATED' | 'ARCHIVED' | 'REVIEW_NEEDED'
export type ScholarshipLevel = 'SECONDARY' | 'BACHELOR' | 'MASTER' | 'PHD' | 'ANY'
export type ScholarshipKind = 'MERIT' | 'NEED_BASED' | 'MOBILITY' | 'RESEARCH' | 'DIVERSITY' | 'OTHER'

export interface ScholarshipEligibility {
    level?: string
    age_limit?: number
    gender?: string
    nationality?: string
    conditions?: string
    language?: string
    destination?: string
    region?: string
    status?: string
    gpa?: string
    domains?: string[]
    [key: string]: unknown
}

export interface ScholarshipMeta {
    submitted_by?: string
    submitted_at?: string
    admin_override?: boolean
    [key: string]: unknown
}

export interface ScholarshipData {
    eligibility?: ScholarshipEligibility
    meta?: ScholarshipMeta
    benefits?: string[]
    duration?: string
    selection_process?: string
    echelons?: number[]
    [key: string]: unknown
}

/** Database row shape (snake_case) */
export interface ScholarshipRow {
    id: string
    name: string
    source_url: string
    status: ScholarshipStatus
    provider: string | null
    scholarship_type: ScholarshipKind
    level: ScholarshipLevel
    domain: string[]
    country: string
    tags: string[]
    description: string | null
    deadline_at: string | null
    amount_min: number | null
    amount_max: number | null
    currency: string
    health_score: number
    last_verified_at: string
    data: ScholarshipData
    created_at: string
    updated_at: string
}

/** Application shape (camelCase) */
export interface Scholarship {
    id: string
    name: string
    sourceUrl: string
    status: ScholarshipStatus
    provider: string | null
    scholarshipType: ScholarshipKind
    level: ScholarshipLevel
    domain: string[]
    country: string
    tags: string[]
    description: string | null
    deadlineAt: string | null
    amountMin: number | null
    amountMax: number | null
    currency: string
    healthScore: number
    lastVerifiedAt: string
    data: ScholarshipData
    createdAt: string
    updatedAt: string
}
