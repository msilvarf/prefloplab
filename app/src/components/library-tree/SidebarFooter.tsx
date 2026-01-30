

interface SidebarFooterProps {
    isCollapsed: boolean
}

export function SidebarFooter({ isCollapsed }: SidebarFooterProps) {
    if (isCollapsed) return null

    return (
        <div className="p-4 border-t border-border/50 bg-black/20 animate-fade-in">
            <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50" />
                    Formato
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    Chart
                </span>
            </div>
        </div>
    )
}
