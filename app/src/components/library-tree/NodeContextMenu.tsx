import { Plus, Pencil, Trash2 } from 'lucide-react'
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
    isCollapsed?: boolean
}

export function NodeContextMenu({
    node,
    isOpen,
    onClose,
    onAddChild,
    onRename,
    onDelete,
    isCollapsed = false
}: NodeContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)
    const childType = getAllowedChildType(node.type)
    const addLabel = getAddChildLabel(node.type)

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
            className="absolute right-0 top-full mt-1 glass-strong rounded-xl shadow-xl py-2 z-50 w-48 animate-scale-in"
            style={{ left: isCollapsed ? '100%' : 'auto', top: isCollapsed ? '0' : 'auto' }}
        >
            {/* Add Child */}
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

            {/* Rename */}
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

            <div className="border-t border-border/50 my-2" />

            {/* Delete */}
            <button
                onClick={() => {
                    onDelete(node.id)
                    onClose()
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-red-500/10 flex items-center gap-3 text-red-400 transition-colors"
            >
                <Trash2 className="w-4 h-4" />
                Excluir
            </button>
        </div>
    )
}
