import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const limit = parseInt(searchParams.get('limit') || '20')

        const where: any = {}

        if (status) {
            if (status === 'live') {
                where.status = { in: ['LIVE', 'HALFTIME'] }
            } else if (status === 'upcoming') {
                where.status = 'SCHEDULED'
                where.kickoff = { gte: new Date() }
            } else if (status === 'finished') {
                where.status = 'FINISHED'
            } else {
                where.status = status
            }
        }

        const matches = await prisma.match.findMany({
            where,
            orderBy: { kickoff: status === 'upcoming' ? 'asc' : 'desc' },
            take: limit,
            include: {
                homeTeam: true,
                awayTeam: true,
                predictions: {
                    include: {
                        market: true,
                    },
                },
                odds: {
                    include: {
                        bookmaker: true,
                    },
                    orderBy: { odd: 'desc' },
                },
            },
        })

        return NextResponse.json(matches)
    } catch (error) {
        console.error('Error fetching matches:', error)
        return NextResponse.json({ error: 'Fehler beim Laden der Spiele' }, { status: 500 })
    }
}
