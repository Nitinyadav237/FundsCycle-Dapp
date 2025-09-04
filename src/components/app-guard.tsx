'use client'

import { ReactNode } from 'react'
import { useWalletUi } from '@wallet-ui/react'
import { WalletButton } from '@/components/solana/solana-provider'

export function AppGuard({ children }: { children: ReactNode }) {
  const { account } = useWalletUi() ?? {}

  // If wallet not connected, show a global "connect wallet" screen
  if (!account?.address) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Connect Your Wallet
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Please connect your wallet to access the application
              </p>
            </div>

            <div className="flex justify-center">
              <WalletButton size="lg" />
            </div>

            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              <p>🔐 Secure connection via Solana wallet</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If wallet is connected, render the app normally
  return <>{children}</>
}
