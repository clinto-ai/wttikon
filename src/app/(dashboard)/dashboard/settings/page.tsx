'use client'

import { useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { Settings as SettingsIcon, User, Bell, Shield, Database } from 'lucide-react'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile')

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-2">Einstellungen</h1>
                <p className="text-muted-foreground">Verwalte dein Konto und die App-Einstellungen</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="lg:w-64 space-y-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'profile'
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <User className="w-5 h-5" />
                        <span>Profil</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'notifications'
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Bell className="w-5 h-5" />
                        <span>Benachrichtigungen</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'security'
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Shield className="w-5 h-5" />
                        <span>Sicherheit</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('data')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'data'
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Database className="w-5 h-5" />
                        <span>Daten</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <div className="glass-card rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-6">Profilinformationen</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Benutzername</label>
                                    <input
                                        type="text"
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2"
                                        placeholder="Dein Benutzername"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">E-Mail</label>
                                    <input
                                        type="email"
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2"
                                        placeholder="deine@email.de"
                                    />
                                </div>
                                <button className="btn-primary">
                                    Änderungen speichern
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="glass-card rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-6">Benachrichtigungseinstellungen</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div>
                                        <p className="font-medium">Value Bet Alerts</p>
                                        <p className="text-sm text-muted-foreground">Erhalte eine Benachrichtigung bei neuen Value Bets</p>
                                    </div>
                                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div>
                                        <p className="font-medium">Live-Spielstände</p>
                                        <p className="text-sm text-muted-foreground">Benachrichtigungen bei Toren und Halbzeit</p>
                                    </div>
                                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="font-medium">Wett-Ergebnisse</p>
                                        <p className="text-sm text-muted-foreground">Info wenn eine Wette gewonnen/verloren wurde</p>
                                    </div>
                                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="glass-card rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-6">Sicherheitseinstellungen</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Aktuelles Passwort</label>
                                    <input
                                        type="password"
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Neues Passwort</label>
                                    <input
                                        type="password"
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Neues Passwort bestätigen</label>
                                    <input
                                        type="password"
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button className="btn-primary">
                                    Passwort ändern
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'data' && (
                        <div className="glass-card rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-6">Datenverwaltung</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-background/50 rounded-lg">
                                    <p className="font-medium mb-2">Daten exportieren</p>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Lade alle deine Wetten und Daten als CSV herunter
                                    </p>
                                    <button className="btn-outline">
                                        Exportieren
                                    </button>
                                </div>
                                <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg">
                                    <p className="font-medium text-danger mb-2">Daten löschen</p>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Lösche alle deine Wetten und persönlichen Daten dauerhaft
                                    </p>
                                    <button className="bg-danger/20 text-danger px-4 py-2 rounded-lg hover:bg-danger/30 transition-colors">
                                        Alles löschen
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
