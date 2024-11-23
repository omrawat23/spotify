"use client"

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react'

type TimeRange = 'short_term' | 'medium_term' | 'long_term'

type AnalyticsView = 'top-tracks' | 'top-artists' | 'recent' | 'genres' | 'listening-time' | 'popularity' | 'recommendations'

interface AnalyticsContextType {
  currentView: AnalyticsView
  setCurrentView: (view: AnalyticsView) => void
  timeRange: TimeRange
  setTimeRange: (range: TimeRange) => void
  data: any
  loading: boolean
  error: string | null
  fetchData: () => Promise<void>
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<AnalyticsView>('top-tracks')
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/spotify/analytics?view=${currentView}&time_range=${timeRange}`)
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      const fetchedData = await response.json()
      setData(fetchedData)
    } catch (err) {
      setError('An error occurred while fetching data')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }, [currentView, timeRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <AnalyticsContext.Provider 
      value={{ 
        currentView, 
        setCurrentView, 
        timeRange, 
        setTimeRange, 
        data, 
        loading, 
        error, 
        fetchData 
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

