"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, TrendingUp, Users, DollarSign, Award } from "lucide-react"
import { DLPTable } from "./components/DLPTable"
import { MetricCard } from "./components/MetricCard"
import { CustomMetricCard } from "./components/CustomMetricCard"
import { DLPComparison } from "./components/DLPComparison"
import { useDLPData } from "./hooks/useDLPData"

export default function DashboardPage() {
  const [selectedEpoch, setSelectedEpoch] = useState(6)
  const { data, loading, error, lastUpdated, refetch } = useDLPData(selectedEpoch)

  const handleEpochChange = (value: string) => {
    setSelectedEpoch(Number.parseInt(value))
  }

  const handleRefresh = () => {
    refetch()
  }

  // Calculate aggregate metrics
  const totalDLPs = data.length
  const avgScore = data.length > 0 ? data.reduce((sum, dlp) => sum + dlp.score, 0) / data.length : 0
  const totalContributors = data.reduce((sum, dlp) => sum + dlp.uniqueDatapoints, 0)
  const totalRewards = data.reduce((sum, dlp) => sum + Number.parseFloat(dlp.rewardAmount || "0"), 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vana DLP Dashboard</h1>
            <p className="text-muted-foreground">Monitor Data Liquidity Pool performance and metrics across epochs</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="epoch-select" className="text-sm font-medium">
                Epoch:
              </label>
              <Select value={selectedEpoch.toString()} onValueChange={handleEpochChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((epoch) => (
                    <SelectItem key={epoch} value={epoch.toString()}>
                      {epoch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status */}
        {lastUpdated && (
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleString()} • Epoch {selectedEpoch}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total DLPs"
            value={totalDLPs.toString()}
            description="Active Data Liquidity Pools"
            icon={<Award className="w-4 h-4" />}
            loading={loading}
          />
          <MetricCard
            title="Average Score"
            value={avgScore.toFixed(2)}
            description="Mean performance score"
            icon={<TrendingUp className="w-4 h-4" />}
            loading={loading}
          />
          <MetricCard
            title="Total Contributors"
            value={totalContributors.toLocaleString()}
            description="Unique data contributors"
            icon={<Users className="w-4 h-4" />}
            loading={loading}
          />
          <MetricCard
            title="Total Rewards"
            value={`${totalRewards.toFixed(2)} VANA`}
            description="Epoch reward distribution"
            icon={<DollarSign className="w-4 h-4" />}
            loading={loading}
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>DLP Performance Rankings</CardTitle>
                <CardDescription>Performance metrics for epoch {selectedEpoch} sorted by total score</CardDescription>
              </CardHeader>
              <CardContent>
                <DLPTable data={data} loading={loading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <DLPComparison data={data} loading={loading} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CustomMetricCard
                title="Top Performers"
                data={data.slice(0, 3)}
                loading={loading}
                metricKey="score"
                formatValue={(val) => val.toFixed(4)}
              />
              <CustomMetricCard
                title="Most Active Contributors"
                data={data.sort((a, b) => b.uniqueDatapoints - a.uniqueDatapoints).slice(0, 3)}
                loading={loading}
                metricKey="uniqueDatapoints"
                formatValue={(val) => val.toLocaleString()}
              />
              <CustomMetricCard
                title="Highest Trading Volume"
                data={data
                  .sort((a, b) => Number.parseFloat(b.tradingVolume) - Number.parseFloat(a.tradingVolume))
                  .slice(0, 3)}
                loading={loading}
                metricKey="tradingVolume"
                formatValue={(val) => `${Number.parseFloat(val.toString()).toFixed(4)} VANA`}
              />
              <CustomMetricCard
                title="Top Rewards"
                data={data
                  .sort((a, b) => Number.parseFloat(b.rewardAmount) - Number.parseFloat(a.rewardAmount))
                  .slice(0, 3)}
                loading={loading}
                metricKey="rewardAmount"
                formatValue={(val) => `${Number.parseFloat(val.toString()).toFixed(4)} VANA`}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-sm">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-2">
                <div>
                  <strong>Loading:</strong> {loading.toString()}
                </div>
                <div>
                  <strong>Error:</strong> {error || "None"}
                </div>
                <div>
                  <strong>Data Count:</strong> {data.length}
                </div>
                <div>
                  <strong>Selected Epoch:</strong> {selectedEpoch}
                </div>
                <div>
                  <strong>Last Updated:</strong> {lastUpdated?.toISOString() || "Never"}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
