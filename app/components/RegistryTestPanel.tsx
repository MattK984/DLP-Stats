"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Beaker, Loader2, Network, FileCode, Search } from "lucide-react"

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

type Status = "pending" | "success" | "error"
interface DiagnosticStep {
  name: string
  status: Status
  message?: string
  icon: React.ElementType
}

const initialSteps: DiagnosticStep[] = [
  { name: "Connecting to RPC", status: "pending", icon: Network },
  { name: "Verifying Contract Address", status: "pending", icon: FileCode },
  { name: "Probing for first DLP", status: "pending", icon: Search },
]

export function RegistryTestPanel() {
  const [steps, setSteps] = useState<DiagnosticStep[]>(initialSteps)

  const updateStep = (index: number, status: Status, message?: string) => {
    setSteps((prevSteps) => {
      const newSteps = [...prevSteps]
      newSteps[index] = { ...newSteps[index], status, message }
      // If a step fails, mark subsequent steps as error too
      if (status === "error") {
        for (let i = index + 1; i < newSteps.length; i++) {
          newSteps[i] = { ...newSteps[i], status: "error", message: "Skipped due to previous error." }
        }
      }
      return newSteps
    })
  }

  useEffect(() => {
    async function runDiagnostics() {
      let provider: ethers.JsonRpcProvider
      try {
        // Step 1: Connect to RPC
        provider = new ethers.JsonRpcProvider(VANA_RPC)
        const network = await provider.getNetwork()
        updateStep(0, "success", `Connected to ${network.name} (Chain ID: ${network.chainId})`)
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Unknown RPC connection error."
        updateStep(0, "error", `Failed to connect to ${VANA_RPC}. ${errorMsg}`)
        return
      }

      try {
        // Step 2: Verify Contract Address
        const code = await provider.getCode(DLP_REGISTRY_ADDRESS)
        if (code === "0x") {
          throw new Error("No contract code found at this address on the connected network.")
        }
        updateStep(1, "success", "Contract code found at address.")
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Failed to get contract code."
        updateStep(1, "error", errorMsg)
        return
      }

      try {
        // Step 3: Probe for first DLP
        const contract = new ethers.Contract(DLP_REGISTRY_ADDRESS, DLP_REGISTRY_ABI, provider)
        const DLP_ID_TO_PROBE = 4
        try {
          // eslint-disable-next-line no-await-in-loop
          const data = await contract.dlps(DLP_ID_TO_PROBE)
          if (data && data.name) {
            const result = {
              id: data.id.toString(),
              name: data.name,
              ownerAddress: data.ownerAddress,
              dlpAddress: data.dlpAddress,
              status: data.status.toString(),
            }
            updateStep(
              2,
              "success",
              `Successfully read DLP #${DLP_ID_TO_PROBE} (${data.name}).\n\n${JSON.stringify(result, null, 2)}`,
            )
            return
          }
        } catch (probeErr) {
          // Ignore individual probe errors and continue
          throw new Error(`Failed to read DLP #${DLP_ID_TO_PROBE}. The contract reverts.`)
        }

        throw new Error(`Failed to read DLP #${DLP_ID_TO_PROBE}. The contract reverts.`)
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Unknown contract call error."
        updateStep(2, "error", errorMsg)
      }
    }

    runDiagnostics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />
    }
  }

  return (
    <Card className="mb-4 border-dashed border-orange-500">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Beaker className="mr-2 h-5 w-5 text-orange-500" />
          On-Chain Diagnostic Panel
        </CardTitle>
        <CardDescription>
          This panel runs a series of checks to diagnose issues with reading contract data from the Vana network.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start gap-4">
              <div>{getStatusIcon(step.status)}</div>
              <div className="flex-1">
                <p className="font-medium">{step.name}</p>
                {step.message && (
                  <div className="mt-1">
                    {step.status === "error" ? (
                      <Alert variant="destructive" className="p-2">
                        <AlertDescription className="text-xs break-all">{step.message}</AlertDescription>
                      </Alert>
                    ) : (
                      <pre className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md overflow-x-auto">
                        <code>{step.message}</code>
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
