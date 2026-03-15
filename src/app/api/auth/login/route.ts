import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { verifyPassword, createToken, createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Bitte E-Mail und Passwort eingeben' },
                { status: 400 }
            )
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Ungültige Anmeldedaten' },
                { status: 401 }
            )
        }

        // Verify password
        const isValid = await verifyPassword(password, user.passwordHash)

        if (!isValid) {
            return NextResponse.json(
                { error: 'Ungültige Anmeldedaten' },
                { status: 401 }
            )
        }

        // Create session
        const token = await createSession(user.id)

        // Set cookie
        const cookieStore = await cookies()
        cookieStore.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        })

        return NextResponse.json({
            message: 'Erfolgreich angemeldet',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            },
        })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Ein Fehler ist aufgetreten' },
            { status: 500 }
        )
    }
}
