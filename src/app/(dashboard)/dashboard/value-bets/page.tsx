import { prisma } from '@/lib/db'
import { formatPercent, getValueBadge } from '@/lib/utils'
import Link from 'next/link'
import { ChevronRight, Target, TrendingUp, Filter } from 'lucide-react'

async function getValueBets() {
    return prisma.prediction.findMany({
        where: {
            valuePercent: { gte: 0 },
            match: {
                status: 'SCHEDULED',
                kickoff: { gte: new Date() },
            },
        },
        orderBy: { valuePercent: 'desc' },
        include: {
            match: {
                include: {
                    homeTeam: true,
                    awayTeam: true,
                },
            },
            market: true,
        },
    })
}

export default async function ValueBetsPage() {
    const valueBets = await getValueBets()

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-2">Value Bets</h1>
                <p className="text-muted-foreground">
                    Wetten mit positivem Erwartungswert basierend auf unseren KI-Prognosen
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-success" />
                        <span className="text-sm text-muted-foreground">Durchschnittliches Value</span>
                    </div>
                    <p className="text-2xl font-bold text-success">
                        +{valueBets.length > 0
                            ? (valueBets.reduce((sum, b) => sum + (b.valuePercent || 0), 0) / valueBets.length).toFixed(1)
                            : 0}%
                    </p>
                </div>

                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-primary" />
                        <span className="text-sm text-muted-foreground">Verfügbare Wetten</span>
                    </div>
                    <p className="text-2xl font-bold">{valueBets.length}</p>
                </div>

                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">Starke Value (&gt;10%)</span>
                    </div>
                    <p className="text-2xl font-bold text-success">
                        {valueBets.filter(b => (b.valuePercent || 0) >= 10).length}
                    </p>
                </div>

                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">Durchschnittliche Confidence</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                        {valueBets.length > 0
                            ? formatPercent(valueBets.reduce((sum, b) => sum + b.confidence, 0) / valueBets.length)
                            : '0%'}
                    </p>
                </div>
            </div>

            {/* Value Bets List */}
            <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Alle Value Bets</h2>
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>

                {valueBets.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        Keine Value Bets verfügbar. Die Daten werden bald aktualisiert.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-muted-foreground border-b border-border">
                                    <th className="pb-3 font-medium">Spiel</th>
                                    <th className="pb-3 font-medium">Markt</th>
                                    <th className="pb-3 font-medium">Tipp</th>
                                    <th className="pb-3 font-medium">Wahrscheinlichkeit</th>
                                    <th className="pb-3 font-medium">Faire Quote</th>
                                    <th className="pb-3 font-medium">Value</th>
                                    <th className="pb-3 font-medium">Confidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {valueBets.map((bet) => {
                                    const badge = getValueBadge(bet.valuePercent ?? 0)

                                    return (
                                        <tr key={bet.id} className="border-b border-border/50 hover:bg-background/50">
                                            <td className="py-4">
                                                <Link
                                                    href={`/dashboard/matches/${bet.match.id}`}
                                                    className="font-medium hover:text-primary transition-colors"
                                                >
                                                    {bet.match.homeTeam.name} vs {bet.match.awayTeam.name}
                                                </Link>
                                            </td>
                                            <td className="py-4">
                                                <span className="badge bg-primary/20 text-primary border-primary/30">
                                                    {bet.market.name}
                                                </span>
                                            </td>
                                            <td className="py-4 font-medium">{bet.selection}</td>
                                            <td className="py-4 text-primary">{formatPercent(bet.predictedProb)}</td>
                                            <td className="py-4 font-medium">{bet.fairOdd.toFixed(2)}</td>
                                            <td className="py-4">
                                                <span className="text-muted-foreground">-</span>
                                            </td>
                                            <td className="py-4">
                                                <span className={`badge ${badge.color}`}>
                                                    +{bet.valuePercent?.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full"
                                                            style={{ width: `${bet.confidence * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm">{formatPercent(bet.confidence)}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
