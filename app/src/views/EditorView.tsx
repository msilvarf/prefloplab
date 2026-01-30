import { useState, useEffect } from 'react'
import type { Range, Action } from '@/types'
import { POKER_HANDS } from '@/types'
import { Save, Trash2, Download, Upload, Share, MoreVertical, Palette, X, GripVertical } from 'lucide-react'
import { ColorPicker } from '@/components/ui/color-picker-custom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface EditorViewProps {
  range: Range | null
  onSave: (range: Range) => void
}

export function EditorView({ range, onSave }: EditorViewProps) {
  const [currentRange, setCurrentRange] = useState<Range | null>(range)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<'add' | 'remove' | null>(null)

  useEffect(() => {
    setCurrentRange(range)
  }, [range])

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false)
      setDragMode(null)
    }
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  if (!currentRange) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhum range selecionado</h3>
          <p className="text-muted-foreground">
            Selecione um range da biblioteca ou crie um novo
          </p>
        </div>
      </div>
    )
  }

  const applyCellColor = (hand: string, mode: 'add' | 'remove', color: string) => {
    setCurrentRange(prev => {
      if (!prev) return null

      const currentColor = prev.hands[hand]
      // Optimize: avoid unnecessary updates
      if (mode === 'add' && currentColor === color) return prev
      if (mode === 'remove' && currentColor !== color) {
        // If we are in remove mode, usually we act as an eraser. 
        // But if we want strict "toggle" behavior (only remove if it matches current selected color), 
        // we would check currentColor === color.
        // However, standard intuitive "eraser" behavior (if started on same color) is to erase.
        // Let's settle on: If mode is remove, we clear the cell IF it matches the target color 
        // OR if we want a strong eraser, we clear everything.
        // Let's implement "smart toggle": if I click on Red, I want to remove Red. 
        // If I drag over Blue, should I remove Blue? 
        // If I wanted to paint Red, I would have started on empty/Blue.
        // So if I started on Red, I am removing Red.
        if (currentColor !== color) return prev
      }

      return {
        ...prev,
        hands: {
          ...prev.hands,
          [hand]: mode === 'add' ? color : ''
        }
      }
    })
  }

  const handleCellMouseDown = (hand: string, e: React.MouseEvent) => {
    if (!selectedAction || !currentRange) return
    e.preventDefault() // Prevents text selection during drag

    const action = currentRange.actions.find(a => a.id === selectedAction)
    if (!action) return

    const isCurrentColor = currentRange.hands[hand] === action.color
    const mode = isCurrentColor ? 'remove' : 'add'

    setIsDragging(true)
    setDragMode(mode)
    applyCellColor(hand, mode, action.color)
  }

  const handleCellMouseEnter = (hand: string) => {
    if (!isDragging || !dragMode || !selectedAction || !currentRange) return

    const action = currentRange.actions.find(a => a.id === selectedAction)
    if (!action) return

    applyCellColor(hand, dragMode, action.color)
  }

  const handleAddAction = () => {
    const newAction: Action = {
      id: Date.now().toString(),
      name: `ação ${currentRange.actions.length + 1}`,
      color: '#8b5cf6'
    }
    setCurrentRange(prev => {
      if (!prev) return null
      return {
        ...prev,
        actions: [...prev.actions, newAction]
      }
    })
  }

  const handleUpdateAction = (actionId: string, updates: Partial<Action>) => {
    setCurrentRange(prev => {
      if (!prev) return null
      return {
        ...prev,
        actions: prev.actions.map(a => a.id === actionId ? { ...a, ...updates } : a)
      }
    })
  }

  const handleDeleteAction = (actionId: string) => {
    setCurrentRange(prev => {
      if (!prev) return null
      return {
        ...prev,
        actions: prev.actions.filter(a => a.id !== actionId),
        hands: Object.fromEntries(
          Object.entries(prev.hands).filter(([, color]) => {
            const action = prev.actions.find(a => a.id === actionId)
            return action ? color !== action.color : true
          })
        )
      }
    })
  }

  const handleSave = () => {
    if (currentRange) {
      onSave(currentRange)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    }
  }

  const getHandStyle = (hand: string) => {
    const color = currentRange.hands[hand]
    if (color) {
      return { backgroundColor: color }
    }
    return {}
  }

  const getStats = () => {
    const stats: Record<string, number> = {}

    currentRange.actions.forEach(action => {
      const count = Object.values(currentRange.hands).filter(c => c === action.color).length
      stats[action.color] = count
    })

    return { stats }
  }

  const { stats } = getStats()

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Input
            value={currentRange.name}
            onChange={(e) => setCurrentRange(prev => prev ? { ...prev, name: e.target.value } : null)}
            className="w-48 bg-background border-border"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Salvar
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Trash2 className="w-4 h-4" />
            Descartar alterações
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Trash2 className="w-4 h-4" />
            Apagar
          </Button>
          <div className="w-px h-4 bg-border mx-2" />
          <Button variant="ghost" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            Importar
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Share className="w-4 h-4" />
            Compartilhar
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Hand grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="w-full max-w-[calc(100vh-10rem)] mx-auto">
            {/* Grid */}
            {POKER_HANDS.map((row, rowIndex) => (
              <div key={rowIndex} className="flex w-full">
                {row.map(hand => (
                  <button
                    key={hand}
                    onMouseDown={(e) => handleCellMouseDown(hand, e)}
                    onMouseEnter={() => handleCellMouseEnter(hand)}
                    className={`flex-1 aspect-square text-xs sm:text-sm font-medium rounded m-[1px] transition-all flex items-center justify-center ${currentRange.hands[hand]
                      ? 'text-white'
                      : 'bg-secondary text-muted-foreground hover:bg-accent'
                      }`}
                    style={getHandStyle(hand)}
                  >
                    {hand}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-6 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">0%</span>
              <span className="text-xs text-muted-foreground">0 / 1326</span>
            </div>
            {currentRange.actions.map(action => {
              const count = stats[action.color] || 0
              const percentage = ((count / 1326) * 100).toFixed(1)
              return (
                <div key={action.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: action.color }}
                  />
                  <span className="text-xs text-muted-foreground">{percentage}%</span>
                  <span className="text-xs text-muted-foreground">{count} / 1326</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions panel */}
        <div className="w-64 border-l border-border p-4 overflow-auto">
          <div className="space-y-3">
            {currentRange.actions.map((action) => (
              <div
                key={action.id}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${selectedAction === action.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
                  }`}
                onClick={() => setSelectedAction(action.id)}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <Popover open={showColorPicker === action.id} onOpenChange={(open) => setShowColorPicker(open ? action.id : null)}>
                  <PopoverTrigger asChild>
                    <button
                      className="w-6 h-6 rounded border border-border shrink-0"
                      style={{ backgroundColor: action.color }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowColorPicker(action.id)
                      }}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-border overflow-hidden">
                    <div className="flex flex-col">
                      <div className="p-3 pb-0">
                        <ColorPicker
                          color={action.color}
                          onChange={(color) => handleUpdateAction(action.id, { color })}
                        />
                      </div>
                      <div className="p-3 border-t border-border mt-3">
                        <div className="grid grid-cols-5 gap-1">
                          {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#d4a017', '#4a9b8e'].map(color => (
                            <button
                              key={color}
                              onClick={() => handleUpdateAction(action.id, { color })}
                              className="w-6 h-6 rounded hover:scale-110 transition-transform shadow-sm ring-1 ring-border/50"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Input
                  value={action.name}
                  onChange={(e) => handleUpdateAction(action.id, { name: e.target.value })}
                  className="flex-1 h-7 text-sm bg-transparent border-0 px-1 focus-visible:ring-0"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteAction(action.id)
                  }}
                  className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddAction}
            className="mt-4 w-full py-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            + Adicionar cor
          </button>
        </div>
      </div>

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 animate-fade-in">
          <span>Salvo</span>
          <button onClick={() => setShowSuccess(false)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
