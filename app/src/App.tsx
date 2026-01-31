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
  const [activeTab, setActiveTabRaw] = useState<'biblioteca' | 'editor' | 'visualizador' | 'treinador'>('biblioteca')
  const [selectedRange, setSelectedRange] = useState<Range | null>(null)

  // Sidebar collapsed state - controlled by App
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const setActiveTab = (tab: 'biblioteca' | 'editor' | 'visualizador' | 'treinador') => {
    setActiveTabRaw(tab)
    // Auto-collapse sidebar in 'treinador', expand in others
    if (tab === 'treinador') {
      setIsSidebarCollapsed(true)
    } else {
      setIsSidebarCollapsed(false)
    }
  }

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
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex overflow-hidden">
        {activeTab !== 'visualizador' && (
          <Sidebar
            library={library}
            onSelectChart={handleSelectChart}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={setIsSidebarCollapsed}
          />
        )}
        <main className="flex-1 overflow-auto bg-black/5">
          <div className="page-container h-full flex flex-col py-6">
            {activeTab === 'biblioteca' && (
              <BibliotecaView
                selectedNode={library.selectedNode}
                onOpenInEditor={handleOpenInEditor}
              />
            )}
            {activeTab === 'editor' && (
              <div className="flex-1 overflow-hidden bg-card rounded-3xl border border-border/50 shadow-sm">
                <EditorView
                  range={selectedRange}
                  onSave={(range) => {
                    if (range) {
                      rangesManager.saveRange(range)
                      setSelectedRange(range)
                    }
                  }}
                />
              </div>
            )}
            {activeTab === 'visualizador' && (
              <div className="flex-1 overflow-hidden bg-card rounded-3xl border border-border/50 shadow-sm">
                <VisualizadorView
                  range={selectedRange}
                  library={library}
                  getRange={getOrCreateRange}
                />
              </div>
            )}
            {activeTab === 'treinador' && (
              <div className="flex-1 overflow-hidden bg-card rounded-3xl border border-border/50 shadow-sm">
                <TreinadorView folders={trainerFolders} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
