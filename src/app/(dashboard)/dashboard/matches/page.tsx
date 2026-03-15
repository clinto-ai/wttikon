import { prisma } from '@/lib/db'
import { formatDate, formatTime, formatPercent, getMatchStatus } from '@/lib/utils'
import Link from 'next/link'
import { ChevronRight, Calendar, Clock } from 'lucide-react'

async function getMatches() {
    return prisma.match.findMany({
        where: {
            league: 'Bundesliga',
        },
        orderBy: { kickoff: 'desc' },
        take: 20,
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
}

export default async function MatchesPage() {
    const matches = await getMatches()

    const upcomingMatches = matches.filter(m => m.status === 'SCHEDULED')
    const liveMatches = matches.filter(m => m.status === 'LIVE' || m.status === 'HALFTIME')
    const finishedMatches = matches.filter(m => m.status === 'FINISHED')

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-2">Bundesliga Spiele</h1>
                <p className="text-muted-foreground">Alle Bundesliga-Spiele mit Prognosen</p>
            </div>

            {/* Live Matches */}
            {liveMatches.length > 0 && (
                <div className="glass-card rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-3 h-3 bg-success rounded-full animate-pulse" />
                        <h2 className="text-lg font-semibold">Live</h2>
                    </div>
                    <div className="space-y-3">
                        {liveMatches.map((match) => (
                            <Link
                                key={match.id}
                                href={`/dashboard/matches/${match.id}`}
                                className="block bg-background/50 rounded-lg p-4 hover:bg-background transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <span className="font-semibold w-28 truncate">{match.homeTeam.name}</span>
                                        <div className="text-2xl font-bold flex items-center gap-3">
                                            <span className="text-primary">{match.homeScore}</span>
                                            <span className="text-muted-foreground">:</span>
                                            <span className="text-primary">{match.awayScore}</span>
                                        </div>
                                        <span className="font-semibold w-28 truncate text-right">{match.awayTeam.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                        <span className="text-danger font-medium">{match.minute}'</span>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming Matches */}
            <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Kommende Spiele</h2>
                </div>

                {upcomingMatches.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Keine kommenden Spiele verfügbar</p>
                ) : (
                    <div className="space-y-3">
                        {upcomingMatches.map((match) => {
                            const homePred = match.predictions.find(p => p.selection === 'Home')
                            const awayPred = match.predictions.find(p => p.selection === 'Away')
                            const drawPred = match.predictions.find(p => p.selection === 'Draw')

                            return (
                                <Link
                                    key={match.id}
                                    href={`/dashboard/matches/${match.id}`}
                                    className="block bg-background/50 rounded-lg p-4 hover:bg-background transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(match.kickoff)}</span>
                                            <span>•</span>
                                            <span>{formatTime(match.kickoff)}</span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <span className="font-semibold w-24 truncate">{match.homeTeam.name}</span>
                                            <span className="text-muted-foreground">vs</span>
                                            <span className="font-semibold w-24 truncate text-right">{match.awayTeam.name}</span>
                                        </div>
                                    </div>

                                    {match.predictions.length > 0 && (
                                        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border/50">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-success">{formatPercent(homePred?.predictedProb ?? 0)}</div>
                                                <div className="text-xs text-muted-foreground">Sieg</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-warning">{formatPercent(drawPred?.predictedProb ?? 0)}</div>
                                                <div className="text-xs text-muted-foreground">Remis</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-danger">{formatPercent(awayPred?.predictedProb ?? 0)}</div>
                                                <div className="text-xs text-muted-foreground">Sieg</div>
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Finished Matches */}
            <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-semibold">Abgeschlossene Spiele</h2>
                </div>

                {finishedMatches.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Keine abgeschlossenen Spiele</p>
                ) : (
                    <div className="space-y-3">
                        {finishedMatches.slice(0, 10).map((match) => (
                            <Link
                                key={match.id}
                                href={`/dashboard/matches/${match.id}`}
                                className="block bg-background/50 rounded-lg p-4 hover:bg-background transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(match.kickoff)}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">Beendet</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <span className="font-semibold w-24 truncate">{match.homeTeam.name}</span>
                                        <div className="text-xl font-bold flex items-center gap-2">
                                            <span className={match.homeScore! > match.awayScore! ? 'text-success' : ''}>{match.homeScore}</span>
                                            <span className="text-muted-foreground">:</span>
                                            <span className={match.awayScore! > match.homeScore! ? 'text-success' : ''}>{match.awayScore}</span>
                                        </div>
                                        <span className="font-semibold w-24 truncate text-right">{match.awayTeam.name}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
