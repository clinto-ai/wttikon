import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

export function formatDate(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

export function formatTime(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function formatDateTime(date: Date | string): string {
    return `${formatDate(date)} ${formatTime(date)}`
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount)
}

export function formatPercent(value: number, decimals = 1): string {
    return `${(value * 100).toFixed(decimals)}%`
}

export function formatNumber(value: number, decimals = 2): string {
    return value.toFixed(decimals)
}

export function getMatchStatus(status: string): { label: string; color: string } {
    switch (status) {
        case 'SCHEDULED':
            return { label: 'Geplant', color: 'text-muted-foreground' }
        case 'LIVE':
            return { label: 'Live', color: 'text-success' }
        case 'HALFTIME':
            return { label: 'Halbzeit', color: 'text-warning' }
        case 'FINISHED':
            return { label: 'Beendet', color: 'text-muted-foreground' }
        case 'POSTPONED':
            return { label: 'Verlegt', color: 'text-danger' }
        case 'CANCELLED':
            return { label: 'Abgesagt', color: 'text-danger' }
        default:
            return { label: status, color: 'text-muted-foreground' }
    }
}

export function getBetResultColor(result: string): string {
    switch (result) {
        case 'WON':
            return 'text-success'
        case 'LOST':
            return 'text-danger'
        case 'VOID':
            return 'text-muted-foreground'
        case 'HALF_WON':
            return 'text-success'
        case 'HALF_LOST':
            return 'text-danger'
        default:
            return 'text-primary'
    }
}

export function calculateROI(stake: number, profit: number): number {
    if (stake === 0) return 0
    return (profit / stake) * 100
}

export function calculateYield(stake: number, profit: number): number {
    if (stake === 0) return 0
    return (profit / stake) * 100
}

export function calculateHitRate(won: number, total: number): number {
    if (total === 0) return 0
    return won / total
}

export function getValueBadge(value: number): { label: string; color: string } {
    if (value >= 15) {
        return { label: '🔥 Starkes Value', color: 'bg-success/20 text-success border-success' }
    } else if (value >= 8) {
        return { label: '⭐ Gutes Value', color: 'bg-primary/20 text-primary border-primary' }
    } else if (value >= 3) {
        return { label: '✓ Value', color: 'bg-warning/20 text-warning border-warning' }
    } else {
        return { label: ' Niedrig', color: 'bg-muted text-muted-foreground border-border' }
    }
}

export function getConfidenceBadge(confidence: number): { label: string; color: string } {
    if (confidence >= 0.8) {
        return { label: 'Sehr hoch', color: 'bg-success/20 text-success' }
    } else if (confidence >= 0.6) {
        return { label: 'Hoch', color: 'bg-primary/20 text-primary' }
    } else if (confidence >= 0.4) {
        return { label: 'Mittel', color: 'bg-warning/20 text-warning' }
    } else {
        return { label: 'Niedrig', color: 'bg-muted text-muted-foreground' }
    }
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim()
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 15)
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
        const groupKey = String(item[key])
        if (!result[groupKey]) {
            result[groupKey] = []
        }
        result[groupKey].push(item)
        return result
    }, {} as Record<string, T[]>)
}
