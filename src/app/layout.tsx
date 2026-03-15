import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Wettikon - Bundesliga Betting Analysis',
    description: 'Moderne Bundesliga-Wettanalysen mit datengetriebenen Prognosen, Value-Bet-Erkennung und Live-Tracking.',
    keywords: ['Bundesliga', 'Wetten', 'Prognosen', 'Value Bets', 'Sportwetten', 'Fussball'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="de" className="dark">
            <body className="bg-background text-foreground antialiased">
                <div className="min-h-screen bg-background">
                    {children}
                </div>
            </body>
        </html>
    )
}
