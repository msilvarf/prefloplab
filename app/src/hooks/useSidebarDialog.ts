import { useState } from 'react'
import type { LibraryNodeType, LibraryNode } from '@/types/library'
import type { UseLibraryReturn } from '@/hooks/useLibrary'

export function useSidebarDialog(library: UseLibraryReturn) {
    const [dialogMode, setDialogMode] = useState<'add' | 'rename' | null>(null)
    const [dialogNodeType, setDialogNodeType] = useState<LibraryNodeType>('format')
    const [parentId, setParentId] = useState<string | null>(null)
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
    const [inputValue, setInputValue] = useState('')

    /**
     * Open add dialog (or auto-create for Charts)
     */
    const openAddDialog = (type: LibraryNodeType, parent: string | null, onClose?: () => void) => {
        // For charts, auto-generate a name and create immediately
        if (type === 'chart' && parent) {
            const parentNode = library.findNodeById(parent)
            const existingCharts = parentNode?.children?.length || 0
            const chartName = `Range ${existingCharts + 1}`
            library.addNode(parent, 'chart', chartName)
            onClose?.()
            return
        }

        setDialogMode('add')
        setDialogNodeType(type)
        setParentId(parent)
        setInputValue('')
        onClose?.()
    }

    /**
     * Open rename dialog
     */
    const openRenameDialog = (node: LibraryNode, onClose?: () => void) => {
        setDialogMode('rename')
        setDialogNodeType(node.type)
        setEditingNodeId(node.id)
        setInputValue(node.title)
        onClose?.()
    }

    /**
     * Handle dialog submit
     */
    const handleSubmit = () => {
        if (!inputValue.trim()) return

        if (dialogMode === 'add') {
            if (dialogNodeType === 'format') {
                library.addFormat(inputValue.trim())
            } else if (parentId) {
                library.addNode(parentId, dialogNodeType, inputValue.trim())
            }
        } else if (dialogMode === 'rename' && editingNodeId) {
            library.renameNode(editingNodeId, inputValue.trim())
        }

        closeDialog()
    }

    const closeDialog = () => {
        setDialogMode(null)
        setParentId(null)
        setEditingNodeId(null)
        setInputValue('')
    }

    return {
        dialogMode,
        dialogNodeType,
        parentId,
        inputValue,
        setInputValue,
        openAddDialog,
        openRenameDialog,
        handleSubmit,
        closeDialog,
    }
}
