"use client"

import { useState } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useWalletClient } from "@thalalabs/surf/hooks"
import { WILL_ABI } from "@/utils/will_abi"
import { motion } from "framer-motion"
import { Poppins } from "next/font/google"
import { cn } from "@/lib/utils"
import {
  FileText,
  Wallet,
  RefreshCw,
  Shield,
  Gift,
  AlertCircle,
  CheckCircle,
  Loader2,
  Activity,
  Globe2,
  User,
  ArrowRight,
  Lock,
  Copy,
} from "lucide-react"
import { WalletSelector } from "@/components/WalletSelector"
import { surfClient } from "@/utils/surfClient"

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
})

export default function WillManager() {
  const { connected, account } = useWallet()
  const { client } = useWalletClient()
  const abiClient = client?.useABI(WILL_ABI)
  const ownerAddress = account?.address?.toStringLong() || ""

  const [tab, setTab] = useState("yourWill")
  const [recipient, setRecipient] = useState("")
  const [owner, setOwner] = useState("")
  const [amount, setAmount] = useState("") // @ts-ignore
  const [timeout, setTimeout] = useState("120")
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [will, setWill] = useState<any>(null)
  // @ts-ignore
  const [willsForRecipient, setWillsForRecipient] = useState<any[]>([])
  // @ts-ignore
  const [claimableWills, setClaimableWills] = useState<any[]>([])
  // @ts-ignore
  const [willCount, setWillCount] = useState<number | null>(null)

  // Step completion states
  const [willInitialized, setWillInitialized] = useState(false)
  const [globalRegistryInitialized, setGlobalRegistryInitialized] = useState(false)
  const [recipientSet, setRecipientSet] = useState(false)
  const [willCreated, setWillCreated] = useState(false)

  // Utility
  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const truncateAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatAmount = (amt: string | number) => {
    const num = typeof amt === "string" ? Number.parseFloat(amt) : amt
    return (num / 1e8).toFixed(4)
  }

  const formatTimestamp = (timestamp: string | number) => {
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleString()
  }
  // @ts-ignore
  const isValidAddress = (addr: string) => {
    return addr.startsWith("0x") && addr.length >= 10
  }

  // View Functions
  const fetchWill = async () => {
    if (!ownerAddress) return
    setLoading(true)
    setError(null)
    try {
      const result = await surfClient().useABI(WILL_ABI).view.get_will({
        functionArguments: [ownerAddress as `0x${string}`],
        typeArguments: [],
      })
      setWill(result[0]?.vec || [])
    } catch (e: any) {
      setWill([])
      setError("No will found or error fetching will.")
    } finally {
      setLoading(false)
    }
  } // @ts-ignore

  const fetchWillsForRecipient = async () => {
    if (!owner || !recipient || !abiClient) return setError("Owner and recipient required.")
    setLoading(true)
    setError(null)
    try {
      // @ts-ignore
      const result = await abiClient.view.get_wills_for_recipient({
        functionArguments: [owner as `0x${string}`, recipient as `0x${string}`],
        typeArguments: [],
      })
      setWillsForRecipient(result?.[0] || [])
    } catch (e: any) {
      setWillsForRecipient([])
      setError("Error fetching wills for recipient.")
    } finally {
      setLoading(false)
    }
  }
  // @ts-ignore
  const fetchClaimableWills = async () => {
    if (!owner || !recipient || !abiClient) return setError("Owner and recipient required.")
    setLoading(true)
    setError(null)
    try { // @ts-ignore
      const result = await abiClient.view.get_claimable_wills_for_recipient({
        functionArguments: [owner as `0x${string}`, recipient as `0x${string}`],
        typeArguments: [],
      })
      setClaimableWills(result?.[0] || [])
    } catch (e: any) {
      setClaimableWills([])
      setError("Error fetching claimable wills.")
    } finally {
      setLoading(false)
    }
  }
  // @ts-ignore
  const fetchWillCount = async () => {
    if (!owner || !recipient || !abiClient) return setError("Owner and recipient required.")
    setLoading(true)
    setError(null)
    try { // @ts-ignore
      const result = await abiClient.view.get_will_count_for_recipient({
        functionArguments: [owner as `0x${string}`, recipient as `0x${string}`],
        typeArguments: [],
      })
      setWillCount(Number(result?.[0]))
    } catch (e: any) {
      setWillCount(null)
      setError("Error fetching will count.")
    } finally {
      setLoading(false)
    }
  }

  // Entry Functions
  const handleInitialize = async () => {
    if (!abiClient) return setError("Wallet client not ready")
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      await abiClient.initialize({ type_arguments: [], arguments: [] })
      setWillInitialized(true)
      setStatus("Will contract initialized!")
      fetchWill()
    } catch (e: any) {
      setError(e.message || "Error initializing will.")
    } finally {
      setLoading(false)
    }
  }

  const handleInitializeGlobalRegistry = async () => {
    if (!abiClient) return setError("Wallet client not ready")
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      await abiClient.initialize_global_registry({ type_arguments: [], arguments: [] })
      setGlobalRegistryInitialized(true)
      setStatus("Global registry initialized!")
    } catch (e: any) {
      setError(e.message || "Error initializing global registry.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWill = async () => {
    if (!abiClient) return setError("Wallet client not ready")
    if (!recipient || !amount || !timeout) return setError("Recipient, amount, and timeout required.")
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      await abiClient.create_will({
        type_arguments: [],
        arguments: [
          recipient as `0x${string}`,
          BigInt(Number.parseFloat(amount) * 100000000),
          ownerAddress as `0x${string}`,
        ],
      })
      setWillCreated(true)
      setStatus("Will created successfully!")
      fetchWill()
    } catch (e: any) {
      setError(e.message || "Error creating will.")
    } finally {
      setLoading(false)
    }
  }

  const handlePing = async () => {
    if (!abiClient) return setError("Wallet client not ready")
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      await abiClient.ping({ type_arguments: [], arguments: [] })
      setStatus("Pinged successfully!")
      fetchWill()
    } catch (e: any) {
      setError(e.message || "Error pinging.")
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async () => {
    if (!abiClient) return setError("Wallet client not ready")
    if (!owner || !amount) return setError("Owner and amount required.")
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      await abiClient.claim({ type_arguments: [], arguments: [owner as `0x${string}`, BigInt(amount)] })
      setStatus("Claimed successfully!")
      fetchWill()
    } catch (e: any) {
      setError(e.message || "Error claiming.")
    } finally {
      setLoading(false)
    }
  }

  const handleClaimSingle = async () => {
    if (!abiClient) return setError("Wallet client not ready")
    if (!owner) return setError("Owner required.")
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      await abiClient.claim_single({ type_arguments: [], arguments: [owner as `0x${string}`] })
      setStatus("Claimed single will successfully!")
      fetchWill()
    } catch (e: any) {
      setError(e.message || "Error claiming single will.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("min-h-screen bg-black p-8 relative", poppins.className)}>
      <div
        className="absolute left-0 right-0"
        style={{
          top: "30%",
          bottom: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.85) 80%, #000 100%)",
        }}
      ></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#bb1b0b] to-[#bb1b0b] rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-thin text-white">On-chain Will Manager</h1>
          </div>
          <p className="text-white/60 text-lg font-light">Manage your digital legacy on the blockchain</p>
        </motion.div>

        {/* Tabs */}
        {/* <div className="flex gap-2 mb-8 justify-center">
          <button
            className={`px-6 py-3 rounded-lg transition-all duration-300 ${tab === "yourWill" ? "bg-[#bb1b0b] text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}`}
            onClick={() => setTab("yourWill")}
          >
            Create Will
          </button>
          <button
            className={`px-6 py-3 rounded-lg transition-all duration-300 ${tab === "manage" ? "bg-[#bb1b0b] text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}`}
            onClick={() => setTab("manage")}
          >
            Manage & Claim
          </button>
        </div> */}

        {tab === "yourWill" && (
          <>
            {/* Progress Indicator */}
            <motion.div
              className="flex items-center justify-center mb-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-4">
                {/* Step 1 */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${willInitialized
                    ? "bg-green-500/20 border border-green-500/30"
                    : connected
                      ? "bg-[#bb1b0b]/20 border border-[#bb1b0b]/30"
                      : "bg-white/5 border border-white/10"
                    }`}
                >
                  {willInitialized ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Shield className="w-4 h-4 text-white/70" />
                  )}
                  <span className="text-sm text-white/80">Initialize</span>
                </div>
                <ArrowRight className="w-4 h-4 text-white/40" />

                {/* Step 2 */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${globalRegistryInitialized
                    ? "bg-green-500/20 border border-green-500/30"
                    : willInitialized
                      ? "bg-[#bb1b0b]/20 border border-[#bb1b0b]/30"
                      : "bg-white/5 border border-white/10"
                    }`}
                >
                  {globalRegistryInitialized ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Globe2 className="w-4 h-4 text-white/70" />
                  )}
                  <span className="text-sm text-white/80">Global Registry</span>
                </div>
                <ArrowRight className="w-4 h-4 text-white/40" />

                {/* Step 3 */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${recipientSet
                    ? "bg-green-500/20 border border-green-500/30"
                    : globalRegistryInitialized
                      ? "bg-[#bb1b0b]/20 border border-[#bb1b0b]/30"
                      : "bg-white/5 border border-white/10"
                    }`}
                >
                  {recipientSet ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <User className="w-4 h-4 text-white/70" />
                  )}
                  <span className="text-sm text-white/80">Set Details</span>
                </div>
                <ArrowRight className="w-4 h-4 text-white/40" />

                {/* Step 4 */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${willCreated
                    ? "bg-green-500/20 border border-green-500/30"
                    : recipientSet
                      ? "bg-[#bb1b0b]/20 border border-[#bb1b0b]/30"
                      : "bg-white/5 border border-white/10"
                    }`}
                >
                  {willCreated ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Gift className="w-4 h-4 text-white/70" />
                  )}
                  <span className="text-sm text-white/80">Create Will</span>
                </div>
              </div>
            </motion.div>

            {/* Main Card */}
            <motion.div
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Wallet Connection Section */}
              {!connected && (
                <div className="p-8 border-b border-white/10 bg-gradient-to-r from-[#bb1b0b]/10 to-[#bb1b0b]/10">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#bb1b0b]/20 to-[#bb1b0b]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                      <Wallet className="w-8 h-8 text-[#bb1b0b]" />
                    </div>
                    <h3 className="text-white text-xl font-thin mb-3">Connect Your Wallet</h3>
                    <p className="text-white/60 text-sm mb-6 leading-relaxed max-w-md mx-auto">
                      Connect your Aptos wallet to start creating your digital will.
                    </p>
                    <WalletSelector />
                  </div>
                </div>
              )}

              {connected && (
                <div className="p-8">
                  {/* Owner Address Display */}
                  <div className="mb-8">
                    <div className="flex flex-col items-center justify-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#bb1b0b] to-[#bb1b0b] rounded-xl flex items-center justify-center border border-white/10 mb-2">
                        <Wallet className="w-6 h-6 text-[white]" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-white text-lg font-medium">Will Owner (Your Wallet)</h3>
                        <p className="text-white/60 text-sm">This will be created for your connected wallet</p>
                      </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white/60 text-xs uppercase tracking-wide mb-1">Owner Address</div>
                          <div className="text-white text-sm font-mono">{truncateAddress(ownerAddress)}</div>
                        </div>
                        <motion.button
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyAddress(ownerAddress)}
                        >
                          {copied ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/60" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Step 1: Initialize Will */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${willInitialized ? "bg-green-500/20" : "bg-[#bb1b0b]/20"
                          }`}
                      >
                        {willInitialized ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Shield className="w-5 h-5 text-[#bb1b0b]" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white text-lg font-medium">Step 1: Initialize Will Contract</h3>
                        <p className="text-white/60 text-sm">Initialize your personal will contract</p>
                      </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                      {!willInitialized && (
                        <motion.button
                          className="w-full py-4 bg-gradient-to-r from-[#bb1b0b] to-[#bb1b0b] text-white rounded-xl font-medium hover:shadow-[0_0_30px_rgba(187,27,11,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          onClick={handleInitialize}
                          disabled={loading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                          Initialize Will Contract
                        </motion.button>
                      )}
                      {willInitialized && (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Will contract initialized successfully</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Initialize Global Registry */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${globalRegistryInitialized
                          ? "bg-green-500/20"
                          : willInitialized
                            ? "bg-[#bb1b0b]/20"
                            : "bg-white/10"
                          }`}
                      >
                        {globalRegistryInitialized ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : willInitialized ? (
                          <Globe2 className="w-5 h-5 text-[#bb1b0b]" />
                        ) : (
                          <Lock className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-medium transition-colors ${willInitialized ? "text-white" : "text-white/40"}`}
                        >
                          Step 2: Initialize Global Registry
                        </h3>
                        <p className={`text-sm ${willInitialized ? "text-white/60" : "text-white/40"}`}>
                          Set up the global will registry
                        </p>
                      </div>
                    </div>
                    <div
                      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-300 ${!willInitialized ? "opacity-50" : ""
                        }`}
                    >
                      {willInitialized && !globalRegistryInitialized && (
                        <motion.button
                          className="w-full py-4 bg-gradient-to-r from-[#bb1b0b] to-[#bb1b0b] text-white rounded-xl font-medium hover:shadow-[0_0_30px_rgba(187,27,11,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          onClick={handleInitializeGlobalRegistry}
                          disabled={loading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe2 className="w-4 h-4" />}
                          Initialize Global Registry
                        </motion.button>
                      )}
                      {!willInitialized && (
                        <div className="flex items-center gap-2 text-white/40 text-sm">
                          <Lock className="w-4 h-4" />
                          <span>Complete Step 1 to unlock</span>
                        </div>
                      )}
                      {globalRegistryInitialized && (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Global registry initialized successfully</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Set Will Details */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${recipientSet
                          ? "bg-green-500/20"
                          : globalRegistryInitialized
                            ? "bg-[#bb1b0b]/20"
                            : "bg-white/10"
                          }`}
                      >
                        {recipientSet ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : globalRegistryInitialized ? (
                          <User className="w-5 h-5 text-[#bb1b0b]" />
                        ) : (
                          <Lock className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-medium transition-colors ${globalRegistryInitialized ? "text-white" : "text-white/40"}`}
                        >
                          Step 3: Set Will Details
                        </h3>
                        <p className={`text-sm ${globalRegistryInitialized ? "text-white/60" : "text-white/40"}`}>
                          Choose recipient and amount
                        </p>
                      </div>
                    </div>
                    <div
                      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-300 ${!globalRegistryInitialized ? "opacity-50" : ""
                        }`}
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="block text-white/70 text-sm font-light mb-2">Recipient Address</label>
                          <input
                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-[#bb1b0b]/50 focus:ring-2 focus:ring-[#bb1b0b]/20 transition-all duration-300 disabled:opacity-50"
                            placeholder="Enter recipient address (0x...)"
                            value={recipient}
                            onChange={(e) => {
                              setRecipient(e.target.value)
                              if (e.target.value && amount) {
                                setRecipientSet(true)
                              } else {
                                setRecipientSet(false)
                              }
                            }}
                            disabled={!globalRegistryInitialized || loading}
                          />
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm font-light mb-2">Amount (APT)</label>
                          <input
                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-[#bb1b0b]/50 focus:ring-2 focus:ring-[#bb1b0b]/20 transition-all duration-300 disabled:opacity-50"
                            placeholder="Enter amount in APT (1 APT = 100000000 units)"
                            value={amount}
                            onChange={(e) => {
                              setAmount(e.target.value)
                              if (e.target.value && recipient) {
                                setRecipientSet(true)
                              } else {
                                setRecipientSet(false)
                              }
                            }}
                            type="number"
                            step="0.01"
                            min="0"
                            disabled={!globalRegistryInitialized || loading}
                          />
                          <p className="text-white/40 text-xs mt-1">Note: 1 APT = 100,000,000 units on-chain</p>
                        </div>
                        {!globalRegistryInitialized && (
                          <div className="flex items-center gap-2 text-white/40 text-sm">
                            <Lock className="w-4 h-4" />
                            <span>Complete Steps 1 & 2 to unlock</span>
                          </div>
                        )}
                        {globalRegistryInitialized && recipient && amount && (
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>Will details set successfully</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Create Will */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${willCreated ? "bg-green-500/20" : recipientSet ? "bg-[#bb1b0b]/20" : "bg-white/10"
                          }`}
                      >
                        {willCreated ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : recipientSet ? (
                          <Gift className="w-5 h-5 text-[#bb1b0b]" />
                        ) : (
                          <Lock className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-medium transition-colors ${recipientSet ? "text-white" : "text-white/40"}`}
                        >
                          Step 4: Create Will
                        </h3>
                        <p className={`text-sm ${recipientSet ? "text-white/60" : "text-white/40"}`}>
                          Finalize and create your digital will
                        </p>
                      </div>
                    </div>
                    <div
                      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-300 ${!recipientSet ? "opacity-50" : ""
                        }`}
                    >
                      {recipientSet && !willCreated && (
                        <motion.button
                          className="w-full py-4 bg-gradient-to-r from-[#bb1b0b] to-[#bb1b0b] text-white rounded-xl font-medium hover:shadow-[0_0_30px_rgba(187,27,11,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          onClick={handleCreateWill}
                          disabled={loading || !recipient || !amount}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                          Create Will ({amount} APT)
                        </motion.button>
                      )}
                      {!recipientSet && (
                        <div className="flex items-center gap-2 text-white/40 text-sm">
                          <Lock className="w-4 h-4" />
                          <span>Complete Step 3 to unlock</span>
                        </div>
                      )}
                      {willCreated && (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 text-green-400 text-lg mb-2">
                            <CheckCircle className="w-6 h-6" />
                            <span className="font-medium">Will Created Successfully!</span>
                          </div>
                          <p className="text-white/60 text-sm">Your digital legacy is now secured on the blockchain</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Your Will Display */}
                  <div className="mb-8">
                    <motion.button
                      onClick={fetchWill}
                      disabled={loading}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-4"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 text-[#bb1b0b] animate-spin" />
                      ) : (
                        <RefreshCw className="w-5 h-5 text-[#bb1b0b]" />
                      )}
                      <span className="text-white font-medium">Refresh Will Data</span>
                    </motion.button>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-5 h-5 text-[#bb1b0b]" />
                        <h4 className="text-white font-medium">Your Will:</h4>
                      </div>
                      {will && will.length > 0 ? (
                        will.map((w: any, idx: number) => (
                          <div key={idx} className="bg-black/30 p-4 rounded-xl border border-white/10 mb-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <span className="text-white/60 text-xs">Amount:</span>
                                <div className="text-white font-mono">{formatAmount(w.amount)} APT</div>
                              </div>
                              <div>
                                <span className="text-white/60 text-xs">Timeout:</span>
                                <div className="text-white font-mono">{w.timeout_secs} sec</div>
                              </div>
                              <div>
                                <span className="text-white/60 text-xs">Owner:</span>
                                <div className="text-white font-mono">{truncateAddress(w.owner)}</div>
                              </div>
                              <div>
                                <span className="text-white/60 text-xs">Recipient:</span>
                                <div className="text-white font-mono">{truncateAddress(w.recipient)}</div>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-white/60 text-xs">Last Ping:</span>
                                <div className="text-white font-mono">{formatTimestamp(w.last_ping_time)}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
                          <p className="text-white/60">No will found. Create one using the steps above.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  {error && (
                    <motion.div
                      className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <div className="text-red-400 text-sm">{error}</div>
                    </motion.div>
                  )}

                  {status && (
                    <motion.div
                      className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <div className="text-green-400 text-sm">{status}</div>
                    </motion.div>
                  )}

                  {/* Security Notice */}
                  <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-5 h-5 text-[#bb1b0b]" />
                      <h4 className="text-white font-medium">Security Notice</h4>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Your digital will is secured by the Aptos blockchain. All transactions are immutable and
                      transparent. Make sure to verify the recipient address carefully before proceeding.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}

        {tab === "manage" && (
          <motion.div
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {!connected ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#bb1b0b]/20 to-[#bb1b0b]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <Wallet className="w-8 h-8 text-[#bb1b0b]" />
                </div>
                <p className="text-white/60 text-lg mb-6">Please connect your wallet.</p>
                <WalletSelector />
              </div>
            ) : (
              <div className="p-8 space-y-6">
                {/* Management Functions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-[#bb1b0b]" />
                      <span className="text-white font-medium">Ping Will</span>
                    </div>
                    <motion.button
                      onClick={handlePing}
                      disabled={loading}
                      className="w-full py-2 bg-gradient-to-r from-[#bb1b0b] to-[#bb1b0b] text-white rounded-xl font-medium hover:shadow-[0_0_30px_rgba(187,27,11,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                      Ping
                    </motion.button>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-4 h-4 text-[#bb1b0b]" />
                      <span className="text-white font-medium">Claim Will</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Owner address"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      className="w-full p-2 rounded bg-white/10 text-white mb-2"
                    />
                    <input
                      type="number"
                      placeholder="Amount (u64)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-2 rounded bg-white/10 text-white mb-2"
                    />
                    <motion.button
                      onClick={handleClaim}
                      disabled={loading}
                      className="w-full py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                      Claim
                    </motion.button>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-4 h-4 text-[#bb1b0b]" />
                      <span className="text-white font-medium">Claim Single</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Owner address"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      className="w-full p-2 rounded bg-white/10 text-white mb-2"
                    />
                    <motion.button
                      onClick={handleClaimSingle}
                      disabled={loading}
                      className="w-full py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                      Claim Single
                    </motion.button>
                  </div>
                </div>

                {/* Status/Error Messages */}
                {loading && (
                  <motion.div
                    className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
                    <div className="text-blue-400 text-sm">Loading...</div>
                  </motion.div>
                )}

                {status && (
                  <motion.div
                    className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div className="text-green-400 text-sm">{status}</div>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div className="text-red-400 text-sm">{error}</div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
