/**
 * PreflopLab Library System
 * 
 * Strict Hierarchy: Format → Scenario → Stack
 * 
 * - Format: game format (Spin, Heads-Up, 6-Max, Cash)
 * - Scenario: position + action (e.g. SB vs Limp, BB vs SB Open)
 * - Stack: effective stack size (e.g. 25bb) - NOW CONTAINS THE RANGE
 */

export type LibraryNodeType = 'format' | 'scenario' | 'stack' | 'chart' // keeping chart for types safety but removing from hierarchy

/**
 * Unified tree node interface for the library hierarchy.
 * All nodes share this interface, with `type` determining valid children.
 */
export interface LibraryNode {
    id: string
    title: string
    type: LibraryNodeType
    children?: LibraryNode[]
    createdAt: string
    /** Present on stack/chart nodes - links to the Range data */
    rangeId?: string
}

/**
 * Returns the allowed child type for a given parent node type.
 * 
 * format → scenario
 * scenario → stack
 * stack → (none, leaf node)
 */
export function getAllowedChildType(parentType: LibraryNodeType): LibraryNodeType | null {
    switch (parentType) {
        case 'format':
            return 'scenario'
        case 'scenario':
            return 'stack'
        case 'stack':
            return null // Stacks are now leaf nodes
        case 'chart':
            return null
    }
}

/**
 * Returns the human-readable label for adding a child.
 */
export function getAddChildLabel(parentType: LibraryNodeType): string | null {
    switch (parentType) {
        case 'format':
            return 'Adicionar Cenário'
        case 'scenario':
            return 'Adicionar Stack'
        case 'stack':
            return null
        case 'chart':
            return null
    }
}

/**
 * Returns the placeholder text for creating a new node
 */
export function getNodePlaceholder(type: LibraryNodeType): string {
    switch (type) {
        case 'format':
            return 'Ex: Spin, Heads-Up, 6-Max, Cash'
        case 'scenario':
            return 'Ex: SB Open, BB vs SB Open, UTG Open'
        case 'stack':
            return 'Ex: 25bb, 20bb, 15bb, 100bb (Setup do Range)'
        case 'chart':
            return 'Ex: Raise, Call, 3-Bet, All-In'
    }
}

/**
 * Returns the node type label in Portuguese
 */
export function getNodeTypeLabel(type: LibraryNodeType): string {
    switch (type) {
        case 'format':
            return 'Formato'
        case 'scenario':
            return 'Cenário'
        case 'stack':
            return 'Stack'
        case 'chart':
            return 'Chart'
    }
}

/**
 * Minimal seed data - only formats, no pre-created content
 */
export function getMinimalSeed(): LibraryNode[] {
    return []
}

/**
 * localStorage key for the library
 */
export const LIBRARY_STORAGE_KEY = 'prefloplab_library'
