import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth'
import { supabase } from '@/lib/supabase'
import { useNavigate, useParams } from 'react-router-dom'
import { History, ArrowLeft, Loader2, AlertCircle, PlusCircle, RefreshCw, Trash2 } from 'lucide-react'
import { getSmartDiff, humanizeValue } from '@/lib/diff-utils'

interface AuditLog {
    id: string
    record_id: string
    operation: string
    old_values: Record<string, unknown> | null
    new_values: Record<string, unknown> | null
    changed_by: string | null
    changed_at: string
}

interface ScholarshipInfo {
    id: string
    name: string
    status: string
}

export function AdminAuditPage() {
    const { id } = useParams<{ id: string }>()
    const { isAdmin, isLoading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [scholarship, setScholarship] = useState<ScholarshipInfo | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !isAdmin) navigate('/')
    }, [isAdmin, authLoading, navigate])

    useEffect(() => {
        if (isAdmin && id) {
            fetchData()
        }
    }, [isAdmin, id])

    const fetchData = async () => {
        const [logsRes, scholarshipRes] = await Promise.all([
            supabase
                .from('audit_logs')
                .select('*')
                .eq('record_id', id)
                .order('changed_at', { ascending: false }),
            supabase
                .from('scholarships')
                .select('id, name, status')
                .eq('id', id)
                .single(),
        ])

        if (logsRes.data) setLogs(logsRes.data as AuditLog[])
        if (scholarshipRes.data) setScholarship(scholarshipRes.data as ScholarshipInfo)
        setLoading(false)
    }

    const operationConfig: Record<string, { icon: typeof PlusCircle; label: string; color: string }> = {
        INSERT: { icon: PlusCircle, label: 'Création', color: 'text-success' },
        UPDATE: { icon: RefreshCw, label: 'Modification', color: 'text-primary' },
        DELETE: { icon: Trash2, label: 'Suppression', color: 'text-destructive' },
    }

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/admin')} className="rounded-md p-1.5 hover:bg-accent transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        Historique d'audit
                    </h2>
                    {scholarship && (
                        <p className="text-sm text-muted-foreground">{scholarship.name}</p>
                    )}
                </div>
            </div>

            {logs.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun événement d'audit pour cette bourse.</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

                    <div className="space-y-4">
                        {logs.map(log => {
                            const config = operationConfig[log.operation] ?? operationConfig.UPDATE
                            const Icon = config.icon
                            const diffs = log.operation === 'UPDATE' && log.old_values && log.new_values
                                ? getSmartDiff(log.old_values, log.new_values).filter(d => d.isChanged)
                                : []

                            return (
                                <div key={log.id} className="relative flex gap-4">
                                    <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 border-background bg-card shadow-sm ${config.color}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 rounded-xl border border-border bg-card p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(log.changed_at).toLocaleString('fr-FR', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            {log.changed_by && (
                                                <p>
                                                    Par : <span className="font-mono opacity-50">{log.changed_by.slice(0, 8)}…</span>
                                                </p>
                                            )}
                                            {diffs.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {diffs.map(d => (
                                                        <div key={d.key} className="flex gap-2">
                                                            <span className="font-mono text-muted-foreground">{d.key}:</span>
                                                            <span className="font-mono line-through text-destructive/70">{humanizeValue(d.oldValue, d.key)}</span>
                                                            <span className="text-muted-foreground">→</span>
                                                            <span className="font-mono text-success">{humanizeValue(d.newValue, d.key)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
