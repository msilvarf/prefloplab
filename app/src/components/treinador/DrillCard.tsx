import { cn } from '@/lib/utils'

interface DrillCardProps {
    hand: string
    cardColors: any[]
    isStatsOpen: boolean
}

export function DrillCard({ hand, cardColors, isStatsOpen }: DrillCardProps) {
    return (
        <div className={cn(
            "poker-table rounded-[100px] flex items-center justify-center relative transition-all duration-300 border-8 border-[#1a1c2e] shadow-2xl",
            isStatsOpen ? "w-[580px] h-[320px] scale-100" : "w-[680px] h-[380px] scale-100"
        )}>
            {/* Table Felt Gradient Overlay (optional, if css class poker-table isn't enough) */}
            <div className="absolute inset-0 rounded-[90px] bg-black/20 pointer-events-none" />

            {/* Cards */}
            <div className="flex items-center gap-6 relative z-10">
                {/* Card 1 */}
                <div className={cn(
                    "rounded-xl relative flex flex-col items-center justify-between p-3 select-none transition-all shadow-xl ring-1 ring-black/10",
                    "bg-gradient-to-br",
                    cardColors[0].bg,
                    cardColors[0].text,
                    isStatsOpen ? "w-[100px] h-[140px]" : "w-[120px] h-[168px]"
                )}>
                    {/* Top Left */}
                    <div className="self-start flex flex-col items-center leading-none">
                        <span className="text-2xl font-bold">{hand.charAt(0)}</span>
                        <span className="text-lg opacity-80">{cardColors[0].symbol}</span>
                    </div>

                    {/* Center */}
                    <span className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                        isStatsOpen ? "text-5xl" : "text-6xl"
                    )}>{cardColors[0].symbol}</span>

                    {/* Bottom Right */}
                    <div className="self-end flex flex-col items-center leading-none rotate-180">
                        <span className="text-2xl font-bold">{hand.charAt(0)}</span>
                        <span className="text-lg opacity-80">{cardColors[0].symbol}</span>
                    </div>
                </div>

                {/* Card 2 */}
                <div className={cn(
                    "rounded-xl relative flex flex-col items-center justify-between p-3 select-none transition-all shadow-xl ring-1 ring-black/10",
                    "bg-gradient-to-br",
                    cardColors[1].bg,
                    cardColors[1].text,
                    isStatsOpen ? "w-[100px] h-[140px]" : "w-[120px] h-[168px]"
                )}>
                    {/* Top Left */}
                    <div className="self-start flex flex-col items-center leading-none">
                        <span className="text-2xl font-bold">{hand.charAt(1)}</span>
                        <span className="text-lg opacity-80">{cardColors[1].symbol}</span>
                    </div>

                    {/* Center */}
                    <span className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                        isStatsOpen ? "text-5xl" : "text-6xl"
                    )}>{cardColors[1].symbol}</span>

                    {/* Bottom Right */}
                    <div className="self-end flex flex-col items-center leading-none rotate-180">
                        <span className="text-2xl font-bold">{hand.charAt(1)}</span>
                        <span className="text-lg opacity-80">{cardColors[1].symbol}</span>
                    </div>
                </div>
            </div>

            {/* Hero badge */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
                <div className="px-8 py-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full text-base font-bold text-white shadow-lg shadow-violet-900/40 ring-4 ring-[#0f111a]">
                    Hero
                </div>
            </div>
        </div>
    )
}
