import { useState, useRef, useEffect } from 'react'
import {
  ChevronRight, ChevronDown, Plus, MoreVertical,
  Gamepad2, Users, Coins, Grid3X3, Pencil, Trash2,
  ChevronUp, ChevronsUpDown
} from 'lucide-react'
import type { LibraryNode, LibraryNodeType } from '@/types/library'
import { getAllowedChildType, getAddChildLabel, getNodePlaceholder, getNodeTypeLabel } from '@/types/library'
import type { UseLibraryReturn } from '@/hooks/useLibrary'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SidebarProps {
  library: UseLibraryReturn
  onSelectChart: (node: LibraryNode) => void
}

/**
 * Get the icon for each node type
 */
function NodeIcon({ type, className }: { type: LibraryNodeType; className?: string }) {
  const iconClass = cn('w-4 h-4', className)
  switch (type) {
    case 'format':
      return <Gamepad2 className={iconClass} />
    case 'scenario':
      return <Users className={iconClass} />
    case 'stack':
      return <Coins className={iconClass} />
    case 'chart':
      return <Grid3X3 className={iconClass} />
  }
}

/**
 * Get colors for each node type
 */
function getNodeColor(type: LibraryNodeType): string {
  switch (type) {
    case 'format':
      return 'text-violet-400'
    case 'scenario':
      return 'text-blue-400'
    case 'stack':
      return 'text-amber-400'
    case 'chart':
      return 'text-emerald-400'
  }
}

export function Sidebar({ library, onSelectChart }: SidebarProps) {
  // Dialog state
  const [dialogMode, setDialogMode] = useState<'add' | 'rename' | null>(null)
  const [dialogNodeType, setDialogNodeType] = useState<LibraryNodeType>('format')
  const [parentId, setParentId] = useState<string | null>(null)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')

  // Context menu state
  const [contextMenuId, setContextMenuId] = useState<string | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /**
   * Open add dialog (or auto-create for Charts)
   */
  const openAddDialog = (type: LibraryNodeType, parent: string | null) => {
    // For charts, auto-generate a name and create immediately
    if (type === 'chart' && parent) {
      const parentNode = library.findNodeById(parent)
      const existingCharts = parentNode?.children?.length || 0
      const chartName = `Range ${existingCharts + 1}`
      library.addNode(parent, 'chart', chartName)
      setContextMenuId(null)
      return
    }

    setDialogMode('add')
    setDialogNodeType(type)
    setParentId(parent)
    setInputValue('')
    setContextMenuId(null)
  }

  /**
   * Open rename dialog
   */
  const openRenameDialog = (node: LibraryNode) => {
    setDialogMode('rename')
    setDialogNodeType(node.type)
    setEditingNodeId(node.id)
    setInputValue(node.title)
    setContextMenuId(null)
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

    setDialogMode(null)
    setParentId(null)
    setEditingNodeId(null)
    setInputValue('')
  }

  /**
   * Handle delete
   */
  const handleDelete = (id: string) => {
    library.deleteNode(id)
    setContextMenuId(null)
  }

  /**
   * Render a single tree node
   */
  const renderNode = (node: LibraryNode, depth: number = 0) => {
    const isExpanded = library.expandedIds.has(node.id)
    const isSelected = library.selectedId === node.id
    const hasChildren = node.children && node.children.length > 0
    const isChart = node.type === 'chart'
    const childType = getAllowedChildType(node.type)
    const addLabel = getAddChildLabel(node.type)

    return (
      <div key={node.id}>
        {/* Node row */}
        <div
          className={cn(
            'flex items-center gap-1 py-1.5 hover:bg-accent/50 cursor-pointer group',
            isSelected && 'bg-accent'
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={() => {
            library.selectNode(node.id)
            if (isChart) {
              onSelectChart(node)
            } else {
              library.toggleExpand(node.id)
            }
          }}
        >
          {/* Expand/collapse chevron */}
          <div className="w-4 h-4 flex items-center justify-center">
            {!isChart && (
              isExpanded ? (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              )
            )}
          </div>

          {/* Node icon */}
          <NodeIcon type={node.type} className={getNodeColor(node.type)} />

          {/* Node title */}
          <span className={cn(
            'text-sm flex-1 truncate',
            isSelected && 'font-medium'
          )}>
            {node.title}
          </span>

          {/* Context menu button + dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setContextMenuId(contextMenuId === node.id ? null : node.id)
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-opacity"
            >
              <MoreVertical className="w-3 h-3" />
            </button>

            {/* Context menu dropdown */}
            {contextMenuId === node.id && (
              <div
                ref={contextMenuRef}
                className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg py-1 z-50 w-44"
              >
                {/* Add child (if not chart) */}
                {childType && addLabel && (
                  <button
                    onClick={() => openAddDialog(childType, node.id)}
                    className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    {addLabel}
                  </button>
                )}

                {/* Rename */}
                <button
                  onClick={() => openRenameDialog(node)}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent flex items-center gap-2"
                >
                  <Pencil className="w-3 h-3" />
                  Renomear
                </button>

                {/* Reorder */}
                <button
                  onClick={() => {
                    library.moveNode(node.id, 'up')
                    setContextMenuId(null)
                  }}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent flex items-center gap-2"
                >
                  <ChevronUp className="w-3 h-3" />
                  Mover para cima
                </button>
                <button
                  onClick={() => {
                    library.moveNode(node.id, 'down')
                    setContextMenuId(null)
                  }}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent flex items-center gap-2"
                >
                  <ChevronDown className="w-3 h-3" />
                  Mover para baixo
                </button>

                <div className="border-t border-border my-1" />

                {/* Delete */}
                <button
                  onClick={() => handleDelete(node.id)}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent flex items-center gap-2 text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div>
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}

        {/* Empty state for expanded nodes */}
        {isExpanded && !hasChildren && !isChart && childType && (
          <div
            className="py-1.5 text-xs text-muted-foreground italic cursor-pointer hover:text-foreground"
            style={{ paddingLeft: `${28 + depth * 16}px` }}
            onClick={() => openAddDialog(childType, node.id)}
          >
            <Plus className="w-3 h-3 inline mr-1" />
            {addLabel}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-border flex flex-col shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => openAddDialog('format', null)}
            className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
            title="Adicionar Formato"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={library.expandAll}
            className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
            title="Expandir tudo"
          >
            <ChevronsUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-auto py-2">
        <div className="px-3 py-1 text-xs text-muted-foreground uppercase tracking-wider">
          Minha biblioteca
        </div>

        {library.nodes.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mb-3">
              Biblioteca vazia
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAddDialog('format', null)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Adicionar Formato
            </Button>
          </div>
        ) : (
          library.nodes.map(node => renderNode(node))
        )}
      </div>

      {/* Footer - Legend */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            Formato
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Cenário
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Stack
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Chart
          </span>
        </div>
      </div>

      {/* Add/Rename Dialog */}
      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'add'
                ? `Adicionar ${getNodeTypeLabel(dialogNodeType)}`
                : `Renomear ${getNodeTypeLabel(dialogNodeType)}`
              }
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'add' && parentId && (
                <>Adicionando em: <strong>{library.findNodeById(parentId)?.title}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={getNodePlaceholder(dialogNodeType)}
              className="bg-background border-border"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogMode(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!inputValue.trim()}>
              {dialogMode === 'add' ? 'Adicionar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  )
}
