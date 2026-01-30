import { useState } from 'react'
import type { Folder, Range } from '@/types'
import { FileText, Folder as FolderIcon, Plus, MoreVertical, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface BibliotecaViewProps {
  folders: Folder[]
  onSelectRange: (range: Range) => void
  onAddFolder: (name: string) => void
  onAddRange: (folderId: string, range: Range) => void
}

export function BibliotecaView({ folders, onSelectRange, onAddFolder, onAddRange }: BibliotecaViewProps) {
  const [showFolderDialog, setShowFolderDialog] = useState(false)
  const [showRangeDialog, setShowRangeDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [newRangeName, setNewRangeName] = useState('')
  const [rangeType, setRangeType] = useState<'classico' | 'shortdeck'>('classico')
  const [contextMenuFolder, setContextMenuFolder] = useState<string | null>(null)

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim())
      setNewFolderName('')
      setShowFolderDialog(false)
    }
  }

  const handleCreateRange = () => {
    if (newRangeName.trim() && selectedFolderId) {
      const newRange: Range = {
        id: Date.now().toString(),
        name: newRangeName.trim(),
        type: rangeType,
        hands: {},
        actions: [
          { id: '1', name: 'call', color: '#d4a017' },
          { id: '2', name: 'raise', color: '#4a9b8e' }
        ]
      }
      onAddRange(selectedFolderId, newRange)
      setNewRangeName('')
      setShowRangeDialog(false)
    }
  }

  const openRangeDialog = (folderId: string) => {
    setSelectedFolderId(folderId)
    setShowRangeDialog(true)
    setContextMenuFolder(null)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Biblioteca</h2>
        <Button onClick={() => setShowFolderDialog(true)} className="gap-2">
          <FolderPlus className="w-4 h-4" />
          Nova Pasta
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {folders.map(folder => (
          <div key={folder.id} className="bg-card border border-border rounded-lg p-4 relative group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FolderIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{folder.name}</h3>
                <p className="text-xs text-muted-foreground">{folder.ranges.length} ranges</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setContextMenuFolder(contextMenuFolder === folder.id ? null : folder.id)}
                  className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {contextMenuFolder === folder.id && (
                  <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg py-1 z-50 w-48">
                    <button
                      onClick={() => openRangeDialog(folder.id)}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar range
                    </button>
                    <button
                      onClick={() => {
                        setShowFolderDialog(true)
                        setContextMenuFolder(null)
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
                    >
                      <FolderPlus className="w-4 h-4" />
                      Adicionar pasta
                    </button>
                    <div className="border-t border-border my-1" />
                    <button className="w-full px-3 py-2 text-sm text-left hover:bg-accent text-muted-foreground">
                      Clonar pasta
                    </button>
                    <button className="w-full px-3 py-2 text-sm text-left hover:bg-accent text-muted-foreground">
                      Renomear pasta
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              {folder.ranges.length === 0 && (
                <button
                  onClick={() => openRangeDialog(folder.id)}
                  className="w-full flex items-center justify-center gap-2 px-2 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md border border-dashed border-border transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar range
                </button>
              )}
              {folder.ranges.slice(0, 3).map(range => (
                <button
                  key={range.id}
                  onClick={() => onSelectRange(range)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 rounded-md text-left"
                >
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{range.name}</span>
                </button>
              ))}
              {folder.ranges.length > 3 && (
                <p className="text-xs text-muted-foreground px-2">
                  +{folder.ranges.length - 3} mais
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {folders.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhuma pasta criada</h3>
          <p className="text-muted-foreground mb-4">
            Crie sua primeira pasta para começar a organizar seus ranges
          </p>
          <Button onClick={() => setShowFolderDialog(true)}>
            <FolderPlus className="w-4 h-4 mr-2" />
            Criar Pasta
          </Button>
        </div>
      )}

      {/* Folder Dialog */}
      <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Adicionar nova pasta</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nome da pasta"
              className="bg-background border-border"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowFolderDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateFolder} className="bg-primary hover:bg-primary/90">
              Ok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Range Dialog */}
      <Dialog open={showRangeDialog} onOpenChange={setShowRangeDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Adicionar range</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <RadioGroup value={rangeType} onValueChange={(v) => setRangeType(v as 'classico' | 'shortdeck')}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="classico" id="classico" />
                  <Label htmlFor="classico">Clássico</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="shortdeck" id="shortdeck" />
                  <Label htmlFor="shortdeck">Shortdeck</Label>
                </div>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              O range contém cartas de 7 a A
            </p>
            <Input
              value={newRangeName}
              onChange={(e) => setNewRangeName(e.target.value)}
              placeholder="Nome, por exemplo: Open-raise"
              className="bg-background border-border"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowRangeDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRange} className="bg-primary hover:bg-primary/90">
              Ok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
