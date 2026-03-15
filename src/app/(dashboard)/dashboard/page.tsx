import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatPercent, getMatchStatus, getValueBadge } from '@/lib/utils'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Target, Zap, Clock, ChevronRight } from 'lucide-react'

async function getDashboardData(userId: string) {
    // Get user stats
    const userStats = await prisma.userStats.findUnique({
        where: { userId },
    })

    // Get recent bets
    const recentBets = await prisma.bet.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            match: {
                include: {
                    homeTeam: true,
                    awayTeam: true,
                },
            },
        },
    })

    // Get upcoming matches
    const upcomingMatches = await prisma.match.findMany({
        where: {
            status: 'SCHEDULED',
            kickoff: { gte: new Date() },
        },
        orderBy: { kickoff: 'asc' },
        take: 5,
        include: {
            homeTeam: true,
            awayTeam: true,
            predictions: {
                include: {
                    market: true,
                },
            },
        },
    })

    // Get live matches
    const liveMatches = await prisma.match.findMany({
        where: {
            status: { in: ['LIVE', 'HALFTIME'] },
        },
        take: 3,
        include: {
            homeTeam: true,
            awayTeam: true,
        },
    })

    // Get top value bets
    const valueBets = await prisma.prediction.findMany({
        where: {
            valuePercent: { gte: 5 },
            match: {
                status: 'SCHEDULED',
                kickoff: { gte: new Date() },
            },
        },
        orderBy: { valuePercent: 'desc' },
        take: 5,
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

    return {
        userStats,
        recentBets,
        upcomingMatches,
        liveMatches,
        valueBets,
    }
}

export default async function DashboardPage() {
    const user = await getCurrentUser()
    if (!user) return null

    const data = await getDashboardData(user.id)

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Aktueller PNL</span>
                        <TrendingUp className="w-5 h-5 text-success" />
                    </div>
                    <p className={`text-2xl font-bold ${(data.userStats?.totalProfit ?? 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(data.userStats?.totalProfit ?? 0)}
                    </p>
                </div>

                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">ROI</span>
                        <Target className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-primary">
                        {formatPercent((data.userStats?.roi ?? 0) / 100)}
                    </p>
                </div>

                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Trefferquote</span>
                        <Zap className="w-5 h-5 text-secondary" />
                    </div>
                    <p className="text-2xl font-bold text-secondary">
                        {formatPercent(data.userStats?.hitRate ?? 0)}
                    </p>
                </div>

                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Wetten</span>
                        <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">
                        {data.userStats?.totalBets ?? 0}
                    </p>
                </div>
            </div>

            {/* Live Matches & Value Bets */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Live Matches */}
                <div className="glass-card rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Live Spiele</h2>
                        <span className="flex items-center gap-2 text-sm text-success">
                            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                            Live
                        </span>
                    </div>

                    {data.liveMatches.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">Keine Live-Spiele</p>
                    ) : (
                        <div className="space-y-3">
                            {data.liveMatches.map((match) => (
                                <Link
                                    key={match.id}
                                    href={`/dashboard/matches/${match.id}`}
                                    className="block bg-background/50 rounded-lg p-4 hover:bg-background transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold w-24 truncate">{match.homeTeam.name}</span>
                                            <span className="text-xl font-bold">{match.homeScore} - {match.awayScore}</span>
                                            <span className="font-semibold w-24 truncate text-right">{match.awayTeam.name}</span>
                                        </div>
                                        <span className="text-sm text-danger font-medium">
                                            {match.minute}'
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Value Bets */}
                <div className="glass-card rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Top Value Bets</h2>
                        <Link href="/dashboard/value-bets" className="text-sm text-primary hover:underline flex items-center gap-1">
                            Alle anzeigen <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {data.valueBets.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">Keine Value Bets verfügbar</p>
                    ) : (
                        <div className="space-y-3">
                            {data.valueBets.map((pred) => {
                                const badge = getValueBadge(pred.valuePercent ?? 0)
                                return (
                                    <Link
                                        key={pred.id}
                                        href={`/dashboard/matches/${pred.match.id}`}
                                        className="block bg-background/50 rounded-lg p-4 hover:bg-background transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{pred.match.homeTeam.name}</span>
                                                <span className="text-muted-foreground">vs</span>
                                                <span className="font-medium">{pred.match.awayTeam.name}</span>
                                            </div>
                                            <span className={`badge ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{pred.market.name} - {pred.selection}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-primary font-medium">{formatPercent(pred.predictedProb)}</span>
                                                <span className="text-success font-bold">+{pred.valuePercent?.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming Matches */}
            <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Kommende Spiele</h2>
                    <Link href="/dashboard/matches" className="text-sm text-primary hover:underline flex items-center gap-1">
                        Alle anzeigen <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {data.upcomingMatches.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Keine kommenden Spiele</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-muted-foreground border-b border-border">
                                    <th className="pb-3 font-medium">Datum</th>
                                    <th className="pb-3 font-medium">Heim</th>
                                    <th className="pb-3 font-medium">Auswärts</th>
                                    <th className="pb-3 font-medium">Prognose</th>
                                    <th className="pb-3 font-medium">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.upcomingMatches.map((match) => {
                                    const homePred = match.predictions.find(p => p.selection === 'Home')
                                    return (
                                        <tr key={match.id} className="border-b border-border/50 hover:bg-background/50">
                                            <td className="py-4">
                                                <div className="text-sm">
                                                    <div>{new Date(match.kickoff).toLocaleDateString('de-DE')}</div>
                                                    <div className="text-muted-foreground">{new Date(match.kickoff).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                            </td>
                                            <td className="py-4 font-medium">{match.homeTeam.name}</td>
                                            <td className="py-4 font-medium">{match.awayTeam.name}</td>
                                            <td className="py-4">
                                                {homePred ? (
                                                    <span className="text-primary font-medium">{formatPercent(homePred.predictedProb)}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="py-4">
                                                {homePred && homePred.valuePercent ? (
                                                    <span className={homePred.valuePercent > 0 ? 'text-success' : 'text-danger'}>
                                                        {homePred.valuePercent > 0 ? '+' : ''}{homePred.valuePercent.toFixed(1)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recent Bets */}
            <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Letzte Wetten</h2>
                    <Link href="/dashboard/bets" className="text-sm text-primary hover:underline flex items-center gap-1">
                        Alle anzeigen <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {data.recentBets.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">Du hast noch keine Wetten platziert</p>
                        <Link href="/dashboard/matches" className="btn-primary">
                            Spiele durchsuchen
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-muted-foreground border-b border-border">
                                    <th className="pb-3 font-medium">Spiel</th>
                                    <th className="pb-3 font-medium">Tipp</th>
                                    <th className="pb-3 font-medium">Quote</th>
                                    <th className="pb-3 font-medium">Einsatz</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentBets.map((bet) => (
                                    <tr key={bet.id} className="border-b border-border/50 hover:bg-background/50">
                                        <td className="py-4">
                                            <div className="text-sm">
                                                <div className="font-medium">{bet.homeTeam} vs {bet.awayTeam}</div>
                                                <div className="text-muted-foreground">{bet.kickoff ? new Date(bet.kickoff).toLocaleDateString('de-DE') : '-'}</div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="badge bg-primary/20 text-primary border-primary/30">
                                                {bet.selection}
                                            </span>
                                        </td>
                                        <td className="py-4 font-medium">{bet.odd.toFixed(2)}</td>
                                        <td className="py-4">{formatCurrency(bet.stake)}</td>
                                        <td className="py-4">
                                            <span className={`badge ${bet.status === 'WON' ? 'badge-success' :
                                                    bet.status === 'LOST' ? 'badge-danger' :
                                                        bet.status === 'VOID' ? 'bg-muted text-muted-foreground' :
                                                            'bg-primary/20 text-primary border-primary/30'
                                                }`}>
                                                {bet.status === 'WON' ? 'Gewonnen' :
                                                    bet.status === 'LOST' ? 'Verloren' :
                                                        bet.status === 'VOID' ? 'Storniert' : 'Offen'}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            {bet.profit !== null ? (
                                                <span className={bet.profit >= 0 ? 'text-success' : 'text-danger'}>
                                                    {formatCurrency(bet.profit)}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
