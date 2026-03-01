import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth'
import { supabase } from '@/lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Check, X, Eye, Loader2, AlertCircle, Pencil, History, Activity } from 'lucide-react'

interface ScholarshipQueueItem {
    id: string
    name: string
    source_url: string
    status: string
    amount_min: number | null
    amount_max: number | null
    currency: string
    health_score: number
    created_at: string
}

function formatAmount(min: number | null, max: number | null, currency: string): string {
    const fmt = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v)
    if (min != null && max != null && min !== max) return `${fmt(min)} – ${fmt(max)}`
    if (min != null) return fmt(min)
    if (max != null) return fmt(max)
    return '—'
}

export function AdminDashboardPage() {
    const { user, isAdmin, isLoading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [rows, setRows] = useState<ScholarshipQueueItem[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        if (!authLoading && (!user || !isAdmin)) {
            navigate('/')
        }
    }, [user, isAdmin, authLoading, navigate])

    useEffect(() => {
        if (isAdmin) fetchQueue()
    }, [isAdmin])

    const fetchQueue = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('scholarships')
            .select('id, name, source_url, status, amount_min, amount_max, currency, health_score, created_at')
            .in('status', ['SUBMITTED', 'REVIEW_NEEDED'])
            .order('created_at', { ascending: false })

        if (data) setRows(data as ScholarshipQueueItem[])
        setLoading(false)
    }

    const handleApprove = async (id: string) => {
        setActionLoading(id)
        const { error } = await supabase
            .from('scholarships')
            .update({ status: 'VERIFIED', last_verified_at: new Date().toISOString() })
            .eq('id', id)
        if (!error) {
            setRows(prev => prev.filter(r => r.id !== id))
        }
        setActionLoading(null)
    }

    const handleReject = async (id: string) => {
        setActionLoading(id)
        await supabase
            .from('scholarships')
            .update({ status: 'ARCHIVED' })
            .eq('id', id)
        setRows(prev => prev.filter(r => r.id !== id))
        setActionLoading(null)
    }

    if (authLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-destructive/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">Accès réservé aux administrateurs.</p>
                </div>
            </div>
        )
    }

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            SUBMITTED: 'bg-warning/10 text-warning',
            REVIEW_NEEDED: 'bg-destructive/10 text-destructive',
        }
        return styles[status] ?? 'bg-muted text-muted-foreground'
    }

    const scoreColor = (score: number) => {
        if (score >= 80) return 'text-success'
        if (score >= 50) return 'text-warning'
        return 'text-destructive'
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">Dashboard Admin</h2>
            </div>
            <p className="text-muted-foreground">
                Bourses en attente de validation ({rows.length})
            </p>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : rows.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                    <Check className="h-12 w-12 text-success/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune bourse en attente de validation.</p>
                </div>
            ) : (
                <div className="rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nom</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Montant</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Score</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(row => (
                                    <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{row.name}</div>
                                            <a href={row.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                                Source
                                            </a>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs">{formatAmount(row.amount_min, row.amount_max, row.currency)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`flex items-center gap-1 text-xs font-medium ${scoreColor(row.health_score)}`}>
                                                <Activity className="h-3 w-3" />
                                                {row.health_score}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-medium uppercase tracking-wider rounded-full px-2 py-0.5 ${statusBadge(row.status)}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {new Date(row.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleApprove(row.id)}
                                                    disabled={actionLoading === row.id}
                                                    className="rounded-md p-1.5 text-success hover:bg-success/10 transition-colors disabled:opacity-50"
                                                    title="Approuver"
                                                >
                                                    {actionLoading === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleReject(row.id)}
                                                    disabled={actionLoading === row.id}
                                                    className="rounded-md p-1.5 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                                                    title="Rejeter"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                                <Link
                                                    to={`/admin/edit/${row.id}`}
                                                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors"
                                                    title="Éditer"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    to={`/admin/audit/${row.id}`}
                                                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors"
                                                    title="Historique"
                                                >
                                                    <History className="h-4 w-4" />
                                                </Link>
                                                <a
                                                    href={row.source_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors"
                                                    title="Voir la source"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
