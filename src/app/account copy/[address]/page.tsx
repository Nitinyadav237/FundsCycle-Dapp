'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useWalletUi } from '@wallet-ui/react'
import { toast } from 'sonner'
import AdminDashboard from '@/components/admin-dashboard'
import BeneficiaryDashboard from '@/components/beneficiary-dashboard'
import {
  useFundsCycleExists,
  useBeneficiariesQuery,
  type BeneficiaryAccount
} from '@/components/fundsCycle/fundsCycle-data-access' // Adjust import path
import { AppGuard } from '@/components/app-guard'

export default function AccountAddressPage() {
  const params = useParams()
  const router = useRouter()
  const { account } = useWalletUi()
  const addressFromUrl = params.address as string

  // Fetch data to determine role
  const { data: fundsCycleExists, isLoading: isLoadingConfig } = useFundsCycleExists()
  const { data: beneficiaries, isLoading: isLoadingBeneficiaries } = useBeneficiariesQuery()

  // Check if current user is a beneficiary
  const isUserBeneficiary = beneficiaries?.some((beneficiary: BeneficiaryAccount) =>
    beneficiary.wallet.toString() === account?.address
  ) || false

  // Role determination logic
  const isAdmin = fundsCycleExists === true
  const isBeneficiary = isUserBeneficiary && !isAdmin

  useEffect(() => {
    // Validate that URL address matches connected wallet address
    // AppGuard ensures account.address is always available
    if (addressFromUrl !== account?.address) {
      toast.error('Address mismatch. Redirecting to your dashboard...')
      router.replace(`/account/${account?.address}`)
      return
    }
  }, [account?.address, addressFromUrl, router])

  // Redirect to landing page if user has no role
  useEffect(() => {
    if (!isLoadingConfig && !isLoadingBeneficiaries && !isAdmin && !isBeneficiary) {
      toast.error('Create a cycle first or get added as a beneficiary to access dashboard')
      router.replace('/')
    }
  }, [isLoadingConfig, isLoadingBeneficiaries, isAdmin, isBeneficiary, router])

  // Show loading state while fetching data
  if (isLoadingConfig || isLoadingBeneficiaries) {
    return (
      <AppGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Loading Dashboard...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Checking your role and permissions
            </p>
          </div>
        </div>
      </AppGuard>

    )
  }

  // If user is admin, show admin dashboard
  if (isAdmin) {
    return (
      <AppGuard>
        <AdminDashboard />
      </AppGuard>
    )
  }

  // If user is beneficiary, show beneficiary dashboard  
  if (isBeneficiary) {
    return (
      <AppGuard>
        <BeneficiaryDashboard />
      </AppGuard>
    )
  }

  // If user has no role (neither admin nor beneficiary), redirect to landing page
  // This return should never be reached due to the redirect above
  return null
}