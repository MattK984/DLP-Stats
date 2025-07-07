"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Settings } from "lucide-react"
import type { DLPData } from "../hooks/useDLPData"

interface CustomMetricCardProps {
  data: DLPData[]
  loading: boolean
}

const METRICS = [
  { key: "score", label: "Total Score" },
  { key: "uniqueDatapoints", label: "Contributors" },
  { key: "rewardAmount", label: "Rewards" },
  { key: "tradingVolume", label: "Trading Volume" },
  { key: "dataAccessFees", label: "Data Access Fees" },
] as const

export function CustomMetricCard({ data, loading }: CustomMetricCardProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>("score")

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Custom Metric</CardTitle>
          <Settings className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatValue = (value: any, metricKey: string) => {
    if (typeof value === "number") {
      if (metricKey === "uniqueDatapoints") {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
        return value.toString()
      }
      if (metricKey === "score") {
        return value.toFixed(4)
      }
      return value.toString()
    }
    if (typeof value === "string") {
      const numValue = Number.parseFloat(value)
      if (!isNaN(numValue)) {
        if (metricKey === "rewardAmount" || metricKey === "tradingVolume" || metricKey === "dataAccessFees") {
          return `${numValue.toFixed(4)} VANA`
        }
        return numValue.toFixed(4)
      }
    }
    return value
  }

  const getBadgeVariant = (index: number) => {
    if (index === 0) return "default"
    if (index === 1) return "secondary"
    return "outline"
  }

  // Sort data by selected metric
  const sortedData = [...data].sort((a, b) => {
    const aVal =
      typeof a[selectedMetric as keyof DLPData] === "string"
        ? Number.parseFloat(a[selectedMetric as keyof DLPData] as string) || 0
        : (a[selectedMetric as keyof DLPData] as number) || 0
    const bVal =
      typeof b[selectedMetric as keyof DLPData] === "string"
        ? Number.parseFloat(b[selectedMetric as keyof DLPData] as string) || 0
        : (b[selectedMetric as keyof DLPData] as number) || 0
    return bVal - aVal
  })

  const selectedMetricLabel = METRICS.find((m) => m.key === selectedMetric)?.label || "Score"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Top by {selectedMetricLabel}</CardTitle>
        <Settings className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METRICS.map((metric) => (
                <SelectItem key={metric.key} value={metric.key}>
                  {metric.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {sortedData.slice(0, 3).map((dlp, index) => (
            <div key={dlp.id} className="flex items-center justify-between">
              <span className="text-sm font-medium">{dlp.name}</span>
              <Badge variant={getBadgeVariant(index)}>
                {formatValue(dlp[selectedMetric as keyof DLPData], selectedMetric)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
