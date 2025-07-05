"use client"

import { PingWill } from "../_components/PingWill"

export default function PingWillPage() {
  return (
    <div className="w-full h-full rounded-none bg-black/50 backdrop-blur-sm shadow-xl flex flex-row p-8 gap-8 min-h-screen relative z-10">
      <main className="flex-1 text-white flex items-center justify-center">
        <PingWill />
      </main>
    </div>
  )
} 