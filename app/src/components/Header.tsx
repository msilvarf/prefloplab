import { Sparkles, Bell, Settings, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <header className="h-16 glass-strong flex items-center justify-between px-6 shrink-0 border-b border-border/50">
      {/* Logo & Navigation */}
      <div className="flex items-center gap-10">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-violet-500/30 transition-shadow duration-300">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight">PreflopLab</span>
            <span className="text-[10px] text-muted-foreground -mt-0.5">Preflop Mastery</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-secondary/30 rounded-xl p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "relative px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                activeTab === tab.key
                  ? "bg-gradient-to-r from-violet-600/90 to-purple-600/90 text-white shadow-lg shadow-violet-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 opacity-0 animate-pulse-glow" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all duration-200 group">
          <Sparkles className="w-4 h-4 text-violet-400 group-hover:animate-pulse" />
          <span className="hidden lg:inline">Assistente</span>
        </button>

        <div className="w-px h-6 bg-border/50 mx-2" />

        <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all duration-200 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
        </button>

        <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all duration-200">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
