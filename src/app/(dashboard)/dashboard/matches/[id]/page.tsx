import { prisma } from '@/lib/db'
import { formatDate, formatTime, formatPercent } from '@/lib/utils'
import Link from 'next/link'
import { ChevronLeft, TrendingUp, Target, Calculator } from 'lucide-react'

interface Props {
    params: Promise<{ id: string }>
}

async function getMatch(id: string) {
    return prisma.match.findUnique({
        where: { id },
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

export default async function MatchDetailPage({ params }: Props) {
    const { id } = await params
    const match = await getMatch(id)

    if (!match) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <h1 className="text-2xl font-bold mb-4">Spiel nicht gefunden</h1>
                <Link href="/dashboard/matches" className="text-primary hover:underline">
                    Zurück zu den Spielen
                </Link>
            </div>
        )
    }

    const isLive = match.status === 'LIVE' || match.status === 'HALFTIME'
    const isFinished = match.status === 'FINISHED'

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link
                href="/dashboard/matches"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
                <ChevronLeft className="w-4 h-4" />
                Zurück zu den Spielen
            </Link>

            {/* Match Header */}
            <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="badge bg-primary/20 text-primary border-primary/30">
                        {match.league}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {formatDate(match.kickoff)} um {formatTime(match.kickoff)}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    {/* Home Team */}
                    <div className="flex-1 text-center">
                        {match.homeTeam.logo && (
                            <img
                                src={match.homeTeam.logo}
                                alt={match.homeTeam.name}
                                className="w-20 h-20 mx-auto mb-2"
                            />
                        )}
                        <h2 className="text-xl font-bold">{match.homeTeam.name}</h2>
                    </div>

                    {/* Score */}
                    <div className="px-8">
                        {isFinished || isLive ? (
                            <div className="text-4xl font-bold">
                                {match.homeScore} - {match.awayScore}
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-muted-foreground">vs</div>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 text-center">
                        {match.awayTeam.logo && (
                            <img
                                src={match.awayTeam.logo}
                                alt={match.awayTeam.name}
                                className="w-20 h-20 mx-auto mb-2"
                            />
                        )}
                        <h2 className="text-xl font-bold">{match.awayTeam.name}</h2>
                    </div>
                </div>

                {/* Match Status */}
                <div className="mt-4 text-center">
                    {isLive && (
                        <span className="badge bg-success/20 text-success border-success/30">
                            LIVE {match.minute && `${match.minute}'`}
                        </span>
                    )}
                    {match.status === 'SCHEDULED' && (
                        <span className="badge bg-primary/20 text-primary border-primary/30">
                            Geplant
                        </span>
                    )}
                    {isFinished && (
                        <span className="badge bg-muted text-muted-foreground">
                            Beendet
                        </span>
                    )}
                </div>
            </div>

            {/* Predictions */}
            {match.predictions.length > 0 && (
                <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Unsere Prognosen
                    </h3>

                    <div className="space-y-4">
                        {match.predictions.map((prediction) => (
                            <div
                                key={prediction.id}
                                className="flex items-center justify-between p-4 bg-background/50 rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="badge bg-primary/20 text-primary border-primary/30">
                                        {prediction.market.name}
                                    </span>
                                    <span className="font-medium">{prediction.selection}</span>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Wahrscheinlichkeit</p>
                                        <p className="font-bold text-primary">
                                            {formatPercent(prediction.predictedProb)}
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Faire Quote</p>
                                        <p className="font-bold">{prediction.fairOdd.toFixed(2)}</p>
                                    </div>

                                    {prediction.valuePercent !== null && (
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">Value</p>
                                            <p className={`font-bold ${prediction.valuePercent > 0 ? 'text-success' : 'text-error'}`}>
                                                {prediction.valuePercent > 0 ? '+' : ''}
                                                {prediction.valuePercent.toFixed(1)}%
                                            </p>
                                        </div>
                                    )}

                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Confidence</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full"
                                                    style={{ width: `${prediction.confidence * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm">{formatPercent(prediction.confidence)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Predictions */}
            {match.predictions.length === 0 && match.status === 'SCHEDULED' && (
                <div className="glass-card rounded-xl p-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calculator className="w-5 h-5" />
                        <p>Noch keine Prognosen für dieses Spiel verfügbar.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
