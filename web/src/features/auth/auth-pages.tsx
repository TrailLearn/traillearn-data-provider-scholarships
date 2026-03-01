import { useState, type FormEvent } from 'react'
import { useAuth } from './auth-provider'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { LogIn, UserPlus, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'

function PasswordInput({
    id,
    value,
    onChange,
    placeholder,
    autoComplete,
}: {
    id: string
    value: string
    onChange: (v: string) => void
    placeholder?: string
    autoComplete?: string
}) {
    const [visible, setVisible] = useState(false)
    return (
        <div className="relative">
            <input
                id={id}
                type={visible ? 'text' : 'password'}
                required
                autoComplete={autoComplete}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder={placeholder}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
                {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    )
}

export function LoginPage() {
    const { signIn } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const redirectTo = searchParams.get('redirect') || '/bourses'

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        const { error } = await signIn(email, password)
        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            navigate(redirectTo)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">
                        <span className="text-primary">TrailLearn</span>
                    </h1>
                    <p className="text-muted-foreground mt-1">Bourses Data Provider</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <LogIn className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Connexion</h2>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 mb-4 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-medium mb-1.5">
                                Email
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
                                placeholder="votre@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="login-password" className="block text-sm font-medium mb-1.5">
                                Mot de passe
                            </label>
                            <PasswordInput
                                id="login-password"
                                value={password}
                                onChange={setPassword}
                                autoComplete="current-password"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                            Se connecter
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Pas encore de compte ?{' '}
                        <Link to="/signup" className="text-primary hover:underline font-medium">
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export function SignupPage() {
    const { signUp } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.')
            return
        }
        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.')
            return
        }

        setLoading(true)
        const { error, session } = await signUp(email, password, {
            emailRedirectTo: window.location.origin,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else if (session) {
            navigate('/bourses')
        } else {
            setAwaitingConfirmation(true)
            setLoading(false)
        }
    }

    if (awaitingConfirmation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <div className="w-full max-w-md text-center">
                    <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
                        <div className="text-4xl mb-4">📧</div>
                        <h2 className="text-lg font-semibold mb-2">Vérifiez votre email</h2>
                        <p className="text-muted-foreground text-sm mb-6">
                            Un lien de confirmation a été envoyé à <strong>{email}</strong>.
                            Cliquez dessus pour activer votre compte.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Retour à la connexion
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">
                        <span className="text-primary">TrailLearn</span>
                    </h1>
                    <p className="text-muted-foreground mt-1">Bourses Data Provider</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <UserPlus className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Créer un compte</h2>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 mb-4 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="signup-email" className="block text-sm font-medium mb-1.5">
                                Email
                            </label>
                            <input
                                id="signup-email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
                                placeholder="votre@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="signup-password" className="block text-sm font-medium mb-1.5">
                                Mot de passe
                            </label>
                            <PasswordInput
                                id="signup-password"
                                value={password}
                                onChange={setPassword}
                                autoComplete="new-password"
                                placeholder="Min. 6 caractères"
                            />
                        </div>

                        <div>
                            <label htmlFor="signup-confirm" className="block text-sm font-medium mb-1.5">
                                Confirmer le mot de passe
                            </label>
                            <PasswordInput
                                id="signup-confirm"
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                autoComplete="new-password"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                            Créer mon compte
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Déjà un compte ?{' '}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
