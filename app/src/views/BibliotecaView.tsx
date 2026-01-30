import type { LibraryNode } from '@/types/library'
import { getNodeTypeLabel, getAllowedChildType, getAddChildLabel } from '@/types/library'
import { Gamepad2, Users, Coins, Grid3X3, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BibliotecaViewProps {
  selectedNode: LibraryNode | null
  onOpenInEditor: (node: LibraryNode) => void
}

/**
 * Get the appropriate icon for a node type
 */
function getNodeIcon(type: LibraryNode['type']) {
  switch (type) {
    case 'format':
      return <Gamepad2 className="w-6 h-6 text-violet-400" />
    case 'scenario':
      return <Users className="w-6 h-6 text-blue-400" />
    case 'stack':
      return <Coins className="w-6 h-6 text-amber-400" />
    case 'chart':
      return <Grid3X3 className="w-6 h-6 text-emerald-400" />
  }
}

export function BibliotecaView({ selectedNode, onOpenInEditor }: BibliotecaViewProps) {
  // Empty state when nothing is selected
  if (!selectedNode) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Gamepad2 className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">Bem-vindo à Biblioteca</h2>
          <p className="text-muted-foreground mb-6">
            Organize seus ranges de poker usando a hierarquia:
          </p>
          <div className="flex items-center justify-center gap-2 text-sm mb-6">
            <span className="px-2 py-1 bg-violet-500/20 text-violet-400 rounded">Formato</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Cenário</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded">Stack</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">Chart</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Use o menu lateral para criar formatos e organizar seus charts.
          </p>
        </div>
      </div>
    )
  }

  const childType = getAllowedChildType(selectedNode.type)
  const addLabel = getAddChildLabel(selectedNode.type)
  const childCount = selectedNode.children?.length || 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-lg bg-card border border-border flex items-center justify-center">
          {getNodeIcon(selectedNode.type)}
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {getNodeTypeLabel(selectedNode.type)}
          </p>
          <h1 className="text-2xl font-semibold">{selectedNode.title}</h1>
        </div>
      </div>

      {/* Chart action */}
      {selectedNode.type === 'chart' && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="font-medium mb-2">Editar Range</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Abra este chart no Editor para configurar as ações e mãos.
          </p>
          <Button onClick={() => onOpenInEditor(selectedNode)}>
            Abrir no Editor
          </Button>
        </div>
      )}

      {/* Children info (for non-chart nodes) */}
      {selectedNode.type !== 'chart' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-medium mb-2">Conteúdo</h3>
            <p className="text-sm text-muted-foreground">
              {childCount === 0
                ? `Nenhum ${childType ? getNodeTypeLabel(childType).toLowerCase() : 'item'} criado ainda.`
                : `${childCount} ${childType ? getNodeTypeLabel(childType).toLowerCase() : 'item'}${childCount > 1 ? 's' : ''}`
              }
            </p>
          </div>

          {addLabel && (
            <p className="text-sm text-muted-foreground">
              Clique com botão direito no item na sidebar para adicionar, renomear ou excluir.
            </p>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Criado em: {new Date(selectedNode.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  )
}
