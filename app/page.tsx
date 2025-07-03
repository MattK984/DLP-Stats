"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, Trophy, Database, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDLPData } from "./hooks/useDLPData"
import { DLPTable } from "./components/DLPTable"
import { MetricCard } from "./components/MetricCard"
import { CustomMetricCard } from "./components/CustomMetricCard"
import { DLPComparison } from "./components/DLPComparison"

export default function VanaDLPDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const { data: dlpData, loading, error, lastUpdated, refetch } = useDLPData()

  const filteredData = dlpData?.filter((dlp) => dlp.name.toLowerCase().includes(searchTerm.toLowerCase())) || []

  const topPerformers = {
    byScore: [...(dlpData || [])].sort((a, b) => b.score - a.score).slice(0, 3),
    byRank: [...(dlpData || [])].sort((a, b) => a.rank - b.rank).slice(0, 3),
    byDatapoints: [...(dlpData || [])].sort((a, b) => b.uniqueDatapoints - a.uniqueDatapoints).slice(0, 3),
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Vana DLP Performance</h1>
              <p className="text-muted-foreground mt-1">Real-time performance metrics for Data Liquidity Pools</p>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <span className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
              )}
              <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Top Performers Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Top DLP Score"
            icon={<Trophy className="w-5 h-5" />}
            data={topPerformers.byScore}
            metricKey="score"
            loading={loading}
          />
          <MetricCard
            title="Best Ranked"
            icon={<TrendingUp className="w-5 h-5" />}
            data={topPerformers.byRank}
            metricKey="rank"
            loading={loading}
            isRank={true}
          />
          <MetricCard
            title="Most Data Points"
            icon={<Database className="w-5 h-5" />}
            data={topPerformers.byDatapoints}
            metricKey="uniqueDatapoints"
            loading={loading}
          />
          <CustomMetricCard data={dlpData || []} loading={loading} />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="current" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="current">Current Scores</TabsTrigger>
              <TabsTrigger value="historical">Historical Data</TabsTrigger>
              <TabsTrigger value="compare">Compare DLPs</TabsTrigger>
            </TabsList>

            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search DLPs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <TabsContent value="current">
            <Card>
              <CardHeader>
                <CardTitle>DLP Performance Overview</CardTitle>
                <CardDescription>Current performance metrics for all Data Liquidity Pools</CardDescription>
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="text-center py-8">
                    <p className="text-destructive">Error loading DLP data: {error}</p>
                    <Button onClick={refetch} className="mt-4">
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <DLPTable data={filteredData} loading={loading} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historical">
            <Card>
              <CardHeader>
                <CardTitle>Historical Performance</CardTitle>
                <CardDescription>Performance trends over time (Coming Soon)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Historical data visualization will be available soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="compare">
            <Card>
              <CardHeader>
                <CardTitle>Compare DLPs</CardTitle>
                <CardDescription>Select multiple DLPs to compare their performance metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <DLPComparison data={dlpData || []} loading={loading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
