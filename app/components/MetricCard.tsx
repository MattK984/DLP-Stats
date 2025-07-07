"use client"

import type React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { DLPData } from "../hooks/useDLPData"

interface MetricCardBaseProps {
  title: string
  icon: React.ReactNode
  loading: boolean
}

/**
 * When you want the “top-3” ranking card
 */
interface RankingMetricCardProps extends MetricCardBaseProps {
  data: DLPData[]
  metricKey: keyof DLPData
  isRank?: boolean
  value?: never
  description?: never
}

/**
 * When you just want to display a single value (total, average, etc.)
 */
interface SummaryMetricCardProps extends MetricCardBaseProps {
  value: string | number
  description?: string
  data?: never
  metricKey?: never
  isRank?: never
}

type MetricCardProps = RankingMetricCardProps | SummaryMetricCardProps

export function MetricCard(props: MetricCardProps) {
  const { title, icon, loading } = props

  /* ---------------------------------------------------------------------
   *  1. SKELETON – show a generic skeleton irrespective of mode
   * ------------------------------------------------------------------- */
  if (loading) {
    const rows = "data" in props ? 3 : 1
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
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

  /* ---------------------------------------------------------------------
   *  2. SUMMARY MODE
   * ------------------------------------------------------------------- */
  if ("value" in props) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{props.value}</div>
          {props.description && <p className="text-xs text-muted-foreground">{props.description}</p>}
        </CardContent>
      </Card>
    )
  }

  /* ---------------------------------------------------------------------
   *  3. RANKING MODE – original behaviour
   * ------------------------------------------------------------------- */
  const { data, metricKey, isRank = false } = props

  const formatValue = (value: any) => {
    if (typeof value === "number") {
      if (metricKey === "uniqueDatapoints") {
        if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
        if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
        return value.toString()
      }
      if (metricKey === "score") return value.toFixed(4)
      if (isRank) return `#${value}`
      return value.toString()
    }
    if (typeof value === "string") {
      const numValue = Number.parseFloat(value)
      if (!isNaN(numValue)) {
        if (metricKey === "rewardAmount") return `${numValue.toFixed(4)} VANA`
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
