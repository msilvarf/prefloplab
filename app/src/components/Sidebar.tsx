import { useState, useRef, useEffect } from 'react'
import {
  ChevronRight, ChevronDown, Plus, MoreVertical,
  Gamepad2, Users, Coins, Grid3X3, Pencil, Trash2,
  ChevronUp, ChevronsUpDown, FolderOpen, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import type { LibraryNode, LibraryNodeType } from '@/types/library'
import { getAllowedChildType, getAddChildLabel, getNodePlaceholder, getNodeTypeLabel } from '@/types/library'
import type { UseLibraryReturn } from '@/hooks/useLibrary'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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

/**
 * Get background gradient for each node type (subtle)
 */
function getNodeBgGradient(type: LibraryNodeType): string {
  switch (type) {
    case 'format':
      return 'from-violet-500/10 to-transparent'
    case 'scenario':
      return 'from-blue-500/10 to-transparent'
    case 'stack':
      return 'from-amber-500/10 to-transparent'
    case 'chart':
      return 'from-emerald-500/10 to-transparent'
  }
}

export function Sidebar({ library, onSelectChart }: SidebarProps) {
  // Collapsed state - Default TRUE as requested
  const [isCollapsed, setIsCollapsed] = useState(true)

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

    // Helper to prevent deep indentation in collapsed mode (optional, but cleaner)
    const paddingLeft = isCollapsed ? 0 : depth * 12

    return (
      <div key={node.id} className="animate-fade-in relative">
        <TooltipProvider delayDuration={500}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex items-center gap-2 py-2 px-2 mx-2 rounded-lg cursor-pointer group transition-all duration-200',
                  isSelected
                    ? `bg-gradient-to-r ${getNodeBgGradient(node.type)} border-l-2 border-${node.type === 'format' ? 'violet' : node.type === 'scenario' ? 'blue' : node.type === 'stack' ? 'amber' : 'emerald'}-400`
                    : 'hover:bg-white/5',
                  isCollapsed && 'justify-center mx-1 px-1'
                )}
                style={{ marginLeft: isCollapsed ? 0 : `${paddingLeft}px` }}
                onClick={() => {
                  if (isCollapsed) {
                    setIsCollapsed(false)
                    library.selectNode(node.id)
                    if (isChart) onSelectChart(node)
                  } else {
                    library.selectNode(node.id)
                    if (isChart) {
                      onSelectChart(node)
                    } else {
                      library.toggleExpand(node.id)
                    }
                  }
                }}
              >
                {/* Expand/collapse chevron - Hide if collapsed */}
                {!isCollapsed && (
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    {!isChart && (
                      <div className={cn(
                        "transition-transform duration-200",
                        isExpanded && "rotate-90"
                      )}>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                )}

                {/* Node icon */}
                <div className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                  isSelected ? "bg-white/10" : "bg-transparent"
                )}>
                  <NodeIcon type={node.type} className={getNodeColor(node.type)} />
                </div>

                {/* Node title - Hide if collapsed */}
                {!isCollapsed && (
                  <span className={cn(
                    'text-sm flex-1 truncate transition-colors',
                    isSelected ? 'font-medium text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )}>
                    {node.title}
                  </span>
                )}

                {/* Children count badge - Hide if collapsed */}
                {!isCollapsed && hasChildren && !isChart && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                    {node.children!.length}
                  </span>
                )}

                {/* Context menu button - Only show if expanded or handle differently */}
                {!isCollapsed && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setContextMenuId(contextMenuId === node.id ? null : node.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-md transition-all duration-200"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {contextMenuId === node.id && (
                      <div
                        ref={contextMenuRef}
                        className="absolute right-0 top-full mt-1 glass-strong rounded-xl shadow-xl py-2 z-50 w-48 animate-scale-in"
                        style={{ left: isCollapsed ? '100%' : 'auto', top: isCollapsed ? '0' : 'auto' }}
                      >
                        {childType && addLabel && (
                          <button
                            onClick={() => openAddDialog(childType, node.id)}
                            className="w-full px-3 py-2 text-sm text-left hover:bg-white/5 flex items-center gap-3 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-emerald-400" />
                            {addLabel}
                          </button>
                        )}
                        <button onClick={() => openRenameDialog(node)} className="w-full px-3 py-2 text-sm text-left hover:bg-white/5 flex items-center gap-3 transition-colors">
                          <Pencil className="w-4 h-4 text-blue-400" /> Renomear
                        </button>
                        <div className="border-t border-border/50 my-2" />
                        <button onClick={() => handleDelete(node.id)} className="w-full px-3 py-2 text-sm text-left hover:bg-red-500/10 flex items-center gap-3 text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" /> Excluir
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">
              <p>{node.title}</p>
              <p className="text-[10px] text-muted-foreground">{getNodeTypeLabel(node.type)}</p>
            </TooltipContent>}
          </Tooltip>
        </TooltipProvider>

        {/* Children - Only render if Expanded AND NOT Collapsed */}
        {!isCollapsed && isExpanded && hasChildren && (
          <div className="mt-1">
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}

        {/* Empty state addon */}
        {!isCollapsed && isExpanded && !hasChildren && !isChart && childType && (
          <div
            className="py-2 px-4 text-xs text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors flex items-center gap-2"
            style={{ marginLeft: `${(depth + 1) * 12 + 8}px` }}
            onClick={() => openAddDialog(childType, node.id)}
          >
            <Plus className="w-3 h-3" />
            {addLabel}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={cn(
        "bg-gradient-to-b from-sidebar to-background border-r border-border/50 flex flex-col shrink-0 transition-all duration-300 ease-in-out relative z-20",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50 h-16 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 animate-fade-in">
            <FolderOpen className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium whitespace-nowrap">Biblioteca</span>
          </div>
        )}

        <div className={cn("flex items-center gap-1", isCollapsed && "w-full justify-center")}>
          {!isCollapsed && (
            <button
              onClick={() => openAddDialog('format', null)}
              className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-all duration-200"
              title="Adicionar Formato"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-all duration-200"
            title={isCollapsed ? "Expandir" : "Recolher"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-auto py-3 no-scrollbar">
        {library.nodes.length === 0 ? (
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
                  onClick={() => openAddDialog('format', null)}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {library.nodes.map(node => renderNode(node))}
          </div>
        )}
      </div>

      {/* Footer - Legend */}
      {!isCollapsed && (
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
      )}

      {/* Add/Rename Dialog */}
      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="glass-strong border-border/50 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {dialogMode === 'add'
                ? `Adicionar ${getNodeTypeLabel(dialogNodeType)}`
                : `Renomear ${getNodeTypeLabel(dialogNodeType)}`
              }
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {dialogMode === 'add' && parentId && (
                <>Adicionando em: <strong className="text-foreground">{library.findNodeById(parentId)?.title}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={getNodePlaceholder(dialogNodeType)}
              className="bg-background/50 border-border/50 rounded-xl h-11"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDialogMode(null)} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl"
            >
              {dialogMode === 'add' ? 'Adicionar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  )
}
