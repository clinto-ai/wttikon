const API_BASE_URL = 'https://api.football-data.org/v4'
const API_KEY = process.env.FOOTBALL_DATA_API_KEY

export interface FootballApiResponse<T> {
    count: number
    results?: T[]
    matches?: MatchApi[]
    teams?: TeamApi[]
    standings?: StandingApi[]
}

export interface MatchApi {
    id: number
    competition: {
        id: number
        name: string
        country: string
        emblem: string
    }
    season: {
        id: number
        startDate: string
        endDate: string
        currentMatchday: number
    }
    homeTeam: {
        id: number
        name: string
        shortName: string
        tla: string
        crest: string
    }
    awayTeam: {
        id: number
        name: string
        shortName: string
        tla: string
        crest: string
    }
    score: {
        fullTime: {
            home: number | null
            away: number | null
        }
        halfTime: {
            home: number | null
            away: number | null
        }
    }
    status: string
    minute: number | null
    matchday: number
    group: string | null
    kickoff: {
        dateTime: string
        utcDate: string
        local: string
    }
}

export interface TeamApi {
    id: number
    name: string
    shortName: string
    tla: string
    crest: string
    venue: string
    country: string
}

export interface StandingApi {
    stage: string
    type: string
    group: string | null
    table: StandingEntry[]
}

export interface StandingEntry {
    position: number
    team: {
        id: number
        name: string
        shortName: string
        tla: string
        crest: string
    }
    playedGames: number
    won: number
    draw: number
    lost: number
    points: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
}

class FootballApiClient {
    public async fetch<T>(endpoint: string): Promise<T> {
        if (!API_KEY) {
            throw new Error('FOOTBALL_DATA_API_KEY not configured')
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'X-Auth-Token': API_KEY,
                'Content-Type': 'application/json',
            },
            next: { revalidate: 60 }, // Cache for 60 seconds
        })

        if (!response.ok) {
            throw new Error(`Football API error: ${response.status} ${response.statusText}`)
        }

        return response.json()
    }

    async getCompetitions() {
        return this.fetch<{ competitions: any[] }>('/competitions')
    }

    async getMatches(competitionCode: string, matchday?: number): Promise<MatchApi[]> {
        let endpoint = `/competitions/${competitionCode}/matches`
        if (matchday) {
            endpoint += `?matchday=${matchday}`
        }
        const data = await this.fetch<{ matches: MatchApi[] }>(endpoint)
        return data.matches || []
    }

    async getUpcomingMatches(competitionCode: string, limit = 10): Promise<MatchApi[]> {
        const today = new Date().toISOString().split('T')[0]
        const endpoint = `/competitions/${competitionCode}/matches?dateFrom=${today}&dateTo=${today}`
        const data = await this.fetch<{ matches: MatchApi[] }>(endpoint)
        return (data.matches || []).slice(0, limit)
    }

    async getMatch(matchId: number): Promise<MatchApi> {
        return this.fetch<MatchApi>(`/matches/${matchId}`)
    }

    async getTeam(teamId: number): Promise<TeamApi> {
        return this.fetch<TeamApi>(`/teams/${teamId}`)
    }

    async getTeams(competitionCode: string): Promise<TeamApi[]> {
        const data = await this.fetch<{ teams: TeamApi[] }>(`/competitions/${competitionCode}/teams`)
        return data.teams || []
    }

    async getStandings(competitionCode: string, matchday?: number): Promise<StandingApi[]> {
        let endpoint = `/competitions/${competitionCode}/standings`
        if (matchday) {
            endpoint += `?matchday=${matchday}`
        }
        const data = await this.fetch<{ standings: StandingApi[] }>(endpoint)
        return data.standings || []
    }

    async getTeamMatches(teamId: number, limit = 10): Promise<MatchApi[]> {
        const endpoint = `/teams/${teamId}/matches?limit=${limit}`
        const data = await this.fetch<{ matches: MatchApi[] }>(endpoint)
        return data.matches || []
    }

    async getHeadToHead(matchId: number): Promise<{ matches: MatchApi[] }> {
        return this.fetch<{ matches: MatchApi[] }>(`/matches/${matchId}/head2head`)
    }
}

export const footballApi = new FootballApiClient()

// Helper to get Bundesliga matches
export async function getBundesligaMatches(matchday?: number): Promise<MatchApi[]> {
    return footballApi.getMatches('BL1', matchday)
}

export async function getBundesligaUpcoming(limit = 10): Promise<MatchApi[]> {
    return footballApi.getUpcomingMatches('BL1', limit)
}

export async function getBundesligaTeams(): Promise<TeamApi[]> {
    return footballApi.getTeams('BL1')
}

export async function getBundesligaStandings(matchday?: number) {
    return footballApi.getStandings('BL1', matchday)
}
