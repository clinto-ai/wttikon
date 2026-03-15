// Check Database Script

import { prisma } from '../lib/db'

async function main() {
    console.log('🔍 Checking database...\n')

    // Get matches with predictions
    const matches = await prisma.match.findMany({
        orderBy: { kickoff: 'desc' },
        take: 20,
        include: {
            homeTeam: true,
            awayTeam: true,
            predictions: true
        }
    })

    console.log('Recent Matches:')
    for (const m of matches) {
        console.log(`  ${m.kickoff.toISOString().split('T')[0]} | ${m.homeTeam.name} vs ${m.awayTeam.name} | ${m.status} | ${m.predictions.length} predictions`)
    }

    // Check upcoming scheduled matches
    const upcoming = await prisma.match.findMany({
        where: {
            status: 'SCHEDULED',
            kickoff: { gte: new Date() }
        },
        orderBy: { kickoff: 'asc' },
        take: 10,
        include: {
            homeTeam: true,
            awayTeam: true,
            predictions: true
        }
    })

    console.log('\nUpcoming Matches with Predictions:')
    for (const m of upcoming) {
        console.log(`  ${m.kickoff.toISOString().split('T')[0]} | ${m.homeTeam.name} vs ${m.awayTeam.name} | ${m.predictions.length} predictions`)
    }
}

main()
