// Prediction Engine for Bundesliga Matches
// This implements multiple prediction models and combines them into an ensemble

import { prisma } from './db'
import { getMLPrediction } from './ml-predictions'

// Types
export interface PredictionInput {
    homeTeamId: string
    awayTeamId: string
    homeTeamName: string
    awayTeamName: string
    league: string
    season: string
    matchday: number
}

export interface PredictionOutput {
    matchId: string
    market: string
    selection: string
    probability: number
    fairOdd: number
    confidence: number
    valuePercent: number | null
    modelVersion: string
    factors: PredictionFactor[]
}

export interface PredictionFactor {
    name: string
    impact: number // -1 to 1
    description: string
}

export interface TeamFeatures {
    elo: number
    homeElo: number
    awayElo: number
    form: number // 0-1
    homeForm: number
    awayForm: number
    goalsScoredAvg: number
    goalsConcededAvg: number
    homeGoalsScoredAvg: number
    homeGoalsConcededAvg: number
    awayGoalsScoredAvg: number
    awayGoalsConcededAvg: number
    winRate: number
    homeWinRate: number
    awayWinRate: number
    drawRate: number
    cleanSheetRate: number
    failedToScoreRate: number
}

// Model Weights for Ensemble
const MODEL_WEIGHTS = {
    logistic: 0.15,
    randomForest: 0.20,
    poisson: 0.25,
    elo: 0.20,
    form: 0.20,
}

// ==================== FEATURE ENGINEERING ====================

async function getTeamFeatures(teamId: string, isHome: boolean): Promise<TeamFeatures> {
    // Get recent matches (last 10)
    const recentMatches = await prisma.match.findMany({
        where: {
            OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
            status: 'FINISHED',
        },
        orderBy: { kickoff: 'desc' },
        take: 10,
    })

    // Get Elo rating
    const elo = await prisma.eloRating.findFirst({
        where: { teamId },
        orderBy: { updatedAt: 'desc' },
    })

    // Calculate form (points from last 5 games)
    let formPoints = 0
    let formGames = 0
    for (let i = 0; i < Math.min(5, recentMatches.length); i++) {
        const match = recentMatches[i]
        const isHomeTeam = match.homeTeamId === teamId
        const scored = isHomeTeam ? match.homeScore! : match.awayScore!
        const conceded = isHomeTeam ? match.awayScore! : match.homeScore!

        if (scored > conceded) formPoints += 3
        else if (scored === conceded) formPoints += 1
        formGames++
    }
    const form = formGames > 0 ? formPoints / (formGames * 3) : 0.5

    // Calculate goals averages
    let goalsScored = 0
    let goalsConceded = 0
    let homeGoalsScored = 0
    let homeGoalsConceded = 0
    let awayGoalsScored = 0
    let awayGoalsConceded = 0
    let homeGames = 0
    let awayGames = 0
    let wins = 0
    let draws = 0
    let cleanSheets = 0
    let failedToScore = 0

    for (const match of recentMatches) {
        const isHomeTeam = match.homeTeamId === teamId
        const scored = isHomeTeam ? match.homeScore! : match.awayScore!
        const conceded = isHomeTeam ? match.awayScore! : match.homeScore!

        goalsScored += scored
        goalsConceded += conceded

        if (isHomeTeam) {
            homeGoalsScored += scored
            homeGoalsConceded += conceded
            homeGames++
        } else {
            awayGoalsScored += scored
            awayGoalsConceded += conceded
            awayGames++
        }

        if (scored > conceded) wins++
        else if (scored === conceded) draws++

        if (conceded === 0) cleanSheets++
        if (scored === 0) failedToScore++
    }

    const totalGames = recentMatches.length || 1

    return {
        elo: elo?.rating ?? 1500,
        homeElo: elo?.homeRating ?? 1500,
        awayElo: elo?.awayRating ?? 1500,
        form,
        homeForm: form, // Simplified
        awayForm: form, // Simplified
        goalsScoredAvg: goalsScored / totalGames,
        goalsConcededAvg: goalsConceded / totalGames,
        homeGoalsScoredAvg: homeGames > 0 ? homeGoalsScored / homeGames : 1.5,
        homeGoalsConcededAvg: homeGames > 0 ? homeGoalsConceded / homeGames : 1.5,
        awayGoalsScoredAvg: awayGames > 0 ? awayGoalsScored / awayGames : 1.2,
        awayGoalsConcededAvg: awayGames > 0 ? awayGoalsConceded / awayGames : 1.8,
        winRate: wins / totalGames,
        homeWinRate: homeGames > 0 ? (homeGoalsScored > homeGoalsConceded ? wins / homeGames : 0) : 0.5,
        awayWinRate: awayGames > 0 ? (awayGoalsScored > awayGoalsConceded ? wins / awayGames : 0) : 0.3,
        drawRate: draws / totalGames,
        cleanSheetRate: cleanSheets / totalGames,
        failedToScoreRate: failedToScore / totalGames,
    }
}

// ==================== LOGISTIC REGRESSION MODEL ====================

function logisticRegressionPrediction(homeFeatures: TeamFeatures, awayFeatures: TeamFeatures): { home: number; draw: number; away: number } {
    // Simple logistic regression approximation
    // Using key features to calculate win probabilities

    const homeAdvantage = 0.08 // ~8% home advantage

    // Calculate strength difference
    const eloDiff = (homeFeatures.elo - awayFeatures.elo) / 100
    const formDiff = homeFeatures.form - awayFeatures.form

    // Combined score
    const homeStrength = (eloDiff * 0.05 + formDiff * 0.5 + homeAdvantage)
    const awayStrength = -(eloDiff * 0.05 + formDiff * 0.5)

    // Convert to probabilities using softmax
    const expHome = Math.exp(homeStrength)
    const expDraw = Math.exp(0)
    const expAway = Math.exp(awayStrength)
    const total = expHome + expDraw + expAway

    return {
        home: expHome / total,
        draw: expDraw / total,
        away: expAway / total,
    }
}

// ==================== RANDOM FOREST MODEL ====================

function randomForestPrediction(homeFeatures: TeamFeatures, awayFeatures: TeamFeatures): { home: number; draw: number; away: number } {
    // Simplified Random Forest - uses decision tree ensemble approach
    // In production, this would be a trained ML model

    const predictions: number[] = []

    // Tree 1: Based on Elo ratings
    const eloWin = homeFeatures.elo > awayFeatures.elo ? 0.6 : 0.3
    predictions.push(eloWin)

    // Tree 2: Based on form
    const formWin = homeFeatures.form > awayFeatures.form ? 0.55 : 0.35
    predictions.push(formWin)

    // Tree 3: Based on goals scored
    const goalsWin = homeFeatures.goalsScoredAvg > awayFeatures.goalsScoredAvg ? 0.55 : 0.35
    predictions.push(goalsWin)

    // Tree 4: Home advantage
    const homeWin = homeFeatures.homeWinRate > awayFeatures.awayWinRate ? 0.55 : 0.35
    predictions.push(homeWin)

    // Tree 5: Defense
    const defenseWin = homeFeatures.goalsConcededAvg < awayFeatures.goalsConcededAvg ? 0.55 : 0.35
    predictions.push(defenseWin)

    // Average and normalize
    const avgWin = predictions.reduce((a, b) => a + b, 0) / predictions.length

    // Calculate draw probability (inverse of win difference)
    const winDiff = Math.abs(homeFeatures.winRate - awayFeatures.winRate)
    const drawProb = 0.25 + (1 - winDiff) * 0.1 // 25-35% draw chance

    const homeProb = (avgWin + homeFeatures.homeWinRate) / 2
    const awayProb = 1 - homeProb - drawProb

    return {
        home: Math.max(0.1, Math.min(0.8, homeProb)),
        draw: Math.max(0.1, Math.min(0.4, drawProb)),
        away: Math.max(0.1, Math.min(0.8, awayProb)),
    }
}

// ==================== POISSON MODEL ====================

function poissonPrediction(homeFeatures: TeamFeatures, awayFeatures: TeamFeatures): { home: number; draw: number; away: number } {
    // Calculate expected goals using Poisson distribution
    const homeGoals = (homeFeatures.homeGoalsScoredAvg + awayFeatures.awayGoalsConcededAvg) / 2
    const awayGoals = (awayFeatures.awayGoalsScoredAvg + homeFeatures.homeGoalsConcededAvg) / 2

    // Home advantage adjustment
    const adjustedHomeGoals = homeGoals * 1.1
    const adjustedAwayGoals = awayGoals * 0.95

    // Calculate probabilities for each scoreline
    let homeWins = 0
    let awayWins = 0
    let draws = 0

    // Calculate probability of home win, draw, away win
    for (let homeScore = 0; homeScore <= 6; homeScore++) {
        for (let awayScore = 0; awayScore <= 6; awayScore++) {
            const homeProb = poisson(adjustedHomeGoals, homeScore)
            const awayProb = poisson(adjustedAwayGoals, awayScore)
            const matchProb = homeProb * awayProb

            if (homeScore > awayScore) {
                homeWins += matchProb
            } else if (awayScore > homeScore) {
                awayWins += matchProb
            } else {
                draws += matchProb
            }
        }
    }

    const total = homeWins + awayWins + draws

    return {
        home: homeWins / total,
        draw: draws / total,
        away: awayWins / total,
    }
}

// Poisson probability mass function
function poisson(lambda: number, k: number): number {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k)
}

function factorial(n: number): number {
    if (n <= 1) return 1
    let result = 1
    for (let i = 2; i <= n; i++) {
        result *= i
    }
    return result
}

// ==================== ELO MODEL ====================

function eloPrediction(homeFeatures: TeamFeatures, awayFeatures: TeamFeatures): { home: number; draw: number; away: number } {
    // Elo-based prediction
    const homeElo = homeFeatures.homeElo
    const awayElo = awayFeatures.awayElo

    // Expected score using Elo formula
    const expectedHome = 1 / (1 + Math.pow(10, (awayElo - homeElo) / 400))
    const expectedAway = 1 - expectedHome

    // Convert to probabilities (home win, draw, away win)
    // Draw probability based on rating difference
    const ratingDiff = Math.abs(homeElo - awayElo)
    const drawProb = Math.max(0.15, Math.min(0.35, 0.25 - ratingDiff / 2000))

    // Adjust win probabilities
    const winProb = 1 - drawProb
    const homeProb = expectedHome * winProb
    const awayProb = expectedAway * winProb

    return {
        home: Math.max(0.1, Math.min(0.8, homeProb)),
        draw: drawProb,
        away: Math.max(0.1, Math.min(0.8, awayProb)),
    }
}

// ==================== FORM MODEL ====================

function formPrediction(homeFeatures: TeamFeatures, awayFeatures: TeamFeatures): { home: number; draw: number; away: number } {
    // Form-based prediction
    const homeForm = homeFeatures.form
    const awayForm = awayFeatures.form

    // Recent form weighting
    const homeWinProb = (homeForm * 0.7 + homeFeatures.homeWinRate * 0.3)
    const awayWinProb = (awayForm * 0.7 + awayFeatures.awayWinRate * 0.3)

    // Draw probability
    const drawProb = 0.28 // Average draw rate in Bundesliga

    // Normalize
    const totalWinProb = homeWinProb + awayWinProb
    const homeProb = (homeWinProb / totalWinProb) * (1 - drawProb)
    const awayProb = (awayWinProb / totalWinProb) * (1 - drawProb)

    return {
        home: Math.max(0.1, Math.min(0.8, homeProb)),
        draw: drawProb,
        away: Math.max(0.1, Math.min(0.8, awayProb)),
    }
}

// ==================== OVER/UNDER MODEL ====================

function overUnderPrediction(homeFeatures: TeamFeatures, awayFeatures: TeamFeatures): { over: number; under: number } {
    // Expected total goals
    const expectedGoals =
        (homeFeatures.homeGoalsScoredAvg + awayFeatures.awayGoalsScoredAvg +
            homeFeatures.homeGoalsConcededAvg + awayFeatures.awayGoalsConcededAvg) / 2

    // Calculate probability of over 2.5 goals
    // Using Poisson distribution
    let overProb = 0
    for (let total = 3; total <= 10; total++) {
        const lambda = expectedGoals
        overProb += poisson(lambda, total)
    }

    return {
        over: overProb,
        under: 1 - overProb,
    }
}

// ==================== BTTS MODEL ====================

function bttsPrediction(homeFeatures: TeamFeatures, awayFeatures: TeamFeatures): { yes: number; no: number } {
    // Calculate probability of both teams scoring
    const homeScoringProb = 1 - homeFeatures.failedToScoreRate
    const awayScoringProb = 1 - awayFeatures.failedToScoreRate

    // Adjust for home/away
    const homeAdjusted = homeScoringProb * 1.1
    const awayAdjusted = awayScoringProb * 0.95

    // BTTS probability
    const bttsYes = homeAdjusted * awayAdjusted
    const bttsNo = 1 - bttsYes

    return {
        yes: Math.max(0.2, Math.min(0.8, bttsYes)),
        no: Math.max(0.2, Math.min(0.8, bttsNo)),
    }
}

// ==================== MAIN PREDICTION FUNCTION ====================

export async function generatePredictions(matchId: string): Promise<PredictionOutput[]> {
    const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
            homeTeam: true,
            awayTeam: true,
        },
    })

    if (!match) {
        throw new Error('Match not found')
    }

    // Get team features
    const homeFeatures = await getTeamFeatures(match.homeTeamId, true)
    const awayFeatures = await getTeamFeatures(match.awayTeamId, false)

    // Generate predictions from each model
    const logisticPred = logisticRegressionPrediction(homeFeatures, awayFeatures)
    const rfPred = randomForestPrediction(homeFeatures, awayFeatures)
    const poissonPred = poissonPrediction(homeFeatures, awayFeatures)
    const eloPred = eloPrediction(homeFeatures, awayFeatures)
    const formPred = formPrediction(homeFeatures, awayFeatures)

    // Try to get ML prediction
    let mlPred: { home: number; draw: number; away: number } | null = null
    try {
        const mlResult = await getMLPrediction(match.homeTeamId, match.awayTeamId)
        if (mlResult) {
            mlPred = {
                home: mlResult.homeWin,
                draw: mlResult.draw,
                away: mlResult.awayWin,
            }
        }
    } catch (e) {
        // ML model not available, continue without it
    }

    // Ensemble prediction (weighted average)
    let ensemble: { home: number; draw: number; away: number }

    if (mlPred) {
        // Include ML model in ensemble
        const mlWeight = 0.25
        const remainingWeight = 1 - mlWeight
        ensemble = {
            home: mlPred.home * mlWeight +
                (logisticPred.home * MODEL_WEIGHTS.logistic +
                    rfPred.home * MODEL_WEIGHTS.randomForest +
                    poissonPred.home * MODEL_WEIGHTS.poisson +
                    eloPred.home * MODEL_WEIGHTS.elo +
                    formPred.home * MODEL_WEIGHTS.form) * remainingWeight,
            draw: mlPred.draw * mlWeight +
                (logisticPred.draw * MODEL_WEIGHTS.logistic +
                    rfPred.draw * MODEL_WEIGHTS.randomForest +
                    poissonPred.draw * MODEL_WEIGHTS.poisson +
                    eloPred.draw * MODEL_WEIGHTS.elo +
                    formPred.draw * MODEL_WEIGHTS.form) * remainingWeight,
            away: mlPred.away * mlWeight +
                (logisticPred.away * MODEL_WEIGHTS.logistic +
                    rfPred.away * MODEL_WEIGHTS.randomForest +
                    poissonPred.away * MODEL_WEIGHTS.poisson +
                    eloPred.away * MODEL_WEIGHTS.elo +
                    formPred.away * MODEL_WEIGHTS.form) * remainingWeight,
        }
    } else {
        ensemble = {
            home:
                logisticPred.home * MODEL_WEIGHTS.logistic +
                rfPred.home * MODEL_WEIGHTS.randomForest +
                poissonPred.home * MODEL_WEIGHTS.poisson +
                eloPred.home * MODEL_WEIGHTS.elo +
                formPred.home * MODEL_WEIGHTS.form,
            draw:
                logisticPred.draw * MODEL_WEIGHTS.logistic +
                rfPred.draw * MODEL_WEIGHTS.randomForest +
                poissonPred.draw * MODEL_WEIGHTS.poisson +
                eloPred.draw * MODEL_WEIGHTS.elo +
                formPred.draw * MODEL_WEIGHTS.form,
            away:
                logisticPred.away * MODEL_WEIGHTS.logistic +
                rfPred.away * MODEL_WEIGHTS.randomForest +
                poissonPred.away * MODEL_WEIGHTS.poisson +
                eloPred.away * MODEL_WEIGHTS.elo +
                formPred.away * MODEL_WEIGHTS.form,
        }
    }

    // Normalize ensemble
    const total = ensemble.home + ensemble.draw + ensemble.away
    const homeProb = ensemble.home / total
    const drawProb = ensemble.draw / total
    const awayProb = ensemble.away / total

    // Generate factors
    const factors: PredictionFactor[] = []

    // Elo difference
    const eloDiff = homeFeatures.elo - awayFeatures.elo
    if (Math.abs(eloDiff) > 50) {
        factors.push({
            name: 'Elo Rating',
            impact: eloDiff / 200,
            description: eloDiff > 0
                ? `${match.homeTeam.name} hat einen höheren Elo-Rating (+${Math.round(eloDiff)})`
                : `${match.awayTeam.name} hat einen höheren Elo-Rating (+${Math.round(-eloDiff)})`,
        })
    }

    // Form
    const formDiff = homeFeatures.form - awayFeatures.form
    if (Math.abs(formDiff) > 0.1) {
        factors.push({
            name: 'Form',
            impact: formDiff,
            description: formDiff > 0
                ? `${match.homeTeam.name} hat bessere Form in den letzten Spielen`
                : `${match.awayTeam.name} hat bessere Form in den letzten Spielen`,
        })
    }

    // Goals
    const goalsDiff = homeFeatures.goalsScoredAvg - awayFeatures.goalsScoredAvg
    if (Math.abs(goalsDiff) > 0.3) {
        factors.push({
            name: 'Torerwartung',
            impact: goalsDiff / 3,
            description: goalsDiff > 0
                ? `${match.homeTeam.name} erzielt durchschnittlich mehr Tore`
                : `${match.awayTeam.name} erzielt durchschnittlich mehr Tore`,
        })
    }

    // Calculate confidence (based on model agreement)
    const modelProbs = [logisticPred, rfPred, poissonPred, eloPred, formPred]
    const homeProbs = modelProbs.map(p => p.home)
    const avgHomeProb = homeProbs.reduce((a, b) => a + b, 0) / homeProbs.length
    const variance = homeProbs.reduce((sum, p) => sum + Math.pow(p - avgHomeProb, 2), 0) / homeProbs.length
    const confidence = Math.max(0.3, Math.min(0.95, 1 - Math.sqrt(variance)))

    // Get best bookmaker odds
    const bestOdds = await prisma.odds.findMany({
        where: {
            matchId,
            market: { name: '1X2' },
        },
        include: { bookmaker: true },
        orderBy: { odd: 'desc' },
        take: 3,
    })

    // Calculate value for each selection
    const predictions: PredictionOutput[] = [
        {
            matchId,
            market: '1X2',
            selection: 'Home',
            probability: homeProb,
            fairOdd: 1 / homeProb,
            confidence,
            valuePercent: bestOdds.find(o => o.selection === 'Home')
                ? ((1 / homeProb - bestOdds.find(o => o.selection === 'Home')!.odd) / (1 / homeProb)) * 100
                : null,
            modelVersion: 'v1',
            factors,
        },
        {
            matchId,
            market: '1X2',
            selection: 'Draw',
            probability: drawProb,
            fairOdd: 1 / drawProb,
            confidence,
            valuePercent: bestOdds.find(o => o.selection === 'Draw')
                ? ((1 / drawProb - bestOdds.find(o => o.selection === 'Draw')!.odd) / (1 / drawProb)) * 100
                : null,
            modelVersion: 'v1',
            factors,
        },
        {
            matchId,
            market: '1X2',
            selection: 'Away',
            probability: awayProb,
            fairOdd: 1 / awayProb,
            confidence,
            valuePercent: bestOdds.find(o => o.selection === 'Away')
                ? ((1 / awayProb - bestOdds.find(o => o.selection === 'Away')!.odd) / (1 / awayProb)) * 100
                : null,
            modelVersion: 'v1',
            factors,
        },
    ]

    // Over/Under
    const ouPred = overUnderPrediction(homeFeatures, awayFeatures)
    predictions.push({
        matchId,
        market: 'OVER_UNDER',
        selection: 'Over2.5',
        probability: ouPred.over,
        fairOdd: 1 / ouPred.over,
        confidence: confidence * 0.9,
        valuePercent: null,
        modelVersion: 'v1',
        factors: factors.slice(0, 3),
    })

    // BTTS
    const bttsPred = bttsPrediction(homeFeatures, awayFeatures)
    predictions.push({
        matchId,
        market: 'BTTS',
        selection: 'Yes',
        probability: bttsPred.yes,
        fairOdd: 1 / bttsPred.yes,
        confidence: confidence * 0.85,
        valuePercent: null,
        modelVersion: 'v1',
        factors: factors.slice(0, 3),
    })

    return predictions
}

// Save predictions to database
export async function savePredictions(matchId: string, predictions: PredictionOutput[]) {
    // Get or create market IDs
    const markets = await prisma.market.findMany()
    const marketMap = new Map(markets.map(m => [m.name, m.id]))

    for (const pred of predictions) {
        const marketId = marketMap.get(pred.market)
        if (!marketId) continue

        await prisma.prediction.upsert({
            where: {
                matchId_marketId_selection: {
                    matchId,
                    marketId,
                    selection: pred.selection,
                },
            },
            create: {
                matchId,
                marketId,
                selection: pred.selection,
                predictedProb: pred.probability,
                fairOdd: pred.fairOdd,
                confidence: pred.confidence,
                valuePercent: pred.valuePercent,
                modelVersion: pred.modelVersion,
                modelType: 'ensemble',
                factors: JSON.stringify(pred.factors),
            },
            update: {
                predictedProb: pred.probability,
                fairOdd: pred.fairOdd,
                confidence: pred.confidence,
                valuePercent: pred.valuePercent,
                factors: JSON.stringify(pred.factors),
                updatedAt: new Date(),
            },
        })
    }
}
