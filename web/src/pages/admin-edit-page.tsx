import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '@/features/auth'
import { supabase } from '@/lib/supabase'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, Loader2, AlertCircle, Check } from 'lucide-react'
import type { ScholarshipRow, ScholarshipStatus } from '@/features/bourses/types'

const STATUS_OPTIONS: { value: ScholarshipStatus; label: string }[] = [
    { value: 'DRAFT', label: 'Brouillon' },
    { value: 'SUBMITTED', label: 'Soumis' },
    { value: 'VERIFIED', label: 'Vérifié' },
    { value: 'DEPRECATED', label: 'Obsolète' },
    { value: 'ARCHIVED', label: 'Archivé' },
    { value: 'REVIEW_NEEDED', label: 'À revoir' },
]

const CURRENCY_OPTIONS = [
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CHF', label: 'CHF' },
    { value: 'CAD', label: 'CAD ($)' },
]

export function AdminEditPage() {
    const { id } = useParams<{ id: string }>()
    const { isAdmin, isLoading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [record, setRecord] = useState<ScholarshipRow | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if (!authLoading && !isAdmin) navigate('/')
    }, [isAdmin, authLoading, navigate])

    useEffect(() => {
        if (isAdmin && id) fetchRecord()
    }, [isAdmin, id])

    const fetchRecord = async () => {
        const { data, error } = await supabase
            .from('scholarships')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) {
            setError('Bourse introuvable.')
        } else {
            setRecord(data as ScholarshipRow)
        }
        setLoading(false)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!record) return
        setSaving(true)
        setError(null)
        setSaved(false)

        const { error } = await supabase
            .from('scholarships')
            .update({
                name: record.name,
                source_url: record.source_url,
                status: record.status,
                amount_min: record.amount_min,
                amount_max: record.amount_max,
                currency: record.currency,
                deadline_at: record.deadline_at || null,
                data: record.data,
            })
            .eq('id', id)

        if (error) {
            setError(error.message)
        } else {
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        }
        setSaving(false)
    }

    const updateField = <K extends keyof ScholarshipRow>(key: K, value: ScholarshipRow[K]) => {
        setRecord(prev => prev ? { ...prev, [key]: value } : null)
    }

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!record) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="h-12 w-12 text-destructive/30 mx-auto mb-4" />
                <p className="text-muted-foreground">{error || 'Bourse introuvable.'}</p>
            </div>
        )
    }

    const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow'
    const labelClass = 'block text-sm font-medium mb-1.5'

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/admin')} className="rounded-md p-1.5 hover:bg-accent transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Éditer la bourse</h2>
                    <p className="text-xs text-muted-foreground">ID: {record.id}</p>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            {saved && (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
                    <Check className="h-4 w-4 shrink-0" />
                    Modifications enregistrées.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Informations générales</h3>

                    <div>
                        <label className={labelClass}>Nom *</label>
                        <input type="text" required value={record.name} onChange={e => updateField('name', e.target.value)} className={inputClass} />
                    </div>

                    <div>
                        <label className={labelClass}>URL source *</label>
                        <input type="url" required value={record.source_url} onChange={e => updateField('source_url', e.target.value)} className={inputClass} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Statut</label>
                            <select value={record.status} onChange={e => updateField('status', e.target.value as ScholarshipStatus)} className={inputClass}>
                                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Devise</label>
                            <select value={record.currency} onChange={e => updateField('currency', e.target.value)} className={inputClass}>
                                {CURRENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <label className={labelClass}>Montant min</label>
                            <input type="number" value={record.amount_min ?? ''} onChange={e => updateField('amount_min', e.target.value ? parseInt(e.target.value) : null)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Montant max</label>
                            <input type="number" value={record.amount_max ?? ''} onChange={e => updateField('amount_max', e.target.value ? parseInt(e.target.value) : null)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Date limite</label>
                            <input type="date" value={record.deadline_at?.split('T')[0] || ''} onChange={e => updateField('deadline_at', e.target.value || null)} className={inputClass} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Données JSONB</h3>

                    <div>
                        <label className={labelClass}>Data (JSON)</label>
                        <textarea
                            value={JSON.stringify(record.data, null, 2)}
                            onChange={e => {
                                try {
                                    updateField('data', JSON.parse(e.target.value))
                                } catch { /* ignore invalid json while typing */ }
                            }}
                            rows={10}
                            className={`${inputClass} font-mono text-xs`}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
                    >
                        Retour
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Enregistrer
                    </button>
                </div>
            </form>
        </div>
    )
}
