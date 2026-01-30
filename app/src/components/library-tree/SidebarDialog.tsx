import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { LibraryNodeType } from '@/types/library'
import type { UseLibraryReturn } from '@/hooks/useLibrary'
import { getNodeTypeLabel, getNodePlaceholder } from '@/types/library'

interface SidebarDialogProps {
    mode: 'add' | 'rename' | null
    nodeType: LibraryNodeType
    parentId: string | null
    inputValue: string
    onInputChange: (value: string) => void
    onSubmit: () => void
    onClose: () => void
    library: UseLibraryReturn
}

export function SidebarDialog({
    mode,
    nodeType,
    parentId,
    inputValue,
    onInputChange,
    onSubmit,
    onClose,
    library
}: SidebarDialogProps) {
    const parentNode = parentId ? library.findNodeById(parentId) : null

    return (
        <Dialog open={mode !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="glass-strong border-border/50 rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg">
                        {mode === 'add'
                            ? `Adicionar ${getNodeTypeLabel(nodeType)}`
                            : `Renomear ${getNodeTypeLabel(nodeType)}`
                        }
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {mode === 'add' && parentNode && (
                            <>Adicionando em: <strong className="text-foreground">{parentNode.title}</strong></>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Input
                        value={inputValue}
                        onChange={(e) => onInputChange(e.target.value)}
                        placeholder={getNodePlaceholder(nodeType)}
                        className="bg-background/50 border-border/50 rounded-xl h-11"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                    />
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl">
                        Cancelar
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={!inputValue.trim()}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl"
                    >
                        {mode === 'add' ? 'Adicionar' : 'Salvar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
