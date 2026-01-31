import { useState } from 'react'
import type { LibraryNode } from '@/types/library'
import type { UseLibraryReturn } from '@/hooks/useLibrary'
import { useSidebarDialog } from '@/hooks/useSidebarDialog'
import {
  SidebarHeader,
  SidebarFooter,
  EmptyLibraryState,
  TreeNode,
  SidebarDialog
} from '@/components/library-tree'
import { cn } from '@/lib/utils'

interface SidebarProps {
  library: UseLibraryReturn
  onSelectChart: (node: LibraryNode) => void
  isCollapsed?: boolean
  onToggleCollapse?: (collapsed: boolean) => void
}

export function Sidebar({ library, onSelectChart, isCollapsed: controlledCollapsed, onToggleCollapse }: SidebarProps) {
  // Internal state fallback if not controlled
  const [internalCollapsed, setInternalCollapsed] = useState(false)

  // Use controlled prop if available, otherwise internal state
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed

  const handleToggle = () => {
    const newState = !isCollapsed
    if (onToggleCollapse) {
      onToggleCollapse(newState)
    } else {
      setInternalCollapsed(newState)
    }
  }

  // Use the dialog hook
  const {
    dialogMode,
    dialogNodeType,
    parentId,
    inputValue,
    setInputValue,
    openAddDialog,
    openRenameDialog,
    handleSubmit,
    closeDialog,
  } = useSidebarDialog(library)

  const handleDelete = (id: string) => {
    library.deleteNode(id)
  }

  return (
    <aside
      className={cn(
        "bg-gradient-to-b from-sidebar to-background border-border/50 flex flex-col shrink-0 transition-all duration-300 ease-in-out relative z-20",
        // Desktop: border-r, height auto (full). Mobile: border-b, controlled height
        "lg:border-r lg:border-b-0 border-b",
        isCollapsed
          ? "lg:w-20 w-full h-16 lg:h-full"
          : "lg:w-72 w-full h-[400px] lg:h-full"
      )}
    >
      {/* Header */}
      <SidebarHeader
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggle}
        onAddFormat={() => openAddDialog('format', null)}
      />

      {/* Tree */}
      <div className="flex-1 overflow-auto py-3 no-scrollbar">
        {library.nodes.length === 0 ? (
          <EmptyLibraryState
            isCollapsed={isCollapsed}
            onAddFormat={() => openAddDialog('format', null)}
          />
        ) : (
          <div className="space-y-1">
            {library.nodes.map(node => (
              <TreeNode
                key={node.id}
                node={node}
                depth={0}
                isCollapsed={isCollapsed}
                library={library}
                onSelectChart={onSelectChart}
                onToggleCollapse={handleToggle}
                onAddChild={openAddDialog}
                onRename={openRenameDialog}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer - Legend */}
      <SidebarFooter isCollapsed={isCollapsed} />

      {/* Add/Rename Dialog */}
      <SidebarDialog
        mode={dialogMode}
        nodeType={dialogNodeType}
        parentId={parentId}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSubmit={handleSubmit}
        onClose={closeDialog}
        library={library}
      />
    </aside>
  )
}
