import { type NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"

const VANA_RPC = "https://rpc.vana.org"
const DLP_REGISTRY_ADDRESS = "0x4D59880a924526d1dD33260552Ff4328b1E18a43"
const DLP_PERFORMANCE_ADDRESS = "0x847715C7DB37cF286611182Be0bD333cbfa29cc1"
const DLP_IDS = ["4", "9", "10", "11", "13", "17", "32"]

const DLP_REGISTRY_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  { inputs: [], name: "AccessControlBadConfirmation", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "bytes32", name: "neededRole", type: "bytes32" },
    ],
    name: "AccessControlUnauthorizedAccount",
    type: "error",
  },
  { inputs: [{ internalType: "address", name: "target", type: "address" }], name: "AddressEmptyCode", type: "error" },
  { inputs: [], name: "DlpAddressCannotBeChanged", type: "error" },
  { inputs: [], name: "DlpLpTokenIdNotSet", type: "error" },
  { inputs: [], name: "DlpTokenNotSet", type: "error" },
  {
    inputs: [{ internalType: "address", name: "implementation", type: "address" }],
    name: "ERC1967InvalidImplementation",
    type: "error",
  },
  { inputs: [], name: "ERC1967NonPayable", type: "error" },
  { inputs: [], name: "EnforcedPause", type: "error" },
  { inputs: [], name: "ExpectedPause", type: "error" },
  { inputs: [], name: "FailedInnerCall", type: "error" },
  { inputs: [], name: "InvalidAddress", type: "error" },
  { inputs: [], name: "InvalidDepositAmount", type: "error" },
  { inputs: [], name: "InvalidDlpStatus", type: "error" },
  { inputs: [], name: "InvalidDlpVerification", type: "error" },
  { inputs: [], name: "InvalidInitialization", type: "error" },
  { inputs: [], name: "InvalidLpTokenId", type: "error" },
  { inputs: [], name: "InvalidName", type: "error" },
  { inputs: [], name: "InvalidTokenAddress", type: "error" },
  { inputs: [], name: "LastEpochMustBeFinalized", type: "error" },
  { inputs: [], name: "NotDlpOwner", type: "error" },
  { inputs: [], name: "NotInitializing", type: "error" },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  { inputs: [], name: "TransferFailed", type: "error" },
  { inputs: [], name: "UUPSUnauthorizedCallContext", type: "error" },
  {
    inputs: [{ internalType: "bytes32", name: "slot", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "dlpId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "lpTokenId", type: "uint256" },
    ],
    name: "DlpLpTokenIdUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "dlpId", type: "uint256" },
      { indexed: true, internalType: "address", name: "dlpAddress", type: "address" },
      { indexed: false, internalType: "address", name: "ownerAddress", type: "address" },
      { indexed: false, internalType: "address", name: "treasuryAddress", type: "address" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "string", name: "iconUrl", type: "string" },
      { indexed: false, internalType: "string", name: "website", type: "string" },
      { indexed: false, internalType: "string", name: "metadata", type: "string" },
    ],
    name: "DlpRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "newDlpRegistrationDepositAmount", type: "uint256" }],
    name: "DlpRegistrationDepositAmountUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "dlpId", type: "uint256" },
      { indexed: false, internalType: "enum IDLPRegistry.DlpStatus", name: "newStatus", type: "uint8" },
    ],
    name: "DlpStatusUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "dlpId", type: "uint256" },
      { indexed: false, internalType: "address", name: "tokenAddress", type: "address" },
    ],
    name: "DlpTokenUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "dlpId", type: "uint256" },
      { indexed: true, internalType: "address", name: "dlpAddress", type: "address" },
      { indexed: false, internalType: "address", name: "ownerAddress", type: "address" },
      { indexed: false, internalType: "address", name: "treasuryAddress", type: "address" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "string", name: "iconUrl", type: "string" },
      { indexed: false, internalType: "string", name: "website", type: "string" },
      { indexed: false, internalType: "string", name: "metadata", type: "string" },
    ],
    name: "DlpUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "dlpId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "verificationBlockNumber", type: "uint256" },
    ],
    name: "DlpVerificationBlockUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "dlpId", type: "uint256" },
      { indexed: false, internalType: "bool", name: "verified", type: "bool" },
    ],
    name: "DlpVerificationUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint64", name: "version", type: "uint64" }],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "address", name: "account", type: "address" }],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "role", type: "bytes32" },
      { indexed: true, internalType: "bytes32", name: "previousAdminRole", type: "bytes32" },
      { indexed: true, internalType: "bytes32", name: "newAdminRole", type: "bytes32" },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "role", type: "bytes32" },
      { indexed: true, internalType: "address", name: "account", type: "address" },
      { indexed: true, internalType: "address", name: "sender", type: "address" },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "role", type: "bytes32" },
      { indexed: true, internalType: "address", name: "account", type: "address" },
      { indexed: true, internalType: "address", name: "sender", type: "address" },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "address", name: "account", type: "address" }],
    name: "Unpaused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "implementation", type: "address" }],
    name: "Upgraded",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAINTAINER_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "dlpId", type: "uint256" }],
    name: "deregisterDlp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "dlpAddress", type: "address" }],
    name: "dlpIds",
    outputs: [{ internalType: "uint256", name: "dlpId", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "dlpName", type: "string" }],
    name: "dlpNameToId",
    outputs: [{ internalType: "uint256", name: "dlpId", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "dlpRegistrationDepositAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "dlpId", type: "uint256" }],
    name: "dlps",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address", name: "dlpAddress", type: "address" },
          { internalType: "address", name: "ownerAddress", type: "address" },
          { internalType: "address", name: "tokenAddress", type: "address" },
          { internalType: "address", name: "treasuryAddress", type: "address" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "iconUrl", type: "string" },
          { internalType: "string", name: "website", type: "string" },
          { internalType: "string", name: "metadata", type: "string" },
          { internalType: "uint256", name: "registrationBlockNumber", type: "uint256" },
          { internalType: "uint256", name: "depositAmount", type: "uint256" },
          { internalType: "enum IDLPRegistry.DlpStatus", name: "status", type: "uint8" },
          { internalType: "uint256", name: "lpTokenId", type: "uint256" },
          { internalType: "uint256", name: "verificationBlockNumber", type: "uint256" },
        ],
        internalType: "struct IDLPRegistry.DlpInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "dlpAddress", type: "address" }],
    name: "dlpsByAddress",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address", name: "dlpAddress", type: "address" },
          { internalType: "address", name: "ownerAddress", type: "address" },
          { internalType: "address", name: "tokenAddress", type: "address" },
          { internalType: "address", name: "treasuryAddress", type: "address" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "iconUrl", type: "string" },
          { internalType: "string", name: "website", type: "string" },
          { internalType: "string", name: "metadata", type: "string" },
          { internalType: "uint256", name: "registrationBlockNumber", type: "uint256" },
          { internalType: "uint256", name: "depositAmount", type: "uint256" },
          { internalType: "enum IDLPRegistry.DlpStatus", name: "status", type: "uint8" },
          { internalType: "uint256", name: "lpTokenId", type: "uint256" },
          { internalType: "uint256", name: "verificationBlockNumber", type: "uint256" },
        ],
        internalType: "struct IDLPRegistry.DlpInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "dlpName", type: "string" }],
    name: "dlpsByName",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address", name: "dlpAddress", type: "address" },
          { internalType: "address", name: "ownerAddress", type: "address" },
          { internalType: "address", name: "tokenAddress", type: "address" },
          { internalType: "address", name: "treasuryAddress", type: "address" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "iconUrl", type: "string" },
          { internalType: "string", name: "website", type: "string" },
          { internalType: "string", name: "metadata", type: "string" },
          { internalType: "uint256", name: "registrationBlockNumber", type: "uint256" },
          { internalType: "uint256", name: "depositAmount", type: "uint256" },
          { internalType: "enum IDLPRegistry.DlpStatus", name: "status", type: "uint8" },
          { internalType: "uint256", name: "lpTokenId", type: "uint256" },
          { internalType: "uint256", name: "verificationBlockNumber", type: "uint256" },
        ],
        internalType: "struct IDLPRegistry.DlpInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "dlpsCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "eligibleDlpsListAt",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "eligibleDlpsListCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "eligibleDlpsListValues",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "role", type: "bytes32" }],
    name: "getRoleAdmin",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "address", name: "account", type: "address" },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "address", name: "account", type: "address" },
    ],
    name: "hasRole",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "ownerAddress", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "dlpId", type: "uint256" }],
    name: "isEligibleDlp",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "dlpRootCoreAddress", type: "address" },
      { internalType: "uint256", name: "startDlpId", type: "uint256" },
      { internalType: "uint256", name: "endDlpId", type: "uint256" },
    ],
    name: "migrateDlpData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [], name: "pause", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "dlpAddress", type: "address" },
          { internalType: "address", name: "ownerAddress", type: "address" },
          { internalType: "address payable", name: "treasuryAddress", type: "address" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "iconUrl", type: "string" },
          { internalType: "string", name: "website", type: "string" },
          { internalType: "string", name: "metadata", type: "string" },
        ],
        internalType: "struct IDLPRegistry.DlpRegistration",
        name: "registrationInfo",
        type: "tuple",
      },
    ],
    name: "registerDlp",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "address", name: "callerConfirmation", type: "address" },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "address", name: "account", type: "address" },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [{ internalType: "contract ITreasury", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [], name: "unpause", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [{ internalType: "uint256", name: "dlpId", type: "uint256" }],
    name: "unverifyDlp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "dlpId", type: "uint256" },
      {
        components: [
          { internalType: "address", name: "dlpAddress", type: "address" },
          { internalType: "address", name: "ownerAddress", type: "address" },
          { internalType: "address payable", name: "treasuryAddress", type: "address" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "iconUrl", type: "string" },
          { internalType: "string", name: "website", type: "string" },
          { internalType: "string", name: "metadata", type: "string" },
        ],
        internalType: "struct IDLPRegistry.DlpRegistration",
        name: "dlpUpdateInfo",
        type: "tuple",
      },
    ],
    name: "updateDlp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "newDlpRegistrationDepositAmount", type: "uint256" }],
    name: "updateDlpRegistrationDepositAmount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "dlpId", type: "uint256" },
      { internalType: "address", name: "tokenAddress", type: "address" },
      { internalType: "uint256", name: "lpTokenId", type: "uint256" },
    ],
    name: "updateDlpToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "dlpId", type: "uint256" },
      { internalType: "address", name: "tokenAddress", type: "address" },
      { internalType: "uint256", name: "lpTokenId", type: "uint256" },
      { internalType: "uint256", name: "verificationBlockNumber", type: "uint256" },
    ],
    name: "updateDlpTokenAndVerification",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "dlpId", type: "uint256" },
      { internalType: "uint256", name: "verificationBlockNumber", type: "uint256" },
    ],
    name: "updateDlpVerificationBlock",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "treasuryAddress", type: "address" }],
    name: "updateTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "vanaEpochAddress", type: "address" }],
    name: "updateVanaEpoch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "newImplementation", type: "address" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "vanaEpoch",
    outputs: [{ internalType: "contract IVanaEpoch", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
]

const DLP_PERFORMANCE_ABI = [
  "function epochDlpPerformances(uint256 epochId, uint256 dlpId) view returns (uint256 totalScore, uint256 tradingVolume, uint256 uniqueContributors, uint256 dataAccessFees, uint256 tradingVolumeScore, uint256 uniqueContributorsScore, uint256 dataAccessFeesScore, uint256 tradingVolumeScorePenalty, uint256 uniqueContributorsScorePenalty, uint256 dataAccessFeesScorePenalty)",
  "function calculateEpochDlpRewards(uint256 epochId, uint256 dlpId) view returns (uint256 rewardAmount, uint256 penaltyAmount)",
  "function getPerformanceScore(uint256 id) view returns (uint256 performanceScore,uint256 validationScore,uint256 dataQualityScore,uint256 uptimeScore,uint256 dataContributed,uint256 validatorCount)",
  "function getRanking(uint256 id) view returns (uint256)",
]

// ERC20 Token ABI for getting token name
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
]

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

async function getTokenName(tokenAddress: string, provider: ethers.JsonRpcProvider): Promise<string> {
  try {
    if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
      return "No Token"
    }

    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
    const name = await tokenContract.name()
    return name || "Unknown Token"
  } catch (error) {
    console.debug(`Error fetching token name for ${tokenAddress}:`, error)
    return "Unknown Token"
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("API: Starting DLP data fetch...")

    const provider = new ethers.JsonRpcProvider(VANA_RPC)
    const registryContract = new ethers.Contract(DLP_REGISTRY_ADDRESS, DLP_REGISTRY_ABI, provider)
    const performanceContract = new ethers.Contract(DLP_PERFORMANCE_ADDRESS, DLP_PERFORMANCE_ABI, provider)

    // Get epoch from query parameters, default to 6
    const { searchParams } = new URL(request.url)
    const epochId = Number.parseInt(searchParams.get("epoch") || "6")

    console.log(`API: Fetching data for epoch ${epochId}`)

    // Fetch DLP names and token info first
    const dlpInfo: Record<string, { name: string; address: string; tokenAddress: string; tokenName: string }> = {}

    for (const dlpId of DLP_IDS) {
      try {
        console.log(`API: Fetching registry info for DLP ${dlpId}`)
        const registryData = await registryContract.dlps(BigInt(dlpId))

        // Get token name
        const tokenName = await getTokenName(registryData.tokenAddress, provider)

        dlpInfo[dlpId] = {
          name: registryData.name || `DLP ${dlpId}`,
          address: registryData.dlpAddress || "",
          tokenAddress: registryData.tokenAddress || "",
          tokenName: tokenName,
        }

        console.log(`API: DLP ${dlpId} - Name: ${dlpInfo[dlpId].name}, Token: ${tokenName}`)
      } catch (err) {
        console.debug(`Error fetching DLP info for ID ${dlpId}:`, err)
        dlpInfo[dlpId] = {
          name: `DLP ${dlpId}`,
          address: "",
          tokenAddress: "",
          tokenName: "Unknown Token",
        }
      }
    }

    // Fetch performance data
    const results = []
    for (const dlpId of DLP_IDS) {
      try {
        console.log(`API: Fetching performance data for DLP ${dlpId}`)
        const data = await performanceContract.epochDlpPerformances(epochId, BigInt(dlpId))

        let rewardAmount = "0"
        let penaltyAmount = "0"
        try {
          const rewardResult = await performanceContract.calculateEpochDlpRewards(epochId, BigInt(dlpId))
          rewardAmount = toEther(rewardResult.rewardAmount)
          penaltyAmount = toEther(rewardResult.penaltyAmount)
        } catch (rewardErr) {
          console.debug(`Error fetching rewards for DLP ID ${dlpId}:`, rewardErr)
        }

        const dlpData = {
          id: dlpId,
          name: dlpInfo[dlpId]?.name || `DLP ${dlpId}`,
          address: dlpInfo[dlpId]?.address || "",
          tokenAddress: dlpInfo[dlpId]?.tokenAddress || "",
          tokenName: dlpInfo[dlpId]?.tokenName || "Unknown Token",
          score: Number.parseFloat(toEther(data.totalScore)),
          rank: 0, // Will be calculated after sorting
          uniqueDatapoints: Number.parseInt(toInt(data.uniqueContributors)),
          lastUpdated: new Date().toISOString(),
          totalScore: toEther(data.totalScore),
          tradingVolume: toEther(data.tradingVolume),
          uniqueContributors: toInt(data.uniqueContributors),
          dataAccessFees: toEther(data.dataAccessFees),
          tradingVolumeScore: toEther(data.tradingVolumeScore),
          uniqueContributorsScore: toEther(data.uniqueContributorsScore),
          dataAccessFeesScore: toEther(data.dataAccessFeesScore),
          tradingVolumeScorePenalty: toEther(data.tradingVolumeScorePenalty),
          uniqueContributorsScorePenalty: toEther(data.uniqueContributorsScorePenalty),
          dataAccessFeesScorePenalty: toEther(data.dataAccessFeesScorePenalty),
          rewardAmount,
          penaltyAmount,
        }

        results.push(dlpData)
        console.log(`API: Successfully fetched data for DLP ${dlpId} with token ${dlpData.tokenName}`)
      } catch (err) {
        console.error(`API: Error fetching DLP ID ${dlpId}:`, err)
        results.push({
          id: dlpId,
          name: dlpInfo[dlpId]?.name || `DLP ${dlpId}`,
          address: dlpInfo[dlpId]?.address || "",
          tokenAddress: dlpInfo[dlpId]?.tokenAddress || "",
          tokenName: dlpInfo[dlpId]?.tokenName || "Unknown Token",
          score: 0,
          rank: 0,
          uniqueDatapoints: 0,
          lastUpdated: new Date().toISOString(),
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

    // Sort by score and assign ranks
    results.sort((a, b) => b.score - a.score)
    results.forEach((dlp, index) => {
      dlp.rank = index + 1
    })

    console.log(`API: Successfully fetched ${results.length} DLPs for epoch ${epochId}`)
    return NextResponse.json({
      success: true,
      data: results,
      epoch: epochId,
    })
  } catch (error) {
    console.error("API: Error in DLP data route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
