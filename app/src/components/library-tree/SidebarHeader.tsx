import { FolderOpen, Plus, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarHeaderProps {
    isCollapsed: boolean
    onToggleCollapse: () => void
    onAddFormat: () => void
}

export function SidebarHeader({ isCollapsed, onToggleCollapse, onAddFormat }: SidebarHeaderProps) {
    return (
        <div className={cn(
            "border-b border-border/50 h-16 flex items-center",
            isCollapsed ? "justify-center p-0" : "justify-between p-4"
        )}>
            {!isCollapsed && (
                <div className="flex items-center gap-2 animate-fade-in">
                    <FolderOpen className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-medium whitespace-nowrap">Biblioteca</span>
                </div>
            )}

            <div className={cn("flex items-center gap-1", isCollapsed && "w-full justify-center flex-col py-2 gap-2")}>
                {!isCollapsed && (
                    <button
                        onClick={onAddFormat}
                        className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-all duration-200"
                        title="Adicionar Formato"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}

                <button
                    onClick={onToggleCollapse}
                    className={cn(
                        "p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-all duration-200",
                        isCollapsed && "hover:bg-white/10"
                    )}
                    title={isCollapsed ? "Expandir" : "Recolher"}
                >
                    {isCollapsed ? <PanelLeftOpen className="w-5 h-5 text-violet-400" /> : <PanelLeftClose className="w-4 h-4" />}
                </button>

                {/* Add button for collapsed state */}
                {isCollapsed && (
                    <button
                        onClick={onAddFormat}
                        className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-green-400 transition-all duration-200 mt-1"
                        title="Adicionar Formato"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    )
}
