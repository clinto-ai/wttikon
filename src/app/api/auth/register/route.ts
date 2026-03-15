import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, createToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, username, password } = body

        // Validation
        if (!email || !username || !password) {
            return NextResponse.json(
                { error: 'Bitte fülle alle Felder aus' },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'E-Mail oder Benutzername bereits vergeben' },
                { status: 400 }
            )
        }

        // Hash password and create user
        const passwordHash = await hashPassword(password)

        const user = await prisma.user.create({
            data: {
                email,
                username,
                passwordHash,
            },
        })

        // Create default user stats
        await prisma.userStats.create({
            data: {
                userId: user.id,
            },
        })

        // Create default markets
        const markets = await prisma.market.findMany()
        if (markets.length === 0) {
            await prisma.market.createMany({
                data: [
                    { name: '1X2', description: 'Sieg/Unentschieden/Niederlage' },
                    { name: 'OVER_UNDER', description: 'Über/Unter Tore' },
                    { name: 'BTTS', description: 'Beide Teams treffen' },
                    { name: 'ASIAN_HANDICAP', description: 'Asiatisches Handicap' },
                    { name: 'DRAW_NO_BET', description: 'Unentschieden keine Wette' },
                ],
            })
        }

        // Create default bookmakers
        const bookmakers = await prisma.bookmaker.findMany()
        if (bookmakers.length === 0) {
            await prisma.bookmaker.createMany({
                data: [
                    { name: 'Tipico' },
                    { name: 'Bet365' },
                    { name: 'bwin' },
                    { name: 'Betano' },
                    { name: 'Oddset' },
                    { name: 'Interwetten' },
                    { name: 'LeoVegas' },
                    { name: 'Unikrn' },
                ],
            })
        }

        return NextResponse.json({
            message: 'Konto erfolgreich erstellt',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            },
        })
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Ein Fehler ist aufgetreten' },
            { status: 500 }
        )
    }
}
