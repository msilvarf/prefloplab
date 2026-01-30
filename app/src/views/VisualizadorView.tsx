import { useState } from 'react'
import type { Folder, Range } from '@/types'
import { POKER_HANDS } from '@/types'
import { Lock } from 'lucide-react'


interface VisualizadorViewProps {
  folders: Folder[]
}

export function VisualizadorView({ folders }: VisualizadorViewProps) {
  const [selectedRange, setSelectedRange] = useState<Range | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  const getHandStyle = (hand: string) => {
    if (!selectedRange) return {}
    const color = selectedRange.hands[hand]
    if (color) {
      return { backgroundColor: color }
    }
    return {}
  }

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-border overflow-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium mb-4">Ranges disponíveis</h3>
          <div className="space-y-2">
            {folders.map(folder => (
              <div key={folder.id}>
                <button
                  onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedFolder === folder.id ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                >
                  {folder.name}
                </button>
                {selectedFolder === folder.id && folder.ranges.length > 0 && (
                  <div className="ml-4 mt-1 space-y-1">
                    {folder.ranges.map(range => (
                      <button
                        key={range.id}
                        onClick={() => setSelectedRange(range)}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${selectedRange?.id === range.id ? 'bg-primary/20 text-primary' : 'hover:bg-accent/30'
                          }`}
                      >
                        {range.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {selectedRange ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{selectedRange.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {folders.find(f => f.ranges.some(r => r.id === selectedRange.id))?.name}
                </p>
              </div>
            </div>

            <div className="flex gap-8">
              {/* Hand grid */}
              <div className="flex-1 w-full max-w-[calc(100vh-10rem)]">
                <div className="flex w-full">
                  <div className="w-8 shrink-0" />
                  {['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'].map(rank => (
                    <div key={rank} className="flex-1 aspect-square flex items-center justify-center text-xs text-muted-foreground">
                      {rank}
                    </div>
                  ))}
                </div>

                {POKER_HANDS.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex w-full">
                    <div className="w-8 shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                      {['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'][rowIndex]}
                    </div>
                    {row.map(hand => (
                      <div
                        key={hand}
                        className={`flex-1 aspect-square text-xs sm:text-sm font-medium rounded m-[1px] flex items-center justify-center ${selectedRange.hands[hand] ? 'text-white' : 'bg-secondary text-muted-foreground'
                          }`}
                        style={getHandStyle(hand)}
                      >
                        {hand}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="space-y-3 shrink-0 w-64">
                <h4 className="text-sm font-medium">Ações</h4>
                {selectedRange.actions.map(action => {
                  const count = Object.values(selectedRange.hands).filter(c => c === action.color).length
                  const percentage = ((count / 1326) * 100).toFixed(1)
                  return (
                    <div key={action.id} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: action.color }}
                      />
                      <span className="text-sm">{action.name}</span>
                      <span className="text-xs text-muted-foreground">{percentage}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Selecione um range para visualizar</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
