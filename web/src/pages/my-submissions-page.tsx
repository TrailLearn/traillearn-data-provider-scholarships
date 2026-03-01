import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth'
import { supabase } from '@/lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { FileText, Loader2, ExternalLink, Clock, Check, X as XIcon, AlertTriangle, Archive } from 'lucide-react'
import type { ScholarshipStatus } from '@/features/bourses/types'

interface UserSubmission {
    id: string
    name: string
    status: ScholarshipStatus
    source_url: string
    amount_min: number | null
    amount_max: number | null
    currency: string
    deadline_at: string | null
    created_at: string
}

function formatAmount(min: number | null, max: number | null, currency: string): string {
    const fmt = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v)
    if (min != null && max != null && min !== max) return `${fmt(min)} – ${fmt(max)}`
    if (min != null) return fmt(min)
    if (max != null) return fmt(max)
    return '—'
}

export function MySubmissionsPage() {
    const { user, isLoading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [rows, setRows] = useState<UserSubmission[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) navigate('/login')
    }, [user, authLoading, navigate])

    useEffect(() => {
        if (user) fetchSubmissions()
    }, [user])

    const fetchSubmissions = async () => {
        const { data } = await supabase
            .from('scholarships')
            .select('id, name, status, source_url, amount_min, amount_max, currency, deadline_at, created_at')
            .filter('data->meta->>submitted_by', 'eq', user!.id)
            .order('created_at', { ascending: false })

        if (data) setRows(data as UserSubmission[])
        setLoading(false)
    }

    const statusConfig: Record<string, { icon: typeof Clock; label: string; class: string }> = {
        DRAFT: { icon: Clock, label: 'Brouillon', class: 'bg-muted text-muted-foreground' },
        SUBMITTED: { icon: Clock, label: 'Soumis', class: 'bg-warning/10 text-warning' },
        VERIFIED: { icon: Check, label: 'Vérifié', class: 'bg-success/10 text-success' },
        DEPRECATED: { icon: AlertTriangle, label: 'Obsolète', class: 'bg-warning/10 text-warning' },
        ARCHIVED: { icon: Archive, label: 'Archivé', class: 'bg-destructive/10 text-destructive' },
        REVIEW_NEEDED: { icon: XIcon, label: 'À revoir', class: 'bg-destructive/10 text-destructive' },
    }

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Mes soumissions</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Suivez le statut de vos contributions.
                    </p>
                </div>
                <Link
                    to="/submit"
                    className="inline-flex items-center gap-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    + Soumettre
                </Link>
            </div>

            {rows.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Vous n'avez encore soumis aucune bourse.</p>
                    <Link
                        to="/submit"
                        className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        Soumettre une bourse
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {rows.map(row => {
                        const sc = statusConfig[row.status] ?? statusConfig.SUBMITTED
                        const StatusIcon = sc.icon
                        return (
                            <div key={row.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <h3 className="font-medium text-sm">{row.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-medium text-muted-foreground">
                                                {formatAmount(row.amount_min, row.amount_max, row.currency)}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(row.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider rounded-full px-2 py-0.5 ${sc.class}`}>
                                        <StatusIcon className="h-3 w-3" />
                                        {sc.label}
                                    </span>
                                    <a
                                        href={row.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
