'use client'

import { useState, useEffect } from 'react'
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils'
import { Plus, TrendingUp, TrendingDown, Target, DollarSign, Calendar } from 'lucide-react'

interface Bet {
    id: string
    bookmaker: string
    marketType: string
    selection: string
    odd: number
    stake: number
    status: string
    profit: number | null
    homeTeam: string | null
    awayTeam: string | null
    kickoff: string | null
    createdAt: string
}

interface Stats {
    totalBets: number
    totalStake: number
    totalProfit: number
    wonBets: number
    lostBets: number
    roi: number
    hitRate: number
}

export default function BetsPage() {
    const [bets, setBets] = useState<Bet[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newBet, setNewBet] = useState({
        bookmaker: 'Tipico',
        marketType: '1X2',
        selection: 'Home',
        odd: '',
        stake: '',
        notes: '',
    })

    useEffect(() => {
        fetchBets()
    }, [])

    async function fetchBets() {
        try {
            const response = await fetch('/api/bets')
            const data = await response.json()
            setBets(data)
        } catch (error) {
            console.error('Error fetching bets:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleAddBet(e: React.FormEvent) {
        e.preventDefault()
        try {
            const response = await fetch('/api/bets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBet),
            })

            if (response.ok) {
                setShowAddForm(false)
                setNewBet({
                    bookmaker: 'Tipico',
                    marketType: '1X2',
                    selection: 'Home',
                    odd: '',
                    stake: '',
                    notes: '',
                })
                fetchBets()
            }
        } catch (error) {
            console.error('Error adding bet:', error)
        }
    }

    async function handleUpdateStatus(betId: string, status: string) {
        try {
            const response = await fetch(`/api/bets/${betId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })

            if (response.ok) {
                fetchBets()
            }
        } catch (error) {
            console.error('Error updating bet:', error)
        }
    }

    const openBets = bets.filter(b => b.status === 'OPEN')
    const settledBets = bets.filter(b => b.status !== 'OPEN')
    const totalProfit = settledBets.reduce((sum, b) => sum + (b.profit || 0), 0)

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Meine Wetten</h1>
                    <p className="text-muted-foreground">Verfolge deine Wetten und Performance</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Wette hinzufügen
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-primary" />
                        <span className="text-sm text-muted-foreground">Gesamteinsatz</span>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(bets.reduce((sum, b) => sum + b.stake, 0))}</p>
                </div>

                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        {totalProfit >= 0 ? (
                            <TrendingUp className="w-5 h-5 text-success" />
                        ) : (
                            <TrendingDown className="w-5 h-5 text-danger" />
                        )}
                        <span className="text-sm text-muted-foreground">Gesamtgewinn</span>
                    </div>
                    <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(totalProfit)}
                    </p>
                </div>

                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-secondary" />
                        <span className="text-sm text-muted-foreground">ROI</span>
                    </div>
                    <p className="text-2xl font-bold">
                        {bets.length > 0 ? (((totalProfit / bets.reduce((sum, b) => sum + b.stake, 0)) * 100)).toFixed(1) : 0}%
                    </p>
                </div>

                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">Gewonnen/Verloren</span>
                    </div>
                    <p className="text-2xl font-bold">
                        <span className="text-success">{settledBets.filter(b => b.status === 'WON').length}</span>
                        {' / '}
                        <span className="text-danger">{settledBets.filter(b => b.status === 'LOST').length}</span>
                    </p>
                </div>
            </div>

            {/* Add Bet Form */}
            {showAddForm && (
                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-4">Neue Wette</h2>
                    <form onSubmit={handleAddBet} className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Buchmacher</label>
                            <select
                                value={newBet.bookmaker}
                                onChange={(e) => setNewBet({ ...newBet, bookmaker: e.target.value })}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2"
                            >
                                <option value="Tipico">Tipico</option>
                                <option value="Bet365">Bet365</option>
                                <option value="bwin">bwin</option>
                                <option value="Betano">Betano</option>
                                <option value="Oddset">Oddset</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Markt</label>
                            <select
                                value={newBet.marketType}
                                onChange={(e) => setNewBet({ ...newBet, marketType: e.target.value })}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2"
                            >
                                <option value="1X2">1X2</option>
                                <option value="OVER_UNDER">Über/Unter</option>
                                <option value="BTTS">Beide Teams treffen</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Tipp</label>
                            <select
                                value={newBet.selection}
                                onChange={(e) => setNewBet({ ...newBet, selection: e.target.value })}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2"
                            >
                                <option value="Home">Heimsieg</option>
                                <option value="Draw">Remis</option>
                                <option value="Away">Auswärtssieg</option>
                                <option value="Over2.5">Über 2.5 Tore</option>
                                <option value="Under2.5">Unter 2.5 Tore</option>
                                <option value="Yes">Ja</option>
                                <option value="No">Nein</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Quote</label>
                            <input
                                type="number"
                                step="0.01"
                                value={newBet.odd}
                                onChange={(e) => setNewBet({ ...newBet, odd: e.target.value })}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2"
                                placeholder="2.50"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Einsatz (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={newBet.stake}
                                onChange={(e) => setNewBet({ ...newBet, stake: e.target.value })}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2"
                                placeholder="50"
                                required
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <button type="submit" className="btn-primary flex-1">
                                Wette speichern
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="btn-outline"
                            >
                                Abbrechen
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Open Bets */}
            {openBets.length > 0 && (
                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-4">Offene Wetten</h2>
                    <div className="space-y-3">
                        {openBets.map((bet) => (
                            <div key={bet.id} className="bg-background/50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <span className="font-medium">{bet.homeTeam || 'Team 1'} vs {bet.awayTeam || 'Team 2'}</span>
                                        <div className="text-sm text-muted-foreground">
                                            {bet.bookmaker} • {bet.marketType} • {bet.selection} @ {bet.odd}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{formatCurrency(bet.stake)}</p>
                                        <span className="badge bg-primary/20 text-primary border-primary/30">Offen</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUpdateStatus(bet.id, 'WON')}
                                        className="flex-1 py-2 rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors"
                                    >
                                        Gewonnen
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(bet.id, 'LOST')}
                                        className="flex-1 py-2 rounded-lg bg-danger/20 text-danger hover:bg-danger/30 transition-colors"
                                    >
                                        Verloren
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(bet.id, 'VOID')}
                                        className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                                    >
                                        Storniert
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Settled Bets */}
            <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Abgeschlossene Wetten</h2>

                {settledBets.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Keine abgeschlossenen Wetten</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-muted-foreground border-b border-border">
                                    <th className="pb-3 font-medium">Datum</th>
                                    <th className="pb-3 font-medium">Spiel</th>
                                    <th className="pb-3 font-medium">Markt</th>
                                    <th className="pb-3 font-medium">Tipp</th>
                                    <th className="pb-3 font-medium">Quote</th>
                                    <th className="pb-3 font-medium">Einsatz</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Gewinn</th>
                                </tr>
                            </thead>
                            <tbody>
                                {settledBets.map((bet) => (
                                    <tr key={bet.id} className="border-b border-border/50 hover:bg-background/50">
                                        <td className="py-4 text-sm text-muted-foreground">
                                            {bet.createdAt ? new Date(bet.createdAt).toLocaleDateString('de-DE') : '-'}
                                        </td>
                                        <td className="py-4 font-medium">
                                            {bet.homeTeam || '-'} vs {bet.awayTeam || '-'}
                                        </td>
                                        <td className="py-4 text-sm">{bet.marketType}</td>
                                        <td className="py-4">
                                            <span className="badge bg-primary/20 text-primary border-primary/30">
                                                {bet.selection}
                                            </span>
                                        </td>
                                        <td className="py-4 font-medium">{bet.odd.toFixed(2)}</td>
                                        <td className="py-4">{formatCurrency(bet.stake)}</td>
                                        <td className="py-4">
                                            <span className={`badge ${bet.status === 'WON' ? 'badge-success' :
                                                    bet.status === 'LOST' ? 'badge-danger' :
                                                        'bg-muted text-muted-foreground'
                                                }`}>
                                                {bet.status === 'WON' ? 'Gewonnen' :
                                                    bet.status === 'LOST' ? 'Verloren' : 'Storniert'}
                                            </span>
                                        </td>
                                        <td className="py-4 font-medium">
                                            {bet.profit !== null ? (
                                                <span className={bet.profit >= 0 ? 'text-success' : 'text-danger'}>
                                                    {formatCurrency(bet.profit)}
                                                </span>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
