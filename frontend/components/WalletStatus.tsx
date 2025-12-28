'use client'
import { useAppKitAccount } from '@reown/appkit/react'

export function WalletStatus() {
  const { address, isConnected } = useAppKitAccount()
  if (!isConnected) return null
  return <div className="p-2 text-xs text-green-400">Connected: {address}</div>
}
