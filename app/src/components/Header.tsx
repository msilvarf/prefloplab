import { Sparkles, Bell, Settings } from 'lucide-react'

interface HeaderProps {
  activeTab: 'biblioteca' | 'editor' | 'visualizador' | 'treinador'
  onTabChange: (tab: 'biblioteca' | 'editor' | 'visualizador' | 'treinador') => void
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    { key: 'biblioteca', label: 'Biblioteca' },
    { key: 'editor', label: 'Editor' },
    { key: 'visualizador', label: 'Visualizador' },
    { key: 'treinador', label: 'Treinador' }
  ] as const

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="font-semibold text-sm">PreflopLab</span>
        </div>

        <nav className="flex items-center gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${activeTab === tab.key
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Sparkles className="w-4 h-4" />
          <span>Reiniciar assistente</span>
          <span className="text-xs">×</span>
        </button>

        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
