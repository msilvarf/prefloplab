import { Target } from 'lucide-react'
import type { Range } from '@/types'
import { POKER_HANDS } from '@/types'
import type { TrainingHand } from '@/hooks/useDrillSession'
import { cn } from '@/lib/utils'

interface ReferenceRangeProps {
    currentRange: Range | null
    activeScenarios: TrainingHand[]
    currentHand: TrainingHand
    isStatsOpen: boolean
    showReference: boolean
}

export function ReferenceRange({
    currentRange,
    activeScenarios,
    currentHand,
    isStatsOpen,
    showReference
}: ReferenceRangeProps) {
    return (
        <div className={cn(
            "border-l border-border/50 p-6 overflow-auto bg-gradient-to-b from-card/50 to-transparent transition-all duration-300 shrink-0",
            isStatsOpen ? "w-[400px]" : "w-[500px]"
        )}>
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-400" />
                Range de referência
            </h4>

            {/* Only show if requested */}
            <div className={cn(
                "transition-all duration-500 ease-out origin-top-right",
                showReference ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            )}>
                <div className="glass rounded-xl p-4 shadow-xl">
                    {POKER_HANDS.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex">
                            {row.map(hand => {
                                let bgColor = 'transparent'
                                let isCurrentHand = hand === currentHand.hand.replace('s', '').replace('o', '')
                                let opacity = 0.35

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
                                            "flex-1 aspect-square font-bold rounded-[3px] m-[1px] flex items-center justify-center transition-all",
                                            isStatsOpen ? "text-[10px]" : "text-xs",
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

                {/* Helper Legend */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center opacity-80">
                    {currentRange?.actions.slice(0, 4).map(action => (
                        <div key={action.id} className="flex items-center gap-1.5 text-[10px] bg-white/5 px-2 py-1 rounded">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: action.color }} />
                            <span>{action.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {!showReference && (
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
    )
}
