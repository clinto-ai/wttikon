import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
        }

        const bets = await prisma.bet.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                match: {
                    include: {
                        homeTeam: true,
                        awayTeam: true,
                    },
                },
            },
        })

        return NextResponse.json(bets)
    } catch (error) {
        console.error('Error fetching bets:', error)
        return NextResponse.json({ error: 'Fehler beim Laden der Wetten' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
        }

        const body = await request.json()
        const { matchId, bookmaker, marketType, selection, odd, stake, notes } = body

        if (!bookmaker || !marketType || !selection || !odd || !stake) {
            return NextResponse.json(
                { error: 'Bitte fülle alle Pflichtfelder aus' },
                { status: 400 }
            )
        }

        // Get match info if matchId provided
        let match = null
        if (matchId) {
            match = await prisma.match.findUnique({
                where: { id: matchId },
                include: {
                    homeTeam: true,
                    awayTeam: true,
                },
            })
        }

        const bet = await prisma.bet.create({
            data: {
                userId: user.id,
                matchId,
                bookmaker,
                marketType,
                selection,
                odd: parseFloat(odd),
                stake: parseFloat(stake),
                status: 'OPEN',
                notes,
                homeTeam: match?.homeTeam.name,
                awayTeam: match?.awayTeam.name,
                kickoff: match?.kickoff,
            },
        })

        // Update user stats
        await prisma.userStats.update({
            where: { userId: user.id },
            data: {
                totalBets: { increment: 1 },
                totalStake: { increment: parseFloat(stake) },
            },
        })

        return NextResponse.json(bet)
    } catch (error) {
        console.error('Error creating bet:', error)
        return NextResponse.json({ error: 'Fehler beim Erstellen der Wette' }, { status: 500 })
    }
}
