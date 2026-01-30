import { useState } from 'react'
import type { Folder, Range } from '@/types'
import { POKER_HANDS } from '@/types'
import { Play, ChevronLeft, Check, X, Trophy, Target, Zap, History, BarChart2, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

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
  const [isStatsOpen, setIsStatsOpen] = useState(true)
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

  // Helper to get random suit colors
  const getRandomSuitColors = (hand: string) => {
    // Colors representing suits with gradients
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
      // Different color for offsuit
      const otherColors = suitColors.filter(c => c.bg !== color1.bg)
      color2 = otherColors[Math.floor(Math.random() * otherColors.length)]
    }

    return [color1.bg, color2.bg]
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
    setIsStatsOpen(true)
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
        <div className="w-80 border-r border-border/50 overflow-auto bg-gradient-to-b from-card/50 to-transparent">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Treinamento</h3>
                <p className="text-xs text-muted-foreground">Selecione um range</p>
              </div>
            </div>

            <div className="space-y-2">
              {folders.map(folder => (
                <div key={folder.id}>
                  <button
                    onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200",
                      selectedFolder === folder.id
                        ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/10 border border-violet-500/30'
                        : 'hover:bg-white/5'
                    )}
                  >
                    <span className="font-medium">{folder.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({folder.ranges.length} ranges)
                    </span>
                  </button>

                  {selectedFolder === folder.id && (
                    <div className="ml-4 mt-2 border-l-2 border-violet-500/30 pl-4 space-y-1 animate-fade-in">
                      {folder.ranges.map(range => (
                        <button
                          key={range.id}
                          onClick={() => handleStartTraining(range, folder.name)}
                          className="w-full text-left px-4 py-2.5 rounded-lg text-sm hover:bg-white/5 flex items-center gap-3 group transition-all"
                        >
                          <Play className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {range.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {folders.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Nenhum range encontrado</p>
                  <p className="text-xs text-muted-foreground mt-1">Crie charts na biblioteca primeiro</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center animate-float">
              <Zap className="w-12 h-12 text-violet-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3 gradient-text">Pronto para treinar?</h2>
            <p className="text-muted-foreground mb-8">
              Escolha um range na barra lateral para começar a praticar suas decisões preflop
            </p>
            <Button
              onClick={() => handleStartTraining()}
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/20 px-8"
            >
              <Play className="w-5 h-5 mr-2" />
              Modo Demo
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const accuracy = currentHandIndex > 0 ? Math.round((score / currentHandIndex) * 100) : 100

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar - Training Progress (Collapsible) */}
      <div
        className={cn(
          "border-r border-border/50 overflow-hidden bg-gradient-to-b from-card/50 to-transparent transition-all duration-300 ease-in-out shrink-0 relative",
          isStatsOpen ? "w-80" : "w-16"
        )}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Header & Toggle */}
          <div className={cn("flex items-center mb-6", isStatsOpen ? "justify-between" : "justify-center")}>
            {isStatsOpen && (
              <button
                onClick={() => setIsTraining(false)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors overflow-hidden whitespace-nowrap"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span>Parar</span>
              </button>
            )}

            <button
              onClick={() => setIsStatsOpen(!isStatsOpen)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
              title={isStatsOpen ? "Recolher painel" : "Expandir painel"}
            >
              {isStatsOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
          </div>

          {/* Collapsed View Icons */}
          {!isStatsOpen && (
            <div className="flex flex-col items-center gap-6 animate-fade-in">
              <div className="flex flex-col items-center gap-1" title="Precisão">
                <BarChart2 className={cn("w-5 h-5", accuracy >= 80 ? "text-emerald-400" : "text-amber-400")} />
                <span className="text-[10px] font-bold">{accuracy}%</span>
              </div>
              <div className="w-full h-px bg-border/50" />
              <div className="flex flex-col items-center gap-2" title="Histórico Recente">
                {trainingHistory.slice(-5).reverse().map((item, idx) => (
                  <div key={idx} className={cn("w-2 h-2 rounded-full", item.correct ? "bg-emerald-400" : "bg-red-400")} />
                ))}
              </div>
            </div>
          )}

          {/* Expanded View Content */}
          {isStatsOpen && (
            <div className="animate-fade-in flex-1 flex flex-col min-h-0">
              {/* Stats Card */}
              <div className="glass rounded-2xl p-5 mb-6 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" /> Precisão
                  </span>
                  <span className={cn(
                    "text-2xl font-bold",
                    accuracy >= 80 ? "text-emerald-400" : accuracy >= 50 ? "text-amber-400" : "text-red-400"
                  )}>
                    {accuracy}%
                  </span>
                </div>
                <Progress value={accuracy} className="h-2" />
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>{score} corretas</span>
                  <span>{currentHandIndex - score} erradas</span>
                </div>
              </div>

              {/* History */}
              <div className="min-h-0 flex-1 flex flex-col">
                <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2 shrink-0">
                  <History className="w-3.5 h-3.5" /> Histórico
                </h4>
                <div className="overflow-y-auto pr-2 space-y-2 flex-1">
                  {trainingHistory.slice().reverse().map((item, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm animate-fade-in",
                        item.correct ? 'bg-emerald-500/10' : 'bg-red-500/10'
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                        item.correct ? 'bg-emerald-500/20' : 'bg-red-500/20'
                      )}>
                        {item.correct ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-red-400" />
                        )}
                      </div>
                      <span className="font-medium w-8">{item.hand}</span>
                      <span className="text-muted-foreground text-xs ml-auto truncate max-w-[100px]">{item.action}</span>
                    </div>
                  ))}
                  {trainingHistory.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground text-xs">
                      Histórico vazio
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Training area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative min-w-[400px]">
        {/* Progress bar at top */}
        <div className="absolute top-6 left-8 right-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span className="font-medium">{currentHandIndex + 1} / {activeScenarios.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Context info */}
          <div className="flex items-center justify-center gap-3 mt-4 text-sm scale-95 origin-top">
            <span className="px-3 py-1 rounded-full bg-white/5 text-muted-foreground">
              <span className="font-bold text-foreground">{currentHand.stackSize}</span>
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{currentHand.situation}</span>
          </div>
        </div>

        {/* Poker table & cards */}
        <div className={cn(
          "poker-table rounded-[50%] flex items-center justify-center relative transition-all duration-300",
          isStatsOpen ? "w-[400px] h-[240px] scale-90" : "w-[480px] h-[280px] scale-100"
        )}>
          {/* Cards */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "rounded-xl flex items-center justify-center text-white font-bold poker-card bg-gradient-to-br shadow-xl",
              currentCardColors[0],
              isStatsOpen ? "w-16 h-24 text-3xl" : "w-20 h-28 text-4xl"
            )}>
              {currentHand.hand.charAt(0)}
            </div>
            <div className={cn(
              "rounded-xl flex items-center justify-center text-white font-bold poker-card bg-gradient-to-br shadow-xl",
              currentCardColors[1],
              isStatsOpen ? "w-16 h-24 text-3xl" : "w-20 h-28 text-4xl"
            )}>
              {currentHand.hand.charAt(1)}
            </div>
          </div>

          {/* Hero badge */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
            <div className="px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full text-sm font-semibold shadow-lg shadow-violet-500/30">
              Hero
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-12 flex flex-wrap justify-center gap-3 max-w-2xl">
          {actionsToDisplay.map((action, idx) => (
            <button
              key={`${action.name}-${idx}`}
              onClick={() => handleAnswer(action.name)}
              disabled={showResult}
              className={cn(
                "px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 action-btn text-white shadow-lg shadow-black/20",
                showResult && action.name === currentHand.correctAction && 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-background scale-105',
                showResult && lastAnswer?.action === action.name && !lastAnswer.correct && 'ring-2 ring-red-400 ring-offset-2 ring-offset-background'
              )}
              style={{ backgroundColor: action.color }}
            >
              {action.name}
            </button>
          ))}
        </div>

        {/* Result feedback */}
        {showResult && lastAnswer && (
          <div className={cn(
            "absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl text-center animate-fade-in-up flex items-center gap-3 shadow-2xl backdrop-blur-md whitespace-nowrap z-10",
            lastAnswer.correct ? 'bg-emerald-900/80 border border-emerald-500/50' : 'bg-red-900/80 border border-red-500/50'
          )}>
            {lastAnswer.correct ? (
              <>
                <Trophy className="w-6 h-6 text-emerald-400 drop-shadow-md" />
                <span className="text-emerald-100 font-bold text-lg">Correto! {currentHand.correctAction}</span>
              </>
            ) : (
              <>
                <X className="w-6 h-6 text-red-400 drop-shadow-md" />
                <span className="text-red-100 font-bold text-lg">Incorreto. Resposta: {currentHand.correctAction}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Range preview - Wider and Bigger */}
      <div className={cn(
        "border-l border-border/50 p-6 overflow-auto bg-gradient-to-b from-card/50 to-transparent transition-all duration-300 shrink-0",
        // Make expand wider when sidebar is closed or dynamically flexible
        isStatsOpen ? "w-[400px]" : "w-[500px]"
      )}>
        <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-violet-400" />
          Range de referência
        </h4>

        {/* Only show if requested */}
        <div className={cn(
          "transition-all duration-500 ease-out origin-top-right",
          showReferenceRange ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        )}>
          <div className="glass rounded-xl p-4 shadow-xl">
            {POKER_HANDS.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map(hand => {
                  let bgColor = 'transparent'
                  let isCurrentHand = hand === currentHand.hand.replace('s', '').replace('o', '')
                  let opacity = 0.35 // Slightly more visible inactive state for context

                  if (currentRange) {
                    const actionColor = currentRange.hands && currentRange.hands[hand]
                    if (actionColor) {
                      bgColor = actionColor
                      opacity = 1
                    }
                  } else {
                    const trainingHand = activeScenarios.find(h => h.hand.replace('s', '').replace('o', '') === hand)
                    if (trainingHand) {
                      bgColor = trainingHand.actionColor
                      opacity = 1
                    }
                  }

                  return (
                    <div
                      key={hand}
                      className={cn(
                        // Bigger cells and text
                        "flex-1 aspect-square font-bold rounded-[3px] m-[1px] flex items-center justify-center transition-all",
                        isStatsOpen ? "text-[10px]" : "text-xs", // Responsive text size
                        isCurrentHand && 'ring-2 ring-white z-10 scale-110 shadow-lg'
                      )}
                      style={{
                        backgroundColor: bgColor,
                        color: opacity === 1 ? 'white' : 'hsl(var(--muted-foreground))',
                        opacity: isCurrentHand ? 1 : opacity
                      }}
                    >
                      {hand}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Helper Legend underneath if there's space */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center opacity-80">
            {currentRange?.actions.slice(0, 4).map(action => (
              <div key={action.id} className="flex items-center gap-1.5 text-[10px] bg-white/5 px-2 py-1 rounded">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: action.color }} />
                <span>{action.name}</span>
              </div>
            ))}
          </div>
        </div>

        {!showReferenceRange && (
          <div className="text-center py-24 animate-fade-in opacity-50">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground px-8 leading-relaxed">
              O range de referência aparecerá aqui automaticamente se você cometer um erro.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
