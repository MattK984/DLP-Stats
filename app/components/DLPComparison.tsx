"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, X } from "lucide-react"
import type { DLPData } from "../hooks/useDLPData"
import { AVAILABLE_METRICS } from "../hooks/useDLPData"

interface DLPComparisonProps {
  data: DLPData[]
  loading: boolean
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"]

export function DLPComparison({ data, loading }: DLPComparisonProps) {
  const [selectedDLPs, setSelectedDLPs] = useState<string[]>([])
  const [selectedMetric, setSelectedMetric] = useState("score")

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const handleDLPToggle = (dlpId: string) => {
    setSelectedDLPs((prev) => {
      if (prev.includes(dlpId)) {
        return prev.filter((id) => id !== dlpId)
      } else if (prev.length < 5) {
        // Limit to 5 DLPs for readability
        return [...prev, dlpId]
      }
      return prev
    })
  }

  const clearSelection = () => {
    setSelectedDLPs([])
  }

  const selectedMetricConfig = AVAILABLE_METRICS.find((m) => m.key === selectedMetric)!

  // Generate mock historical data for comparison chart
  const generateComparisonData = () => {
    const days = 30
    const chartData = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const dataPoint: any = {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        timestamp: date.getTime(),
      }

      selectedDLPs.forEach((dlpId) => {
        const dlp = data.find((d) => d.id === dlpId)
        if (dlp) {
          // Generate mock historical variation
          const baseValue = dlp[selectedMetric as keyof DLPData] as number
          const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
          dataPoint[dlp.name] = Math.max(0, baseValue * (1 + variation))
        }
      })

      chartData.push(dataPoint)
    }

    return chartData
  }

  const chartData = selectedDLPs.length > 0 ? generateComparisonData() : []

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Metric to Compare</label>
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
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Selected DLPs ({selectedDLPs.length}/5)</label>
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedDLPs.map((dlpId) => {
                const dlp = data.find((d) => d.id === dlpId)
                return dlp ? (
                  <Badge key={dlpId} variant="secondary" className="flex items-center gap-1">
                    {dlp.name}
                    <button
                      onClick={() => handleDLPToggle(dlpId)}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ) : null
              })}
            </div>
            {selectedDLPs.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* DLP Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select DLPs to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.map((dlp) => (
              <div
                key={dlp.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedDLPs.includes(dlp.id) ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                }`}
                onClick={() => handleDLPToggle(dlp.id)}
              >
                <Checkbox
                  checked={selectedDLPs.includes(dlp.id)}
                  disabled={!selectedDLPs.includes(dlp.id) && selectedDLPs.length >= 5}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{dlp.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedMetricConfig.format(dlp[selectedMetric as keyof DLPData] as number)}
                  </p>
                </div>
                <Badge variant="outline">#{dlp.rank}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      {selectedDLPs.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {selectedMetricConfig.label} Comparison (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [selectedMetricConfig.format(value), ""]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  {selectedDLPs.map((dlpId, index) => {
                    const dlp = data.find((d) => d.id === dlpId)
                    return dlp ? (
                      <Line
                        key={dlpId}
                        type="monotone"
                        dataKey={dlp.name}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    ) : null
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Select DLPs above to start comparing their performance</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
