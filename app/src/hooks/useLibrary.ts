import { useState, useCallback, useMemo, useEffect } from 'react'
import type { LibraryNode, LibraryNodeType } from '@/types/library'
import { LIBRARY_STORAGE_KEY } from '@/types/library'

/**
 * Custom hook for managing the library state with localStorage persistence.
 * Provides full CRUD operations for the tree.
 */
export function useLibrary() {
    // Load initial state from localStorage or start empty
    const [nodes, setNodes] = useState<LibraryNode[]>(() => {
        try {
            const stored = localStorage.getItem(LIBRARY_STORAGE_KEY)
            if (stored) {
                return JSON.parse(stored)
            }
        } catch (e) {
            console.error('Failed to load library from localStorage:', e)
        }
        return []
    })

    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
    const [selectedId, setSelectedId] = useState<string | null>(null)

    // Persist to localStorage whenever nodes change
    useEffect(() => {
        try {
            localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(nodes))
        } catch (e) {
            console.error('Failed to save library to localStorage:', e)
        }
    }, [nodes])

    /**
     * Find a node by ID in the tree
     */
    const findNodeById = useCallback((id: string, searchNodes?: LibraryNode[]): LibraryNode | null => {
        const nodeList = searchNodes ?? nodes
        for (const node of nodeList) {
            if (node.id === id) return node
            if (node.children) {
                const found = findNodeById(id, node.children)
                if (found) return found
            }
        }
        return null
    }, [nodes])

    /**
     * Get the selected node
     */
    const selectedNode = useMemo(() => {
        return selectedId ? findNodeById(selectedId) : null
    }, [selectedId, findNodeById])

    /**
     * Toggle expand/collapse for a node
     */
    const toggleExpand = useCallback((id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }, [])

    /**
     * Select a node
     */
    const selectNode = useCallback((id: string | null) => {
        setSelectedId(id)
    }, [])

    /**
     * Generate a unique ID
     */
    const generateId = (type: LibraryNodeType) => `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    /**
     * Add a new format (root level node)
     */
    const addFormat = useCallback((title: string) => {
        const newFormat: LibraryNode = {
            id: generateId('format'),
            title,
            type: 'format',
            createdAt: new Date().toISOString(),
            children: []
        }
        setNodes(prev => [...prev, newFormat])
        setExpandedIds(prev => new Set([...prev, newFormat.id]))
        return newFormat.id
    }, [])

    /**
     * Add a child node to a parent
     */
    const addNode = useCallback((
        parentId: string,
        childType: LibraryNodeType,
        title: string
    ): string | null => {
        const newNode: LibraryNode = {
            id: generateId(childType),
            title,
            type: childType,
            createdAt: new Date().toISOString(),
            children: childType !== 'chart' ? [] : undefined,
            rangeId: childType === 'chart' ? `range-${Date.now()}` : undefined
        }

        const addToParent = (nodeList: LibraryNode[]): LibraryNode[] => {
            return nodeList.map(node => {
                if (node.id === parentId) {
                    return {
                        ...node,
                        children: [...(node.children || []), newNode]
                    }
                }
                if (node.children) {
                    return {
                        ...node,
                        children: addToParent(node.children)
                    }
                }
                return node
            })
        }

        setNodes(prev => addToParent(prev))
        // Auto-expand the parent
        setExpandedIds(prev => new Set([...prev, parentId]))
        return newNode.id
    }, [])

    /**
     * Rename a node
     */
    const renameNode = useCallback((id: string, newTitle: string) => {
        const updateNodes = (nodeList: LibraryNode[]): LibraryNode[] => {
            return nodeList.map(node => {
                if (node.id === id) {
                    return { ...node, title: newTitle }
                }
                if (node.children) {
                    return { ...node, children: updateNodes(node.children) }
                }
                return node
            })
        }
        setNodes(prev => updateNodes(prev))
    }, [])

    /**
     * Delete a node by ID (and all its children)
     */
    const deleteNode = useCallback((id: string) => {
        const removeFromNodes = (nodeList: LibraryNode[]): LibraryNode[] => {
            return nodeList
                .filter(node => node.id !== id)
                .map(node => ({
                    ...node,
                    children: node.children ? removeFromNodes(node.children) : undefined
                }))
        }
        setNodes(prev => removeFromNodes(prev))
        if (selectedId === id) {
            setSelectedId(null)
        }
    }, [selectedId])

    /**
     * Move a node to a new position (reorder within same parent)
     */
    const moveNode = useCallback((nodeId: string, direction: 'up' | 'down') => {
        const reorder = (nodeList: LibraryNode[]): LibraryNode[] => {
            const index = nodeList.findIndex(n => n.id === nodeId)
            if (index === -1) {
                // Not in this level, search deeper
                return nodeList.map(node => ({
                    ...node,
                    children: node.children ? reorder(node.children) : undefined
                }))
            }

            const newList = [...nodeList]
            const newIndex = direction === 'up' ? index - 1 : index + 1

            if (newIndex < 0 || newIndex >= newList.length) {
                return nodeList // Can't move beyond bounds
            }

            // Swap
            const temp = newList[index]
            newList[index] = newList[newIndex]
            newList[newIndex] = temp

            return newList
        }

        setNodes(prev => reorder(prev))
    }, [])

    /**
     * Expand all nodes
     */
    const expandAll = useCallback(() => {
        const collectIds = (nodeList: LibraryNode[]): string[] => {
            return nodeList.flatMap(node => [
                node.id,
                ...(node.children ? collectIds(node.children) : [])
            ])
        }
        setExpandedIds(new Set(collectIds(nodes)))
    }, [nodes])

    /**
     * Collapse all nodes
     */
    const collapseAll = useCallback(() => {
        setExpandedIds(new Set())
    }, [])

    /**
     * Clear the entire library
     */
    const clearLibrary = useCallback(() => {
        setNodes([])
        setSelectedId(null)
        setExpandedIds(new Set())
    }, [])

    return {
        nodes,
        expandedIds,
        selectedId,
        selectedNode,
        findNodeById,
        toggleExpand,
        selectNode,
        addFormat,
        addNode,
        renameNode,
        deleteNode,
        moveNode,
        expandAll,
        collapseAll,
        clearLibrary
    }
}

// Export the return type for use in props
export type UseLibraryReturn = ReturnType<typeof useLibrary>
