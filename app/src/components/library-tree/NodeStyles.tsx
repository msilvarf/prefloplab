import { Gamepad2, Users, Coins, Grid3X3 } from 'lucide-react'
import type { LibraryNodeType } from '@/types/library'
import { cn } from '@/lib/utils'

interface NodeIconProps {
    type: LibraryNodeType
    className?: string
}

/**
 * Get the icon for each node type
 */
export function NodeIcon({ type, className }: NodeIconProps) {
    const iconClass = cn('w-5 h-5', className)

    switch (type) {
        case 'format':
            return <Gamepad2 className={iconClass} />
        case 'scenario':
            return <Users className={iconClass} />
        case 'stack':
            return <Coins className={iconClass} />
        case 'chart':
            return <Grid3X3 className={iconClass} />
    }
}

/**
 * Get colors for each node type
 */
export function getNodeColor(type: LibraryNodeType): string {
    switch (type) {
        case 'format':
            return 'text-violet-400'
        case 'scenario':
            return 'text-blue-400'
        case 'stack':
            return 'text-amber-400'
        case 'chart':
            return 'text-emerald-400'
    }
}

/**
 * Get background gradient for each node type (subtle)
 */
export function getNodeBgGradient(type: LibraryNodeType): string {
    switch (type) {
        case 'format':
            return 'from-violet-500/10 to-transparent'
        case 'scenario':
            return 'from-blue-500/10 to-transparent'
        case 'stack':
            return 'from-amber-500/10 to-transparent'
        case 'chart':
            return 'from-emerald-500/10 to-transparent'
    }
}
