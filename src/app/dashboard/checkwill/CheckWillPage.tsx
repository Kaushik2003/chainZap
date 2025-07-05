"use client"

import { useState } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useWalletClient } from "@thalalabs/surf/hooks"
import { WILL_ABI } from "@/utils/will_abi"
import { ClaimWill } from "../_components/ClaimWill"
import { AlertCircle, CheckCircle, Loader2, Wallet, Shield, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function CheckWillPage() {
  const { connected } = useWallet()
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
    <div className="h-screen w-full bg-transparent flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col items-center justify-center space-y-5">
        {/* Header */}
        <motion.header
          className="text-center space-y-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Shield className="w-3 h-3 text-white/70" />
            <span className="text-white/70 text-xs font-medium">Secure Digital Inheritance</span>
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Will Management
          </motion.h1>

          <motion.p
            className="text-base text-gray-300 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Securely manage and claim your digital inheritance on Aptos
          </motion.p>
        </motion.header>

        {/* Connection Status */}
        <motion.section
          className="w-full max-w-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <motion.div
            className={`p-4 rounded-2xl backdrop-blur-xl border transition-all duration-300 ${connected
              ? "bg-green-500/10 border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]"
              : "bg-amber-500/10 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
              }`}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="flex items-center justify-center gap-4">
              <motion.div
                animate={connected ? { rotate: 360 } : { rotate: 0 }}
                transition={{
                  duration: 2,
                  repeat: connected ? Number.POSITIVE_INFINITY : 0,
                  ease: "linear",
                  repeatType: "loop",
                }}
              >
                {connected ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Wallet className="w-4 h-4 text-amber-400" />
                )}
              </motion.div>
              <div className="text-center">
                <div className={`font-medium text-sm ${connected ? "text-green-300" : "text-amber-300"}`}>
                  {connected ? "Wallet Connected" : "Connect Wallet"}
                </div>
                <div className={`text-xs ${connected ? "text-green-400/70" : "text-amber-400/70"}`}>
                  {connected ? "Ready to process" : "Please connect"}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Main Content */}
        <motion.main
          className="w-full flex-1 min-h-0 py-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ClaimWill
            loading={loading}
            owner={owner}
            amount={amount}
            setOwner={setOwner}
            setAmount={setAmount}
            handleClaim={handleClaim}
            handleClaimSingle={handleClaimSingle}
          />
        </motion.main>

        {/* Status Messages */}
        <AnimatePresence mode="wait">
          <section className="w-full max-w-2xl h-16 flex items-center justify-center">
            {loading && (
              <motion.div
                className="w-full p-5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-center gap-5">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                      repeatType: "loop",
                    }}
                  >
                    <Loader2 className="w-4 h-4 text-white/70" />
                  </motion.div>
                  <div className="text-center">
                    <div className="text-white font-medium text-sm">Processing...</div>
                  </div>
                </div>
              </motion.div>
            )}

            {status && (
              <motion.div
                className="w-full p-5 bg-green-500/10 border border-green-500/20 rounded-xl backdrop-blur-xl"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  scale: [0.5, 1.1, 1],
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.5,
                  times: [0, 0.6, 1],
                  type: "spring",
                  stiffness: 400,
                }}
              >
                <div className="flex items-center justify-center gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                  >
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </motion.div>
                  <div className="text-center">
                    <div className="text-green-300 font-medium text-sm">Success!</div>
                    <div className="text-green-400/70 text-xs">{status}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                className="w-full p-5 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-xl"
                initial={{ opacity: 0, x: 0 }}
                animate={{
                  opacity: 1,
                  x: [0, -3, 3, -3, 3, 0],
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.5,
                  times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                }}
              >
                <div className="flex items-center justify-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                    transition={{ duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
                  >
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  </motion.div>
                  <div className="text-center">
                    <div className="text-red-300 font-medium text-sm">Error</div>
                    <div className="text-red-400/70 text-xs">{error}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </section>
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          className="w-full max-w-3xl p-6 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Wallet, title: "Connect", desc: "Link wallet" },
              { icon: Shield, title: "Verify", desc: "Enter details" },
              { icon: Zap, title: "Claim", desc: "Get assets" },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center space-y-2"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <item.icon className="w-5 h-5 text-white/80" />
                </motion.div>
                <div>
                  <h4 className="text-white font-medium text-xs">{item.title}</h4>
                  <p className="text-gray-400 text-xs">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.footer>
      </div>
    </div>
  )
}
