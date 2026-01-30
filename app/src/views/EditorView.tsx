import { useState, useEffect } from 'react'
import type { Range, Action } from '@/types'
import { POKER_HANDS } from '@/types'
import { Save, Trash2, Download, Upload, Palette, X, GripVertical, CheckCircle } from 'lucide-react'
import { ColorPicker } from '@/components/ui/color-picker-custom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

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

  useEffect(() => { setCurrentRange(range) }, [range])

  useEffect(() => {
    const handleMouseUp = () => { setIsDragging(false); setDragMode(null) }
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  if (!currentRange) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center animate-float">
            <Palette className="w-12 h-12 text-violet-400" />
          </div>
          <h3 className="text-xl font-bold mb-3">Nenhum range selecionado</h3>
          <p className="text-muted-foreground max-w-sm">Selecione um chart da biblioteca ou crie um novo</p>
        </div>
      </div>
    )
  }

  const applyCellColor = (hand: string, mode: 'add' | 'remove', color: string) => {
    setCurrentRange(prev => {
      if (!prev) return null
      const currentColor = prev.hands[hand]
      if (mode === 'add' && currentColor === color) return prev
      if (mode === 'remove' && currentColor !== color) return prev
      return { ...prev, hands: { ...prev.hands, [hand]: mode === 'add' ? color : '' } }
    })
  }

  const handleCellMouseDown = (hand: string, e: React.MouseEvent) => {
    if (!selectedAction || !currentRange) return
    e.preventDefault()
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
    const newAction: Action = { id: Date.now().toString(), name: `ação ${currentRange.actions.length + 1}`, color: '#8b5cf6' }
    setCurrentRange(prev => prev ? { ...prev, actions: [...prev.actions, newAction] } : null)
  }

  const handleUpdateAction = (actionId: string, updates: Partial<Action>) => {
    setCurrentRange(prev => prev ? { ...prev, actions: prev.actions.map(a => a.id === actionId ? { ...a, ...updates } : a) } : null)
  }

  const handleDeleteAction = (actionId: string) => {
    setCurrentRange(prev => {
      if (!prev) return null
      const action = prev.actions.find(a => a.id === actionId)
      return {
        ...prev,
        actions: prev.actions.filter(a => a.id !== actionId),
        hands: Object.fromEntries(Object.entries(prev.hands).filter(([, color]) => action ? color !== action.color : true))
      }
    })
  }

  const handleSave = () => {
    if (currentRange) { onSave(currentRange); setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2000) }
  }

  const getHandStyle = (hand: string) => {
    const color = currentRange.hands[hand]
    return color ? { backgroundColor: color } : {}
  }

  const getStats = () => {
    const stats: Record<string, number> = {}
    let total = 0
    currentRange.actions.forEach(action => {
      const count = Object.values(currentRange.hands).filter(c => c === action.color).length
      stats[action.color] = count
      total += count
    })
    return { stats, total }
  }

  const { stats, total } = getStats()
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#d4a017', '#4a9b8e']

  return (
    <div className="h-full flex flex-col">
      <div className="h-16 glass-strong border-b border-border/50 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Input value={currentRange.name} onChange={(e) => setCurrentRange(prev => prev ? { ...prev, name: e.target.value } : null)} className="w-56 bg-background/50 border-border/50 rounded-xl h-10 font-medium" />
          <div className="w-px h-6 bg-border/50" />
          <span className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{total}</span> / 169</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSave} className="gap-2 rounded-xl"><Save className="w-4 h-4" />Salvar</Button>
          <Button variant="ghost" size="sm" className="gap-2 rounded-xl text-muted-foreground"><Download className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" className="gap-2 rounded-xl text-muted-foreground"><Upload className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-8 overflow-auto flex flex-col items-center justify-center">
          <div className="w-full max-w-[560px]">
            <div className="glass rounded-2xl p-4">
              {POKER_HANDS.map((row, rowIndex) => (
                <div key={rowIndex} className="flex w-full">
                  {row.map(hand => (
                    <button key={hand} onMouseDown={(e) => handleCellMouseDown(hand, e)} onMouseEnter={() => handleCellMouseEnter(hand)}
                      className={cn("flex-1 aspect-square text-xs sm:text-sm font-medium rounded-md m-[2px] transition-all flex items-center justify-center grid-cell", currentRange.hands[hand] ? 'text-white shadow-sm' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary')}
                      style={getHandStyle(hand)}>{hand}</button>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {currentRange.actions.map(action => {
                const count = stats[action.color] || 0
                return (
                  <div key={action.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: action.color }} />
                    <span className="text-sm font-medium">{action.name}</span>
                    <span className="text-xs text-muted-foreground">{((count / 169) * 100).toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="w-80 border-l border-border/50 p-6 overflow-auto bg-gradient-to-b from-card/50 to-transparent">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2"><Palette className="w-4 h-4 text-violet-400" />Ações</h3>
          <div className="space-y-3">
            {currentRange.actions.map((action) => (
              <div key={action.id} className={cn("flex items-center gap-3 p-3 rounded-xl border cursor-pointer", selectedAction === action.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-muted-foreground/50 bg-white/5')} onClick={() => setSelectedAction(action.id)}>
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <Popover open={showColorPicker === action.id} onOpenChange={(open) => setShowColorPicker(open ? action.id : null)}>
                  <PopoverTrigger asChild>
                    <button className="w-8 h-8 rounded-lg border border-white/10 shrink-0" style={{ backgroundColor: action.color }} onClick={(e) => { e.stopPropagation(); setShowColorPicker(action.id) }} />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 glass-strong border-border/50 rounded-xl overflow-hidden">
                    <div className="p-3 pb-0"><ColorPicker color={action.color} onChange={(color) => handleUpdateAction(action.id, { color })} /></div>
                    <div className="p-3 border-t border-border/50 mt-3">
                      <div className="grid grid-cols-5 gap-1.5">
                        {colors.map(color => (<button key={color} onClick={() => handleUpdateAction(action.id, { color })} className="w-7 h-7 rounded-lg hover:scale-110 transition-transform ring-1 ring-white/10" style={{ backgroundColor: color }} />))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Input value={action.name} onChange={(e) => handleUpdateAction(action.id, { name: e.target.value })} className="flex-1 h-8 text-sm bg-transparent border-0 px-2 focus-visible:ring-0" onClick={(e) => e.stopPropagation()} />
                <button onClick={(e) => { e.stopPropagation(); handleDeleteAction(action.id) }} className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-400"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <button onClick={handleAddAction} className="mt-4 w-full py-3 text-sm text-violet-400 hover:text-violet-300 hover:bg-violet-500/5 rounded-xl border border-dashed border-violet-500/30">+ Adicionar ação</button>
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-border/50">
            <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Dica:</span> Selecione uma ação e clique nas mãos para pintá-las.</p>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg animate-fade-in">
          <CheckCircle className="w-5 h-5" /><span className="font-medium">Salvo!</span>
        </div>
      )}
    </div>
  )
}
