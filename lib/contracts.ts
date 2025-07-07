import { ethers } from "ethers"

// Contract addresses from your working code
const DLP_REGISTRY_ADDRESS = "0x4D59880a924526d1dD33260552Ff4328b1E18a43"
const DLP_PERFORMANCE_ADDRESS = "0x..." // You'll need to provide this address

// Known working DLP IDs from your code
export const DLP_IDS = ["4", "9", "10", "11", "13", "17", "32"]

// RPC endpoint
const RPC_URL = "https://rpc.vana.org"

// Create provider
const provider = new ethers.JsonRpcProvider(RPC_URL)

// Registry ABI (minimal for getting DLP info)
const REGISTRY_ABI = [
  "function dlps(uint256) view returns (string name, address owner, address dlpAddress, uint256 stakersPercentage, uint256 validatorsPercentage)",
]

// Performance ABI based on your working code
const PERFORMANCE_ABI = [
  "function epochDlpPerformances(uint256 epochId, uint256 dlpId) view returns (uint256 totalScore, uint256 tradingVolume, uint256 uniqueContributors, uint256 dataAccessFees, uint256 tradingVolumeScore, uint256 uniqueContributorsScore, uint256 dataAccessFeesScore, uint256 tradingVolumeScorePenalty, uint256 uniqueContributorsScorePenalty, uint256 dataAccessFeesScorePenalty)",
  "function calculateEpochDlpRewards(uint256 epochId, uint256 dlpId) view returns (uint256 rewardAmount, uint256 penaltyAmount)",
]

export const dlpRegistryContract = new ethers.Contract(DLP_REGISTRY_ADDRESS, REGISTRY_ABI, provider)
export const dlpPerformanceContract = new ethers.Contract(DLP_PERFORMANCE_ADDRESS, PERFORMANCE_ABI, provider)
