import { Play, Target, Zap } from 'lucide-react'
import type { Folder, Range } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface SelectionViewProps {
    folders: Folder[]
    onStartTraining: (range?: Range, folderName?: string) => void
}

export function SelectionView({ folders, onStartTraining }: SelectionViewProps) {
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

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
                                    <div className="ml-4 mt-2 border-l-2 border-violet-500/30 pl-4 space-y-1 animate-fade-in">
                                        {folder.ranges.map(range => (
                                            <button
                                                key={range.id}
                                                onClick={() => onStartTraining(range, folder.name)}
                                                className="w-full text-left px-4 py-2.5 rounded-lg text-sm hover:bg-white/5 flex items-center gap-3 group transition-all"
                                            >
                                                <Play className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                                    {range.name}
                                                </span>
                                            </button>
                                        ))}
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
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center animate-float">
                        <Zap className="w-12 h-12 text-violet-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 gradient-text">Pronto para treinar?</h2>
                    <p className="text-muted-foreground mb-8">
                        Escolha um range na barra lateral para começar a praticar suas decisões preflop
                    </p>
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
