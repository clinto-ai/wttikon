import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create markets
    const markets = await Promise.all([
        prisma.market.upsert({
            where: { name: '1X2' },
            update: {},
            create: { name: '1X2', description: 'Sieg/Unentschieden/Niederlage' },
        }),
        prisma.market.upsert({
            where: { name: 'OVER_UNDER' },
            update: {},
            create: { name: 'OVER_UNDER', description: 'Über/Unter Tore' },
        }),
        prisma.market.upsert({
            where: { name: 'BTTS' },
            update: {},
            create: { name: 'BTTS', description: 'Beide Teams treffen' },
        }),
        prisma.market.upsert({
            where: { name: 'ASIAN_HANDICAP' },
            update: {},
            create: { name: 'ASIAN_HANDICAP', description: 'Asiatisches Handicap' },
        }),
        prisma.market.upsert({
            where: { name: 'DRAW_NO_BET' },
            update: {},
            create: { name: 'DRAW_NO_BET', description: 'Unentschieden keine Wette' },
        }),
    ])
    console.log('✓ Markets created')

    // Create bookmakers
    const bookmakers = await Promise.all([
        prisma.bookmaker.upsert({
            where: { name: 'Tipico' },
            update: {},
            create: { name: 'Tipico' },
        }),
        prisma.bookmaker.upsert({
            where: { name: 'Bet365' },
            update: {},
            create: { name: 'Bet365' },
        }),
        prisma.bookmaker.upsert({
            where: { name: 'bwin' },
            update: {},
            create: { name: 'bwin' },
        }),
        prisma.bookmaker.upsert({
            where: { name: 'Betano' },
            update: {},
            create: { name: 'Betano' },
        }),
        prisma.bookmaker.upsert({
            where: { name: 'Oddset' },
            update: {},
            create: { name: 'Oddset' },
        }),
        prisma.bookmaker.upsert({
            where: { name: 'Interwetten' },
            update: {},
            create: { name: 'Interwetten' },
        }),
        prisma.bookmaker.upsert({
            where: { name: 'LeoVegas' },
            update: {},
            create: { name: 'LeoVegas' },
        }),
    ])
    console.log('✓ Bookmakers created')

    // Create Bundesliga teams
    const teams = await Promise.all([
        prisma.team.upsert({
            where: { externalId: 1 },
            update: {},
            create: { externalId: 1, name: 'Bayern München', shortName: 'FCB', country: 'Germany', league: 'Bundesliga' },
        }),
        prisma.team.upsert({
            where: { externalId: 2 },
            update: {},
            create: { externalId: 2, name: 'Borussia Dortmund', shortName: 'BVB', country: 'Germany', league: 'Bundesliga' },
        }),
        prisma.team.upsert({
            where: { externalId: 3 },
            update: {},
            create: { externalId: 3, name: 'RB Leipzig', shortName: 'RBL', country: 'Germany', league: 'Bundesliga' },
        }),
        prisma.team.upsert({
            where: { externalId: 4 },
            update: {},
            create: { externalId: 4, name: 'Bayer Leverkusen', shortName: 'B04', country: 'Germany', league: 'Bundesliga' },
        }),
        prisma.team.upsert({
            where: { externalId: 5 },
            update: {},
            create: { externalId: 5, name: 'Eintracht Frankfurt', shortName: 'SGE', country: 'Germany', league: 'Bundesliga' },
        }),
        prisma.team.upsert({
            where: { externalId: 6 },
            update: {},
            create: { externalId: 6, name: 'VfL Wolfsburg', shortName: 'WOB', country: 'Germany', league: 'Bundesliga' },
        }),
        prisma.team.upsert({
            where: { externalId: 7 },
            update: {},
            create: { externalId: 7, name: 'SC Freiburg', shortName: 'SCF', country: 'Germany', league: 'Bundesliga' },
        }),
        prisma.team.upsert({
            where: { externalId: 8 },
            update: {},
            create: { externalId: 8, name: '1. FC Union Berlin', shortName: 'FCU', country: 'Germany', league: 'Bundesliga' },
        }),
        prisma.team.upsert({
            where: { externalId: 9 },
            update: {},
            create: { externalId: 9, name: 'VfB Stuttgart', shortName: 'VFB', country: 'Germany', league: 'Bundesliga' },
        }),
        prisma.team.upsert({
            where: { externalId: 10 },
            update: {},
            create: { externalId: 10, name: 'Borussia Mönchengladbach', shortName: 'BMG', country: 'Germany', league: 'Bundesliga' },
        }),
        prisma.team.upsert({
            where: { externalId: 11 },
            update: {},
            create: { externalId: 11, name: 'FC Augsburg', shortName: 'FCA', country: 'Germany', league: 'Bundesliga' },
        }),
        prisma.team.upsert({
            where: { externalId: 12 },
            update: {},
            create: { externalId: 12, name: 'Hertha BSC', shortName: 'HBSC', country: 'Germany', league: 'Bundesliga' },
        }),
        prisma.team.upsert({
            where: { externalId: 13 },
            update: {},
            create: { externalId: 13, name: 'TSG Hoffenheim', shortName: 'TSG', country: 'Germany', league: 'Bundesliga' },
        }),
        prisma.team.upsert({
            where: { externalId: 14 },
            update: {},
            create: { externalId: 14, name: '1. FSV Mainz 05', shortName: 'M05', country: 'Germany', league: 'Bundesliga' },
        }),
        prisma.team.upsert({
            where: { externalId: 15 },
            update: {},
            create: { externalId: 15, name: 'VfL Bochum', shortName: 'BOC', country: 'Germany', league: 'Bundesliga' },
        }),
        prisma.team.upsert({
            where: { externalId: 16 },
            update: {},
            create: { externalId: 16, name: 'SV Darmstadt 98', shortName: 'DAR', country: 'Germany', league: 'Bundesliga' },
        }),
        prisma.team.upsert({
            where: { externalId: 17 },
            update: {},
            create: { externalId: 17, name: '1. FC Köln', shortName: 'FCK', country: 'Germany', league: 'Bundesliga' },
        }),
        prisma.team.upsert({
            where: { externalId: 18 },
            update: {},
            create: { externalId: 18, name: 'SV Werder Bremen', shortName: 'WER', country: 'Germany', league: 'Bundesliga' },
        }),
    ])
    console.log('✓ Teams created')

    // Create demo user
    const passwordHash = await bcrypt.hash('demo123', 12)
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@wettikon.de' },
        update: {},
        create: {
            email: 'demo@wettikon.de',
            username: 'DemoUser',
            passwordHash,
        },
    })
    console.log('✓ Demo user created')

    // Create user stats
    await prisma.userStats.upsert({
        where: { userId: demoUser.id },
        update: {},
        create: {
            userId: demoUser.id,
            totalBets: 47,
            totalStake: 2350,
            totalProfit: 287.5,
            wonBets: 28,
            lostBets: 17,
            voidBets: 2,
            roi: 12.23,
            yield: 12.23,
            hitRate: 0.622,
            avgOdd: 2.15,
            avgStake: 50,
        },
    })
    console.log('✓ User stats created')

    // Create some demo matches with predictions
    const allTeams = await prisma.team.findMany()
    const market1X2 = markets.find(m => m.name === '1X2')!
    const marketOU = markets.find(m => m.name === 'OVER_UNDER')!
    const marketBTTS = markets.find(m => m.name === 'BTTS')!
    const bookmakerTipico = bookmakers.find(b => b.name === 'Tipico')!
    const bookmakerBet365 = bookmakers.find(b => b.name === 'Bet365')!

    // Create upcoming matches
    const upcomingMatches = [
        { home: allTeams[0], away: allTeams[1], date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) }, // Bayern vs Dortmund
        { home: allTeams[2], away: allTeams[3], date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) }, // Leipzig vs Leverkusen
        { home: allTeams[4], away: allTeams[5], date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) }, // Frankfurt vs Wolfsburg
        { home: allTeams[6], away: allTeams[7], date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) }, // Freiburg vs Union
        { home: allTeams[8], away: allTeams[9], date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) }, // Stuttgart vs Gladbach
    ]

    for (const match of upcomingMatches) {
        const createdMatch = await prisma.match.upsert({
            where: { externalId: Math.random() * 100000 },
            update: {},
            create: {
                externalId: Math.floor(Math.random() * 100000),
                league: 'Bundesliga',
                season: '2024/25',
                matchday: 25,
                kickoff: match.date,
                status: 'SCHEDULED',
                homeTeamId: match.home.id,
                awayTeamId: match.away.id,
            },
        })

        // Create predictions
        const homeWinProb = 0.35 + Math.random() * 0.3
        const drawProb = 0.2 + Math.random() * 0.15
        const awayWinProb = 1 - homeWinProb - drawProb

        await prisma.prediction.upsert({
            where: {
                matchId_marketId_selection: {
                    matchId: createdMatch.id,
                    marketId: market1X2.id,
                    selection: 'Home',
                },
            },
            update: {},
            create: {
                matchId: createdMatch.id,
                marketId: market1X2.id,
                selection: 'Home',
                predictedProb: homeWinProb,
                fairOdd: 1 / homeWinProb,
                confidence: 0.6 + Math.random() * 0.25,
                valuePercent: (Math.random() - 0.3) * 20,
                modelVersion: 'v1',
            },
        })

        await prisma.prediction.upsert({
            where: {
                matchId_marketId_selection: {
                    matchId: createdMatch.id,
                    marketId: market1X2.id,
                    selection: 'Draw',
                },
            },
            update: {},
            create: {
                matchId: createdMatch.id,
                marketId: market1X2.id,
                selection: 'Draw',
                predictedProb: drawProb,
                fairOdd: 1 / drawProb,
                confidence: 0.5 + Math.random() * 0.2,
                valuePercent: (Math.random() - 0.5) * 15,
                modelVersion: 'v1',
            },
        })

        await prisma.prediction.upsert({
            where: {
                matchId_marketId_selection: {
                    matchId: createdMatch.id,
                    marketId: market1X2.id,
                    selection: 'Away',
                },
            },
            update: {},
            create: {
                matchId: createdMatch.id,
                marketId: market1X2.id,
                selection: 'Away',
                predictedProb: awayWinProb,
                fairOdd: 1 / awayWinProb,
                confidence: 0.6 + Math.random() * 0.25,
                valuePercent: (Math.random() - 0.3) * 20,
                modelVersion: 'v1',
            },
        })

        // Create odds
        const homeOdd = 1.8 + Math.random() * 0.8
        const drawOdd = 3.0 + Math.random() * 1.0
        const awayOdd = 2.5 + Math.random() * 1.5

        await prisma.odds.create({
            data: {
                matchId: createdMatch.id,
                bookmakerId: bookmakerTipico.id,
                marketId: market1X2.id,
                selection: 'Home',
                odd: homeOdd,
            },
        })

        await prisma.odds.create({
            data: {
                matchId: createdMatch.id,
                bookmakerId: bookmakerTipico.id,
                marketId: market1X2.id,
                selection: 'Draw',
                odd: drawOdd,
            },
        })

        await prisma.odds.create({
            data: {
                matchId: createdMatch.id,
                bookmakerId: bookmakerTipico.id,
                marketId: market1X2.id,
                selection: 'Away',
                odd: awayOdd,
            },
        })

        await prisma.odds.create({
            data: {
                matchId: createdMatch.id,
                bookmakerId: bookmakerBet365.id,
                marketId: market1X2.id,
                selection: 'Home',
                odd: homeOdd - 0.05,
            },
        })

        await prisma.odds.create({
            data: {
                matchId: createdMatch.id,
                bookmakerId: bookmakerBet365.id,
                marketId: market1X2.id,
                selection: 'Draw',
                odd: drawOdd + 0.1,
            },
        })

        await prisma.odds.create({
            data: {
                matchId: createdMatch.id,
                bookmakerId: bookmakerBet365.id,
                marketId: market1X2.id,
                selection: 'Away',
                odd: awayOdd + 0.05,
            },
        })
    }

    // Create Elo ratings for teams
    for (const team of allTeams) {
        await prisma.eloRating.upsert({
            where: {
                id: team.id,
            },
            update: {},
            create: {
                teamId: team.id,
                rating: 1400 + Math.random() * 300,
                homeRating: 1450 + Math.random() * 250,
                awayRating: 1350 + Math.random() * 250,
                season: '2024/25',
            },
        })
    }
    console.log('✓ Elo ratings created')

    console.log('✅ Seeding completed!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
