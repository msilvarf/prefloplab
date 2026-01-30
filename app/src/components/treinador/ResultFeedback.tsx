import { Trophy, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResultFeedbackProps {
    show: boolean
    correct: boolean
    correctAction: string
}

export function ResultFeedback({ show, correct, correctAction }: ResultFeedbackProps) {
    if (!show) return null

    return (
        <div className={cn(
            "absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl text-center animate-fade-in-up flex items-center gap-3 shadow-2xl backdrop-blur-md whitespace-nowrap z-10",
            correct ? 'bg-emerald-900/80 border border-emerald-500/50' : 'bg-red-900/80 border border-red-500/50'
        )}>
            {correct ? (
                <>
                    <Trophy className="w-6 h-6 text-emerald-400 drop-shadow-md" />
                    <span className="text-emerald-100 font-bold text-lg">Correto! {correctAction}</span>
                </>
            ) : (
                <>
                    <X className="w-6 h-6 text-red-400 drop-shadow-md" />
                    <span className="text-red-100 font-bold text-lg">Incorreto. Resposta: {correctAction}</span>
                </>
            )}
        </div>
    )
}
