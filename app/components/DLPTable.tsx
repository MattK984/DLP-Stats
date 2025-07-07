"use client"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ExternalLink, Info, Coins } from "lucide-react"
import type { DLPData } from "../hooks/useDLPData"

interface DLPTableProps {
  data: DLPData[]
  loading: boolean
}

export function DLPTable({ data, loading }: DLPTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const getRankBadgeVariant = (rank: number) => {
    if (rank === 1) return "default"
    if (rank <= 3) return "secondary"
    return "outline"
  }

  const getVanaScanUrl = (address: string) => {
    return `https://vanascan.io/address/${address}`
  }

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>DLP Name</TableHead>
            <TableHead>Token</TableHead>
            <TableHead className="text-right">Total Score</TableHead>
            <TableHead className="text-right">Contributors</TableHead>
            <TableHead className="text-right">Trading Volume</TableHead>
            <TableHead className="text-right">Rewards</TableHead>
            <TableHead className="text-right">DLP ID</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((dlp) => (
            <TableRow key={dlp.id} className="hover:bg-muted/50">
              <TableCell>
                <Badge variant={getRankBadgeVariant(dlp.rank)}>#{dlp.rank}</Badge>
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {dlp.name}
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>DLP ID:</strong> {dlp.id}
                        </p>
                        <p>
                          <strong>Contract:</strong>{" "}
                          {dlp.address ? `${dlp.address.slice(0, 10)}...${dlp.address.slice(-8)}` : "N/A"}
                        </p>
                        <p>
                          <strong>Token Contract:</strong>{" "}
                          {dlp.tokenAddress
                            ? `${dlp.tokenAddress.slice(0, 10)}...${dlp.tokenAddress.slice(-8)}`
                            : "N/A"}
                        </p>
                        <p>
                          <strong>Trading Volume Score:</strong> {Number.parseFloat(dlp.tradingVolumeScore).toFixed(4)}
                        </p>
                        <p>
                          <strong>Contributors Score:</strong>{" "}
                          {Number.parseFloat(dlp.uniqueContributorsScore).toFixed(4)}
                        </p>
                        <p>
                          <strong>Data Access Score:</strong> {Number.parseFloat(dlp.dataAccessFeesScore).toFixed(4)}
                        </p>
                        <p>
                          <strong>Last Updated:</strong> {new Date(dlp.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{dlp.tokenName}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">
                <span
                  className={`font-semibold ${
                    dlp.score >= 1 ? "text-green-600" : dlp.score >= 0.5 ? "text-yellow-600" : "text-red-600"
                  }`}
                >
                  {dlp.score.toFixed(4)}
                </span>
              </TableCell>
              <TableCell className="text-right font-mono">{formatNumber(dlp.uniqueDatapoints)}</TableCell>
              <TableCell className="text-right font-mono text-sm">
                {Number.parseFloat(dlp.tradingVolume).toFixed(4)} VANA
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                <span className="text-green-600">+{Number.parseFloat(dlp.rewardAmount).toFixed(4)}</span>
                {Number.parseFloat(dlp.penaltyAmount) > 0 && (
                  <span className="text-red-600 block">-{Number.parseFloat(dlp.penaltyAmount).toFixed(4)}</span>
                )}
              </TableCell>
              <TableCell className="text-right font-mono text-sm text-muted-foreground">{dlp.id}</TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="p-1 hover:bg-muted rounded"
                      onClick={() => {
                        if (dlp.address) {
                          window.open(getVanaScanUrl(dlp.address), "_blank")
                        }
                      }}
                      disabled={!dlp.address}
                    >
                      <ExternalLink
                        className={`w-4 h-4 ${dlp.address ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground/50"}`}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {dlp.address ? "View contract on VanaScan" : "Contract address not available"}
                  </TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  )
}
