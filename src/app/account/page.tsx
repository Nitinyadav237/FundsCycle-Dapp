'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWalletUi } from '@wallet-ui/react'

export default function AccountPage() {
  const { account } = useWalletUi()
  const router = useRouter()

  useEffect(() => {
    // Since AppGuard ensures wallet is connected, we can directly redirect
    if (account?.address) {
      router.replace(`/account/${account.address}`)
    }
  }, [account?.address, router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}