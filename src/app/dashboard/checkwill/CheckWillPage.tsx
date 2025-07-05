"use client"

import { useState } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useWalletClient } from "@thalalabs/surf/hooks"
import { WILL_ABI } from "@/utils/will_abi"
import { ClaimWill } from "../_components/ClaimWill" // @ts-ignore
import { surfClient } from "@/utils/surfClient"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function CheckWillPage() { // @ts-ignore
  const { connected } = useWallet() // @ts-ignore
  const { client } = useWalletClient()
  const abiClient = client?.useABI(WILL_ABI)

  const [owner, setOwner] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const handleClaim = async () => {
    if (!abiClient) return setError("Wallet client not ready")
    if (!owner || !amount) return setError("Owner and amount required.")
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      await abiClient.claim({ type_arguments: [], arguments: [owner as `0x${string}`, BigInt(amount)] })
      setStatus("Claimed successfully!")
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
    } catch (e: any) {
      setError(e.message || "Error claiming single will.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-full rounded-none bg-black/50 backdrop-blur-sm shadow-xl flex flex-row p-8 gap-8 min-h-screen relative z-10">
      <main className="flex-1 text-white space-y-6">
        <ClaimWill
          loading={loading}
          owner={owner}
          amount={amount}
          setOwner={setOwner}
          setAmount={setAmount}
          handleClaim={handleClaim}
          handleClaimSingle={handleClaimSingle}
        />
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
      </main>
    </div>
  )
} 