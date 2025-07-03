"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Settings } from "lucide-react"
import type { DLPData } from "../hooks/useDLPData"
import { AVAILABLE_METRICS } from "../hooks/useDLPData"

interface CustomMetricCardProps {
  data: DLPData[]
  loading: boolean
}

export function CustomMetricCard({ data, loading }: CustomMetricCardProps) {
  const [selectedMetric, setSelectedMetric] = useState(AVAILABLE_METRICS[3].key) // Default to totalRewards

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Custom Metric</CardTitle>
          <Settings className="w-5 h-5" />
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

  const selectedMetricConfig = AVAILABLE_METRICS.find((m) => m.key === selectedMetric)!

  // Sort data by the selected metric
  const sortedData = [...data].sort((a, b) => {
    const aVal = a[selectedMetric as keyof DLPData] as number
    const bVal = b[selectedMetric as keyof DLPData] as number

    // For rank, lower is better
    if (selectedMetric === "rank") {
      return aVal - bVal
    }
    // For response time, lower is better
    if (selectedMetric === "avgResponseTime") {
      return aVal - bVal
    }
    // For everything else, higher is better
    return bVal - aVal
  })

  const getBadgeVariant = (index: number) => {
    if (index === 0) return "default"
    if (index === 1) return "secondary"
    return "outline"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Custom Metric</CardTitle>
        <Settings className="w-5 h-5" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_METRICS.map((metric) => (
                <SelectItem key={metric.key} value={metric.key}>
                  {metric.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-3">
            {sortedData.slice(0, 3).map((dlp, index) => (
              <div key={dlp.id} className="flex items-center justify-between">
                <span className="text-sm font-medium">{dlp.name}</span>
                <Badge variant={getBadgeVariant(index)}>
                  {selectedMetricConfig.format(dlp[selectedMetric as keyof DLPData] as number)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
