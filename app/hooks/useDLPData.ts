"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"

export interface DLPData {
  id: string
  name: string
  score: number
  rank: number
  uniqueDatapoints: number
  address: string
  lastUpdated: Date
  // Additional metrics that might be available from the contract
  totalRewards: number
  validatorCount: number
  avgResponseTime: number
  uptime: number
  stakingAmount: number
}

export interface HistoricalDataPoint {
  timestamp: Date
  score: number
  rank: number
  uniqueDatapoints: number
  totalRewards: number
  validatorCount: number
  avgResponseTime: number
  uptime: number
  stakingAmount: number
}

export interface DLPHistoricalData {
  dlpId: string
  data: HistoricalDataPoint[]
}

const VANA_RPC = "https://rpc.vana.org"
const DLP_PERFORMANCE_ADDRESS = "0x847715C7DB37cF286611182Be0bD333cbfa29cc1"

// This is a simplified ABI - we'll need to get the actual ABI from the contract
const DLP_PERFORMANCE_ABI = [
  "function getDLPScore(address dlp) view returns (uint256)",
  "function getDLPRank(address dlp) view returns (uint256)",
  "function getAllDLPs() view returns (address[])",
  "function getDLPInfo(address dlp) view returns (string memory name, uint256 datapoints)",
]

// Available metrics for the custom metric card
export const AVAILABLE_METRICS = [
  { key: "score", label: "DLP Score", format: (val: number) => val.toFixed(1) },
  { key: "rank", label: "Rank", format: (val: number) => `#${val}` },
  { key: "uniqueDatapoints", label: "Unique Datapoints", format: (val: number) => formatNumber(val) },
  { key: "totalRewards", label: "Total Rewards", format: (val: number) => `${formatNumber(val)} VANA` },
  { key: "validatorCount", label: "Validators", format: (val: number) => val.toString() },
  { key: "avgResponseTime", label: "Avg Response Time", format: (val: number) => `${val}ms` },
  { key: "uptime", label: "Uptime", format: (val: number) => `${val.toFixed(1)}%` },
  { key: "stakingAmount", label: "Staking Amount", format: (val: number) => `${formatNumber(val)} VANA` },
] as const

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

// Generate mock historical data
function generateHistoricalData(dlp: DLPData): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = []
  const now = new Date()

  for (let i = 29; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const variation = (Math.random() - 0.5) * 0.1 // ±5% variation

    data.push({
      timestamp,
      score: Math.max(0, dlp.score * (1 + variation)),
      rank: Math.max(1, Math.round(dlp.rank * (1 + variation * 0.5))),
      uniqueDatapoints: Math.max(0, Math.round(dlp.uniqueDatapoints * (1 + variation))),
      totalRewards: Math.max(0, Math.round(dlp.totalRewards * (1 + variation))),
      validatorCount: Math.max(1, Math.round(dlp.validatorCount * (1 + variation * 0.3))),
      avgResponseTime: Math.max(10, Math.round(dlp.avgResponseTime * (1 + variation * 0.2))),
      uptime: Math.max(80, Math.min(100, dlp.uptime * (1 + variation * 0.05))),
      stakingAmount: Math.max(0, Math.round(dlp.stakingAmount * (1 + variation * 0.1))),
    })
  }

  return data
}

export function useDLPData() {
  const [data, setData] = useState<DLPData[]>([])
  const [historicalData, setHistoricalData] = useState<DLPHistoricalData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchDLPData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const provider = new ethers.JsonRpcProvider(VANA_RPC)
      const contract = new ethers.Contract(DLP_PERFORMANCE_ADDRESS, DLP_PERFORMANCE_ABI, provider)

      // Enhanced mock data with additional metrics
      const mockData: DLPData[] = [
        {
          id: "1",
          name: "OpenChat DLP",
          score: 95.7,
          rank: 1,
          uniqueDatapoints: 1250000,
          address: "0x1234...5678",
          lastUpdated: new Date(),
          totalRewards: 45000,
          validatorCount: 12,
          avgResponseTime: 120,
          uptime: 99.8,
          stakingAmount: 500000,
        },
        {
          id: "2",
          name: "Reddit DLP",
          score: 92.3,
          rank: 2,
          uniqueDatapoints: 980000,
          address: "0x2345...6789",
          lastUpdated: new Date(),
          totalRewards: 38000,
          validatorCount: 10,
          avgResponseTime: 150,
          uptime: 99.2,
          stakingAmount: 420000,
        },
        {
          id: "3",
          name: "Twitter DLP",
          score: 89.1,
          rank: 3,
          uniqueDatapoints: 750000,
          address: "0x3456...7890",
          lastUpdated: new Date(),
          totalRewards: 32000,
          validatorCount: 8,
          avgResponseTime: 180,
          uptime: 98.9,
          stakingAmount: 380000,
        },
        {
          id: "4",
          name: "LinkedIn DLP",
          score: 85.4,
          rank: 4,
          uniqueDatapoints: 620000,
          address: "0x4567...8901",
          lastUpdated: new Date(),
          totalRewards: 28000,
          validatorCount: 7,
          avgResponseTime: 200,
          uptime: 98.5,
          stakingAmount: 320000,
        },
        {
          id: "5",
          name: "GitHub DLP",
          score: 82.8,
          rank: 5,
          uniqueDatapoints: 540000,
          address: "0x5678...9012",
          lastUpdated: new Date(),
          totalRewards: 25000,
          validatorCount: 6,
          avgResponseTime: 220,
          uptime: 98.1,
          stakingAmount: 280000,
        },
      ]

      // Generate historical data for each DLP
      const mockHistoricalData: DLPHistoricalData[] = mockData.map((dlp) => ({
        dlpId: dlp.id,
        data: generateHistoricalData(dlp),
      }))

      setData(mockData)
      setHistoricalData(mockHistoricalData)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch DLP data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDLPData()

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchDLPData, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchDLPData])

  return {
    data,
    historicalData,
    loading,
    error,
    lastUpdated,
    refetch: fetchDLPData,
  }
}
