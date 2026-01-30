import { ChevronLeft, BarChart2, History, Check, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface StatsPanelProps {
    isOpen: boolean
    onToggle: (open: boolean) => void
    onStop: () => void
    accuracy: number
    score: number
    totalAnswered: number
    history: Array<{ hand: string; correct: boolean; action: string }>
}

export function StatsPanel({
    isOpen,
    onToggle,
    onStop,
    accuracy,
    score,
    totalAnswered,
    history
}: StatsPanelProps) {
    return (
        <div
            className={cn(
                "border-r border-border/50 overflow-hidden bg-gradient-to-b from-card/50 to-transparent transition-all duration-300 ease-in-out shrink-0 relative",
                isOpen ? "w-80" : "w-16"
            )}
        >
            <div className="p-4 h-full flex flex-col">
                {/* Header & Toggle */}
                <div className={cn("flex items-center mb-6", isOpen ? "justify-between" : "justify-center")}>
                    {isOpen && (
                        <button
                            onClick={onStop}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors overflow-hidden whitespace-nowrap"
                        >
                            <ChevronLeft className="w-4 h-4 shrink-0" />
                            <span>Parar</span>
                        </button>
                    )}

                    <button
                        onClick={() => onToggle(!isOpen)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                        title={isOpen ? "Recolher painel" : "Expandir painel"}
                    >
                        {isOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                    </button>
                </div>

                {/* Collapsed View Icons */}
                {!isOpen && (
                    <div className="flex flex-col items-center gap-6 animate-fade-in">
                        <div className="flex flex-col items-center gap-1" title="Precisão">
                            <BarChart2 className={cn("w-5 h-5", accuracy >= 80 ? "text-emerald-400" : "text-amber-400")} />
                            <span className="text-[10px] font-bold">{accuracy}%</span>
                        </div>
                        <div className="w-full h-px bg-border/50" />
                        <div className="flex flex-col items-center gap-2" title="Histórico Recente">
                            {history.slice(-5).reverse().map((item, idx) => (
                                <div key={idx} className={cn("w-2 h-2 rounded-full", item.correct ? "bg-emerald-400" : "bg-red-400")} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Expanded View Content */}
                {isOpen && (
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
                                <span>{totalAnswered - score} erradas</span>
                            </div>
                        </div>

                        {/* History */}
                        <div className="min-h-0 flex-1 flex flex-col">
                            <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2 shrink-0">
                                <History className="w-3.5 h-3.5" /> Histórico
                            </h4>
                            <div className="overflow-y-auto pr-2 space-y-2 flex-1">
                                {history.slice().reverse().map((item, idx) => (
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
                                {history.length === 0 && (
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
    )
}
