import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ChevronRight, Clock, Activity, AlertCircle } from 'lucide-react'

async function getLiveMatches() {
    return prisma.match.findMany({
        where: {
            status: { in: ['LIVE', 'HALFTIME'] },
        },
        orderBy: { minute: 'desc' },
        include: {
            homeTeam: true,
            awayTeam: true,
            events: {
                orderBy: { minute: 'desc' },
            },
            predictions: {
                include: {
                    market: true,
                },
            },
        },
    })
}

export default async function LivePage() {
    const liveMatches = await getLiveMatches()

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-2">Live Spiele</h1>
                <p className="text-muted-foreground">
                    Verfolge alle Bundesliga-Spiele in Echtzeit mit Live-Wahrscheinlichkeiten
                </p>
            </div>

            {liveMatches.length === 0 ? (
                <div className="glass-card rounded-xl p-12 text-center">
                    <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Keine Live-Spiele</h2>
                    <p className="text-muted-foreground">
                        Aktuell finden keine Bundesliga-Spiele statt.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {liveMatches.map((match) => (
                        <div key={match.id} className="glass-card rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 bg-success rounded-full animate-pulse" />
                                    <span className="text-success font-medium">
                                        {match.status === 'HALFTIME' ? 'Halbzeit' : `${match.minute}'`}
                                    </span>
                                </div>
                                <Link
                                    href={`/dashboard/matches/${match.id}`}
                                    className="text-primary hover:underline flex items-center gap-1"
                                >
                                    Details <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="flex items-center justify-between mb-6">
                                <div className="text-center flex-1">
                                    <h3 className="text-xl font-bold mb-1">{match.homeTeam.name}</h3>
                                </div>
                                <div className="text-4xl font-bold px-8">
                                    <span className="text-primary">{match.homeScore}</span>
                                    <span className="text-muted-foreground mx-2">:</span>
                                    <span className="text-primary">{match.awayScore}</span>
                                </div>
                                <div className="text-center flex-1">
                                    <h3 className="text-xl font-bold mb-1">{match.awayTeam.name}</h3>
                                </div>
                            </div>

                            {/* Live Events */}
                            {match.events.length > 0 && (
                                <div className="border-t border-border pt-4">
                                    <h4 className="text-sm font-medium mb-3">Spielereignisse</h4>
                                    <div className="space-y-2">
                                        {match.events.slice(0, 5).map((event) => (
                                            <div key={event.id} className="flex items-center gap-3 text-sm">
                                                <span className="text-muted-foreground w-8">{event.minute}'</span>
                                                <span className={`badge ${event.type === 'GOAL' ? 'badge-success' :
                                                        event.type === 'YELLOW_CARD' ? 'badge-warning' :
                                                            event.type === 'RED_CARD' ? 'badge-danger' :
                                                                'bg-muted'
                                                    }`}>
                                                    {event.type === 'GOAL' ? '⚽' :
                                                        event.type === 'YELLOW_CARD' ? '🟨' :
                                                            event.type === 'RED_CARD' ? '🟥' : '⚽'}
                                                </span>
                                                <span>{event.playerName || 'Spieler'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Live Probabilities */}
                            {match.predictions.length > 0 && (
                                <div className="border-t border-border pt-4 mt-4">
                                    <h4 className="text-sm font-medium mb-3">Live-Wahrscheinlichkeiten</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['Home', 'Draw', 'Away'].map((selection) => {
                                            const pred = match.predictions.find(p => p.selection === selection)
                                            if (!pred) return null

                                            return (
                                                <div key={selection} className="text-center">
                                                    <div className="text-2xl font-bold text-primary mb-1">
                                                        {(pred.predictedProb * 100).toFixed(0)}%
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {selection === 'Home' ? 'Heimsieg' :
                                                            selection === 'Draw' ? 'Remis' : 'Auswärtssieg'}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
