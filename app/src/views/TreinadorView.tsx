import { useState } from 'react'
import type { Folder, Range } from '@/types'
import { POKER_HANDS } from '@/types'
import { Play, ChevronLeft, Check, X, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface TreinadorViewProps {
  folders: Folder[]
}

interface TrainingHand {
  hand: string
  correctAction: string
  actionColor: string
  position: string
  stackSize: string
  situation: string
}

const DEMO_SCENARIOS: TrainingHand[] = [
  { hand: 'K2o', correctAction: 'Fold', actionColor: '#ef4444', position: 'SB', stackSize: '10bb', situation: 'spin / HU; SB' },
  { hand: 'K8s', correctAction: 'Raise/shove/call', actionColor: '#3b82f6', position: 'SB', stackSize: '9bb', situation: 'spin / HU; SB' },
  { hand: 'KJo', correctAction: 'Call', actionColor: '#22c55e', position: 'BB', stackSize: '15bb', situation: 'spin / HU; BB vs OS' },
  { hand: 'T8s', correctAction: 'Call', actionColor: '#22c55e', position: 'BB', stackSize: '8bb', situation: 'spin / HU; BB vs OS' },
  { hand: '94s', correctAction: 'Raise AI', actionColor: '#8b5cf6', position: 'SB', stackSize: '20bb', situation: 'spin / HU; SB' },
  { hand: 'A5s', correctAction: '3bet AI', actionColor: '#f97316', position: 'BB', stackSize: '15bb', situation: 'spin / HU; BB vs Minr' },
]

export function TreinadorView({ folders }: TreinadorViewProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [isTraining, setIsTraining] = useState(false)
  const [currentHandIndex, setCurrentHandIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [lastAnswer, setLastAnswer] = useState<{ correct: boolean; action: string } | null>(null)
  const [trainingHistory, setTrainingHistory] = useState<Array<{ hand: string; correct: boolean; action: string }>>([])
  const [activeScenarios, setActiveScenarios] = useState<TrainingHand[]>(DEMO_SCENARIOS)
  const [currentRange, setCurrentRange] = useState<Range | null>(null)
  const [currentCardColors, setCurrentCardColors] = useState<string[]>(['bg-blue-500', 'bg-orange-500'])

  const currentHand = activeScenarios[currentHandIndex] || DEMO_SCENARIOS[0]
  const progress = ((currentHandIndex) / activeScenarios.length) * 100

  // Helper to get random suit colors
  const getRandomSuitColors = (hand: string) => {
    // Colors representing suits: Spades(Black), Hearts(Red), Diamonds(Blue-ish/Cyan), Clubs(Green)
    // Using tailwind classes
    const colors = [
      'bg-red-500',
      'bg-slate-900',
      'bg-blue-600',
      'bg-green-600'
    ]

    const isSuited = hand.includes('s')
    const isPair = !hand.includes('s') && !hand.includes('o') // e.g. 'AA'

    const color1 = colors[Math.floor(Math.random() * colors.length)]
    let color2 = color1

    if (isSuited) {
      // Same color
      color2 = color1
    } else {
      // Different color
      const otherColors = colors.filter(c => c !== color1)
      color2 = otherColors[Math.floor(Math.random() * otherColors.length)]
    }

    return [color1, color2]
  }

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

  const handleStartTraining = (range?: Range, folderName?: string) => {
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

  const handleAnswer = (action: string) => {
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
      // Check if we are still processing the same user action (basic debounce check not needed here due to simple flow)
      // We only proceed if we're not at the very end
      if (currentHandIndex < activeScenarios.length - 1) {
        // Move to next hand
        const nextIndex = currentHandIndex + 1
        setCurrentHandIndex(nextIndex)
        setCurrentCardColors(getRandomSuitColors(activeScenarios[nextIndex].hand))
        setShowResult(false)
        setLastAnswer(null)
      } else {
        // End of training
        setIsTraining(false)
      }
    }, delay)
  }

  const getCardColor = (card: string) => {
    if (card.includes('s')) return 'text-blue-400'
    if (card.includes('o')) return 'text-red-400'
    return 'text-white'
  }

  const formatHand = (hand: string) => {
    return hand.replace('s', '').replace('o', '')
  }

  const actionsToDisplay = currentRange
    ? currentRange.actions.map(a => ({ name: a.name, color: a.color }))
    : [
      { name: 'Fold', color: '#6b7280' },
      { name: 'Raise/shove/call', color: '#3b82f6' },
      { name: 'Open shove', color: '#22c55e' },
      { name: 'Limp/fold', color: '#eab308' },
      { name: 'Raise/call/fold', color: '#8b5cf6' },
      { name: 'Raise/fold', color: '#ef4444' },
      { name: 'Limp/call/call', color: '#6b7280' },
      { name: 'Limp/call/fold', color: '#d97706' },
      { name: 'Raise/call/call', color: '#06b6d4' },
    ]

  // Show reference range ONLY if result is shown AND answer was incorrect
  const showReferenceRange = showResult && lastAnswer && !lastAnswer.correct

  if (!isTraining) {
    return (
      <div className="h-full flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-border overflow-auto">
          <div className="p-4">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>

            <h3 className="text-sm font-medium mb-4">Escolha um treinamento à esquerda para começar</h3>

            <div className="space-y-1">
              {folders.map(folder => (
                <div key={folder.id}>
                  <button
                    onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedFolder === folder.id ? 'bg-accent' : 'hover:bg-accent/50'
                      }`}
                  >
                    {folder.name}
                  </button>

                  {selectedFolder === folder.id && (
                    <div className="ml-2 border-l border-border pl-2 mt-1 space-y-1">
                      {folder.ranges.map(range => (
                        <button
                          key={range.id}
                          onClick={() => handleStartTraining(range, folder.name)}
                          className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent/30 flex items-center gap-2"
                        >
                          <GripVertical className="w-3 h-3 text-muted-foreground" />
                          {range.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {folders.length === 0 && (
                <div className="text-sm text-muted-foreground p-2">Nenhum range encontrado</div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Treinamento</h2>
            <p className="text-muted-foreground mb-6">
              Escolha um range na barra lateral para praticar
            </p>
            <Button onClick={() => handleStartTraining()} className="bg-primary hover:bg-primary/90">
              <Play className="w-4 h-4 mr-2" />
              Modo Demo (Clássico)
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-border overflow-auto">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setIsTraining(false)} className="text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium">Parar</span>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progresso</span>
              <span>{Math.round((score / (currentHandIndex + 1)) * 100) || 0}%</span>
            </div>
            <Progress value={(score / (currentHandIndex + 1)) * 100 || 0} className="h-2" />
          </div>

          <div className="space-y-1">
            {trainingHistory.slice(-10).map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${item.correct ? 'text-green-500' : 'text-red-500'
                  }`}
              >
                {item.correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                <span>{item.hand}</span>
                <span className="text-muted-foreground ml-auto">{item.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Training area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Progress */}
        <div className="w-full max-w-md mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>{currentHandIndex + 1} / {activeScenarios.length}</span>
            <span>{Math.round(progress)}%</span>
            {currentRange && <span className="text-xs ml-2 text-primary">{currentRange.name}</span>}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Hand display */}
        <div className="text-center mb-8">
          {/* Primary Hand Text */}
          <div className="text-6xl font-bold mb-4">
            <span className={getCardColor(currentHand.hand)}>
              {formatHand(currentHand.hand)}
            </span>
          </div>

          {/* Situation Context */}
          <div className="text-2xl font-bold mb-1">
            {currentHand.stackSize}
          </div>
          <div className="text-base text-muted-foreground mb-2">
            {currentHand.situation}
          </div>
        </div>

        {/* Poker table */}
        <div className="relative w-96 h-56 border-4 border-muted-foreground/30 rounded-[50%] mb-8 flex items-center justify-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-14 ${currentCardColors[0]} rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                {currentHand.hand.charAt(0)}
              </div>
              <div className={`w-10 h-14 ${currentCardColors[1]} rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                {currentHand.hand.charAt(1)}
              </div>
            </div>
            <div className="mt-2 px-3 py-1 bg-primary text-white text-xs rounded-full text-center">
              Hero
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-3 max-w-lg">
          {actionsToDisplay.map((action, idx) => (
            <button
              key={`${action.name}-${idx}`}
              onClick={() => handleAnswer(action.name)}
              disabled={showResult}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${showResult && action.name === currentHand.correctAction
                  ? 'ring-2 ring-green-500'
                  : showResult && lastAnswer?.action === action.name && !lastAnswer.correct
                    ? 'ring-2 ring-red-500'
                    : 'hover:opacity-80'
                }`}
              style={{ backgroundColor: action.color }}
            >
              {action.name}
            </button>
          ))}
        </div>

        {/* Result feedback */}
        {showResult && lastAnswer && (
          <div className={`mt-6 px-6 py-3 rounded-lg text-center ${lastAnswer.correct ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
            }`}>
            {lastAnswer.correct ? (
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>Correto! {currentHand.correctAction}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <X className="w-5 h-5" />
                <span>Incorreto. Resposta: {currentHand.correctAction}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Range preview */}
      <div className="w-80 border-l border-border p-4 overflow-auto">
        <h4 className="text-sm font-medium mb-4">Range de referência</h4>

        {/* Only show if requested. Using CSS opacity/pointer-events to keep layout or conditional render */}
        <div className={`transition-opacity duration-300 ${showReferenceRange ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="inline-block">
            {POKER_HANDS.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map(hand => {
                  let bgColor = 'transparent'
                  let isCurrentHand = hand === currentHand.hand.replace('s', '').replace('o', '')
                  let opacity = 0.3
                  let textColor = 'inherit'

                  if (currentRange) {
                    const actionColor = currentRange.hands && currentRange.hands[hand]
                    if (actionColor) {
                      bgColor = actionColor
                      opacity = 1
                      textColor = 'white'
                    }
                  } else {
                    const trainingHand = activeScenarios.find(h => h.hand.replace('s', '').replace('o', '') === hand)
                    if (trainingHand) {
                      bgColor = trainingHand.actionColor
                      opacity = 1
                      textColor = 'white'
                    }
                  }

                  return (
                    <div
                      key={hand}
                      className={`w-6 h-6 text-[8px] font-medium rounded m-0.5 flex items-center justify-center ${isCurrentHand ? 'ring-2 ring-white' : ''
                        }`}
                      style={{
                        backgroundColor: bgColor,
                        color: textColor,
                        opacity: opacity
                      }}
                    >
                      {hand}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        {!showReferenceRange && (
          <div className="mt-8 text-center text-sm text-muted-foreground px-4">
            O range de referência será exibido apenas se você errar a ação.
          </div>
        )}
      </div>
    </div>
  )
}
