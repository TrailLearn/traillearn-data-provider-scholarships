import { useState, type FormEvent } from 'react'
import { useAuth } from '@/features/auth'
import { useNavigate } from 'react-router-dom'
import { Send, Loader2, AlertCircle, Check, ArrowLeft } from 'lucide-react'

const CURRENCY_OPTIONS = [
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CHF', label: 'CHF' },
    { value: 'CAD', label: 'CAD ($)' },
]

export function SubmitBoursePage() {
    const { user, session, isLoading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [form, setForm] = useState({
        name: '',
        source_url: '',
        amount_min: '',
        amount_max: '',
        currency: 'EUR',
        deadline_at: '',
        tags: '',
        description: '',
    })

    const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

    if (authLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="text-center py-20 max-w-md mx-auto">
                <Send className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h2 className="text-lg font-semibold mb-2">Connexion requise</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Vous devez être connecté pour soumettre une bourse.
                </p>
                <button
                    onClick={() => navigate('/login')}
                    className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    Se connecter
                </button>
            </div>
        )
    }

    if (success) {
        return (
            <div className="text-center py-20 max-w-md mx-auto">
                <div className="rounded-xl border border-border bg-card p-8">
                    <Check className="h-12 w-12 text-success mx-auto mb-4" />
                    <h2 className="text-lg font-semibold mb-2">Bourse soumise !</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                        Votre soumission est en attente de validation par un administrateur.
                    </p>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => { setSuccess(false); setForm({ name: '', source_url: '', amount_min: '', amount_max: '', currency: 'EUR', deadline_at: '', tags: '', description: '' }) }}
                            className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Soumettre une autre
                        </button>
                        <button
                            onClick={() => navigate('/my-submissions')}
                            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
                        >
                            Voir mes soumissions
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const payload: Record<string, unknown> = {
            name: form.name,
            source_url: form.source_url,
            description: form.description || undefined,
            tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        }
        if (form.amount_min) payload.amount_min = parseInt(form.amount_min)
        if (form.amount_max) payload.amount_max = parseInt(form.amount_max)
        if (form.currency !== 'EUR') payload.currency = form.currency
        if (form.deadline_at) payload.deadline_at = form.deadline_at

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

        try {
            const res = await fetch(`${supabaseUrl}/functions/v1/scholarship-submission`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify(payload),
            })

            if (res.status === 201) {
                setSuccess(true)
            } else {
                const body = await res.json()
                if (res.status === 409) {
                    setError('Cette URL de source existe déjà dans la base.')
                } else {
                    setError(body.detail || body.message || `Erreur ${res.status}`)
                }
            }
        } catch (err) {
            setError('Erreur réseau. Vérifiez votre connexion.')
        }

        setLoading(false)
    }

    const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow'
    const labelClass = 'block text-sm font-medium mb-1.5'

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="rounded-md p-1.5 hover:bg-accent transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Soumettre une bourse</h2>
                    <p className="text-xs text-muted-foreground">
                        Contribuez au catalogue en ajoutant une nouvelle bourse d'études.
                    </p>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Informations générales</h3>

                    <div>
                        <label className={labelClass}>Nom de la bourse *</label>
                        <input type="text" required value={form.name} onChange={e => updateForm('name', e.target.value)} className={inputClass} placeholder="Ex: Bourse d'Excellence 2026" />
                    </div>

                    <div>
                        <label className={labelClass}>URL source (HTTPS) *</label>
                        <input type="url" required value={form.source_url} onChange={e => updateForm('source_url', e.target.value)} className={inputClass} placeholder="https://..." />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <label className={labelClass}>Montant min</label>
                            <input type="number" value={form.amount_min} onChange={e => updateForm('amount_min', e.target.value)} className={inputClass} placeholder="5000" />
                        </div>
                        <div>
                            <label className={labelClass}>Montant max</label>
                            <input type="number" value={form.amount_max} onChange={e => updateForm('amount_max', e.target.value)} className={inputClass} placeholder="25000" />
                        </div>
                        <div>
                            <label className={labelClass}>Devise</label>
                            <select value={form.currency} onChange={e => updateForm('currency', e.target.value)} className={inputClass}>
                                {CURRENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Détails (optionnel)</h3>

                    <div>
                        <label className={labelClass}>Date limite</label>
                        <input type="date" value={form.deadline_at} onChange={e => updateForm('deadline_at', e.target.value)} className={inputClass} />
                    </div>

                    <div>
                        <label className={labelClass}>Tags (séparés par des virgules)</label>
                        <input type="text" value={form.tags} onChange={e => updateForm('tags', e.target.value)} className={inputClass} placeholder="Mérite, Master, Sciences..." />
                    </div>

                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea value={form.description} onChange={e => updateForm('description', e.target.value)} rows={4} className={inputClass} placeholder="Description de la bourse..." />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Soumettre la bourse
                </button>
            </form>
        </div>
    )
}
