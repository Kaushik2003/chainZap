"use client"

import { motion } from "framer-motion"
// @ts-ignore
import { Gift, Loader2, User, DollarSign } from 'lucide-react'

interface ClaimWillProps {
  loading: boolean
  owner: string
  amount: string
  setOwner: (owner: string) => void
  setAmount: (amount: string) => void
  handleClaim: () => Promise<void>
  handleClaimSingle: () => Promise<void>
}

export function ClaimWill({
  loading,
  owner,  // @ts-ignore
  amount,  // @ts-ignore
  setOwner,  // @ts-ignore
  setAmount,  // @ts-ignore
  handleClaim,  // @ts-ignore
  handleClaimSingle
}: ClaimWillProps) {
  return (
    <div className="space-y-6">
      {/* Claim Will with Amount */}


      {/* Claim Single Will */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-4 h-4" style={{ color: '#bb1b0b' }} />
          <span className="text-white font-medium">Claim Single Will (Full Amount)</span>
        </div>
        <p className="text-white/60 text-sm mb-4">
          Claim the entire will from a specific owner. This will claim all available funds from that will.
        </p>

        <div>
          <label className="block text-white/70 text-sm font-light mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Will Owner Address
          </label>
          <input
            type="text"
            placeholder="Enter will owner's address (0x...)"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-[#bb1b0b]/50 focus:ring-2 focus:ring-[#bb1b0b]/20 transition-all duration-300"
          />
        </div>

        <motion.button
          onClick={handleClaimSingle}
          disabled={loading || !owner}
          className="w-full py-3 text-white rounded-xl font-medium hover:shadow-[0_0_30px_rgba(187,27,11,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(to right, #bb1b0b, #bb1b0b)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
          Claim Full Will
        </motion.button>
      </div>
    </div>
  )
}
