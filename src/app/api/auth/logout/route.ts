import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth-token')?.value

        if (token) {
            await deleteSession(token)
        }

        cookieStore.delete('auth-token')

        return NextResponse.json({ message: 'Erfolgreich abgemeldet' })
    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json(
            { error: 'Ein Fehler ist aufgetreten' },
            { status: 500 }
        )
    }
}
