import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
        }

        const body = await request.json()
        const { status, result } = body

        const bet = await prisma.bet.findFirst({
            where: { id: params.id, userId: user.id },
        })

        if (!bet) {
            return NextResponse.json({ error: 'Wette nicht gefunden' }, { status: 404 })
        }

        // Calculate profit
        let profit = null
        if (status === 'WON') {
            profit = (bet.odd - 1) * bet.stake
        } else if (status === 'LOST') {
            profit = -bet.stake
        }

        const updatedBet = await prisma.bet.update({
            where: { id: params.id },
            data: {
                status,
                result,
                profit,
                settledAt: new Date(),
            },
        })

        // Update user stats
        if (profit !== null) {
            const userStats = await prisma.userStats.findUnique({
                where: { userId: user.id },
            })

            if (userStats) {
                const wonBets = status === 'WON' ? userStats.wonBets + 1 : userStats.wonBets
                const lostBets = status === 'LOST' ? userStats.lostBets + 1 : userStats.lostBets
                const voidBets = status === 'VOID' ? userStats.voidBets + 1 : userStats.voidBets

                await prisma.userStats.update({
                    where: { userId: user.id },
                    data: {
                        totalProfit: { increment: profit },
                        wonBets,
                        lostBets,
                        voidBets,
                        roi: (((userStats.totalProfit + profit) / (userStats.totalStake || 1)) * 100),
                        hitRate: wonBets / (wonBets + lostBets) || 0,
                    },
                })
            }
        }

        return NextResponse.json(updatedBet)
    } catch (error) {
        console.error('Error updating bet:', error)
        return NextResponse.json({ error: 'Fehler beim Aktualisieren der Wette' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
        }

        const bet = await prisma.bet.findFirst({
            where: { id: params.id, userId: user.id },
        })

        if (!bet) {
            return NextResponse.json({ error: 'Wette nicht gefunden' }, { status: 404 })
        }

        await prisma.bet.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ message: 'Wette gelöscht' })
    } catch (error) {
        console.error('Error deleting bet:', error)
        return NextResponse.json({ error: 'Fehler beim Löschen der Wette' }, { status: 500 })
    }
}
