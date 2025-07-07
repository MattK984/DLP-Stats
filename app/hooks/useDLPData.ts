"use client"

import { useState, useEffect, useCallback } from "react"

export interface DLPData {
  id: string
  name: string
  score: number
  rank: number
  uniqueDatapoints: number
  address: string
  tokenAddress: string
  tokenName: string
  lastUpdated: string
  // Additional detailed metrics from your working code
  totalScore: string
  tradingVolume: string
  uniqueContributors: string
  dataAccessFees: string
  tradingVolumeScore: string
  uniqueContributorsScore: string
  dataAccessFeesScore: string
  tradingVolumeScorePenalty: string
  uniqueContributorsScorePenalty: string
  dataAccessFeesScorePenalty: string
  rewardAmount: string
  penaltyAmount: string
}

export function useDLPData(epoch = 6) {
  const [data, setData] = useState<DLPData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchDLPData = useCallback(async () => {
    console.log(`Hook: Starting fetch for epoch ${epoch}...`)
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/dlp-data?epoch=${epoch}`)
      console.log("Hook: Response status:", response.status)

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: "An unknown server error occurred" }))
        throw new Error(errorBody.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Hook: API result:", result)

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch DLP data from API")
      }

      console.log("Hook: Setting data:", result.data)
      setData(result.data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Hook: Error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [epoch])

  useEffect(() => {
    fetchDLPData()
    const interval = setInterval(fetchDLPData, 5 * 60 * 1000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [fetchDLPData])

  return { data, loading, error, lastUpdated, refetch: fetchDLPData }
}
