import { Trophy, X, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResultFeedbackProps {
    show: boolean
    correct: boolean
    correctAction: string
    onNext?: () => void
}

export function ResultFeedback({ show, correct, correctAction, onNext }: ResultFeedbackProps) {
    if (!show) return null

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-fade-in-up z-10">
            {/* Feedback message */}
            <div className={cn(
                "px-8 py-4 rounded-2xl text-center flex items-center gap-3 shadow-2xl backdrop-blur-md whitespace-nowrap",
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

            {/* Next button - only show for incorrect answers */}
            {!correct && onNext && (
                <button
                    onClick={onNext}
                    className="group w-16 h-16 rounded-full bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-600/50 shadow-2xl backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                    title="Próxima mão"
                >
                    <div className="flex items-center gap-0.5 text-zinc-300 group-hover:text-white transition-colors">
                        <div className="w-0.5 h-5 bg-current rounded-full" />
                        <Play className="w-6 h-6 fill-current" />
                    </div>
                </button>
            )}
        </div>
    )
}
