import { Plus, Pencil, Trash2, Copy, Clipboard, ClipboardPaste, ChevronUp, ChevronDown, GraduationCap, FolderPlus } from 'lucide-react'
import type { LibraryNode, LibraryNodeType } from '@/types/library'
import { getAllowedChildType, getAddChildLabel } from '@/types/library'
import { useRef, useEffect } from 'react'

interface NodeContextMenuProps {
    node: LibraryNode
    isOpen: boolean
    onClose: () => void
    onAddChild: (type: LibraryNodeType, parentId: string) => void
    onRename: (node: LibraryNode) => void
    onDelete: (id: string) => void
    onCopy?: (node: LibraryNode) => void
    onPaste?: (parentId: string) => void
    onClone?: (nodeId: string) => void
    onMoveUp?: (nodeId: string) => void
    onMoveDown?: (nodeId: string) => void
    onTrain?: (node: LibraryNode) => void
    canPaste?: boolean
    isCollapsed?: boolean
}

export function NodeContextMenu({
    node,
    isOpen,
    onClose,
    onAddChild,
    onRename,
    onDelete,
    onCopy,
    onPaste,
    onClone,
    onMoveUp,
    onMoveDown,
    onTrain,
    canPaste = false,
    isCollapsed = false
}: NodeContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)
    const childType = getAllowedChildType(node.type)
    const addLabel = getAddChildLabel(node.type)
    const isChart = node.type === 'chart'

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            ref={menuRef}
            className="absolute right-0 top-full mt-1 glass-strong rounded-xl shadow-xl py-2 z-50 w-52 animate-scale-in"
            style={{ left: isCollapsed ? '100%' : 'auto', top: isCollapsed ? '0' : 'auto' }}
        >
            {/* Add Child (para não-charts) */}
            {childType && addLabel && (
                <button
                    onClick={() => {
                        onAddChild(childType, node.id)
                        onClose()
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-white/5 flex items-center gap-3 transition-colors"
                >
                    <Plus className="w-4 h-4 text-emerald-400" />
                    {addLabel}
                </button>
            )}

            {/* Adicionar Pasta (apenas para format e scenario) */}
            {(node.type === 'format' || node.type === 'scenario') && (
                <button
                    onClick={() => {
                        if (childType) {
                            onAddChild(childType, node.id)
                        }
                        onClose()
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-white/5 flex items-center gap-3 transition-colors text-muted-foreground"
                >
                    <FolderPlus className="w-4 h-4 text-amber-400" />
                    Adicionar pasta
                </button>
            )}

            {/* Treinar Range (apenas para charts) */}
            {isChart && onTrain && (
                <button
                    onClick={() => {
                        onTrain(node)
                        onClose()
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-white/5 flex items-center gap-3 transition-colors"
                >
                    <GraduationCap className="w-4 h-4 text-purple-400" />
                    Treinar range
                </button>
            )}

            <div className="border-t border-border/50 my-2" />

            {/* Clonar */}
            {onClone && (
                <button
                    onClick={() => {
                        onClone(node.id)
                        onClose()
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-white/5 flex items-center gap-3 transition-colors"
                >
                    <Copy className="w-4 h-4 text-blue-400" />
                    Clonar {isChart ? 'range' : node.type === 'stack' ? 'stack' : node.type === 'scenario' ? 'cenário' : 'formato'}
                </button>
            )}

            {/* Copiar */}
            {onCopy && (
                <button
                    onClick={() => {
                        onCopy(node)
                        onClose()
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-white/5 flex items-center gap-3 transition-colors"
                >
                    <Clipboard className="w-4 h-4 text-cyan-400" />
                    Copiar {isChart ? 'range' : node.type === 'stack' ? 'stack' : node.type === 'scenario' ? 'cenário' : 'formato'}
                </button>
            )}

            {/* Colar */}
            {onPaste && !isChart && (
                <button
                    onClick={() => {
                        if (canPaste) {
                            onPaste(node.id)
                        }
                        onClose()
                    }}
                    disabled={!canPaste}
                    className={`w-full px-3 py-2 text-sm text-left flex items-center gap-3 transition-colors ${canPaste ? 'hover:bg-white/5' : 'opacity-40 cursor-not-allowed'
                        }`}
                >
                    <ClipboardPaste className="w-4 h-4 text-teal-400" />
                    Colar range
                </button>
            )}

            <div className="border-t border-border/50 my-2" />

            {/* Mover para cima */}
            {onMoveUp && (
                <button
                    onClick={() => {
                        onMoveUp(node.id)
                        onClose()
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-white/5 flex items-center gap-3 transition-colors"
                >
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                    Mover para cima
                </button>
            )}

            {/* Mover para baixo */}
            {onMoveDown && (
                <button
                    onClick={() => {
                        onMoveDown(node.id)
                        onClose()
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-white/5 flex items-center gap-3 transition-colors"
                >
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                    Mover para baixo
                </button>
            )}

            <div className="border-t border-border/50 my-2" />

            {/* Renomear */}
            <button
                onClick={() => {
                    onRename(node)
                    onClose()
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-white/5 flex items-center gap-3 transition-colors"
            >
                <Pencil className="w-4 h-4 text-blue-400" />
                Renomear
            </button>

            {/* Excluir */}
            <button
                onClick={() => {
                    onDelete(node.id)
                    onClose()
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-red-500/10 flex items-center gap-3 text-red-400 transition-colors"
            >
                <Trash2 className="w-4 h-4" />
                Apagar {isChart ? 'range' : node.type === 'stack' ? 'stack' : node.type === 'scenario' ? 'cenário' : 'formato'}
            </button>
        </div>
    )
}
