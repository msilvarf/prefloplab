import { useState, useEffect, useMemo } from 'react'
import { POKER_HANDS } from '@/types'
import { Lock } from 'lucide-react'
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
  // State for internal navigation
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null)
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null)
  const [selectedStackId, setSelectedStackId] = useState<string | null>(null)

  // Derived selections
  const selectedFormat = useMemo(() =>
    library.nodes.find(n => n.id === selectedFormatId),
    [library.nodes, selectedFormatId]
  )

  const scenarios = useMemo(() =>
    selectedFormat?.children || [],
    [selectedFormat]
  )

  const selectedScenario = useMemo(() =>
    scenarios.find(n => n.id === selectedScenarioId),
    [scenarios, selectedScenarioId]
  )

  const stacks = useMemo(() =>
    selectedScenario?.children || [],
    [selectedScenario]
  )

  const selectedStack = useMemo(() =>
    stacks.find(n => n.id === selectedStackId),
    [stacks, selectedStackId]
  )

  // Determine the active range to display
  const activeRange = useMemo(() => {
    // 1. If we have a specific stack selected, use its first chart
    if (selectedStack) {
      const chartNode = selectedStack.children?.find(c => c.type === 'chart')
      if (chartNode) {
        return getRange(chartNode)
      }
    }

    // 2. Fallback to external range (e.g. from sidebar selection)
    if (externalRange) return externalRange

    return null
  }, [selectedStack, externalRange, getRange])

  // Effect: Auto-select defaults when tree structure changes or is loaded
  useEffect(() => {
    // If no format selected, select first available
    if (!selectedFormatId && library.nodes.length > 0) {
      setSelectedFormatId(library.nodes[0].id)
    }
  }, [library.nodes, selectedFormatId])

  useEffect(() => {
    // If format changes, ensure scenario is valid
    if (selectedFormat && (!selectedScenarioId || !selectedFormat.children?.find(c => c.id === selectedScenarioId))) {
      const firstScenario = selectedFormat.children?.[0]
      setSelectedScenarioId(firstScenario?.id || null)
    }
  }, [selectedFormat, selectedScenarioId])

  useEffect(() => {
    // If scenario changes, ensure stack is valid
    if (selectedScenario && (!selectedStackId || !selectedScenario.children?.find(c => c.id === selectedStackId))) {
      const firstStack = selectedScenario.children?.[0]
      setSelectedStackId(firstStack?.id || null)
    }
  }, [selectedScenario, selectedStackId])

  // Sync with external range selection if it happens (optional, but good UX)
  // This logic is complex because we need to reverse-lookup the path. 
  // For now, allow manual override.

  const getHandStyle = (hand: string) => {
    if (!activeRange) return {}
    const color = activeRange.hands[hand]
    if (color) {
      return { backgroundColor: color, borderColor: color }
    }
    return {}
  }

  return (
    <div className="h-full flex flex-col md:flex-row bg-background">
      {/* Left Panel: Matrix & Legend */}
      <div className="flex-1 p-6 overflow-auto flex flex-col items-center justify-center border-r border-border/50">
        {activeRange ? (
          <div className="w-full max-w-[600px] space-y-6">
            {/* Grid Header Info (optional, helpful context) */}
            <div className="text-left w-full mb-2">
              <h2 className="text-2xl font-bold tracking-tight">{activeRange.name}</h2>
              <p className="text-muted-foreground text-sm">
                {selectedFormat?.title} {selectedScenario ? `• ${selectedScenario.title}` : ''} {selectedStack ? `• ${selectedStack.title}` : ''}
              </p>
            </div>

            {/* Hand Grid */}
            <div className="w-full aspect-square">
              {POKER_HANDS.map((row, rowIndex) => (
                <div key={rowIndex} className="flex w-full">
                  {row.map(hand => (
                    <div
                      key={hand}
                      className={cn(
                        "flex-1 aspect-square text-xs sm:text-sm font-medium rounded-[2px] m-[1px] flex items-center justify-center transition-colors",
                        activeRange.hands[hand] ? 'text-white shadow-sm' : 'bg-secondary/30 text-muted-foreground/50'
                      )}
                      style={getHandStyle(hand)}
                    >
                      {hand}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Legend / Info Panel */}
            <div className="w-full bg-card rounded-lg border p-4 shadow-sm">
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-8 gap-y-2 text-sm">
                <div className="font-medium text-muted-foreground border-b pb-2 mb-2 col-span-3 grid grid-cols-[1fr_auto_auto] gap-8">
                  <span>Ação</span>
                  <span className="text-right">Freq</span>
                  <span className="text-right">Combos</span>
                </div>

                {activeRange.actions.map(action => {
                  const count = Object.values(activeRange.hands).filter(c => c === action.color).length
                  const percentage = ((count / 1326) * 100).toFixed(1)
                  return (
                    <div key={action.id} className="contents group">
                      <div className="flex items-center gap-2 py-1">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: action.color }} />
                        <span className="font-medium group-hover:text-foreground transition-colors">{action.name}</span>
                      </div>
                      <div className="text-right py-1 text-muted-foreground">{percentage}%</div>
                      <div className="text-right py-1 text-muted-foreground">{count} / 1326</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-10">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhum chart disponível</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Selecione ou crie um chart na biblioteca para visualizar.
            </p>
          </div>
        )}
      </div>

      {/* Right Panel: Navigation */}
      <div className="w-full md:w-[450px] lg:w-[500px] flex flex-col border-l bg-card/30">
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">

            {/* 1. Format Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Formatos</h3>
              <div className="flex flex-wrap gap-2">
                {library.nodes.map(format => (
                  <Button
                    key={format.id}
                    variant={selectedFormatId === format.id ? "default" : "outline"}
                    className={cn(
                      "h-9",
                      selectedFormatId === format.id ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-transparent"
                    )}
                    onClick={() => setSelectedFormatId(format.id)}
                  >
                    {format.title}
                  </Button>
                ))}
                {library.nodes.length === 0 && (
                  <span className="text-sm text-muted-foreground italic">Nenhum formato criado</span>
                )}
              </div>
            </div>

            {/* 2. Scenario Selection */}
            {selectedFormat && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Cenários</h3>
                <div className="grid grid-cols-2 gap-2">
                  {scenarios.map(scenario => (
                    <Button
                      key={scenario.id}
                      variant={selectedScenarioId === scenario.id ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start h-auto py-2 px-3 text-left whitespace-normal",
                        selectedScenarioId === scenario.id
                          ? "bg-secondary text-secondary-foreground font-medium shadow-sm ring-1 ring-border"
                          : "hover:bg-secondary/50 text-muted-foreground"
                      )}
                      onClick={() => setSelectedScenarioId(scenario.id)}
                    >
                      {scenario.title}
                    </Button>
                  ))}
                  {scenarios.length === 0 && (
                    <span className="text-sm text-muted-foreground italic col-span-2">Nenhum cenário neste formato</span>
                  )}
                </div>
              </div>
            )}

            {/* 3. Stack Selection */}
            {selectedScenario && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Stack Size</h3>
                <div className="flex flex-wrap gap-2">
                  {stacks.map(stack => (
                    <button
                      key={stack.id}
                      onClick={() => setSelectedStackId(stack.id)}
                      className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                        selectedStackId === stack.id
                          ? "bg-primary text-primary-foreground shadow-md transform scale-105"
                          : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      {stack.title}
                    </button>
                  ))}
                  {stacks.length === 0 && (
                    <span className="text-sm text-muted-foreground italic">Nenhum stack neste cenário</span>
                  )}
                </div>
              </div>
            )}

            {/* Debug/Info (Optional) */}
            {/* <div className="pt-8 border-t">
               <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
                 {JSON.stringify({ activeRangeId: activeRange?.id }, null, 2)}
               </pre>
            </div> */}

          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
