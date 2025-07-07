import { dlpPerformanceContract, DLP_IDS, dlpRegistryContract } from "./contracts"
import { ethers } from "ethers"

// TODO: Replace with logic to get the latest epoch if available
const EPOCH_ID = 6

export interface DlpScore {
  dlpId: string
  totalScore: string
  tradingVolume: string
  uniqueContributors: string // integer, not ether
  dataAccessFees: string
  tradingVolumeScore: string
  uniqueContributorsScore: string
  dataAccessFeesScore: string
  tradingVolumeScorePenalty: string
  uniqueContributorsScorePenalty: string
  dataAccessFeesScorePenalty: string
  rewardAmount: string
  penaltyAmount: string
}

function toEther(value: any) {
  try {
    return ethers.formatEther(value ?? "0")
  } catch {
    return "0"
  }
}

function toInt(value: any) {
  try {
    return value?.toString() ?? "0"
  } catch {
    return "0"
  }
}

export async function fetchDlpScores(): Promise<DlpScore[]> {
  console.debug("Fetching DLP scores for IDs:", DLP_IDS)
  const results: DlpScore[] = []

  for (const dlpId of DLP_IDS) {
    try {
      const data = await dlpPerformanceContract.epochDlpPerformances(EPOCH_ID, dlpId)

      let rewardAmount = "0"
      let penaltyAmount = "0"

      try {
        const rewardResult = await dlpPerformanceContract.calculateEpochDlpRewards(EPOCH_ID, dlpId)
        rewardAmount = toEther(rewardResult.rewardAmount)
        penaltyAmount = toEther(rewardResult.penaltyAmount)
      } catch (rewardErr) {
        console.debug(`Error fetching rewards for DLP ID ${dlpId}:`, rewardErr)
      }

      results.push({
        dlpId,
        totalScore: toEther(data.totalScore),
        tradingVolume: toEther(data.tradingVolume),
        uniqueContributors: toInt(data.uniqueContributors), // integer
        dataAccessFees: toEther(data.dataAccessFees),
        tradingVolumeScore: toEther(data.tradingVolumeScore),
        uniqueContributorsScore: toEther(data.uniqueContributorsScore),
        dataAccessFeesScore: toEther(data.dataAccessFeesScore),
        tradingVolumeScorePenalty: toEther(data.tradingVolumeScorePenalty),
        uniqueContributorsScorePenalty: toEther(data.uniqueContributorsScorePenalty),
        dataAccessFeesScorePenalty: toEther(data.dataAccessFeesScorePenalty),
        rewardAmount,
        penaltyAmount,
      })
    } catch (err) {
      console.debug(`Error fetching DLP ID ${dlpId}:`, err)
      results.push({
        dlpId,
        totalScore: "error",
        tradingVolume: "error",
        uniqueContributors: "error",
        dataAccessFees: "error",
        tradingVolumeScore: "error",
        uniqueContributorsScore: "error",
        dataAccessFeesScore: "error",
        tradingVolumeScorePenalty: "error",
        uniqueContributorsScorePenalty: "error",
        dataAccessFeesScorePenalty: "error",
        rewardAmount: "error",
        penaltyAmount: "error",
      })
    }
  }

  return results
}

export async function getDlpNames(): Promise<Record<string, string>> {
  const names: Record<string, string> = {}

  for (const dlpId of DLP_IDS) {
    try {
      const dlpInfo = await dlpRegistryContract.dlps(dlpId)
      names[dlpId] = dlpInfo.name || dlpId
    } catch (err) {
      names[dlpId] = dlpId
    }
  }

  return names
}
