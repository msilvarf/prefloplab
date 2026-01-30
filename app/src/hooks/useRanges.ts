import { useState, useEffect, useCallback } from 'react'
import type { Range } from '@/types'

const RANGES_STORAGE_KEY = 'prefloplab_ranges'

export function useRanges() {
    const [ranges, setRanges] = useState<Record<string, Range>>(() => {
        try {
            const stored = localStorage.getItem(RANGES_STORAGE_KEY)
            if (stored) {
                return JSON.parse(stored)
            }
        } catch (e) {
            console.error('Failed to load ranges from localStorage:', e)
        }
        return {}
    })

    useEffect(() => {
        try {
            localStorage.setItem(RANGES_STORAGE_KEY, JSON.stringify(ranges))
        } catch (e) {
            console.error('Failed to save ranges to localStorage:', e)
        }
    }, [ranges])

    const getRange = useCallback((id: string): Range | undefined => {
        return ranges[id]
    }, [ranges])

    const saveRange = useCallback((range: Range) => {
        setRanges(prev => ({
            ...prev,
            [range.id]: range
        }))
    }, [])

    const deleteRange = useCallback((id: string) => {
        setRanges(prev => {
            const next = { ...prev }
            delete next[id]
            return next
        })
    }, [])

    return {
        ranges,
        getRange,
        saveRange,
        deleteRange
    }
}
