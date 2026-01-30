import { Gamepad2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyLibraryStateProps {
    isCollapsed: boolean
    onAddFormat: () => void
}

export function EmptyLibraryState({ isCollapsed, onAddFormat }: EmptyLibraryStateProps) {
    return (
        <div className={cn("px-4 py-12 text-center", isCollapsed && "px-1")}>
            <div className={cn(
                "rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center mb-4 mx-auto",
                isCollapsed ? "w-10 h-10" : "w-16 h-16"
            )}>
                <Gamepad2 className={cn("text-violet-400", isCollapsed ? "w-5 h-5" : "w-8 h-8")} />
            </div>
            {!isCollapsed && (
                <>
                    <p className="text-sm text-muted-foreground mb-4">
                        Biblioteca vazia
                    </p>
                    <Button
                        size="sm"
                        onClick={onAddFormat}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar
                    </Button>
                </>
            )}
        </div>
    )
}
