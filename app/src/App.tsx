import { useState, useMemo } from 'react'
import './App.css'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { BibliotecaView } from './views/BibliotecaView'
import { EditorView } from './views/EditorView'
import { VisualizadorView } from './views/VisualizadorView'
import { TreinadorView } from './views/TreinadorView'
import { useLibrary } from './hooks/useLibrary'
import { useRanges } from './hooks/useRanges'
import type { Range, LibraryNode, Folder } from './types'

function App() {
  const [activeTab, setActiveTab] = useState<'biblioteca' | 'editor' | 'visualizador' | 'treinador'>('biblioteca')
  const [selectedRange, setSelectedRange] = useState<Range | null>(null)

  // Use the library hook at App level to share state
  const library = useLibrary()
  const rangesManager = useRanges()

  /**
   * Helper to get or create a default range
   */
  const getOrCreateRange = (node: LibraryNode): Range => {
    if (node.rangeId) {
      const existing = rangesManager.getRange(node.rangeId)
      if (existing) return existing

      // Return default template if not found
      return {
        id: node.rangeId,
        name: node.title,
        type: 'classico',
        hands: {},
        actions: [
          { id: '1', name: 'call', color: '#d4a017' },
          { id: '2', name: 'raise', color: '#4a9b8e' }
        ]
      }
    }
    // Fallback should typically not happen for chart nodes
    return {
      id: 'temp',
      name: node.title,
      type: 'classico',
      hands: {},
      actions: []
    }
  }

  /**
   * Handle chart selection from sidebar
   */
  const handleSelectChart = (node: LibraryNode) => {
    // If it's a chart, also prepare the Range object
    if (node.type === 'chart') {
      const range = getOrCreateRange(node)
      setSelectedRange(range)
    }
  }

  /**
   * Open chart in editor
   */
  const handleOpenInEditor = (node: LibraryNode) => {
    if (node.type === 'chart') {
      const range = getOrCreateRange(node)
      setSelectedRange(range)
      setActiveTab('editor')
    }
  }

  /**
   * Generate folders for TreinadorView from Library Structure
   * We flatten the hierarchy: Each 'Stack' node becomes a folder.
   */
  const trainerFolders = useMemo(() => {
    const folders: Folder[] = []

    const processNode = (node: LibraryNode, path: string[]) => {
      if (node.type === 'stack') {
        // Create a folder for this Stack
        const folderName = [...path, node.title].join(' / ')

        // Find chart children
        const chartNodes = node.children?.filter(c => c.type === 'chart') || []

        if (chartNodes.length > 0) {
          const folderRanges = chartNodes.map(chartNode => getOrCreateRange(chartNode))

          folders.push({
            id: node.id,
            name: folderName,
            isOpen: false,
            ranges: folderRanges
          })
        }
      } else if (node.children) {
        // Continue traversing
        // Don't include format/scenario names in path if desire cleaner UI, but usually helpful context
        const newPath = node.type === 'format' || node.type === 'scenario'
          ? [...path, node.title]
          : path

        node.children.forEach(child => processNode(child, newPath))
      }
    }

    library.nodes.forEach(node => processNode(node, []))
    return folders
  }, [library.nodes, rangesManager.ranges])

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          library={library}
          onSelectChart={handleSelectChart}
        />
        <main className="flex-1 overflow-auto">
          {activeTab === 'biblioteca' && (
            <BibliotecaView
              selectedNode={library.selectedNode}
              onOpenInEditor={handleOpenInEditor}
            />
          )}
          {activeTab === 'editor' && (
            <EditorView
              range={selectedRange}
              onSave={(range) => {
                if (range) {
                  rangesManager.saveRange(range)
                  setSelectedRange(range)
                }
              }}
            />
          )}
          {activeTab === 'visualizador' && (
            <VisualizadorView range={selectedRange} />
          )}
          {activeTab === 'treinador' && (
            <TreinadorView folders={trainerFolders} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
