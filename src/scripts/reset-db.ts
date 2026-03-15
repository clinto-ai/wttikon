// Reset Database Script - Clear demo data and reset stats

import { prisma } from '../lib/db'

async function main() {
    console.log('🔄 Resetting database...\n')

    // Delete all demo bets
    const deletedBets = await prisma.bet.deleteMany({})
    console.log(`✓ Deleted ${deletedBets.count} demo bets`)

    // Delete all sessions
    const deletedSessions = await prisma.session.deleteMany({})
    console.log(`✓ Deleted ${deletedSessions.count} sessions`)

    // Delete all user stats
    const deletedStats = await prisma.userStats.deleteMany({})
    console.log(`✓ Deleted ${deletedStats.count} user stats`)

    // Delete all watchlist items
    const deletedWatchlist = await prisma.watchlist.deleteMany({})
    console.log(`✓ Deleted ${deletedWatchlist.count} watchlist items`)

    // Delete all predictions
    const deletedPredictions = await prisma.prediction.deleteMany({})
    console.log(`✓ Deleted ${deletedPredictions.count} predictions`)

    // Delete all matches
    const deletedMatches = await prisma.match.deleteMany({})
    console.log(`✓ Deleted ${deletedMatches.count} matches`)

    // Delete all Elo ratings
    const deletedElo = await prisma.eloRating.deleteMany({})
    console.log(`✓ Deleted ${deletedElo.count} Elo ratings`)

    // Delete all standings
    const deletedStandings = await prisma.standingsSnapshot.deleteMany({})
    console.log(`✓ Deleted ${deletedStandings.count} standings`)

    // Keep teams but reset external IDs
    const teams = await prisma.team.findMany()
    for (const team of teams) {
        await prisma.team.update({
            where: { id: team.id },
            data: { externalId: null }
        })
    }
    console.log(`✓ Reset ${teams.length} team external IDs`)

    // Delete demo user if exists
    const demoUser = await prisma.user.findFirst({
        where: { email: 'demo@wettikon.de' }
    })

    if (demoUser) {
        await prisma.user.delete({ where: { id: demoUser.id } })
        console.log('✓ Deleted demo user')
    }

    console.log('\n✅ Database reset complete!')
    console.log('\nNote: Keep the teams and markets - they will be re-populated when you run update-predictions')
}

main().catch(console.error)
