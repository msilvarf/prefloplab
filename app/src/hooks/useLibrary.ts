import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
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

    // Clipboard for copy/paste functionality
    const [clipboard, setClipboard] = useState<LibraryNode | null>(null)

    // Callback to duplicate range data when cloning/pasting chart nodes
    const duplicateRangeRef = useRef<((oldRangeId: string, newRangeId: string) => void) | null>(null)

    const setDuplicateRangeCallback = useCallback((cb: (oldRangeId: string, newRangeId: string) => void) => {
        duplicateRangeRef.current = cb
    }, [])

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
            children: (childType !== 'chart' && childType !== 'stack') ? [] : undefined,
            rangeId: (childType === 'chart' || childType === 'stack') ? `range-${Date.now()}` : undefined
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

    /**
     * Copy a node to clipboard (deep copy for pasting)
     */
    const copyNode = useCallback((node: LibraryNode) => {
        // Deep copy the node
        const deepCopy = JSON.parse(JSON.stringify(node))
        setClipboard(deepCopy)
    }, [])

    /**
     * Check if we can paste in the target parent
     * We can only paste if the clipboard node type matches what the parent allows
     */
    const canPaste = useCallback((parentId: string): boolean => {
        if (!clipboard) return false

        const parent = findNodeById(parentId)
        if (!parent) return false

        // Check if parent can have children of clipboard's type
        const allowedChildType =
            parent.type === 'format' ? 'scenario' :
                parent.type === 'scenario' ? 'stack' : null

        return clipboard.type === allowedChildType
    }, [clipboard, findNodeById])

    /**
     * Deep regenerate IDs for a node and all its children.
     * Also duplicates range data for chart nodes via the registered callback.
     */
    const regenerateIds = (node: LibraryNode): LibraryNode => {
        const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        let newRangeId = node.rangeId
        if (node.type === 'chart' || node.type === 'stack') {
            // Only generate new rangeId if the node already had one (stacks might not have rangeId if created in old version)
            // But for new stacks acting as charts, they should have rangeId.
            // If cloning an old stack (without rangeId), we don't add one here unless we migrate logic.
            // Let's assume if it has rangeId or is type stack/chart, we want a fresh start.

            // Generate new rangeId mainly if it's a chart OR if it's a stack that already acts as a chart (has rangeId)
            // OR if we are converting a stack to have a range? No, let's respect existing data.
            if (node.rangeId || node.type === 'stack' || node.type === 'chart') {
                newRangeId = `range-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

                // Duplicate the range data from oldRangeId → newRangeId
                if (node.rangeId && newRangeId && duplicateRangeRef.current) {
                    duplicateRangeRef.current(node.rangeId, newRangeId)
                }
            }
        }
        return {
            ...node,
            id: newId,
            rangeId: newRangeId,
            children: node.children?.map(child => regenerateIds(child))
        }
    }

    /**
     * Paste clipboard node as child of target parent
     */
    const pasteNode = useCallback((parentId: string): string | null => {
        if (!clipboard || !canPaste(parentId)) return null

        // Create copy with new IDs
        const nodeToPaste = regenerateIds(clipboard)
        nodeToPaste.title = `${clipboard.title} (cópia)`
        nodeToPaste.createdAt = new Date().toISOString()

        const addToParent = (nodeList: LibraryNode[]): LibraryNode[] => {
            return nodeList.map(node => {
                if (node.id === parentId) {
                    return {
                        ...node,
                        children: [...(node.children || []), nodeToPaste]
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
        setExpandedIds(prev => new Set([...prev, parentId]))
        return nodeToPaste.id
    }, [clipboard, canPaste])

    /**
     * Clone a node in place (duplicate as sibling)
     */
    const cloneNode = useCallback((nodeId: string): string | null => {
        const originalNode = findNodeById(nodeId)
        if (!originalNode) return null

        // Create cloned node with new IDs
        const clonedNode = regenerateIds(originalNode)
        clonedNode.title = `${originalNode.title} (cópia)`
        clonedNode.createdAt = new Date().toISOString()

        // Find parent and add clone as sibling
        const addClone = (nodeList: LibraryNode[]): LibraryNode[] => {
            // Check if node is at this level
            const index = nodeList.findIndex(n => n.id === nodeId)
            if (index !== -1) {
                // Found at this level, insert clone after original
                const newList = [...nodeList]
                newList.splice(index + 1, 0, clonedNode)
                return newList
            }

            // Search in children
            return nodeList.map(node => ({
                ...node,
                children: node.children ? addClone(node.children) : undefined
            }))
        }

        setNodes(prev => addClone(prev))
        return clonedNode.id
    }, [findNodeById])

    return {
        nodes,
        expandedIds,
        selectedId,
        selectedNode,
        clipboard,
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
        clearLibrary,
        copyNode,
        pasteNode,
        cloneNode,
        canPaste,
        setDuplicateRangeCallback
    }
}

// Export the return type for use in props
export type UseLibraryReturn = ReturnType<typeof useLibrary>
