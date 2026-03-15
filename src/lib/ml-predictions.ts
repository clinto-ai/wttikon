// ML Model Integration - Load trained model and generate predictions

import * as tf from '@tensorflow/tfjs'
import * as fs from 'fs'
import { prisma } from './db'

const MODEL_WEIGHTS_PATH = './models/model-weights.json'

let model: tf.LayersModel | null = null

export async function loadModel(): Promise<tf.LayersModel | null> {
    if (model) return model

    try {
        if (!fs.existsSync(MODEL_WEIGHTS_PATH)) {
            console.log('No trained model found')
            return null
        }

        // Create model architecture
        const newModel = tf.sequential()

        newModel.add(tf.layers.dense({
            inputShape: [13],
            units: 64,
            activation: 'relu',
            kernelInitializer: 'glorotNormal'
        }))
        newModel.add(tf.layers.dropout({ rate: 0.3 }))
        newModel.add(tf.layers.dense({ units: 32, activation: 'relu' }))
        newModel.add(tf.layers.dropout({ rate: 0.2 }))
        newModel.add(tf.layers.dense({ units: 16, activation: 'relu' }))
        newModel.add(tf.layers.dense({ units: 3, activation: 'softmax' }))

        newModel.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy'],
        })

        // Load weights - they're already in correct nested array format from arraySync()
        const weightData = JSON.parse(fs.readFileSync(MODEL_WEIGHTS_PATH, 'utf-8'))

        // Each layer weight is stored as nested array, just convert to tensor
        const weights: tf.Tensor[] = weightData.map((layerWeights: number[][]) => {
            // Check if it's a 2D array (kernel) or 1D array (bias)
            if (Array.isArray(layerWeights[0])) {
                return tf.tensor(layerWeights as number[][])
            } else {
                return tf.tensor(layerWeights as number[])
            }
        })

        newModel.setWeights(weights)

        model = newModel
        console.log('✓ ML Model loaded successfully')
        return model

    } catch (error) {
        console.error('Error loading ML model:', error)
        return null
    }
}

function normalizeElo(elo: number): number {
    return (elo - 1000) / 1000
}

function normalizeGoals(goals: number): number {
    return goals / 5
}

export async function getMLPrediction(homeTeamId: string, awayTeamId: string): Promise<{
    homeWin: number
    draw: number
    awayWin: number
    confidence: number
} | null> {
    const mlModel = await loadModel()

    if (!mlModel) {
        return null
    }

    try {
        // Get team features from database
        const homeTeam = await prisma.team.findUnique({ where: { id: homeTeamId } })
        const awayTeam = await prisma.team.findUnique({ where: { id: awayTeamId } })

        if (!homeTeam || !awayTeam) {
            return null
        }

        // Get recent Elo ratings
        const homeElo = await prisma.eloRating.findFirst({
            where: { teamId: homeTeamId },
            orderBy: { updatedAt: 'desc' }
        })

        const awayElo = await prisma.eloRating.findFirst({
            where: { teamId: awayTeamId },
            orderBy: { updatedAt: 'desc' }
        })

        // Get recent form from matches
        const homeMatches = await prisma.match.findMany({
            where: {
                OR: [{ homeTeamId }, { awayTeamId }],
                status: 'FINISHED',
            },
            orderBy: { kickoff: 'desc' },
            take: 5,
        })

        let homeForm = 0.5
        let homeGoalsScored = 1.5
        let homeGoalsConceded = 1.5
        let homeWins = 0
        let homeGames = 0

        for (const match of homeMatches) {
            const isHome = match.homeTeamId === homeTeamId
            const scored = isHome ? match.homeScore! : match.awayScore!
            const conceded = isHome ? match.awayScore! : match.homeScore!

            homeGoalsScored += scored
            homeGoalsConceded += conceded
            homeGames++

            if (scored > conceded) homeWins++
            else if (scored === conceded) homeForm += 0.33
        }

        if (homeGames > 0) {
            homeForm = homeForm / homeGames
            homeGoalsScored /= homeGames
            homeGoalsConceded /= homeGames
        }

        // Away team form
        const awayMatches = await prisma.match.findMany({
            where: {
                OR: [{ homeTeamId: awayTeamId }, { awayTeamId: awayTeamId }],
                status: 'FINISHED',
            },
            orderBy: { kickoff: 'desc' },
            take: 5,
        })

        let awayForm = 0.5
        let awayGoalsScored = 1.5
        let awayGoalsConceded = 1.5
        let awayWins = 0
        let awayGames = 0

        for (const match of awayMatches) {
            const isHome = match.homeTeamId === awayTeamId
            const scored = isHome ? match.homeScore! : match.awayScore!
            const conceded = isHome ? match.awayScore! : match.homeScore!

            awayGoalsScored += scored
            awayGoalsConceded += conceded
            awayGames++

            if (scored > conceded) awayWins++
            else if (scored === conceded) awayForm += 0.33
        }

        if (awayGames > 0) {
            awayForm = awayForm / awayGames
            awayGoalsScored /= awayGames
            awayGoalsConceded /= awayGames
        }

        // Extract features
        const features = [
            normalizeElo(homeElo?.rating || 1500),
            normalizeElo(awayElo?.rating || 1500),
            homeForm,
            awayForm,
            normalizeGoals(homeGoalsScored),
            normalizeGoals(homeGoalsConceded),
            normalizeGoals(awayGoalsScored),
            normalizeGoals(awayGoalsConceded),
            homeWins / Math.max(homeGames, 1),
            awayWins / Math.max(awayGames, 1),
            ((homeElo?.rating || 1500) - (awayElo?.rating || 1500)) / 400,
            homeForm - awayForm,
            (homeGoalsScored - homeGoalsConceded) - (awayGoalsScored - awayGoalsConceded),
        ]

        // Make prediction
        const xs = tf.tensor2d([features], [1, 13])
        const predictions = mlModel.predict(xs) as tf.Tensor
        const predArray = Array.from(await predictions.data())

        xs.dispose()
        predictions.dispose()

        // Calculate confidence
        const maxProb = Math.max(...predArray)
        const confidence = maxProb

        return {
            homeWin: predArray[0],
            draw: predArray[1],
            awayWin: predArray[2],
            confidence,
        }

    } catch (error) {
        console.error('Error generating ML prediction:', error)
        return null
    }
}
