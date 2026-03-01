import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { LogOut, User, Shield, Menu, X, FileText } from 'lucide-react'
import { useState } from 'react'
import { supabaseMissing } from '@/lib/supabase'

export function Layout() {
    const { user, isAdmin, signOut } = useAuth()
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {supabaseMissing && (
                <div className="bg-warning/10 border-b border-warning/30 px-4 py-2 text-center text-xs text-warning">
                    Supabase non configuré — copiez <code className="font-mono bg-warning/10 px-1 rounded">.env.example</code> vers <code className="font-mono bg-warning/10 px-1 rounded">.env</code> et ajoutez vos clés.
                </div>
            )}
            <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <h1 className="text-lg font-bold tracking-tight">
                                <span className="text-primary">TrailLearn</span>
                            </h1>
                            <span className="hidden sm:inline text-muted-foreground text-xs font-normal border-l border-border pl-2 ml-1">
                                Bourses
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            <Link
                                to="/bourses"
                                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            >
                                Catalogue
                            </Link>

                            {user && (
                                <>
                                    <Link
                                        to="/submit"
                                        className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                    >
                                        Soumettre
                                    </Link>
                                    <Link
                                        to="/my-submissions"
                                        className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                    >
                                        <span className="flex items-center gap-1">
                                            <FileText className="h-3.5 w-3.5" />
                                            Mes soumissions
                                        </span>
                                    </Link>
                                </>
                            )}

                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                >
                                    <span className="flex items-center gap-1">
                                        <Shield className="h-3.5 w-3.5" />
                                        Admin
                                    </span>
                                </Link>
                            )}
                        </nav>

                        {/* Auth Actions */}
                        <div className="hidden md:flex items-center gap-2">
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <User className="h-3.5 w-3.5" />
                                        {user.email}
                                        {isAdmin && (
                                            <span className="ml-1 rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-medium">
                                                Admin
                                            </span>
                                        )}
                                    </span>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                        Déconnexion
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/login"
                                        className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                    >
                                        Connexion
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity"
                                    >
                                        S'inscrire
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border bg-background p-4 space-y-2">
                        <Link to="/bourses" className="block rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
                            Catalogue
                        </Link>
                        {user && (
                            <>
                                <Link to="/submit" className="block rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
                                    Soumettre
                                </Link>
                                <Link to="/my-submissions" className="block rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
                                    Mes soumissions
                                </Link>
                            </>
                        )}
                        {isAdmin && (
                            <Link to="/admin" className="block rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
                                Admin
                            </Link>
                        )}
                        <div className="border-t border-border pt-2 mt-2">
                            {user ? (
                                <button onClick={() => { handleSignOut(); setMobileMenuOpen(false) }} className="block w-full text-left rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent">
                                    Déconnexion
                                </button>
                            ) : (
                                <>
                                    <Link to="/login" className="block rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
                                        Connexion
                                    </Link>
                                    <Link to="/signup" className="block rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
                                        S'inscrire
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Outlet />
            </main>

            <footer className="border-t border-border mt-auto">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <p className="text-center text-xs text-muted-foreground">
                        © 2026 TrailLearn — Bourses Data Provider
                    </p>
                </div>
            </footer>
        </div>
    )
}
