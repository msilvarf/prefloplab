import { cn } from '@/lib/utils'

interface ActionButtonsProps {
    actions: Array<{ name: string; color: string }>
    onAnswer: (action: string) => void
    disabled: boolean
    showResult: boolean
    correctAction: string
    lastAnswer: { correct: boolean; action: string } | null
}

export function ActionButtons({
    actions,
    onAnswer,
    disabled,
    showResult,
    correctAction,
    lastAnswer
}: ActionButtonsProps) {
    return (
        <div className="mt-12 flex flex-wrap justify-center gap-3 max-w-2xl">
            {actions.map((action, idx) => (
                <button
                    key={`${action.name}-${idx}`}
                    onClick={() => onAnswer(action.name)}
                    disabled={disabled}
                    className={cn(
                        "px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 action-btn text-white shadow-lg shadow-black/20",
                        showResult && action.name === correctAction && 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-background scale-105',
                        showResult && lastAnswer?.action === action.name && !lastAnswer.correct && 'ring-2 ring-red-400 ring-offset-2 ring-offset-background'
                    )}
                    style={{ backgroundColor: action.color }}
                >
                    {action.name}
                </button>
            ))}
        </div>
    )
}
