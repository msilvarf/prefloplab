import { useState } from 'react'
import type { Range } from '@/types'
import { useSRS } from './useSRS'
import { calculateNewSRSState } from '../utils/srs'

export interface TrainingHand {
    hand: string
    correctAction: string
    actionColor: string
    position: string
    stackSize: string
    situation: string
}

export const DEMO_SCENARIOS: TrainingHand[] = [
    { hand: 'K2o', correctAction: 'Fold', actionColor: '#ef4444', position: 'SB', stackSize: '10bb', situation: 'spin / HU; SB' },
    { hand: 'K8s', correctAction: 'Raise/shove/call', actionColor: '#3b82f6', position: 'SB', stackSize: '9bb', situation: 'spin / HU; SB' },
    { hand: 'KJo', correctAction: 'Call', actionColor: '#22c55e', position: 'BB', stackSize: '15bb', situation: 'spin / HU; BB vs OS' },
    { hand: 'T8s', correctAction: 'Call', actionColor: '#22c55e', position: 'BB', stackSize: '8bb', situation: 'spin / HU; BB vs OS' },
    { hand: '94s', correctAction: 'Raise AI', actionColor: '#8b5cf6', position: 'SB', stackSize: '20bb', situation: 'spin / HU; SB' },
    { hand: 'A5s', correctAction: '3bet AI', actionColor: '#f97316', position: 'BB', stackSize: '15bb', situation: 'spin / HU; BB vs Minr' },
]

const parseFolderContext = (folderName: string) => {
    const parts = folderName.split(' / ')
    if (parts.length >= 3) {
        const stack = parts[parts.length - 1]
        const situation = parts.slice(0, parts.length - 1).join(' / ')
        return { stack, situation }
    }
    return { stack: '', situation: folderName }
}

const generateScenarios = (range: Range, folderName?: string): TrainingHand[] => {
    const scenarios: TrainingHand[] = []

    const context = folderName ? parseFolderContext(folderName) : { stack: '', situation: range.name }

    if (range.hands) {
        Object.entries(range.hands).forEach(([hand, color]) => {
            const action = range.actions.find(a => a.color === color)

            if (action) {
                scenarios.push({
                    hand,
                    correctAction: action.name,
                    actionColor: color,
                    position: range.name,
                    stackSize: context.stack,
                    situation: context.situation
                })
            }
        })
    }

    return scenarios.length > 0 ? scenarios : DEMO_SCENARIOS
}

// Fisher-Yates shuffle
const shuffleStats = <T>(array: T[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

// Helper to get random suit colors - 4 poker colors: Red, Black, Blue, Green
const getRandomSuitColors = (hand: string) => {
    const suits = [
        { bg: 'from-red-500 to-red-600', text: 'text-white', symbol: '♥', name: 'hearts' },      // Hearts
        { bg: 'from-slate-800 to-slate-900', text: 'text-white', symbol: '♠', name: 'spades' },    // Spades
        { bg: 'from-blue-500 to-blue-600', text: 'text-white', symbol: '♦', name: 'diamonds' },    // Diamonds
        { bg: 'from-emerald-500 to-emerald-600', text: 'text-white', symbol: '♣', name: 'clubs' }   // Clubs
    ]

    const isSuited = hand.includes('s')

    // Pick random first suit
    const suit1 = suits[Math.floor(Math.random() * suits.length)]
    let suit2 = suit1

    if (!isSuited) {
        // Pick random second suit different from first
        const otherSuits = suits.filter(s => s.name !== suit1.name)
        suit2 = otherSuits[Math.floor(Math.random() * otherSuits.length)]
    }

    return [suit1, suit2]
}

export function useDrillSession() {
    const [isTraining, setIsTraining] = useState(false)
    const [currentHandIndex, setCurrentHandIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [lastAnswer, setLastAnswer] = useState<{ correct: boolean; action: string } | null>(null)
    const [trainingHistory, setTrainingHistory] = useState<Array<{ hand: string; correct: boolean; action: string }>>([])
    const [activeScenarios, setActiveScenarios] = useState<TrainingHand[]>(DEMO_SCENARIOS)
    const [currentRange, setCurrentRange] = useState<Range | null>(null)
    // Store full suit objects now
    const [currentCardColors, setCurrentCardColors] = useState<any[]>(getRandomSuitColors(DEMO_SCENARIOS[0].hand))

    const { getDueHands, getCardStats, updateCardStats } = useSRS()

    const currentHand = activeScenarios[currentHandIndex] || DEMO_SCENARIOS[0]
    const progress = ((currentHandIndex) / activeScenarios.length) * 100
    const accuracy = currentHandIndex > 0 ? Math.round((score / currentHandIndex) * 100) : 100

    const startTraining = (range?: Range, folderName?: string) => {
        if (range) {
            setCurrentRange(range)
            let scenarios = generateScenarios(range, folderName)

            // SRS Sorting Logic
            const dueHands = getDueHands(range.id)
            const dueScenarios = scenarios.filter(s => dueHands.includes(s.hand))
            const newScenarios = scenarios.filter(s => !dueHands.includes(s.hand))

            // Shuffle both independently so due cards are random among themselves, but always come first
            scenarios = [...shuffleStats(dueScenarios), ...shuffleStats(newScenarios)]

            setActiveScenarios(scenarios)
            setCurrentCardColors(getRandomSuitColors(scenarios[0].hand))
        } else {
            setCurrentRange(null)
            setActiveScenarios(DEMO_SCENARIOS)
            setCurrentCardColors(getRandomSuitColors(DEMO_SCENARIOS[0].hand))
        }

        setIsTraining(true)
        setCurrentHandIndex(0)
        setScore(0)
        setTrainingHistory([])
        setShowResult(false)
        setLastAnswer(null)
    }

    const submitAnswer = (action: string) => {
        const isCorrect = action === currentHand.correctAction
        if (isCorrect) {
            setScore(s => s + 1)
        }
        setLastAnswer({ correct: isCorrect, action })
        setTrainingHistory(prev => [...prev, { hand: currentHand.hand, correct: isCorrect, action }])
        setShowResult(true)

        // Update SRS Stats
        if (currentRange) {
            const currentStats = getCardStats(currentRange.id, currentHand.hand)
            const newStats = calculateNewSRSState(currentStats, isCorrect)
            updateCardStats(currentRange.id, currentHand.hand, newStats)
        }

        // Auto-advance only when correct
        if (isCorrect) {
            setTimeout(() => {
                goToNextHand()
            }, 1000)
        }
        // When incorrect, wait for user to click "next" button
    }

    const goToNextHand = () => {
        if (currentHandIndex < activeScenarios.length - 1) {
            const nextIndex = currentHandIndex + 1
            setCurrentHandIndex(nextIndex)
            setCurrentCardColors(getRandomSuitColors(activeScenarios[nextIndex].hand))
            setShowResult(false)
            setLastAnswer(null)
        } else {
            setIsTraining(false)
        }
    }

    const stopTraining = () => {
        setIsTraining(false)
    }

    return {
        isTraining,
        currentHand,
        currentHandIndex,
        score,
        accuracy,
        progress,
        showResult,
        lastAnswer,
        trainingHistory,
        activeScenarios,
        currentRange,
        currentCardColors,
        startTraining,
        submitAnswer,
        stopTraining,
        goToNextHand,
    }
}
