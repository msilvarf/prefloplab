import { useState } from 'react'
import { ChevronRight, MoreVertical, Plus, Folder, FolderOpen } from 'lucide-react'
import type { LibraryNode, LibraryNodeType } from '@/types/library'
import type { UseLibraryReturn } from '@/hooks/useLibrary'
import { getAllowedChildType, getAddChildLabel, getNodeTypeLabel } from '@/types/library'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { NodeIcon, getNodeColor } from './NodeStyles'
import { NodeContextMenu } from './NodeContextMenu'
import { cn } from '@/lib/utils'

interface TreeNodeProps {
    node: LibraryNode
    depth?: number
    isCollapsed: boolean
    library: UseLibraryReturn
    onSelectChart: (node: LibraryNode) => void
    onToggleCollapse: () => void
    onAddChild: (type: LibraryNodeType, parentId: string) => void
    onRename: (node: LibraryNode) => void
    onDelete: (id: string) => void
    onTrain?: (node: LibraryNode) => void
}

export function TreeNode({
    node,
    depth = 0,
    isCollapsed,
    library,
    onSelectChart,
    onToggleCollapse,
    onAddChild,
    onRename,
    onDelete,
    onTrain
}: TreeNodeProps) {
    const [contextMenuOpen, setContextMenuOpen] = useState(false)

    const isExpanded = library.expandedIds.has(node.id)
    const isSelected = library.selectedId === node.id
    const hasChildren = node.children && node.children.length > 0
    const isChart = node.type === 'chart' || (node.type === 'stack' && !!node.rangeId)
    const childType = getAllowedChildType(node.type)
    const addLabel = getAddChildLabel(node.type)

    // É uma "pasta" se não é chart (format, scenario, stack)
    const isFolder = !isChart

    const paddingLeft = isCollapsed ? 0 : depth * 16

    const handleNodeClick = () => {
        if (isCollapsed) {
            onToggleCollapse() // Expand on interaction
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
    }

    // Handlers para o menu de contexto
    const handleCopy = () => {
        library.copyNode(node)
    }

    const handlePaste = () => {
        library.pasteNode(node.id)
    }

    const handleClone = () => {
        library.cloneNode(node.id)
    }

    const handleMoveUp = () => {
        library.moveNode(node.id, 'up')
    }

    const handleMoveDown = () => {
        library.moveNode(node.id, 'down')
    }

    // Verifica se pode colar neste nó
    const canPaste = library.canPaste(node.id)

    // Ícone dinâmico baseado no tipo
    const renderNodeIcon = () => {
        if (isFolder) {
            // Usar ícone de pasta para nós que não são chart
            if (isExpanded && hasChildren) {
                return <FolderOpen className={cn("w-4 h-4", getNodeColor(node.type))} />
            }
            return <Folder className={cn("w-4 h-4", getNodeColor(node.type))} />
        }
        // Para charts, usar o ícone de grid
        return <NodeIcon type={node.type} className={cn("w-4 h-4", getNodeColor(node.type))} />
    }

    return (
        <div className="animate-fade-in relative">
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className={cn(
                                'flex items-center gap-2 py-1.5 px-2 mx-1 rounded cursor-pointer group transition-all duration-150',
                                isSelected
                                    ? 'bg-white/10 border-l-2 border-primary'
                                    : 'hover:bg-white/5 border-l-2 border-transparent',
                                isCollapsed && 'justify-center mx-1 px-1 py-3 mb-1'
                            )}
                            style={{ marginLeft: isCollapsed ? 0 : `${paddingLeft}px` }}
                            onClick={handleNodeClick}
                        >
                            {/* Expand/collapse chevron - Hide if collapsed */}
                            {!isCollapsed && (
                                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                    {isFolder && (
                                        <div className={cn(
                                            "transition-transform duration-200",
                                            isExpanded && "rotate-90"
                                        )}>
                                            <ChevronRight className="w-3 h-3 text-muted-foreground/70" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Node icon - Larger wrapper when collapsed */}
                            <div className={cn(
                                "flex items-center justify-center shrink-0 transition-all",
                                isCollapsed ? "w-10 h-10 bg-white/5 border border-white/5 shadow-sm rounded-md" : ""
                            )}>
                                {renderNodeIcon()}
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

                            {/* Children count badge - Only show for folders with children */}
                            {!isCollapsed && hasChildren && isFolder && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground font-medium">
                                    {node.children!.length}
                                </span>
                            )}

                            {/* Context menu button - Only show if expanded */}
                            {!isCollapsed && (
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setContextMenuOpen(!contextMenuOpen)
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all duration-200"
                                    >
                                        <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                                    </button>

                                    <NodeContextMenu
                                        node={node}
                                        isOpen={contextMenuOpen}
                                        onClose={() => setContextMenuOpen(false)}
                                        onAddChild={onAddChild}
                                        onRename={onRename}
                                        onDelete={onDelete}
                                        onCopy={handleCopy}
                                        onPaste={handlePaste}
                                        onClone={handleClone}
                                        onMoveUp={handleMoveUp}
                                        onMoveDown={handleMoveDown}
                                        onTrain={onTrain}
                                        canPaste={canPaste}
                                        isCollapsed={isCollapsed}
                                    />
                                </div>
                            )}
                        </div>
                    </TooltipTrigger>
                    {isCollapsed && <TooltipContent side="right">
                        <p className="font-semibold">{node.title}</p>
                        <p className="text-[10px] text-muted-foreground">{getNodeTypeLabel(node.type)}</p>
                    </TooltipContent>}
                </Tooltip>
            </TooltipProvider>

            {/* Children - Only render if Expanded AND NOT Collapsed */}
            {!isCollapsed && isExpanded && hasChildren && (
                <div className="mt-0.5">
                    {node.children!.map(child => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            isCollapsed={isCollapsed}
                            library={library}
                            onSelectChart={onSelectChart}
                            onToggleCollapse={onToggleCollapse}
                            onAddChild={onAddChild}
                            onRename={onRename}
                            onDelete={onDelete}
                            onTrain={onTrain}
                        />
                    ))}
                </div>
            )}

            {/* Empty state addon */}
            {!isCollapsed && isExpanded && !hasChildren && !isChart && childType && (
                <div
                    className="py-1.5 px-4 text-xs text-muted-foreground/60 italic cursor-pointer hover:text-foreground transition-colors flex items-center gap-2"
                    style={{ marginLeft: `${(depth + 1) * 16 + 8}px` }}
                    onClick={() => onAddChild(childType, node.id)}
                >
                    <Plus className="w-3 h-3" />
                    {addLabel}
                </div>
            )}
        </div>
    )
}
