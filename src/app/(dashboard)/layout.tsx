import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
    TrendingUp,
    LayoutDashboard,
    Target,
    Zap,
    DollarSign,
    Settings,
    LogOut,
    Menu,
    X,
    Bell
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/matches', label: 'Spiele', icon: Target },
    { href: '/dashboard/value-bets', label: 'Value Bets', icon: TrendingUp },
    { href: '/dashboard/live', label: 'Live', icon: Zap },
    { href: '/dashboard/bets', label: 'Meine Wetten', icon: DollarSign },
    { href: '/dashboard/settings', label: 'Einstellungen', icon: Settings },
]

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar - Desktop */}
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border hidden lg:flex flex-col">
                {/* Logo */}
                <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold gradient-text">Wettikon</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-medium text-sm">{user.username}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                    <form action="/api/auth/logout" method="POST">
                        <button
                            type="submit"
                            className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Abmelden</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:ml-64">
                {/* Top header */}
                <header className="h-16 bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-40">
                    <div className="h-full px-4 lg:px-8 flex items-center justify-between">
                        <h1 className="text-lg font-semibold">Dashboard</h1>

                        <div className="flex items-center gap-4">
                            <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
