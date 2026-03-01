import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Scholarship, ScholarshipRow } from '@/features/bourses/types'
import { mapScholarshipToCamelCase } from '@/features/bourses/mappers'
import { calculateScoreBreakdown } from '@/lib/score-utils'
import {
    ArrowLeft, ExternalLink, Calendar, GraduationCap,
    Loader2, Euro, Activity, Tag, CheckCircle,
    Building2, Globe, BookOpen, AlertCircle,
} from 'lucide-react'

const LEVEL_LABELS: Record<string, string> = {
    SECONDARY: 'Lycée / Bac',
    BACHELOR: 'Licence (Bac+3)',
    MASTER: 'Master (Bac+5)',
    PHD: 'Doctorat',
    ANY: 'Tous niveaux',
}

const TYPE_LABELS: Record<string, string> = {
    MERIT: 'Mérite académique',
    NEED_BASED: 'Critères sociaux',
    MOBILITY: 'Mobilité internationale',
    RESEARCH: 'Recherche / Fellowship',
    DIVERSITY: 'Diversité',
    OTHER: 'Autre',
}

const ELIGIBILITY_LABELS: Record<string, string> = {
    level: 'Niveau requis',
    age_limit: 'Âge maximum',
    gender: 'Genre',
    nationality: 'Nationalité',
    conditions: 'Conditions',
    language: 'Langue',
    destination: 'Destination',
    region: 'Région',
    status: 'Statut',
    gpa: 'Niveau académique',
    domains: 'Disciplines',
}

function formatAmount(min: number | null, max: number | null, currency: string): string {
    const fmt = (v: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v)
    if (min === 0 && max === 0) return 'Financement complet (scolarité + vie)'
    if (min != null && max != null && min !== max) return `${fmt(min)} – ${fmt(max)}`
    if (min != null) return fmt(min)
    if (max != null) return fmt(max)
    return '—'
}

export function BourseDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [bourse, setBourse] = useState<Scholarship | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (id) fetchBourse()
    }, [id])

    const fetchBourse = async () => {
        const { data, error: err } = await supabase
            .from('scholarships')
            .select('*')
            .eq('id', id)
            .single()

        if (err) {
            if (err.code === 'PGRST116') setNotFound(true)
            else setError(err.message)
        } else if (data) {
            setBourse(mapScholarshipToCamelCase(data as ScholarshipRow))
        } else {
            setNotFound(true)
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto space-y-4">
                <Link to="/bourses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Retour au catalogue
                </Link>
                <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">Erreur lors du chargement</p>
                        <p className="text-xs mt-0.5 opacity-80">{error}</p>
                    </div>
                </div>
            </div>
        )
    }

    if (notFound || !bourse) {
        return (
            <div className="text-center py-20">
                <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h2 className="text-lg font-semibold mb-2">Bourse introuvable</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Cette bourse n'existe pas ou n'est pas encore publiée.
                </p>
                <Link to="/bourses" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <ArrowLeft className="h-4 w-4" />
                    Retour au catalogue
                </Link>
            </div>
        )
    }

    const formatDate = (d: string | null) =>
        d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null

    const breakdown = calculateScoreBreakdown(bourse)
    const eligibility = bourse.data?.eligibility
    const benefits = bourse.data?.benefits
    const duration = bourse.data?.duration
    const selectionProcess = bourse.data?.selection_process

    const scoreColor = (score: number) => {
        if (score >= 80) return 'text-success'
        if (score >= 50) return 'text-warning'
        return 'text-destructive'
    }

    const eligibilityEntries = eligibility
        ? Object.entries(eligibility).filter(([k, v]) => k !== 'meta' && v != null && v !== '')
        : []

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Back nav */}
            <Link
                to="/bourses"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Retour au catalogue
            </Link>

            {/* Header */}
            <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    {bourse.level && bourse.level !== 'ANY' && (
                        <span className="text-[10px] font-medium uppercase tracking-wider text-secondary-foreground bg-secondary rounded-full px-2 py-0.5">
                            {LEVEL_LABELS[bourse.level]}
                        </span>
                    )}
                    {bourse.scholarshipType && bourse.scholarshipType !== 'OTHER' && (
                        <span className="text-[10px] font-medium uppercase tracking-wider text-primary bg-primary/10 rounded-full px-2 py-0.5">
                            {TYPE_LABELS[bourse.scholarshipType]}
                        </span>
                    )}
                    <span className={`flex items-center gap-1 text-xs font-medium ${scoreColor(bourse.healthScore)}`}>
                        <Activity className="h-3.5 w-3.5" />
                        Score : {bourse.healthScore}/100
                    </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{bourse.name}</h1>
                {bourse.provider && (
                    <p className="text-muted-foreground mt-1 text-sm">{bourse.provider}</p>
                )}
            </div>

            {/* Description */}
            {bourse.description && (
                <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="text-sm font-semibold mb-3">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {bourse.description}
                    </p>
                </div>
            )}

            {/* Key Info Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
                {/* Dates & Montants */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                        <Calendar className="h-4 w-4 text-primary" />
                        Dates & Montants
                    </h3>
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Montant</dt>
                            <dd className="font-medium flex items-center gap-1">
                                <Euro className="h-3.5 w-3.5 text-muted-foreground" />
                                {formatAmount(bourse.amountMin, bourse.amountMax, bourse.currency)}
                            </dd>
                        </div>
                        {duration && (
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Durée</dt>
                                <dd className="font-medium">{duration}</dd>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Date limite</dt>
                            <dd className="font-medium">
                                {bourse.deadlineAt
                                    ? formatDate(bourse.deadlineAt)
                                    : <span className="text-xs italic text-muted-foreground">Candidature continue</span>}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Vérification</dt>
                            <dd className="font-medium">{formatDate(bourse.lastVerifiedAt)}</dd>
                        </div>
                    </dl>
                </div>

                {/* General Info */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                        <Building2 className="h-4 w-4 text-primary" />
                        Informations
                    </h3>
                    <dl className="space-y-2 text-sm">
                        {bourse.country && (
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground flex items-center gap-1">
                                    <Globe className="h-3 w-3" />Pays
                                </dt>
                                <dd className="font-medium">{bourse.country}</dd>
                            </div>
                        )}
                        {bourse.level && (
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground flex items-center gap-1">
                                    <GraduationCap className="h-3 w-3" />Niveau
                                </dt>
                                <dd className="font-medium">{LEVEL_LABELS[bourse.level]}</dd>
                            </div>
                        )}
                        {bourse.scholarshipType && (
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />Type
                                </dt>
                                <dd className="font-medium">{TYPE_LABELS[bourse.scholarshipType]}</dd>
                            </div>
                        )}
                        {selectionProcess && (
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Sélection</dt>
                                <dd className="font-medium">{selectionProcess}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>

            {/* Domain */}
            {bourse.domain && bourse.domain.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold mb-3">
                        <BookOpen className="h-4 w-4 text-primary" />
                        Domaines d'études
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {bourse.domain.map((d: string) => (
                            <span key={d} className="text-xs bg-muted rounded-full px-3 py-1">{d}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Eligibility */}
            {eligibilityEntries.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Éligibilité
                    </h3>
                    <dl className="space-y-2 text-sm">
                        {eligibilityEntries.map(([k, v]) => (
                            <div key={k} className="flex justify-between gap-4">
                                <dt className="text-muted-foreground shrink-0">
                                    {ELIGIBILITY_LABELS[k] ?? k}
                                </dt>
                                <dd className="font-medium text-right">
                                    {Array.isArray(v) ? v.join(', ') : String(v)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            )}

            {/* Benefits */}
            {benefits && benefits.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold mb-3">
                        <CheckCircle className="h-4 w-4 text-success" />
                        Avantages inclus
                    </h3>
                    <ul className="space-y-1.5">
                        {benefits.map((b: string, i: number) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                                {b}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Tags */}
            {bourse.tags && bourse.tags.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold mb-3">
                        <Tag className="h-4 w-4 text-primary" />
                        Mots-clés
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {bourse.tags.map((tag: string) => (
                            <span key={tag} className="text-xs bg-muted rounded-full px-3 py-1">{tag}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Health Score Breakdown */}
            <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold mb-3">
                    <Activity className="h-4 w-4 text-primary" />
                    Health Score — {bourse.healthScore}/100
                </h3>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Fraîcheur ({breakdown.days}j)</span>
                            <span className="font-medium">{breakdown.freshness}/40</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${(breakdown.freshness / 40) * 100}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Fiabilité source</span>
                            <span className="font-medium">{breakdown.reliability}/40</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${(breakdown.reliability / 40) * 100}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Stabilité URL</span>
                            <span className="font-medium">{breakdown.stability}/20</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${(breakdown.stability / 20) * 100}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="flex justify-center pt-4 pb-8">
                <a
                    href={bourse.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    Voir la source officielle
                    <ExternalLink className="h-4 w-4" />
                </a>
            </div>
        </div>
    )
}
