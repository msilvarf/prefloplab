import { useState } from 'react'
import type { Range } from '@/types'

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

    for (let i = scenarios.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [scenarios[i], scenarios[j]] = [scenarios[j], scenarios[i]];
    }

    return scenarios.length > 0 ? scenarios : DEMO_SCENARIOS
}

// Helper to get random suit colors
const getRandomSuitColors = (hand: string) => {
    const suitColors = [
        { bg: 'from-red-500 to-red-600', text: 'text-white' },      // Hearts
        { bg: 'from-slate-800 to-slate-900', text: 'text-white' },  // Spades
        { bg: 'from-blue-500 to-blue-600', text: 'text-white' },    // Diamonds
        { bg: 'from-emerald-500 to-emerald-600', text: 'text-white' } // Clubs
    ]

    const isSuited = hand.includes('s')

    const color1 = suitColors[Math.floor(Math.random() * suitColors.length)]
    let color2 = color1

    if (!isSuited) {
        const otherColors = suitColors.filter(c => c.bg !== color1.bg)
        color2 = otherColors[Math.floor(Math.random() * otherColors.length)]
    }

    return [color1.bg, color2.bg]
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
    const [currentCardColors, setCurrentCardColors] = useState<string[]>(['bg-red-500', 'bg-red-500'])

    const currentHand = activeScenarios[currentHandIndex] || DEMO_SCENARIOS[0]
    const progress = ((currentHandIndex) / activeScenarios.length) * 100
    const accuracy = currentHandIndex > 0 ? Math.round((score / currentHandIndex) * 100) : 100

    const startTraining = (range?: Range, folderName?: string) => {
        if (range) {
            setCurrentRange(range)
            const scenarios = generateScenarios(range, folderName)
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

        // Delay to allow user to see result
        const delay = isCorrect ? 1000 : 2500

        setTimeout(() => {
            if (currentHandIndex < activeScenarios.length - 1) {
                const nextIndex = currentHandIndex + 1
                setCurrentHandIndex(nextIndex)
                setCurrentCardColors(getRandomSuitColors(activeScenarios[nextIndex].hand))
                setShowResult(false)
                setLastAnswer(null)
            } else {
                setIsTraining(false)
            }
        }, delay)
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
    }
}
