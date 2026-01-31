import { useState, useEffect, useCallback } from 'react'
import type { SRSCardState } from '../utils/srs'

const STORAGE_KEY = 'preflop_srs_data'

type SRSData = Record<string, Record<string, SRSCardState>> // chartId -> hand -> State

export function useSRS() {
    const [data, setData] = useState<SRSData>({})

    // Load data on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                setData(JSON.parse(stored))
            }
        } catch (e) {
            console.error('Failed to load SRS data', e)
        }
    }, [])

    const saveToStorage = (newData: SRSData) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
        } catch (e) {
            console.error('Failed to save SRS data', e)
        }
    }

    const getCardStats = useCallback((chartId: string, hand: string): SRSCardState | null => {
        return data[chartId]?.[hand] || null
    }, [data])

    const updateCardStats = useCallback((chartId: string, hand: string, newState: SRSCardState) => {
        setData(prev => {
            const next = { ...prev }
            if (!next[chartId]) {
                next[chartId] = {}
            }
            next[chartId][hand] = newState
            saveToStorage(next)
            return next
        })
    }, [])

    const getDueHands = useCallback((chartId: string): string[] => {
        const chartData = data[chartId]
        if (!chartData) return []

        const now = Date.now()
        return Object.entries(chartData)
            .filter(([_, stats]) => stats.due <= now)
            .map(([hand]) => hand)
    }, [data])

    return {
        getCardStats,
        updateCardStats,
        getDueHands
    }
}
