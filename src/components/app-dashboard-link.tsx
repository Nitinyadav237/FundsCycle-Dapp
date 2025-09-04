'use client'

import { useRouter } from 'next/navigation'
import { useWalletUi } from '@wallet-ui/react'
import { toast } from 'sonner'
import { 
  useFundsCycleExists, 
  useBeneficiariesQuery, 
  type BeneficiaryAccount 
} from '@/components/fundsCycle/fundsCycle-data-access'

interface DashboardLinkProps {
  onClick?: () => void // For mobile menu close
  className?: string
  children: React.ReactNode
}

export function DashboardLink({ onClick, className, children }: DashboardLinkProps) {
  const router = useRouter()
  const { account } = useWalletUi()
  
  const { data: fundsCycleExists, isLoading: isLoadingConfig } = useFundsCycleExists()
  const { data: beneficiaries, isLoading: isLoadingBeneficiaries } = useBeneficiariesQuery()

  const isUserBeneficiary = beneficiaries?.some((beneficiary: BeneficiaryAccount) => 
    beneficiary.wallet.toString() === account?.address
  ) || false

  // Role determination logic
  const isAdmin = fundsCycleExists === true
  const isBeneficiary = isUserBeneficiary && !isAdmin
  const hasAccess = isAdmin || isBeneficiary

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (onClick) {
      onClick()
    }

    if (isLoadingConfig || isLoadingBeneficiaries) {
      toast.loading('Checking your dashboard access...', {
        duration: 2000
      })
      return
    }

    if (!hasAccess) {
      toast.error('Create a cycle first or get added as a beneficiary to access dashboard')
      return
    }

    // User has access, navigate to dashboard
    router.push(`/account/${account?.address}`)
  }

  return (
    <button
      onClick={handleDashboardClick}
      className={className}
      disabled={isLoadingConfig || isLoadingBeneficiaries}
    >
      {children}
    </button>
  )
}