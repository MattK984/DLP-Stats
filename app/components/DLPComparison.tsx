"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import type { DLPData } from "../hooks/useDLPData"

interface DLPComparisonProps {
  data: DLPData[]
  loading: boolean
}

export function DLPComparison({ data, loading }: DLPComparisonProps) {
  const [selectedDLP1, setSelectedDLP1] = useState<string>("")
  const [selectedDLP2, setSelectedDLP2] = useState<string>("")

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compare DLPs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const dlp1 = data.find((d) => d.id === selectedDLP1)
  const dlp2 = data.find((d) => d.id === selectedDLP2)

  const metrics = [
    { key: "score", label: "Total Score", format: (val: number) => val.toFixed(4) },
    { key: "uniqueDatapoints", label: "Contributors", format: (val: number) => val.toLocaleString() },
    { key: "rewardAmount", label: "Rewards", format: (val: string) => `${Number.parseFloat(val).toFixed(4)} VANA` },
    {
      key: "tradingVolume",
      label: "Trading Volume",
      format: (val: string) => `${Number.parseFloat(val).toFixed(4)} VANA`,
    },
    {
      key: "dataAccessFees",
      label: "Data Access Fees",
      format: (val: string) => `${Number.parseFloat(val).toFixed(4)} VANA`,
    },
  ]

  const getProgressValue = (val1: any, val2: any, isString = false) => {
    const num1 = isString ? Number.parseFloat(val1) || 0 : val1 || 0
    const num2 = isString ? Number.parseFloat(val2) || 0 : val2 || 0
    const max = Math.max(num1, num2)
    return max === 0 ? 0 : (num1 / max) * 100
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare DLPs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* DLP Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select First DLP</label>
              <Select value={selectedDLP1} onValueChange={setSelectedDLP1}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose DLP..." />
                </SelectTrigger>
                <SelectContent>
                  {data.map((dlp) => (
                    <SelectItem key={dlp.id} value={dlp.id}>
                      {dlp.name} (#{dlp.rank})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Second DLP</label>
              <Select value={selectedDLP2} onValueChange={setSelectedDLP2}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose DLP..." />
                </SelectTrigger>
                <SelectContent>
                  {data.map((dlp) => (
                    <SelectItem key={dlp.id} value={dlp.id}>
                      {dlp.name} (#{dlp.rank})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Comparison Results */}
          {dlp1 && dlp2 && (
            <div className="space-y-6">
              {/* Header */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <h3 className="font-semibold">{dlp1.name}</h3>
                  <Badge variant="outline">Rank #{dlp1.rank}</Badge>
                </div>
                <div className="text-center text-sm text-muted-foreground">Metric</div>
                <div className="text-center">
                  <h3 className="font-semibold">{dlp2.name}</h3>
                  <Badge variant="outline">Rank #{dlp2.rank}</Badge>
                </div>
              </div>

              {/* Metrics Comparison */}
              <div className="space-y-4">
                {metrics.map((metric) => {
                  const val1 =
                    metric.key === "score" || metric.key === "uniqueDatapoints"
                      ? (dlp1[metric.key as keyof DLPData] as number)
                      : (dlp1[metric.key as keyof DLPData] as string)
                  const val2 =
                    metric.key === "score" || metric.key === "uniqueDatapoints"
                      ? (dlp2[metric.key as keyof DLPData] as number)
                      : (dlp2[metric.key as keyof DLPData] as string)

                  const isString = typeof val1 === "string"
                  const progress1 = getProgressValue(val1, val2, isString)
                  const progress2 = getProgressValue(val2, val1, isString)

                  return (
                    <div key={metric.key} className="space-y-2">
                      <div className="text-sm font-medium text-center">{metric.label}</div>
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div className="text-right">
                          <div className="text-sm font-mono">
                            {isString ? metric.format(val1 as string) : metric.format(val1 as number)}
                          </div>
                          <Progress value={progress1} className="mt-1" />
                        </div>
                        <div className="text-center text-xs text-muted-foreground">vs</div>
                        <div className="text-left">
                          <div className="text-sm font-mono">
                            {isString ? metric.format(val2 as string) : metric.format(val2 as number)}
                          </div>
                          <Progress value={progress2} className="mt-1" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {(!dlp1 || !dlp2) && (
            <div className="text-center text-muted-foreground py-8">
              Select two DLPs to compare their performance metrics
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
