import { cn } from '@/lib/utils'

interface DrillCardProps {
    hand: string
    cardColors: string[]
    isStatsOpen: boolean
}

export function DrillCard({ hand, cardColors, isStatsOpen }: DrillCardProps) {
    return (
        <div className={cn(
            "poker-table rounded-[50%] flex items-center justify-center relative transition-all duration-300",
            isStatsOpen ? "w-[400px] h-[240px] scale-90" : "w-[480px] h-[280px] scale-100"
        )}>
            {/* Cards */}
            <div className="flex items-center gap-3">
                <div className={cn(
                    "rounded-xl flex items-center justify-center text-white font-bold poker-card bg-gradient-to-br shadow-xl",
                    cardColors[0],
                    isStatsOpen ? "w-16 h-24 text-3xl" : "w-20 h-28 text-4xl"
                )}>
                    {hand.charAt(0)}
                </div>
                <div className={cn(
                    "rounded-xl flex items-center justify-center text-white font-bold poker-card bg-gradient-to-br shadow-xl",
                    cardColors[1],
                    isStatsOpen ? "w-16 h-24 text-3xl" : "w-20 h-28 text-4xl"
                )}>
                    {hand.charAt(1)}
                </div>
            </div>

            {/* Hero badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                <div className="px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full text-sm font-semibold shadow-lg shadow-violet-500/30">
                    Hero
                </div>
            </div>
        </div>
    )
}
