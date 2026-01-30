import { useState } from 'react'
import { Folder, ChevronRight, ChevronDown, Plus, MoreVertical, FileText } from 'lucide-react'
import type { Folder as FolderType, Range } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface SidebarProps {
  folders: FolderType[]
  onAddFolder: (name: string, parentId?: string) => void
  onAddRange: (folderId: string, range: Range) => void
  onSelectRange: (range: Range) => void
  onToggleFolder: (folderId: string) => void
}

export function Sidebar({ folders, onAddFolder, onAddRange, onSelectRange, onToggleFolder }: SidebarProps) {
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

  const renderFolder = (folder: FolderType, depth = 0) => (
    <div key={folder.id}>
      <div 
        className="flex items-center gap-1 px-3 py-1.5 hover:bg-accent/50 cursor-pointer group"
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <button 
          onClick={() => onToggleFolder(folder.id)}
          className="p-0.5 text-muted-foreground"
        >
          {folder.isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
        <Folder className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm flex-1 truncate">{folder.name}</span>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setContextMenuFolder(contextMenuFolder === folder.id ? null : folder.id)
            }}
            className="p-1 hover:bg-accent rounded"
          >
            <MoreVertical className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {contextMenuFolder === folder.id && (
        <div 
          className="absolute left-full ml-1 bg-popover border border-border rounded-md shadow-lg py-1 z-50 w-40"
          style={{ marginLeft: `${160 + depth * 16}px` }}
        >
          <button
            onClick={() => openRangeDialog(folder.id)}
            className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent flex items-center gap-2"
          >
            <Plus className="w-3 h-3" />
            Adicionar range
          </button>
          <button
            onClick={() => {
              setShowFolderDialog(true)
              setContextMenuFolder(null)
            }}
            className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent flex items-center gap-2"
          >
            <Folder className="w-3 h-3" />
            Adicionar pasta
          </button>
          <div className="border-t border-border my-1" />
          <button className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent text-muted-foreground">
            Clonar pasta
          </button>
          <button className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent text-muted-foreground">
            Renomear pasta
          </button>
        </div>
      )}
      
      {folder.isOpen && (
        <div>
          {folder.ranges.map(range => (
            <div
              key={range.id}
              onClick={() => onSelectRange(range)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent/50 cursor-pointer"
              style={{ paddingLeft: `${28 + depth * 16}px` }}
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm truncate">{range.name}</span>
            </div>
          ))}
          {folder.subfolders?.map(subfolder => renderFolder(subfolder, depth + 1))}
        </div>
      )}
    </div>
  )

  return (
    <aside className="w-56 bg-sidebar border-r border-border flex flex-col shrink-0">
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFolderDialog(true)}
            className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors">
            <Folder className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <div className="px-3 py-1 text-xs text-muted-foreground uppercase tracking-wider">
          Minha biblioteca
        </div>
        {folders.map(folder => renderFolder(folder))}
      </div>

      <div className="p-3 border-t border-border">
        <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors">
          Importar do HRC
        </button>
      </div>

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
    </aside>
  )
}
