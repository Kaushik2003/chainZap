"use client"

import { useState } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useWalletClient } from "@thalalabs/surf/hooks"
import { WILL_ABI } from "@/utils/will_abi"
import { surfClient } from "@/utils/surfClient"
import { motion } from "framer-motion"
import { Activity, Loader2, CheckCircle, AlertCircle, FileText } from "lucide-react"
import React from "react"

function truncateAddress(addr: string) {
  if (!addr) return ""
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function formatAmount(amt: string | number) {
  const num = typeof amt === "string" ? Number.parseFloat(amt) : amt
  return (num / 1e8).toFixed(4)
}

function formatTimestamp(timestamp: string | number) {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleString()
}

export function PingWill() {
  const { connected, account } = useWallet()
  const { client } = useWalletClient()
  const abiClient = client?.useABI(WILL_ABI)
  const ownerAddress = account?.address?.toStringLong() || ""

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [will, setWill] = useState<any>(null)

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
  }

  const handlePing = async () => {
    if (!abiClient) return setError("Wallet client not ready")
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      await abiClient.ping({ type_arguments: [], arguments: [] })
      setStatus("Pinged successfully!")
      await fetchWill()
    } catch (e: any) {
      setError(e.message || "Error pinging.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch will on mount if connected
  React.useEffect(() => {
    if (connected) fetchWill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, ownerAddress])

  if (!connected) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 text-center">
        <div className="flex items-center gap-2 mb-2 justify-center">
          <Activity className="w-4 h-4 text-[#bb1b0b]" />
          <span className="text-white font-medium">Ping Will</span>
        </div>
        <p className="text-white/60 text-sm mb-4">Connect your wallet to ping your will.</p>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-[#bb1b0b]" />
        <span className="text-white font-medium">Ping Will</span>
      </div>
      <p className="text-white/60 text-sm mb-4">
        Send a ping to update your will's last activity timestamp. This shows you're still active.
      </p>
      <motion.button
        onClick={handlePing}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-[#bb1b0b] to-[#bb1b0b] text-white rounded-xl font-medium hover:shadow-[0_0_30px_rgba(187,27,11,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
        Ping My Will
      </motion.button>
      {status && (
        <div className="flex items-center gap-2 text-green-400 text-sm mt-2">
          <CheckCircle className="w-4 h-4" />
          <span>{status}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      <div className="mt-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
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
    </div>
  )
}
