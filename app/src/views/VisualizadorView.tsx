import { useState, useEffect, useMemo } from 'react'
import { POKER_HANDS } from '@/types'
import { Lock, Eye, Layers } from 'lucide-react'
import type { Range, LibraryNode } from '@/types'
import type { UseLibraryReturn } from '@/hooks/useLibrary'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface VisualizadorViewProps {
  range: Range | null
  library: UseLibraryReturn
  getRange: (node: LibraryNode) => Range
}

export function VisualizadorView({ range: externalRange, library, getRange }: VisualizadorViewProps) {
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null)
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null)
  const [selectedStackId, setSelectedStackId] = useState<string | null>(null)

  const selectedFormat = useMemo(() => library.nodes.find(n => n.id === selectedFormatId), [library.nodes, selectedFormatId])
  const scenarios = useMemo(() => selectedFormat?.children || [], [selectedFormat])
  const selectedScenario = useMemo(() => scenarios.find(n => n.id === selectedScenarioId), [scenarios, selectedScenarioId])
  const stacks = useMemo(() => selectedScenario?.children || [], [selectedScenario])
  const selectedStack = useMemo(() => stacks.find(n => n.id === selectedStackId), [stacks, selectedStackId])

  const activeRange = useMemo(() => {
    if (selectedStack) {
      const chartNode = selectedStack.children?.find(c => c.type === 'chart')
      if (chartNode) return getRange(chartNode)
    }
    if (externalRange) return externalRange
    return null
  }, [selectedStack, externalRange, getRange])

  useEffect(() => {
    if (!selectedFormatId && library.nodes.length > 0) setSelectedFormatId(library.nodes[0].id)
  }, [library.nodes, selectedFormatId])

  useEffect(() => {
    if (selectedFormat && (!selectedScenarioId || !selectedFormat.children?.find(c => c.id === selectedScenarioId))) {
      setSelectedScenarioId(selectedFormat.children?.[0]?.id || null)
    }
  }, [selectedFormat, selectedScenarioId])

  useEffect(() => {
    if (selectedScenario && (!selectedStackId || !selectedScenario.children?.find(c => c.id === selectedStackId))) {
      setSelectedStackId(selectedScenario.children?.[0]?.id || null)
    }
  }, [selectedScenario, selectedStackId])

  const getHandStyle = (hand: string) => {
    if (!activeRange) return {}
    const color = activeRange.hands[hand]
    return color ? { backgroundColor: color, borderColor: color } : {}
  }

  return (
    <div className="h-full flex flex-col md:flex-row bg-background">
      {/* Left Panel: Matrix & Legend */}
      <div className="flex-1 p-8 overflow-auto flex flex-col items-center justify-center">
        {activeRange ? (
          <div className="w-full max-w-[600px] space-y-6 animate-fade-in">
            <div className="text-left w-full">
              <h2 className="text-3xl font-bold tracking-tight mb-1">{activeRange.name}</h2>
              <p className="text-muted-foreground text-sm">
                {selectedFormat?.title} {selectedScenario ? `• ${selectedScenario.title}` : ''} {selectedStack ? `• ${selectedStack.title}` : ''}
              </p>
            </div>

            <div className="glass rounded-2xl p-4">
              {POKER_HANDS.map((row, rowIndex) => (
                <div key={rowIndex} className="flex w-full">
                  {row.map(hand => (
                    <div key={hand} className={cn("flex-1 aspect-square text-xs sm:text-sm font-medium rounded-md m-[2px] flex items-center justify-center transition-colors", activeRange.hands[hand] ? 'text-white shadow-sm' : 'bg-secondary/30 text-muted-foreground/50')} style={getHandStyle(hand)}>{hand}</div>
                  ))}
                </div>
              ))}
            </div>

            <div className="glass rounded-xl p-5">
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-8 gap-y-2 text-sm">
                <div className="font-medium text-muted-foreground border-b border-border/50 pb-2 mb-2 col-span-3 grid grid-cols-[1fr_auto_auto] gap-8">
                  <span>Ação</span><span className="text-right">Freq</span><span className="text-right">Combos</span>
                </div>
                {activeRange.actions.map(action => {
                  const count = Object.values(activeRange.hands).filter(c => c === action.color).length
                  return (
                    <div key={action.id} className="contents group">
                      <div className="flex items-center gap-3 py-1">
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: action.color }} />
                        <span className="font-medium">{action.name}</span>
                      </div>
                      <div className="text-right py-1 text-muted-foreground">{((count / 1326) * 100).toFixed(1)}%</div>
                      <div className="text-right py-1 text-muted-foreground">{count} / 1326</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-10 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center">
              <Lock className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold mb-2">Nenhum chart disponível</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">Selecione ou crie um chart na biblioteca para visualizar.</p>
          </div>
        )}
      </div>

      {/* Right Panel: Navigation */}
      <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col border-l border-border/50 bg-gradient-to-b from-card/50 to-transparent">
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {/* Formats */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2"><Layers className="w-3.5 h-3.5" />Formatos</h3>
              <div className="flex flex-wrap gap-2">
                {library.nodes.map(format => (
                  <Button key={format.id} variant={selectedFormatId === format.id ? "default" : "outline"} className={cn("h-9 rounded-xl", selectedFormatId === format.id ? "bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/20" : "bg-transparent")} onClick={() => setSelectedFormatId(format.id)}>{format.title}</Button>
                ))}
                {library.nodes.length === 0 && <span className="text-sm text-muted-foreground italic">Nenhum formato</span>}
              </div>
            </div>

            {/* Scenarios */}
            {selectedFormat && (
              <div className="space-y-3 animate-fade-in">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2"><Eye className="w-3.5 h-3.5" />Cenários</h3>
                <div className="grid grid-cols-2 gap-2">
                  {scenarios.map(scenario => (
                    <Button key={scenario.id} variant={selectedScenarioId === scenario.id ? "secondary" : "ghost"} className={cn("justify-start h-auto py-2.5 px-4 text-left rounded-xl", selectedScenarioId === scenario.id ? "bg-secondary/80 font-medium ring-1 ring-border" : "hover:bg-white/5 text-muted-foreground")} onClick={() => setSelectedScenarioId(scenario.id)}>{scenario.title}</Button>
                  ))}
                  {scenarios.length === 0 && <span className="text-sm text-muted-foreground italic col-span-2">Nenhum cenário</span>}
                </div>
              </div>
            )}

            {/* Stacks */}
            {selectedScenario && (
              <div className="space-y-3 animate-fade-in">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Stack Size</h3>
                <div className="flex flex-wrap gap-2">
                  {stacks.map(stack => (
                    <button key={stack.id} onClick={() => setSelectedStackId(stack.id)} className={cn("px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200", selectedStackId === stack.id ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20 scale-105" : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground")}>{stack.title}</button>
                  ))}
                  {stacks.length === 0 && <span className="text-sm text-muted-foreground italic">Nenhum stack</span>}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
