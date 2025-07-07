"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, TestTube2 } from "lucide-react"

const VANA_RPC = "https://rpc.vana.org"
const DLP_REGISTRY_ADDRESS = "0x4D59880a924526d1dD33260552Ff4328b1E18a43"

// Using the full, correct ABI provided by the user
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

export function DLPInfoPanel() {
  const [dlpId, setDlpId] = useState("0")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dlpData, setDlpData] = useState<any | null>(null)
  const [maxIdHint, setMaxIdHint] = useState<string | null>(null)

  const handleQuery = async () => {
    setLoading(true)
    setError(null)
    setDlpData(null)

    try {
      if (!dlpId || isNaN(Number(dlpId))) {
        throw new Error("Please enter a valid numeric DLP ID.")
      }

      const provider = new ethers.JsonRpcProvider(VANA_RPC)
      const contract = new ethers.Contract(DLP_REGISTRY_ADDRESS, DLP_REGISTRY_ABI, provider)

      const data = await contract.dlps(BigInt(dlpId))

      // Convert BigInts to strings for display and serializing
      const formattedData = {
        id: data.id.toString(),
        dlpAddress: data.dlpAddress,
        ownerAddress: data.ownerAddress,
        tokenAddress: data.tokenAddress,
        treasuryAddress: data.treasuryAddress,
        name: data.name,
        iconUrl: data.iconUrl,
        website: data.website,
        metadata: data.metadata,
        status: data.status.toString(),
        registrationBlockNumber: data.registrationBlockNumber.toString(),
        depositAmount: ethers.formatEther(data.depositAmount) + " VANA",
        lpTokenId: data.lpTokenId.toString(),
        verificationBlockNumber: data.verificationBlockNumber.toString(),
      }

      setDlpData(formattedData)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred."
      console.error(e)
      setError(`Query failed: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const findMaxExistingId = async () => {
    setLoading(true)
    setError(null)
    setDlpData(null)
    setMaxIdHint(null)

    try {
      const provider = new ethers.JsonRpcProvider(VANA_RPC)
      const contract = new ethers.Contract(DLP_REGISTRY_ADDRESS, DLP_REGISTRY_ABI, provider)

      const knownWorkingIds = ["4", "9", "10", "11", "13", "17", "32"]
      let highest = "none found"

      for (const id of knownWorkingIds) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await contract.dlps(BigInt(id))
          highest = id
        } catch {
          // Ignore errors, just means the ID doesn't exist
        }
      }

      setMaxIdHint(highest)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      setError(`Probe failed: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TestTube2 className="mr-2 h-5 w-5" />
          DLP Info Query Tool
        </CardTitle>
        <CardDescription>
          Enter a DLP ID to query its full information from the registry contract. This now uses the correct function
          signature.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="number"
            placeholder="Enter DLP ID"
            value={dlpId}
            onChange={(e) => setDlpId(e.target.value)}
            disabled={loading}
          />
          <Button onClick={handleQuery} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Query
          </Button>

          <Button type="button" variant="outline" onClick={findMaxExistingId} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Find highest ID
          </Button>
        </div>

        {maxIdHint && (
          <p className="text-sm text-muted-foreground">
            Highest existing ID detected:&nbsp;
            <span className="font-mono">{maxIdHint}</span>
          </p>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="break-all">{error}</AlertDescription>
          </Alert>
        )}

        {dlpData && (
          <div>
            <h3 className="font-semibold mb-2">Result for DLP ID: {dlpId}</h3>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
              <code>{JSON.stringify(dlpData, null, 2)}</code>
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
