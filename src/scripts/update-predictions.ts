// Update Predictions Script - Fetches real data from Football API and generates predictions

import 'dotenv/config'
import { prisma } from '../lib/db'
import { getBundesligaMatches, getBundesligaTeams, footballApi } from '../lib/football-api'
import { generatePredictions } from '../lib/predictions'

async function syncTeams() {
    console.log('🔄 Syncing Bundesliga teams...')

    const teams = await getBundesligaTeams()
    console.log(`   Found ${teams.length} teams`)

    for (const team of teams) {
        // Try to find by externalId first
        let existingTeam = await prisma.team.findUnique({
            where: { externalId: team.id }
        })

        // If not found, try by name
        if (!existingTeam) {
            existingTeam = await prisma.team.findFirst({
                where: { name: team.name }
            })
        }

        if (existingTeam) {
            await prisma.team.update({
                where: { id: existingTeam.id },
                data: {
                    externalId: team.id,
                    shortName: team.shortName,
                    logo: team.crest,
                    venue: team.venue,
                },
            })
        } else {
            await prisma.team.create({
                data: {
                    externalId: team.id,
                    name: team.name,
                    shortName: team.shortName,
                    logo: team.crest,
                    venue: team.venue,
                },
            })
        }
    }

    console.log('   ✓ Teams synced')
}

async function syncMatches() {
    console.log('🔄 Syncing Bundesliga matches...')

    const matches = await getBundesligaMatches()

    console.log(`   Total API matches: ${matches.length}`)

    // Debug: show first match structure
    if (matches.length > 0) {
        console.log('   Sample match:', JSON.stringify(matches[0], null, 2).substring(0, 500))
    }

    // Get all matches - don't filter by date
    let savedCount = 0
    for (const match of matches) {
        const homeTeam = await prisma.team.findUnique({
            where: { externalId: match.homeTeam.id }
        })
        const awayTeam = await prisma.team.findUnique({
            where: { externalId: match.awayTeam.id }
        })

        if (!homeTeam || !awayTeam) {
            continue
        }

        const statusMap: Record<string, string> = {
            'SCHEDULED': 'SCHEDULED',
            'IN_PLAY': 'LIVE',
            'PAUSED': 'HALFTIME',
            'FINISHED': 'FINISHED',
            'POSTPONED': 'POSTPONED',
            'CANCELLED': 'CANCELLED',
            'SUSPENDED': 'CANCELLED',
        }

        // Use utcDate from kickoff or fallback to utcDate at top level
        let kickoffDate: Date
        if (match.kickoff && match.kickoff.utcDate) {
            kickoffDate = new Date(match.kickoff.utcDate)
        } else if (match.utcDate) {
            kickoffDate = new Date(match.utcDate)
        } else {
            console.log(`   ⚠ No kickoff date for match ${match.homeTeam.name} vs ${match.awayTeam.name}`)
            continue
        }

        await prisma.match.upsert({
            where: { externalId: match.id },
            update: {
                status: statusMap[match.status] || 'SCHEDULED',
                homeScore: match.score.fullTime.home,
                awayScore: match.score.fullTime.away,
                halfTimeHome: match.score.halfTime.home,
                halfTimeAway: match.score.halfTime.away,
                minute: match.minute,
                matchday: match.matchday,
            },
            create: {
                externalId: match.id,
                league: 'Bundesliga',
                season: '2024',
                matchday: match.matchday,
                kickoff: kickoffDate,
                status: statusMap[match.status] || 'SCHEDULED',
                minute: match.minute,
                homeTeamId: homeTeam.id,
                awayTeamId: awayTeam.id,
                homeScore: match.score.fullTime.home,
                awayScore: match.score.fullTime.away,
                halfTimeHome: match.score.halfTime.home,
                halfTimeAway: match.score.halfTime.away,
            },
        })
        savedCount++
    }

    console.log(`   ✓ Saved ${savedCount} matches`)
}

async function ensureMarkets() {
    console.log('🔄 Ensuring markets exist...')

    const markets = [
        { name: '1X2', description: 'Match Result' },
        { name: 'OVER_UNDER', description: 'Over/Under 2.5 Goals' },
        { name: 'BTTS', description: 'Both Teams To Score' },
    ]

    for (const market of markets) {
        await prisma.market.upsert({
            where: { name: market.name },
            update: {},
            create: market,
        })
    }

    console.log('   ✓ Markets ready')
}

async function generatePredictionsForMatches() {
    console.log('🔄 Generating predictions for upcoming matches...')

    const upcomingMatches = await prisma.match.findMany({
        where: {
            status: 'SCHEDULED',
            kickoff: {
                gte: new Date(),
            },
        },
        include: {
            homeTeam: true,
            awayTeam: true,
        },
        orderBy: {
            kickoff: 'asc',
        },
        take: 50, // Generate predictions for up to 50 matches
    })

    console.log(`   Found ${upcomingMatches.length} upcoming matches`)

    for (const match of upcomingMatches) {
        try {
            console.log(`   Generating prediction for: ${match.homeTeam.name} vs ${match.awayTeam.name}`)

            const predictions = await generatePredictions(match.id)

            const market1X2 = await prisma.market.findUnique({ where: { name: '1X2' } })
            const marketOverUnder = await prisma.market.findUnique({ where: { name: 'OVER_UNDER' } })
            const marketBTTS = await prisma.market.findUnique({ where: { name: 'BTTS' } })

            if (!market1X2 || !marketOverUnder || !marketBTTS) {
                console.log('   ⚠ Markets not found')
                continue
            }

            // Save 1X2 predictions
            for (const pred of predictions.filter(p => p.market === '1X2')) {
                await prisma.prediction.upsert({
                    where: {
                        matchId_marketId_selection: {
                            matchId: match.id,
                            marketId: market1X2.id,
                            selection: pred.selection,
                        },
                    },
                    update: {
                        predictedProb: pred.probability,
                        fairOdd: pred.fairOdd,
                        confidence: pred.confidence,
                        valuePercent: pred.valuePercent,
                        factors: pred.factors ? JSON.stringify(pred.factors) : null,
                    },
                    create: {
                        matchId: match.id,
                        marketId: market1X2.id,
                        selection: pred.selection,
                        predictedProb: pred.probability,
                        fairOdd: pred.fairOdd,
                        confidence: pred.confidence,
                        valuePercent: pred.valuePercent,
                        modelVersion: pred.modelVersion,
                        factors: pred.factors ? JSON.stringify(pred.factors) : null,
                    },
                })
            }

            console.log(`   ✓ Saved predictions for ${match.homeTeam.name} vs ${match.awayTeam.name}`)
        } catch (error) {
            console.log(`   ⚠ Error generating prediction: ${error}`)
        }
    }

    console.log('   ✓ Predictions generated')
}

async function main() {
    console.log('\n🏆 Wettikon Prediction Update\n')
    console.log('=================================\n')

    try {
        await ensureMarkets()
        await syncTeams()
        await syncMatches()
        await generatePredictionsForMatches()

        console.log('\n=================================')
        console.log('✅ Update complete!\n')
    } catch (error) {
        console.error('\n❌ Error during update:', error)
        process.exit(1)
    }
}

main()
