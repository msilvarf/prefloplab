import { useState, useEffect, useMemo } from 'react'
import type { Range } from '@/types'
import { POKER_HANDS } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Eraser, CheckCircle2, RotateCcw, Eye, EyeOff, ChevronLeft, Award, AlertCircle } from 'lucide-react'

interface RangeTrainingViewProps {
    range: Range
    folderName?: string
    onBack: () => void
}

// Quick selection groups
const QUICK_GROUPS = {
    'Pocket pairs': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22'],
    'Suited Aces': ['AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s'],
    'Off-Suited Aces': ['AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o'],
    'Suited Broadway': ['AKs', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs'],
    'Off-Suited Broadway': ['AKo', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo'],
}

export function RangeTrainingView({ range, folderName, onBack }: RangeTrainingViewProps) {
    const [userHands, setUserHands] = useState<Record<string, string>>({})
    const [selectedAction, setSelectedAction] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragMode, setDragMode] = useState<'add' | 'remove' | null>(null)
    const [showResult, setShowResult] = useState(false)
    const [showReference, setShowReference] = useState(false)

    // Parse context from folder name
    const context = useMemo(() => {
        if (!folderName) return { stack: '', situation: range.name }
        const parts = folderName.split(' / ')
        if (parts.length >= 3) {
            const stack = parts[parts.length - 1]
            const situation = parts.slice(0, parts.length - 1).join(' / ')
            return { stack, situation }
        }
        return { stack: '', situation: folderName }
    }, [folderName, range.name])

    // Set first action as default
    useEffect(() => {
        if (range.actions.length > 0 && !selectedAction) {
            setSelectedAction(range.actions[0].id)
        }
    }, [range.actions, selectedAction])

    useEffect(() => {
        const handleMouseUp = () => {
            setIsDragging(false)
            setDragMode(null)
        }
        window.addEventListener('mouseup', handleMouseUp)
        return () => window.removeEventListener('mouseup', handleMouseUp)
    }, [])

    const applyCellColor = (hand: string, mode: 'add' | 'remove', color: string) => {
        setUserHands(prev => {
            const currentColor = prev[hand]
            if (mode === 'add' && currentColor === color) return prev
            if (mode === 'remove' && currentColor !== color) return prev

            const newHands = { ...prev }
            if (mode === 'add') {
                newHands[hand] = color
            } else {
                delete newHands[hand]
            }
            return newHands
        })
    }

    const handleCellMouseDown = (hand: string, e: React.MouseEvent) => {
        if (!selectedAction) return
        e.preventDefault()

        const action = range.actions.find(a => a.id === selectedAction)
        if (!action) return

        const isCurrentColor = userHands[hand] === action.color
        const mode = isCurrentColor ? 'remove' : 'add'

        setIsDragging(true)
        setDragMode(mode)
        applyCellColor(hand, mode, action.color)
    }

    const handleCellMouseEnter = (hand: string) => {
        if (!isDragging || !dragMode || !selectedAction) return
        const action = range.actions.find(a => a.id === selectedAction)
        if (!action) return
        applyCellColor(hand, dragMode, action.color)
    }

    const handleQuickSelect = (groupName: keyof typeof QUICK_GROUPS) => {
        if (!selectedAction) return
        const action = range.actions.find(a => a.id === selectedAction)
        if (!action) return

        const groupHands = QUICK_GROUPS[groupName]
        setUserHands(prev => {
            const newHands = { ...prev }
            groupHands.forEach(hand => {
                newHands[hand] = action.color
            })
            return newHands
        })
    }

    const handleClear = () => {
        setUserHands({})
        setShowResult(false)
        setShowReference(false)
    }

    const handleVerify = () => {
        setShowResult(true)
    }

    // Calculate results
    const results = useMemo(() => {
        if (!showResult) return null

        const referenceHands = range.hands
        let correct = 0
        let incorrect = 0
        let missed = 0

        const correctCells: string[] = []
        const incorrectCells: string[] = []
        const missedCells: string[] = []

        // Check all hands in reference
        Object.entries(referenceHands).forEach(([hand, color]) => {
            if (color) {
                if (userHands[hand] === color) {
                    correct++
                    correctCells.push(hand)
                } else if (userHands[hand]) {
                    incorrect++
                    incorrectCells.push(hand)
                } else {
                    missed++
                    missedCells.push(hand)
                }
            }
        })

        // Check for extra cells painted by user that shouldn't be
        Object.keys(userHands).forEach(hand => {
            if (!referenceHands[hand]) {
                incorrect++
                incorrectCells.push(hand)
            }
        })

        const total = Object.values(referenceHands).filter(c => c).length
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

        return { correct, incorrect, missed, total, accuracy, correctCells, incorrectCells, missedCells }
    }, [showResult, userHands, range.hands])

    const getHandStyle = (hand: string) => {
        if (showReference) {
            // Show reference range
            const color = range.hands[hand]
            return color ? { backgroundColor: color } : {}
        }

        if (showResult && results) {
            // Show results with indicators
            const userColor = userHands[hand]
            const refColor = range.hands[hand]

            if (results.correctCells.includes(hand)) {
                return {
                    backgroundColor: userColor,
                    boxShadow: 'inset 0 0 0 2px rgba(34, 197, 94, 0.8)'
                }
            }
            if (results.incorrectCells.includes(hand)) {
                return {
                    backgroundColor: userColor || 'rgba(239, 68, 68, 0.3)',
                    boxShadow: 'inset 0 0 0 2px rgba(239, 68, 68, 0.8)'
                }
            }
            if (results.missedCells.includes(hand)) {
                return {
                    backgroundColor: refColor,
                    opacity: 0.5,
                    boxShadow: 'inset 0 0 0 2px rgba(234, 179, 8, 0.8)'
                }
            }
        }

        const color = userHands[hand]
        return color ? { backgroundColor: color } : {}
    }

    const getHandClass = (hand: string) => {
        if (showResult && results) {
            if (results.correctCells.includes(hand)) return 'ring-2 ring-emerald-500'
            if (results.incorrectCells.includes(hand)) return 'ring-2 ring-red-500'
            if (results.missedCells.includes(hand)) return 'ring-2 ring-yellow-500 ring-dashed'
        }
        return ''
    }

    return (
        <div className="h-full flex overflow-hidden">
            {/* Sidebar with actions */}
            <div className="w-80 border-r border-border/50 overflow-auto bg-gradient-to-b from-card/50 to-transparent">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h3 className="font-semibold">Treinamento de Range</h3>
                            <p className="text-xs text-muted-foreground">{range.name}</p>
                        </div>
                    </div>

                    {/* Context info */}
                    <div className="flex items-center justify-center gap-3 mb-6 text-sm">
                        <span className="px-3 py-1 rounded-full bg-white/5 text-muted-foreground">
                            <span className="font-bold text-foreground">{context.stack}</span>
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground text-xs">{context.situation}</span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 mb-6">
                        {range.actions.map((action) => (
                            <button
                                key={action.id}
                                onClick={() => setSelectedAction(action.id)}
                                disabled={showResult}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                                    selectedAction === action.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border/50 hover:border-muted-foreground/50 bg-white/5',
                                    showResult && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                <div
                                    className="w-8 h-8 rounded-lg border border-white/10 shrink-0"
                                    style={{ backgroundColor: action.color }}
                                />
                                <span className="text-sm font-medium">{action.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Quick selection buttons */}
                    <div className="mb-6">
                        <h4 className="text-xs font-medium text-muted-foreground mb-2">Seleção Rápida</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {Object.keys(QUICK_GROUPS).map((group) => (
                                <button
                                    key={group}
                                    onClick={() => handleQuickSelect(group as keyof typeof QUICK_GROUPS)}
                                    disabled={showResult}
                                    className={cn(
                                        "px-2 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 border border-border/50 transition-colors",
                                        showResult && 'opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    {group}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2">
                        <Button
                            onClick={handleVerify}
                            disabled={showResult}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Verificar
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleClear}
                                className="flex-1"
                            >
                                <Eraser className="w-4 h-4 mr-2" />
                                Apagar
                            </Button>

                            {showResult && (
                                <Button
                                    variant="outline"
                                    onClick={() => setShowReference(!showReference)}
                                    className="flex-1"
                                >
                                    {showReference ? (
                                        <>
                                            <EyeOff className="w-4 h-4 mr-2" />
                                            Ocultar
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4 mr-2" />
                                            Referência
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    {showResult && results && (
                        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-border/50 animate-fade-in">
                            <div className="flex items-center gap-3 mb-4">
                                {results.accuracy >= 90 ? (
                                    <Award className="w-6 h-6 text-yellow-400" />
                                ) : results.accuracy >= 70 ? (
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                ) : (
                                    <AlertCircle className="w-6 h-6 text-red-400" />
                                )}
                                <div>
                                    <p className="text-2xl font-bold">{results.accuracy}%</p>
                                    <p className="text-xs text-muted-foreground">de precisão</p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-emerald-400 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                        Corretos
                                    </span>
                                    <span className="font-medium">{results.correct}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-red-400 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        Incorretos
                                    </span>
                                    <span className="font-medium">{results.incorrect}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-yellow-400 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        Faltando
                                    </span>
                                    <span className="font-medium">{results.missed}</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => {
                                    handleClear()
                                }}
                                variant="ghost"
                                className="w-full mt-4"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Tentar Novamente
                            </Button>
                        </div>
                    )}

                    {/* Instructions */}
                    {!showResult && (
                        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-border/50">
                            <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">Instruções:</span> Selecione uma ação e pinte as mãos que você acredita pertencerem a ela. Depois clique em "Verificar" para ver seu resultado.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Grid area */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
                <div className="w-full max-w-[560px]">
                    <div className="glass rounded-2xl p-4">
                        {POKER_HANDS.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex w-full">
                                {row.map(hand => (
                                    <button
                                        key={hand}
                                        onMouseDown={(e) => !showResult && handleCellMouseDown(hand, e)}
                                        onMouseEnter={() => !showResult && handleCellMouseEnter(hand)}
                                        className={cn(
                                            "flex-1 aspect-square text-xs sm:text-sm font-medium rounded-md m-[2px] transition-all flex items-center justify-center grid-cell",
                                            userHands[hand] || (showReference && range.hands[hand])
                                                ? 'text-white shadow-sm'
                                                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary',
                                            showResult && 'cursor-default',
                                            getHandClass(hand)
                                        )}
                                        style={getHandStyle(hand)}
                                    >
                                        {hand}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 flex flex-wrap items-center gap-4 justify-center">
                        {range.actions.map(action => (
                            <div key={action.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: action.color }} />
                                <span className="text-sm font-medium">{action.name}</span>
                            </div>
                        ))}
                    </div>

                    {showResult && (
                        <div className="mt-4 flex flex-wrap items-center gap-4 justify-center">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                                <div className="w-3 h-3 rounded-full ring-2 ring-emerald-500" />
                                <span className="text-xs text-muted-foreground">Correto</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                                <div className="w-3 h-3 rounded-full ring-2 ring-red-500" />
                                <span className="text-xs text-muted-foreground">Incorreto</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                                <div className="w-3 h-3 rounded-full ring-2 ring-yellow-500 ring-dashed" />
                                <span className="text-xs text-muted-foreground">Faltando</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
