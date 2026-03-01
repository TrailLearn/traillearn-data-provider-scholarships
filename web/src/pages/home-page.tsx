import { useAuth } from '@/features/auth'
import { Link } from 'react-router-dom'
import { Search, ArrowRight, Database, Shield, RefreshCw } from 'lucide-react'

export function HomePage() {
    const { user } = useAuth()

    return (
        <div className="space-y-16">
            {/* Hero */}
            <section className="text-center pt-8 pb-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    Toutes les bourses d'études,
                    <br />
                    <span className="text-primary">en un seul endroit.</span>
                </h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Mérite, mobilité, recherche, arts — agrégées, normalisées et vérifiées automatiquement.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        to="/bourses"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        <Search className="h-4 w-4" />
                        Explorer les bourses
                    </Link>
                    {!user && (
                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
                        >
                            Contribuer
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            </section>

            {/* Features */}
            <section className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
                    <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-2.5 mb-4">
                        <Database className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Multi-sources</h3>
                    <p className="text-sm text-muted-foreground">
                        Gouvernements, universités, fondations — données agrégées et normalisées depuis les sources officielles.
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
                    <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-2.5 mb-4">
                        <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Validé par des humains</h3>
                    <p className="text-sm text-muted-foreground">
                        Chaque bourse passe par un workflow de validation admin avant publication. Qualité garantie.
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
                    <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-2.5 mb-4">
                        <RefreshCw className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Toujours à jour</h3>
                    <p className="text-sm text-muted-foreground">
                        Boucle de revalidation automatique — 0% de liens morts, fraîcheur garantie &lt; 6 mois.
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section className="rounded-xl border border-border bg-card p-8 text-center">
                <div className="grid gap-8 sm:grid-cols-3">
                    <div>
                        <p className="text-3xl font-bold text-primary">—</p>
                        <p className="text-sm text-muted-foreground mt-1">Bourses référencées</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-primary">—</p>
                        <p className="text-sm text-muted-foreground mt-1">Sources actives</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-primary">—</p>
                        <p className="text-sm text-muted-foreground mt-1">Vérifications ce mois</p>
                    </div>
                </div>
            </section>
        </div>
    )
}
