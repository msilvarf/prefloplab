import { useMemo } from 'react'
import { Trophy, Target, TrendingUp, TrendingDown, RotateCcw, Home, Flame, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HistoryItem {
    hand: string
    correct: boolean
    action: string
}

interface SessionSummaryProps {
    history: HistoryItem[]
    score: number
    totalAnswered: number
    onRestart: () => void
    onHome: () => void
}

export function SessionSummary({ history, score, totalAnswered, onRestart, onHome }: SessionSummaryProps) {
    const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0

    // Calculate statistics
    const stats = useMemo(() => {
        // Find longest streak
        let currentStreak = 0
        let longestStreak = 0
        for (const item of history) {
            if (item.correct) {
                currentStreak++
                longestStreak = Math.max(longestStreak, currentStreak)
            } else {
                currentStreak = 0
            }
        }

        // Find problematic hands (missed most frequently)
        const handErrors: Record<string, number> = {}
        const handAttempts: Record<string, number> = {}
        history.forEach(item => {
            handAttempts[item.hand] = (handAttempts[item.hand] || 0) + 1
            if (!item.correct) {
                handErrors[item.hand] = (handErrors[item.hand] || 0) + 1
            }
        })

        const problematicHands = Object.entries(handErrors)
            .map(([hand, errors]) => ({
                hand,
                errors,
                attempts: handAttempts[hand],
                errorRate: errors / handAttempts[hand]
            }))
            .sort((a, b) => b.errors - a.errors)
            .slice(0, 5)

        // Find best performing hands
        const correctHands = history.filter(h => h.correct)
        const handSuccesses: Record<string, number> = {}
        correctHands.forEach(item => {
            handSuccesses[item.hand] = (handSuccesses[item.hand] || 0) + 1
        })

        // Action breakdown
        const actionStats: Record<string, { correct: number; total: number }> = {}
        history.forEach(item => {
            if (!actionStats[item.action]) {
                actionStats[item.action] = { correct: 0, total: 0 }
            }
            actionStats[item.action].total++
            if (item.correct) {
                actionStats[item.action].correct++
            }
        })

        const actionBreakdown = Object.entries(actionStats)
            .map(([action, { correct, total }]) => ({
                action,
                correct,
                total,
                accuracy: Math.round((correct / total) * 100)
            }))
            .sort((a, b) => b.total - a.total)

        return {
            longestStreak,
            problematicHands,
            actionBreakdown,
            totalErrors: totalAnswered - score
        }
    }, [history, score, totalAnswered])

    // Determine performance tier
    const getPerformanceTier = () => {
        if (accuracy >= 95) return { label: 'Perfeito!', color: 'text-yellow-400', icon: Trophy, gradient: 'from-yellow-500/20 to-amber-500/10' }
        if (accuracy >= 85) return { label: 'Excelente!', color: 'text-emerald-400', icon: TrendingUp, gradient: 'from-emerald-500/20 to-green-500/10' }
        if (accuracy >= 70) return { label: 'Bom trabalho!', color: 'text-blue-400', icon: Target, gradient: 'from-blue-500/20 to-cyan-500/10' }
        if (accuracy >= 50) return { label: 'Continue praticando', color: 'text-amber-400', icon: TrendingDown, gradient: 'from-amber-500/20 to-orange-500/10' }
        return { label: 'Precisa melhorar', color: 'text-red-400', icon: AlertTriangle, gradient: 'from-red-500/20 to-rose-500/10' }
    }

    const tier = getPerformanceTier()
    const TierIcon = tier.icon

    return (
        <div className="h-full flex items-center justify-center p-8 overflow-auto">
            <div className="w-full max-w-2xl animate-fade-in">
                {/* Header */}
                <div className={cn(
                    "text-center mb-8 p-8 rounded-3xl bg-gradient-to-br border border-white/10",
                    tier.gradient
                )}>
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center animate-float">
                        <TierIcon className={cn("w-10 h-10", tier.color)} />
                    </div>
                    <h1 className={cn("text-3xl font-bold mb-2", tier.color)}>{tier.label}</h1>
                    <p className="text-muted-foreground">Sessão de treinamento concluída</p>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="glass rounded-2xl p-5 text-center">
                        <p className="text-4xl font-bold gradient-text">{accuracy}%</p>
                        <p className="text-sm text-muted-foreground mt-1">Precisão</p>
                    </div>
                    <div className="glass rounded-2xl p-5 text-center">
                        <p className="text-4xl font-bold text-emerald-400">{score}</p>
                        <p className="text-sm text-muted-foreground mt-1">Acertos</p>
                    </div>
                    <div className="glass rounded-2xl p-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <Flame className="w-6 h-6 text-orange-400" />
                            <p className="text-4xl font-bold text-orange-400">{stats.longestStreak}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Maior sequência</p>
                    </div>
                </div>

                {/* Action Breakdown */}
                {stats.actionBreakdown.length > 0 && (
                    <div className="glass rounded-2xl p-6 mb-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Desempenho por Ação
                        </h3>
                        <div className="space-y-3">
                            {stats.actionBreakdown.slice(0, 6).map(({ action, correct, total, accuracy: actionAccuracy }) => (
                                <div key={action} className="flex items-center gap-3">
                                    <span className="text-sm font-medium w-32 truncate">{action}</span>
                                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full transition-all duration-500",
                                                actionAccuracy >= 80 ? 'bg-emerald-500' :
                                                    actionAccuracy >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                            )}
                                            style={{ width: `${actionAccuracy}%` }}
                                        />
                                    </div>
                                    <span className={cn(
                                        "text-sm font-medium w-16 text-right",
                                        actionAccuracy >= 80 ? 'text-emerald-400' :
                                            actionAccuracy >= 60 ? 'text-amber-400' : 'text-red-400'
                                    )}>
                                        {correct}/{total}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Problematic Hands */}
                {stats.problematicHands.length > 0 && (
                    <div className="glass rounded-2xl p-6 mb-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            Mãos para Revisar
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {stats.problematicHands.map(({ hand, errors, attempts }) => (
                                <div
                                    key={hand}
                                    className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2"
                                >
                                    <span className="font-mono font-bold text-foreground">{hand}</span>
                                    <span className="text-xs text-red-400">
                                        {errors}/{attempts} erros
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent History */}
                <div className="glass rounded-2xl p-6 mb-8">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Últimas Respostas
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                        {history.slice(-30).map((item, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all",
                                    item.correct
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                )}
                                title={`${item.hand}: ${item.action}`}
                            >
                                {item.correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Button
                        onClick={onHome}
                        variant="outline"
                        size="lg"
                        className="flex-1"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Voltar ao Início
                    </Button>
                    <Button
                        onClick={onRestart}
                        size="lg"
                        className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/20"
                    >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Treinar Novamente
                    </Button>
                </div>
            </div>
        </div>
    )
}
