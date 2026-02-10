import { Play, Target, Zap, Grid3X3, CheckSquare, Square, Shuffle, Layers } from 'lucide-react'
import type { Folder, Range } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'

interface SelectionViewProps {
    folders: Folder[]
    onStartTraining: (ranges?: Range[], folderNames?: string[]) => void
    onStartRangeTraining: (range: Range, folderName?: string) => void
}

export function SelectionView({ folders, onStartTraining, onStartRangeTraining }: SelectionViewProps) {
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
    const [selectedRanges, setSelectedRanges] = useState<Map<string, { range: Range; folderName: string }>>(new Map())
    const [multiSelectMode, setMultiSelectMode] = useState(false)

    // Toggle range selection
    const toggleRangeSelection = (range: Range, folderName: string) => {
        setSelectedRanges(prev => {
            const newMap = new Map(prev)
            if (newMap.has(range.id)) {
                newMap.delete(range.id)
            } else {
                newMap.set(range.id, { range, folderName })
            }
            return newMap
        })
    }

    // Clear all selections
    const clearSelections = () => {
        setSelectedRanges(new Map())
    }

    // Start training with selected ranges
    const startMultiRangeTraining = () => {
        const ranges = Array.from(selectedRanges.values()).map(v => v.range)
        const folderNames = Array.from(selectedRanges.values()).map(v => v.folderName)
        onStartTraining(ranges, folderNames)
    }

    // Count total hands in selected ranges
    const totalSelectedHands = useMemo(() => {
        let count = 0
        selectedRanges.forEach(({ range }) => {
            if (range.hands) {
                count += Object.keys(range.hands).filter(h => range.hands[h]).length
            }
        })
        return count
    }, [selectedRanges])

    const selectedCount = selectedRanges.size

    return (
        <div className="h-full flex">
            {/* Sidebar */}
            <div className="w-80 border-r border-border/50 overflow-auto bg-gradient-to-b from-card/50 to-transparent">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Treinamento</h3>
                            <p className="text-xs text-muted-foreground">Selecione um range</p>
                        </div>
                    </div>

                    {/* Multi-select toggle */}
                    <div className="mb-4">
                        <button
                            onClick={() => {
                                setMultiSelectMode(!multiSelectMode)
                                if (multiSelectMode) clearSelections()
                            }}
                            className={cn(
                                "w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all",
                                multiSelectMode
                                    ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/10 border border-violet-500/30'
                                    : 'bg-white/5 hover:bg-white/10 border border-border/50'
                            )}
                        >
                            <Layers className={cn("w-4 h-4", multiSelectMode ? 'text-violet-400' : 'text-muted-foreground')} />
                            <span className={multiSelectMode ? 'text-foreground' : 'text-muted-foreground'}>
                                Seleção Múltipla
                            </span>
                            {multiSelectMode && (
                                <span className="ml-auto text-xs text-violet-400">
                                    {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="space-y-2">
                        {folders.map(folder => (
                            <div key={folder.id}>
                                <button
                                    onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200",
                                        selectedFolder === folder.id
                                            ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/10 border border-violet-500/30'
                                            : 'hover:bg-white/5'
                                    )}
                                >
                                    <span className="font-medium">{folder.name}</span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                        ({folder.ranges.length} ranges)
                                    </span>
                                </button>

                                {selectedFolder === folder.id && (
                                    <div className="ml-4 mt-2 border-l-2 border-violet-500/30 pl-4 space-y-2 animate-fade-in">
                                        {folder.ranges.map(range => {
                                            const isSelected = selectedRanges.has(range.id)
                                            const handCount = range.hands ? Object.keys(range.hands).filter(h => range.hands[h]).length : 0

                                            return (
                                                <div key={range.id} className="space-y-1">
                                                    {multiSelectMode ? (
                                                        <button
                                                            onClick={() => toggleRangeSelection(range, folder.name)}
                                                            className={cn(
                                                                "w-full text-left px-4 py-2.5 rounded-lg text-sm flex items-center gap-3 transition-all",
                                                                isSelected
                                                                    ? 'bg-violet-500/10 border border-violet-500/30'
                                                                    : 'hover:bg-white/5'
                                                            )}
                                                        >
                                                            {isSelected ? (
                                                                <CheckSquare className="w-4 h-4 text-violet-400 shrink-0" />
                                                            ) : (
                                                                <Square className="w-4 h-4 text-muted-foreground shrink-0" />
                                                            )}
                                                            <span className={cn(
                                                                "flex-1",
                                                                isSelected ? 'text-foreground' : 'text-muted-foreground'
                                                            )}>
                                                                {range.name}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {handCount} mãos
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <span className="text-sm text-muted-foreground px-4 py-1 block">
                                                                {range.name}
                                                            </span>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => onStartTraining([range], [folder.name])}
                                                                    className="flex-1 text-left px-4 py-2 rounded-lg text-xs hover:bg-white/5 flex items-center gap-2 group transition-all"
                                                                    title="Treino de mãos: uma mão por vez"
                                                                >
                                                                    <Play className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                                                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                                                        Mãos
                                                                    </span>
                                                                </button>
                                                                <button
                                                                    onClick={() => onStartRangeTraining(range, folder.name)}
                                                                    className="flex-1 text-left px-4 py-2 rounded-lg text-xs hover:bg-white/5 flex items-center gap-2 group transition-all"
                                                                    title="Treino de range: pinte o grid"
                                                                >
                                                                    <Grid3X3 className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
                                                                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                                                        Range
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}

                        {folders.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-sm text-muted-foreground">Nenhum range encontrado</p>
                                <p className="text-xs text-muted-foreground mt-1">Crie charts na biblioteca primeiro</p>
                            </div>
                        )}
                    </div>

                    {/* Multi-select action button */}
                    {multiSelectMode && selectedCount > 0 && (
                        <div className="mt-6 space-y-3 animate-fade-in">
                            <div className="p-3 rounded-xl bg-white/5 border border-border/50">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Ranges selecionados:</span>
                                    <span className="font-bold text-violet-400">{selectedCount}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Total de mãos:</span>
                                    <span className="font-bold text-foreground">{totalSelectedHands}</span>
                                </div>
                            </div>
                            <Button
                                onClick={startMultiRangeTraining}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                            >
                                <Shuffle className="w-4 h-4 mr-2" />
                                Treinar {selectedCount} Range{selectedCount !== 1 ? 's' : ''}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={clearSelections}
                                className="w-full text-muted-foreground"
                            >
                                Limpar seleção
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center animate-float">
                        <Zap className="w-12 h-12 text-violet-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 gradient-text">Pronto para treinar?</h2>
                    <p className="text-muted-foreground mb-4">
                        Escolha um range na barra lateral para começar a praticar suas decisões preflop
                    </p>
                    {multiSelectMode && (
                        <p className="text-sm text-violet-400 mb-4 animate-fade-in">
                            <Layers className="w-4 h-4 inline mr-1" />
                            Modo seleção múltipla ativo - selecione vários ranges para treinar juntos
                        </p>
                    )}
                    <Button
                        onClick={() => onStartTraining()}
                        size="lg"
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/20 px-8"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        Modo Demo
                    </Button>
                </div>
            </div>
        </div>
    )
}
