import { useState } from 'react'
import { ChevronRight, MoreVertical, Plus } from 'lucide-react'
import type { LibraryNode, LibraryNodeType } from '@/types/library'
import type { UseLibraryReturn } from '@/hooks/useLibrary'
import { getAllowedChildType, getAddChildLabel, getNodeTypeLabel } from '@/types/library'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { NodeIcon, getNodeColor, getNodeBgGradient } from './NodeStyles'
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
    onDelete
}: TreeNodeProps) {
    const [contextMenuOpen, setContextMenuOpen] = useState(false)

    const isExpanded = library.expandedIds.has(node.id)
    const isSelected = library.selectedId === node.id
    const hasChildren = node.children && node.children.length > 0
    const isChart = node.type === 'chart'
    const childType = getAllowedChildType(node.type)
    const addLabel = getAddChildLabel(node.type)

    const paddingLeft = isCollapsed ? 0 : depth * 12

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

    return (
        <div className="animate-fade-in relative">
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className={cn(
                                'flex items-center gap-2 py-2 px-2 mx-2 rounded-lg cursor-pointer group transition-all duration-200',
                                isSelected
                                    ? `bg-gradient-to-r ${getNodeBgGradient(node.type)} border-l-2 border-${node.type === 'format' ? 'violet' : node.type === 'scenario' ? 'blue' : node.type === 'stack' ? 'amber' : 'emerald'}-400`
                                    : 'hover:bg-white/5',
                                isCollapsed && 'justify-center mx-1 px-1 py-3 mb-1'
                            )}
                            style={{ marginLeft: isCollapsed ? 0 : `${paddingLeft}px` }}
                            onClick={handleNodeClick}
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

                            {/* Node icon - Larger wrapper when collapsed */}
                            <div className={cn(
                                "rounded-md flex items-center justify-center shrink-0 transition-all",
                                isSelected ? "bg-white/10" : "bg-transparent",
                                isCollapsed ? "w-10 h-10 bg-white/5 border border-white/5 shadow-sm" : "w-6 h-6"
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

                            {/* Context menu button - Only show if expanded */}
                            {!isCollapsed && (
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setContextMenuOpen(!contextMenuOpen)
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-md transition-all duration-200"
                                    >
                                        <MoreVertical className="w-3.5 h-3.5" />
                                    </button>

                                    <NodeContextMenu
                                        node={node}
                                        isOpen={contextMenuOpen}
                                        onClose={() => setContextMenuOpen(false)}
                                        onAddChild={onAddChild}
                                        onRename={onRename}
                                        onDelete={onDelete}
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
                <div className="mt-1">
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
                        />
                    ))}
                </div>
            )}

            {/* Empty state addon */}
            {!isCollapsed && isExpanded && !hasChildren && !isChart && childType && (
                <div
                    className="py-2 px-4 text-xs text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors flex items-center gap-2"
                    style={{ marginLeft: `${(depth + 1) * 12 + 8}px` }}
                    onClick={() => onAddChild(childType, node.id)}
                >
                    <Plus className="w-3 h-3" />
                    {addLabel}
                </div>
            )}
        </div>
    )
}
