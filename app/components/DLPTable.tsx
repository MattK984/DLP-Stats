"use client"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ExternalLink, Info } from "lucide-react"
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

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>DLP Name</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Unique Datapoints</TableHead>
            <TableHead className="text-right">Address</TableHead>
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
                      <div className="space-y-1">
                        <p>
                          <strong>Address:</strong> {dlp.address}
                        </p>
                        <p>
                          <strong>Last Updated:</strong> {dlp.lastUpdated.toLocaleString()}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">
                <span
                  className={`font-semibold ${
                    dlp.score >= 90 ? "text-green-600" : dlp.score >= 80 ? "text-yellow-600" : "text-red-600"
                  }`}
                >
                  {dlp.score.toFixed(1)}
                </span>
              </TableCell>
              <TableCell className="text-right font-mono">{formatNumber(dlp.uniqueDatapoints)}</TableCell>
              <TableCell className="text-right font-mono text-sm text-muted-foreground">
                {dlp.address.slice(0, 6)}...{dlp.address.slice(-4)}
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1 hover:bg-muted rounded">
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>View on VanaScan</TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  )
}
