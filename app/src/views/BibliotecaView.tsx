import type { LibraryNode } from '@/types/library'
import { getNodeTypeLabel, getAllowedChildType, getAddChildLabel } from '@/types/library'
import { Gamepad2, Users, Grid3X3, ArrowRight, Sparkles, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BibliotecaViewProps {
  selectedNode: LibraryNode | null
  onOpenInEditor: (node: LibraryNode) => void
}

/**
 * Get the appropriate icon for a node type
 */
function getNodeIcon(type: LibraryNode['type']) {
  const iconClass = "w-8 h-8"
  switch (type) {
    case 'format':
      return <Gamepad2 className={cn(iconClass, "text-violet-400")} />
    case 'scenario':
      return <Users className={cn(iconClass, "text-blue-400")} />
    case 'stack':
      return <Grid3X3 className={cn(iconClass, "text-emerald-400")} />
    case 'chart':
      return <Grid3X3 className={cn(iconClass, "text-emerald-400")} />
  }
}

/**
 * Get gradient for each node type
 */
function getNodeGradient(type: LibraryNode['type']): string {
  switch (type) {
    case 'format':
      return 'from-violet-500/20 to-purple-500/10'
    case 'scenario':
      return 'from-blue-500/20 to-cyan-500/10'
    case 'stack':
      return 'from-emerald-500/20 to-teal-500/10'
    case 'chart':
      return 'from-emerald-500/20 to-teal-500/10'
  }
}

export function BibliotecaView({ selectedNode, onOpenInEditor }: BibliotecaViewProps) {
  // Empty state when nothing is selected
  if (!selectedNode) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-lg animate-fade-in-up">
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center animate-float">
            <Sparkles className="w-12 h-12 text-violet-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            <span className="gradient-text">Bem-vindo à Biblioteca</span>
          </h2>
          <p className="text-muted-foreground mb-8 text-lg prose-limit">
            Organize seus ranges de poker usando a hierarquia:
          </p>

          {/* Hierarchy visual */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500/20 to-violet-500/5 border border-violet-500/20">
              <Gamepad2 className="w-4 h-4 text-violet-400" />
              <span className="text-violet-300 font-medium">Formato</span>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-500/5 border border-blue-500/20">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 font-medium">Cenário</span>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/5 border border-amber-500/20">
              <Grid3X3 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 font-medium">Stack (Range)</span>
            </div>
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
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header Card */}
      <div className={cn(
        "glass rounded-3xl p-8 mb-8 bg-gradient-to-br",
        getNodeGradient(selectedNode.type)
      )}>
        <div className="flex items-start gap-6">
          <div className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br",
            getNodeGradient(selectedNode.type),
            "shadow-lg"
          )}>
            {getNodeIcon(selectedNode.type)}
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
              {getNodeTypeLabel(selectedNode.type)}
            </p>
            <h1 className="text-3xl font-bold mb-2">{selectedNode.title}</h1>
            <p className="text-sm text-muted-foreground">
              Criado em {new Date(selectedNode.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Chart action */}
      {(selectedNode.type === 'chart' || selectedNode.type === 'stack') && (
        <div className="glass rounded-2xl p-6 mb-6 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center">
              <Edit3 className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Editar Range</h3>
              <p className="text-sm text-muted-foreground">
                Abra este stack no Editor para configurar as ações e mãos.
              </p>
            </div>
            <Button
              onClick={() => onOpenInEditor(selectedNode)}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20 rounded-xl"
            >
              Abrir no Editor
            </Button>
          </div>
        </div>
      )}

      {/* Children info (for non-chart/stack nodes) */}
      {(selectedNode.type !== 'chart' && selectedNode.type !== 'stack') && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br",
                childType === 'scenario' ? 'from-blue-500/20 to-cyan-500/10' :
                  childType === 'stack' ? 'from-amber-500/20 to-orange-500/10' :
                    childType === 'chart' ? 'from-emerald-500/20 to-teal-500/10' :
                      'from-muted to-muted/50'
              )}>
                <span className="text-2xl font-bold">{childCount}</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Conteúdo</h3>
                <p className="text-sm text-muted-foreground">
                  {childCount === 0
                    ? `Nenhum ${childType ? getNodeTypeLabel(childType).toLowerCase() : 'item'} criado ainda.`
                    : `${childCount} ${childType ? getNodeTypeLabel(childType).toLowerCase() : 'item'}${childCount > 1 ? 's' : ''}`
                  }
                </p>
              </div>
            </div>
          </div>

          {addLabel && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-dashed border-border">
              <span className="text-violet-400">💡</span>
              <p className="text-sm text-muted-foreground">
                Clique com botão direito no item na sidebar para adicionar, renomear ou excluir.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
