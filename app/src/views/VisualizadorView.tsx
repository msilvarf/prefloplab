import { POKER_HANDS } from '@/types'
import { Lock } from 'lucide-react'
import type { Range } from '@/types'

interface VisualizadorViewProps {
  range: Range | null
}

export function VisualizadorView({ range }: VisualizadorViewProps) {
  const getHandStyle = (hand: string) => {
    if (!range) return {}
    const color = range.hands[hand]
    if (color) {
      return { backgroundColor: color }
    }
    return {}
  }

  return (
    <div className="h-full p-6 overflow-auto">
      {range ? (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">{range.name}</h2>
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
                      className={`flex-1 aspect-square text-xs sm:text-sm font-medium rounded m-[1px] flex items-center justify-center ${range.hands[hand] ? 'text-white' : 'bg-secondary text-muted-foreground'
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
              {range.actions.map(action => {
                const count = Object.values(range.hands).filter(c => c === action.color).length
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
            <p className="text-sm text-muted-foreground">
              Escolha um chart na barra lateral esquerda
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
