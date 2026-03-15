// ML Training Script - Train Neural Network Model on Historical Bundesliga Data

import 'dotenv/config'
import { prisma } from '../lib/db'
import { footballApi } from '../lib/football-api'
import * as tf from '@tensorflow/tfjs'
import * as fs from 'fs'

interface HistoricalMatch {
    homeTeam: string
    awayTeam: string
    homeScore: number
    awayScore: number
    matchday: number
    season: string
    date: string
}

interface TrainingData {
    features: number[]
    label: number[] // [homeWin, draw, awayWin]
}

// Configuration
const MODEL_PATH = './models/bundesliga-model'
const TRAINING_EPOCHS = 150
const LEARNING_RATE = 0.001

// Bundesliga teams
const BUNDESLIGA_TEAMS = [
    'FC Bayern München', 'Borussia Dortmund', 'RB Leipzig', 'Bayer 04 Leverkusen',
    'Eintracht Frankfurt', 'Borussia Mönchengladbach', 'VfL Wolfsburg', 'TSG 1899 Hoffenheim',
    'SC Freiburg', '1. FC Köln', 'Hertha BSC', 'FC Augsburg', '1. FSV Mainz 05',
    'VfL Bochum', 'VfB Stuttgart', 'Arminia Bielefeld', 'SV Werder Bremen', 'FC Schalke 04'
]

async function fetchHistoricalData(): Promise<HistoricalMatch[]> {
    console.log('📊 Fetching historical Bundesliga data...')

    const allMatches: HistoricalMatch[] = []

    // Check database
    console.log('   Checking database for historical matches...')
    const dbMatches = await prisma.match.findMany({
        where: {
            status: 'FINISHED',
            homeScore: { not: null },
        },
        include: {
            homeTeam: true,
            awayTeam: true,
        },
        orderBy: { kickoff: 'asc' },
    })

    if (dbMatches.length > 0) {
        console.log(`   Found ${dbMatches.length} finished matches in database`)
        for (const match of dbMatches) {
            allMatches.push({
                homeTeam: match.homeTeam.name,
                awayTeam: match.awayTeam.name,
                homeScore: match.homeScore!,
                awayScore: match.awayScore!,
                matchday: match.matchday || 1,
                season: match.season || '2024',
                date: match.kickoff.toISOString(),
            })
        }
    }

    // Try API
    console.log('   Fetching from Football API...')
    try {
        const currentSeason = new Date().getFullYear().toString()
        const response = await footballApi.fetch<{ matches: any[] }>(
            `/competitions/BL1/matches?dateFrom=2024-01-01&dateTo=2025-12-31`
        )

        if (response.matches) {
            let count = 0
            for (const match of response.matches) {
                if (match.status === 'FINISHED' && match.score.fullTime.home !== null) {
                    const exists = allMatches.some(m =>
                        m.homeTeam === match.homeTeam.name &&
                        m.awayTeam === match.awayTeam.name &&
                        m.date === match.utcDate
                    )

                    if (!exists) {
                        allMatches.push({
                            homeTeam: match.homeTeam.name,
                            awayTeam: match.awayTeam.name,
                            homeScore: match.score.fullTime.home,
                            awayScore: match.score.fullTime.away,
                            matchday: match.matchday,
                            season: currentSeason,
                            date: match.utcDate,
                        })
                        count++
                    }
                }
            }
            console.log(`   Added ${count} matches from API`)
        }
    } catch (error) {
        console.log(`   ⚠ API error: ${error}`)
    }

    // Generate synthetic if needed
    if (allMatches.length < 50) {
        console.log('   Generating synthetic historical data for training demo...')
        const syntheticMatches = generateSyntheticData(200)
        allMatches.push(...syntheticMatches)
        console.log(`   Generated ${syntheticMatches.length} synthetic matches`)
    }

    console.log(`   Total matches: ${allMatches.length}`)
    return allMatches
}

function generateSyntheticData(count: number): HistoricalMatch[] {
    const matches: HistoricalMatch[] = []
    const seasons = ['2020', '2021', '2022', '2023']

    const teamStrengths: Record<string, number> = {
        'FC Bayern München': 95, 'Borussia Dortmund': 88, 'RB Leipzig': 85,
        'Bayer 04 Leverkusen': 82, 'Eintracht Frankfurt': 78, 'Borussia Mönchengladbach': 76,
        'VfL Wolfsburg': 75, 'TSG 1899 Hoffenheim': 74, 'SC Freiburg': 73,
        '1. FC Köln': 70, 'Hertha BSC': 69, 'FC Augsburg': 67, '1. FSV Mainz 05': 66,
        'VfL Bochum': 64, 'VfB Stuttgart': 70, 'Arminia Bielefeld': 60,
        'SV Werder Bremen': 65, 'FC Schalke 04': 68,
    }

    for (let i = 0; i < count; i++) {
        const homeTeam = BUNDESLIGA_TEAMS[Math.floor(Math.random() * BUNDESLIGA_TEAMS.length)]
        let awayTeam = BUNDESLIGA_TEAMS[Math.floor(Math.random() * BUNDESLIGA_TEAMS.length)]
        while (awayTeam === homeTeam) {
            awayTeam = BUNDESLIGA_TEAMS[Math.floor(Math.random() * BUNDESLIGA_TEAMS.length)]
        }

        const homeStrength = teamStrengths[homeTeam] || 70
        const awayStrength = teamStrengths[awayTeam] || 70
        const adjustedHomeStrength = homeStrength + 5

        const strengthDiff = adjustedHomeStrength - awayStrength
        const homeProb = 0.45 + (strengthDiff / 100)
        const awayProb = 0.30 - (strengthDiff / 150)
        const drawProb = 1 - homeProb - awayProb

        const rand = Math.random()
        let homeScore = 0, awayScore = 0

        if (rand < homeProb) {
            homeScore = Math.floor(Math.random() * 4) + 1
            awayScore = Math.floor(Math.random() * homeScore)
        } else if (rand < homeProb + drawProb) {
            homeScore = Math.floor(Math.random() * 2)
            awayScore = homeScore
        } else {
            awayScore = Math.floor(Math.random() * 4) + 1
            homeScore = Math.floor(Math.random() * awayScore)
        }

        const season = seasons[Math.floor(Math.random() * seasons.length)]
        const month = Math.floor(Math.random() * 9) + 1
        const day = Math.floor(Math.random() * 28) + 1

        matches.push({
            homeTeam, awayTeam, homeScore, awayScore,
            matchday: Math.floor(Math.random() * 34) + 1, season,
            date: `${season}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T15:00:00Z`,
        })
    }

    return matches
}

function calculateTeamFeatures(teamName: string, matches: HistoricalMatch[], upToDate: string) {
    const teamMatches = matches
        .filter(m => (m.homeTeam === teamName || m.awayTeam === teamName) && m.date < upToDate)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)

    if (teamMatches.length === 0) {
        return { elo: 1500, form: 0.5, goalsScored: 1.5, goalsConceded: 1.5, wins: 0, games: 0 }
    }

    let goalsScored = 0, goalsConceded = 0, wins = 0, formPoints = 0

    for (const match of teamMatches) {
        const isHome = match.homeTeam === teamName
        const scored = isHome ? match.homeScore : match.awayScore
        const conceded = isHome ? match.awayScore : match.homeScore

        goalsScored += scored
        goalsConceded += conceded

        if (scored > conceded) { wins++; formPoints += 3 }
        else if (scored === conceded) formPoints += 1
    }

    return {
        elo: 1500 + (wins - (teamMatches.length - wins)) * 25,
        form: formPoints / (teamMatches.length * 3),
        goalsScored: goalsScored / teamMatches.length,
        goalsConceded: goalsConceded / teamMatches.length,
        wins, games: teamMatches.length,
    }
}

function extractFeatures(homeFeatures: any, awayFeatures: any): number[] {
    return [
        (homeFeatures.elo - 1000) / 1000,
        (awayFeatures.elo - 1000) / 1000,
        homeFeatures.form,
        awayFeatures.form,
        homeFeatures.goalsScored / 5,
        homeFeatures.goalsConceded / 5,
        awayFeatures.goalsScored / 5,
        awayFeatures.goalsConceded / 5,
        homeFeatures.wins / Math.max(homeFeatures.games, 1),
        awayFeatures.wins / Math.max(awayFeatures.games, 1),
        (homeFeatures.elo - awayFeatures.elo) / 400,
        homeFeatures.form - awayFeatures.form,
        (homeFeatures.goalsScored - homeFeatures.goalsConceded) - (awayFeatures.goalsScored - awayFeatures.goalsConceded),
    ]
}

function createLabel(homeScore: number, awayScore: number): number[] {
    if (homeScore > awayScore) return [1, 0, 0]
    if (homeScore === awayScore) return [0, 1, 0]
    return [0, 0, 1]
}

async function prepareTrainingData(matches: HistoricalMatch[]): Promise<TrainingData[]> {
    console.log('🔧 Preparing training data...')

    const trainingData: TrainingData[] = []
    const sortedMatches = matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    for (const match of sortedMatches) {
        const homeFeatures = calculateTeamFeatures(match.homeTeam, sortedMatches, match.date)
        const awayFeatures = calculateTeamFeatures(match.awayTeam, sortedMatches, match.date)

        if (homeFeatures.games > 0 && awayFeatures.games > 0) {
            trainingData.push({
                features: extractFeatures(homeFeatures, awayFeatures),
                label: createLabel(match.homeScore, match.awayScore),
            })
        }
    }

    console.log(`   ✓ Prepared ${trainingData.length} training samples`)
    return trainingData
}

function createModel(): tf.Sequential {
    console.log('🧠 Creating neural network model...')

    const model = tf.sequential()

    model.add(tf.layers.dense({ inputShape: [13], units: 64, activation: 'relu', kernelInitializer: 'glorotNormal' }))
    model.add(tf.layers.dropout({ rate: 0.3 }))
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }))
    model.add(tf.layers.dropout({ rate: 0.2 }))
    model.add(tf.layers.dense({ units: 16, activation: 'relu' }))
    model.add(tf.layers.dense({ units: 3, activation: 'softmax' }))

    model.compile({
        optimizer: tf.train.adam(LEARNING_RATE),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
    })

    model.summary()
    console.log('   ✓ Model created')
    return model
}

async function trainModel(trainingData: TrainingData[]) {
    console.log('🚀 Training model...')

    const splitIndex = Math.floor(trainingData.length * 0.8)
    const trainData = trainingData.slice(0, splitIndex)
    const valData = trainingData.slice(splitIndex)

    const xs = tf.tensor2d(trainData.map(d => d.features), [trainData.length, 13])
    const ys = tf.tensor2d(trainData.map(d => d.label), [trainData.length, 3])
    const valXs = tf.tensor2d(valData.map(d => d.features), [valData.length, 13])
    const valYs = tf.tensor2d(valData.map(d => d.label), [valData.length, 3])

    const model = createModel()

    await model.fit(xs, ys, {
        epochs: TRAINING_EPOCHS,
        batchSize: 32,
        validationData: [valXs, valYs],
        shuffle: true,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                if (epoch % 25 === 0) {
                    const trainAcc = logs?.acc ? (logs.acc as number).toFixed(4) : 'N/A'
                    const valAcc = logs?.val_acc ? (logs.val_acc as number).toFixed(4) : 'N/A'
                    console.log(`   Epoch ${epoch}: loss=${logs?.loss?.toFixed(4)}, val_loss=${logs?.val_loss?.toFixed(4)}, val_acc=${valAcc}`)
                }
            }
        }
    })

    // Save weights
    const weights = model.getWeights()
    const weightData = weights.map(w => Array.from(w.dataSync()))
    fs.writeFileSync('./models/model-weights.json', JSON.stringify(weightData))
    console.log('   ✓ Model weights saved')

    xs.dispose(); ys.dispose(); valXs.dispose(); valYs.dispose()
    return model
}

async function backtest(model: tf.LayersModel, trainingData: TrainingData[]) {
    console.log('\n🔁 Running backtesting...')

    const splitIndex = Math.floor(trainingData.length * 0.8)
    const testData = trainingData.slice(splitIndex)

    if (testData.length === 0) {
        console.log('   No test data available')
        return
    }

    // Direct prediction accuracy test
    const testFeatures = testData.map(d => d.features)
    const testLabels = testData.map(d => d.label)

    const xs = tf.tensor2d(testFeatures, [testFeatures.length, 13])
    const predictions = model.predict(xs) as tf.Tensor
    const predArray = Array.from(await predictions.data())

    let correct = 0
    let homeCorrect = 0, drawCorrect = 0, awayCorrect = 0
    let homeTotal = 0, drawTotal = 0, awayTotal = 0

    for (let i = 0; i < testData.length; i++) {
        const pred = [predArray[i * 3], predArray[i * 3 + 1], predArray[i * 3 + 2]]
        const actual = testData[i].label

        const predWinner = pred.indexOf(Math.max(...pred))
        const actualWinner = actual.indexOf(1)

        if (predWinner === actualWinner) correct++

        // Track per outcome
        if (actualWinner === 0) { homeTotal++; if (predWinner === 0) homeCorrect++ }
        if (actualWinner === 1) { drawTotal++; if (predWinner === 1) drawCorrect++ }
        if (actualWinner === 2) { awayTotal++; if (predWinner === 2) awayCorrect++ }
    }

    const accuracy = correct / testData.length

    console.log('\n📊 Backtesting Results:')
    console.log(`   Total test samples: ${testData.length}`)
    console.log(`   Overall Accuracy: ${(accuracy * 100).toFixed(1)}%`)

    console.log('\n📈 Per-outcome prediction accuracy:')
    console.log(`   Home Win: ${homeTotal > 0 ? (homeCorrect / homeTotal * 100).toFixed(1) : 0}% (${homeTotal} samples)`)
    console.log(`   Draw: ${drawTotal > 0 ? (drawCorrect / drawTotal * 100).toFixed(1) : 0}% (${drawTotal} samples)`)
    console.log(`   Away Win: ${awayTotal > 0 ? (awayCorrect / awayTotal * 100).toFixed(1) : 0}% (${awayTotal} samples)`)

    // Simulate value betting
    console.log('\n💰 Value Betting Simulation:')
    let valueBets = 0, valueWins = 0, profit = 0

    for (let i = 0; i < testData.length; i++) {
        const pred = [predArray[i * 3], predArray[i * 3 + 1], predArray[i * 3 + 2]]
        const actual = testData[i].label.indexOf(1)

        // Simulate bookmaker with 5% margin
        const bookmakerOdds = [1 / pred[0] * 0.95, 1 / pred[1] * 0.95, 1 / pred[2] * 0.95]

        // Bet on highest confidence prediction
        const bestBet = pred.indexOf(Math.max(...pred))
        const expectedValue = pred[bestBet] * bookmakerOdds[bestBet] - 1

        if (expectedValue > 0.02) { // 2% value threshold
            valueBets++
            if (bestBet === actual) {
                valueWins++
                profit += (bookmakerOdds[bestBet] - 1) * 10
            } else {
                profit -= 10
            }
        }
    }

    if (valueBets > 0) {
        console.log(`   Value bets placed: ${valueBets}`)
        console.log(`   Value bet win rate: ${(valueWins / valueBets * 100).toFixed(1)}%`)
        console.log(`   Total profit: ${profit.toFixed(2)} units`)
        console.log(`   ROI: ${(profit / (valueBets * 10) * 100).toFixed(1)}%`)
    } else {
        console.log('   No value bets found with current threshold')
    }

    xs.dispose()
    predictions.dispose()
}

async function main() {
    console.log('\n🧠 Wettikon ML Training System')
    console.log('================================\n')

    if (!fs.existsSync('./models')) {
        fs.mkdirSync('./models', { recursive: true })
    }

    // Try loading existing model
    let model: tf.Sequential
    try {
        if (fs.existsSync('./models/model-weights.json')) {
            console.log('✓ Loaded existing model weights\n')
            model = createModel()
            const weightData = JSON.parse(fs.readFileSync('./models/model-weights.json', 'utf-8'))
            const weights = weightData.map((w: number[]) => tf.tensor(w))
            model.setWeights(weights)
        } else {
            throw new Error('No model found')
        }
    } catch (e) {
        console.log('No existing model found, training from scratch...\n')

        const matches = await fetchHistoricalData()

        if (matches.length === 0) {
            console.log('❌ No data available for training')
            return
        }

        const trainingData = await prepareTrainingData(matches)

        if (trainingData.length === 0) {
            console.log('❌ Not enough data for training')
            return
        }

        model = await trainModel(trainingData)
    }

    // Run backtesting
    const matches = await fetchHistoricalData()
    const trainingData = await prepareTrainingData(matches)
    await backtest(model, trainingData)

    console.log('\n================================')
    console.log('✅ Training complete!\n')
}

main().catch(console.error)
