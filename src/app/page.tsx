import Link from 'next/link'
import { TrendingUp, Target, Zap, BarChart3, Shield, Users } from 'lucide-react'

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text">Wettikon</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                                Features
                            </Link>
                            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                                Pricing
                            </Link>
                            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                                Login
                            </Link>
                            <Link href="/register" className="btn-primary">
                                Kostenlos starten
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-hero-glow opacity-50" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8 animate-fade-in">
                            <Zap className="w-4 h-4" />
                            <span>Deutsche Bundesliga Analytics</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in stagger-1">
                            Datengetriebene{' '}
                            <span className="gradient-text">Wettprognosen</span>
                            <br />für die Bundesliga
                        </h1>

                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in stagger-2">
                            Modernste KI-Modelle analysieren Spielstatistiken, Elo-Ratings und Formkurven,
                            um die präzisesten Bundesliga-Prognosen zu liefern.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in stagger-3">
                            <Link href="/register" className="btn-primary text-lg px-8 py-3">
                                Kostenlos starten
                            </Link>
                            <Link href="#features" className="btn-outline text-lg px-8 py-3">
                                Mehr erfahren
                            </Link>
                        </div>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="mt-16 relative">
                        <div className="glass-card rounded-2xl p-6 border border-border/50 animate-fade-in stagger-4">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Live Dashboard</h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-success rounded-full animate-pulse-slow" />
                                    <span className="text-sm text-success">Live</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                {[
                                    { label: 'Aktueller PNL', value: '€1,247.50', color: 'text-success' },
                                    { label: 'ROI', value: '12.4%', color: 'text-primary' },
                                    { label: 'Trefferquote', value: '58.2%', color: 'text-secondary' },
                                    { label: 'Value Bets', value: '24', color: 'text-warning' },
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-background/50 rounded-xl p-4">
                                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="h-48 bg-background/50 rounded-xl flex items-center justify-center">
                                <BarChart3 className="w-16 h-16 text-muted-foreground/50" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-card/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">
                            Alles was du für{' '}
                            <span className="gradient-text">erfolgreiche Wetten</span> brauchst
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Professionelle Tools und Analysen, die sonst nur Profis nutzen
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Target,
                                title: 'KI-Prognosen',
                                description: 'Ensemble-Modell aus 5 Algorithmen für präzise Spielausgangs-Wahrscheinlichkeiten',
                                color: 'text-primary',
                            },
                            {
                                icon: TrendingUp,
                                title: 'Value Bet Finder',
                                description: 'Automatische Erkennung von Wetten mit positivem Erwartungswert',
                                color: 'text-success',
                            },
                            {
                                icon: Zap,
                                title: 'Live Tracking',
                                description: 'Echtzeit-Spielstände und dynamische Wahrscheinlichkeiten während des Spiels',
                                color: 'text-warning',
                            },
                            {
                                icon: BarChart3,
                                title: 'PNL Analytics',
                                description: 'Detaillierte Auswertung deiner Wetten mit ROI, Yield und Performance-Charts',
                                color: 'text-secondary',
                            },
                            {
                                icon: Shield,
                                title: 'Sichere Daten',
                                description: 'Lokale Datenbank mit verschlüsselten Passwörtern - keine Cloud-Abhängigkeit',
                                color: 'text-danger',
                            },
                            {
                                icon: Users,
                                title: 'Community',
                                description: 'Teile Tipps und diskutiere Strategien mit anderen Wett-Enthusiasten',
                                color: 'text-primary',
                            },
                        ].map((feature, index) => (
                            <div
                                key={feature.title}
                                className="glass-card rounded-2xl p-6 card-hover animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={`w-12 h-12 rounded-xl bg-background flex items-center justify-center mb-4 ${feature.color}`}>
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Models Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">
                            Unsere <span className="gradient-text">Prognose-Modelle</span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            5 verschiedene Algorithmen arbeiten zusammen für maximale Präzision
                        </p>
                    </div>

                    <div className="grid md:grid-cols-5 gap-4">
                        {[
                            { name: 'Logistic Regression', weight: '15%', desc: 'Klassische statistische Methode' },
                            { name: 'Random Forest', weight: '20%', desc: 'Ensemble aus Entscheidungsbäumen' },
                            { name: 'Poisson', weight: '25%', desc: 'Torerwartungs-Modell' },
                            { name: 'Elo Rating', weight: '20%', desc: 'Dynamische Teamstärke' },
                            { name: 'Form Model', weight: '20%', desc: 'Aktuelle Spielform' },
                        ].map((model) => (
                            <div key={model.name} className="glass-card rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-primary mb-1">{model.weight}</div>
                                <h4 className="font-semibold mb-1">{model.name}</h4>
                                <p className="text-sm text-muted-foreground">{model.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="pricing" className="py-20 bg-card/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="glass-card rounded-3xl p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-hero-glow opacity-30" />
                        <div className="relative">
                            <h2 className="text-4xl font-bold mb-4">
                                Bereit für{' '}
                                <span className="gradient-text">bessere Wetten</span>?
                            </h2>
                            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
                                Starte jetzt kostenlos und erhalte Zugriff auf alle Premium-Features
                            </p>
                            <Link href="/register" className="btn-primary text-lg px-10 py-4 inline-block">
                                Kostenlos registrieren
                            </Link>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Keine Kreditkarte erforderlich • 14 Tage kostenlos testen
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold">Wettikon</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2024 Wettikon. Alle Rechte vorbehalten.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
