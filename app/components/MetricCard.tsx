"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { DLPData } from "../hooks/useDLPData"

interface MetricCardProps {
  title: string
  icon: React.ReactNode
  data: DLPData[]
  metricKey: keyof DLPData
  loading: boolean
  isRank?: boolean
}

export function MetricCard({ title, icon, data, metricKey, loading, isRank = false }: MetricCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
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

  const formatValue = (value: any) => {
    if (typeof value === "number") {
      if (metricKey === "uniqueDatapoints") {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
        return value.toString()
      }
      if (metricKey === "score") {
        return value.toFixed(1)
      }
      if (isRank) {
        return `#${value}`
      }
      return value.toString()
    }
    return value
  }

  const getBadgeVariant = (index: number) => {
    if (index === 0) return "default"
    if (index === 1) return "secondary"
    return "outline"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 3).map((dlp, index) => (
            <div key={dlp.id} className="flex items-center justify-between">
              <span className="text-sm font-medium">{dlp.name}</span>
              <Badge variant={getBadgeVariant(index)}>{formatValue(dlp[metricKey])}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
