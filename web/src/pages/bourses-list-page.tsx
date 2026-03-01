import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { mapScholarshipListToCamelCase } from '@/features/bourses/mappers'
import type { Scholarship, ScholarshipRow, ScholarshipLevel, ScholarshipKind } from '@/features/bourses/types'
import { Link } from 'react-router-dom'
import { Search, ExternalLink, Calendar, GraduationCap, Loader2, Activity, AlertCircle, Filter } from 'lucide-react'

const LEVEL_LABELS: Record<ScholarshipLevel, string> = {
    SECONDARY: 'Lycée / Bac',
    BACHELOR: 'Licence',
    MASTER: 'Master',
    PHD: 'Doctorat',
    ANY: 'Tous niveaux',
}

const TYPE_LABELS: Record<ScholarshipKind, string> = {
    MERIT: 'Mérite académique',
    NEED_BASED: 'Critères sociaux',
    MOBILITY: 'Mobilité',
    RESEARCH: 'Recherche',
    DIVERSITY: 'Diversité',
    OTHER: 'Autre',
}

function formatAmount(min: number | null, max: number | null, currency: string): string {
    const fmt = (v: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v)
    if (min === 0 && max === 0) return 'Financement complet'
    if (min != null && max != null && min !== max) return `${fmt(min)} – ${fmt(max)}`
    if (min != null) return fmt(min)
    if (max != null) return fmt(max)
    return '—'
}

export function BoursesListPage() {
    const [bourses, setBourses] = useState<Scholarship[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [filterLevel, setFilterLevel] = useState<ScholarshipLevel | ''>('')
    const [filterType, setFilterType] = useState<ScholarshipKind | ''>('')
    const [filterCountry, setFilterCountry] = useState('')
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

    const fetchBourses = useCallback(async () => {
        setLoading(true)
        setError(null)
        const { data, error: err } = await supabase
            .from('scholarships')
            .select('*')
            .eq('status', 'VERIFIED')
            .order('deadline_at', { ascending: true, nullsFirst: false })

        if (err) {
            setError(err.message)
        } else if (data) {
            setBourses(mapScholarshipListToCamelCase(data as ScholarshipRow[]))
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchBourses()
    }, [fetchBourses])

    const handleSearchChange = (value: string) => {
        setSearch(value)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => setDebouncedSearch(value), 400)
    }

    const countries = [...new Set(bourses.map(b => b.country).filter(Boolean))].sort()

    const filtered = bourses.filter(b => {
        if (filterLevel && b.level !== filterLevel) return false
        if (filterType && b.scholarshipType !== filterType) return false
        if (filterCountry && b.country !== filterCountry) return false
        if (debouncedSearch.trim()) {
            const q = debouncedSearch.toLowerCase()
            const searchable = [b.name, b.provider, b.description]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
            if (!searchable.includes(q)) return false
        }
        return true
    })

    const scoreColor = (score: number) => {
        if (score >= 80) return 'text-success'
        if (score >= 50) return 'text-warning'
        return 'text-destructive'
    }

    const hasFilters = filterLevel || filterType || filterCountry

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Catalogue des bourses</h2>
                <p className="text-muted-foreground mt-1">
                    Parcourez les bourses vérifiées et à jour.
                </p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, organisme, description…"
                        value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                    <select
                        value={filterLevel}
                        onChange={e => setFilterLevel(e.target.value as ScholarshipLevel | '')}
                        className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                    >
                        <option value="">Tous les niveaux</option>
                        {(Object.keys(LEVEL_LABELS) as ScholarshipLevel[]).map(k => (
                            <option key={k} value={k}>{LEVEL_LABELS[k]}</option>
                        ))}
                    </select>
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value as ScholarshipKind | '')}
                        className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                    >
                        <option value="">Tous les types</option>
                        {(Object.keys(TYPE_LABELS) as ScholarshipKind[]).map(k => (
                            <option key={k} value={k}>{TYPE_LABELS[k]}</option>
                        ))}
                    </select>
                    <select
                        value={filterCountry}
                        onChange={e => setFilterCountry(e.target.value)}
                        className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                    >
                        <option value="">Tous les pays</option>
                        {countries.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    {hasFilters && (
                        <button
                            onClick={() => { setFilterLevel(''); setFilterType(''); setFilterCountry('') }}
                            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">Impossible de charger les bourses</p>
                        <p className="text-xs mt-0.5 opacity-80">{error}</p>
                    </div>
                </div>
            )}

            {/* Results */}
            {!error && (
                <>
                    {!loading && (
                        <p className="text-xs text-muted-foreground">
                            {filtered.length} bourse{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
                        </p>
                    )}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {(search || hasFilters)
                                    ? 'Aucune bourse ne correspond à vos filtres.'
                                    : 'Aucune bourse publiée pour le moment.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filtered.map(b => (
                                <Link
                                    key={b.id}
                                    to={`/bourses/${b.id}`}
                                    className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow group block"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex flex-wrap gap-1">
                                            {b.level && b.level !== 'ANY' && (
                                                <span className="text-[10px] font-medium uppercase tracking-wider text-secondary-foreground bg-secondary rounded-full px-2 py-0.5">
                                                    {LEVEL_LABELS[b.level]}
                                                </span>
                                            )}
                                            {b.scholarshipType && b.scholarshipType !== 'OTHER' && (
                                                <span className="text-[10px] font-medium uppercase tracking-wider text-primary bg-primary/10 rounded-full px-2 py-0.5">
                                                    {TYPE_LABELS[b.scholarshipType]}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`flex items-center gap-1 text-xs font-medium shrink-0 ml-2 ${scoreColor(b.healthScore)}`}>
                                            <Activity className="h-3 w-3" />
                                            {b.healthScore}
                                        </span>
                                    </div>

                                    <h3 className="font-semibold text-sm leading-snug mb-1 group-hover:text-primary transition-colors">
                                        {b.name}
                                    </h3>
                                    {b.provider && (
                                        <p className="text-xs text-muted-foreground mb-1 truncate">{b.provider}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground font-medium mb-3">
                                        {formatAmount(b.amountMin, b.amountMax, b.currency)}
                                    </p>

                                    {b.deadlineAt && (
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>Limite : {new Date(b.deadlineAt).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                    )}
                                    {b.country && (
                                        <p className="text-xs text-muted-foreground mb-3">📍 {b.country}</p>
                                    )}

                                    <span className="inline-flex items-center gap-1 text-xs text-primary">
                                        Voir le détail
                                        <ExternalLink className="h-3 w-3" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
