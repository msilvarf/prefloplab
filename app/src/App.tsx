import { useState } from 'react'
import './App.css'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { BibliotecaView } from './views/BibliotecaView'
import { EditorView } from './views/EditorView'
import { VisualizadorView } from './views/VisualizadorView'
import { TreinadorView } from './views/TreinadorView'
import type { Folder, Range } from './types'

const initialFolders: Folder[] = [
  {
    id: '1',
    name: 'Holdem Cash by FreeBetRange',
    isOpen: true,
    ranges: []
  },
  {
    id: '2',
    name: 'spin',
    isOpen: false,
    ranges: []
  }
]

function App() {
  const [activeTab, setActiveTab] = useState<'biblioteca' | 'editor' | 'visualizador' | 'treinador'>('biblioteca')
  const [folders, setFolders] = useState<Folder[]>(initialFolders)
  const [selectedRange, setSelectedRange] = useState<Range | null>(null)

  const handleAddFolder = (name: string, parentId?: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      isOpen: false,
      ranges: []
    }
    
    if (parentId) {
      setFolders(prev => addFolderToParent(prev, parentId, newFolder))
    } else {
      setFolders(prev => [...prev, newFolder])
    }
  }

  const addFolderToParent = (folders: Folder[], parentId: string, newFolder: Folder): Folder[] => {
    return folders.map(folder => {
      if (folder.id === parentId) {
        return {
          ...folder,
          subfolders: [...(folder.subfolders || []), newFolder]
        }
      }
      if (folder.subfolders) {
        return {
          ...folder,
          subfolders: addFolderToParent(folder.subfolders, parentId, newFolder)
        }
      }
      return folder
    })
  }

  const handleAddRange = (folderId: string, range: Range) => {
    setFolders(prev => prev.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, ranges: [...folder.ranges, range] }
      }
      return folder
    }))
    setSelectedRange(range)
    setActiveTab('editor')
  }

  const handleSelectRange = (range: Range) => {
    setSelectedRange(range)
    setActiveTab('editor')
  }

  const toggleFolder = (folderId: string) => {
    setFolders(prev => prev.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, isOpen: !folder.isOpen }
      }
      return folder
    }))
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          folders={folders}
          onAddFolder={handleAddFolder}
          onAddRange={handleAddRange}
          onSelectRange={handleSelectRange}
          onToggleFolder={toggleFolder}
        />
        <main className="flex-1 overflow-auto">
          {activeTab === 'biblioteca' && (
            <BibliotecaView 
              folders={folders}
              onSelectRange={handleSelectRange}
              onAddFolder={(name) => handleAddFolder(name)}
              onAddRange={handleAddRange}
            />
          )}
          {activeTab === 'editor' && (
            <EditorView 
              range={selectedRange}
              onSave={(range) => {
                if (range) {
                  setFolders(prev => prev.map(folder => ({
                    ...folder,
                    ranges: folder.ranges.map(r => r.id === range.id ? range : r)
                  })))
                }
              }}
            />
          )}
          {activeTab === 'visualizador' && (
            <VisualizadorView folders={folders} />
          )}
          {activeTab === 'treinador' && (
            <TreinadorView folders={folders} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
