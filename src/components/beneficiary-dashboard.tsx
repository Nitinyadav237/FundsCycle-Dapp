"use client"

import { User, Users, Vault, Settings, CheckCircle, RefreshCw, X, XCircle, Loader2 } from "lucide-react"

// Import your actual hooks
import {
  useBeneficiariesQuery,
  useDepositCollateralMutation,
  useDepositMonthlyMutation,
  useWithdrawMutation,
  useClaimCollateralMutation,
  useBeneficiaryData,
} from "@/components/fundsCycle/fundsCycle-data-access" // Update this path to match your file structure

// Import wallet hook
import { useWalletUi } from '@wallet-ui/react'
import { toast } from "sonner"
import { Progress } from "./ui/progress"
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/admin-table"


const StatCard = ({ icon: Icon, title, value, iconColor }: { icon: any, title: string, value: string, iconColor?: string }) => (
  <Card className="shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`w-8 h-8 flex items-center justify-center rounded-full ${iconColor ? iconColor : 'text-blue-600 dark:text-blue-400'}`}>
        <Icon className="h-5 w-5" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
)

export default function BeneficiaryDashboard() {
  const { account } = useWalletUi()
  const { data: fundsCycleData, isLoading: fundsCycleLoading, error: fundsCycleError, refetch } = useBeneficiaryData()
  const { data: beneficiaries = [], isLoading: beneficiariesLoading, error: beneficiariesError } = useBeneficiariesQuery()
  const depositCollateralMutation = useDepositCollateralMutation()
  const depositMonthlyMutation = useDepositMonthlyMutation()
  const withdrawMutation = useWithdrawMutation()
  const claimCollateralMutation = useClaimCollateralMutation()

  const isLoading = fundsCycleLoading || beneficiariesLoading
  const error = fundsCycleError || beneficiariesError
  const fundsCycleExists = !!fundsCycleData 

  // Safely access data, providing fallback values
  const MAX_PARTICIPANTS = fundsCycleData?.config?.maxBeneficiaries ?? 10
  const COLLATERAL_AMOUNT = fundsCycleData?.collateralAmountSOL ?? 0
  const MONTHLY_PAYOUT = fundsCycleData?.monthlyPayoutSOL ?? 0
  const PAYMENT_INTERVAL = fundsCycleData?.config?.paymentIntervalDays ? Number(fundsCycleData.config.paymentIntervalDays) / (24 * 60 * 60) : 30
  const WITHDRAW_PERCENT = fundsCycleData?.config?.withdrawPercent ?? 85
  const CURRENT_INDEX = fundsCycleData?.config?.currentIndex ?? 0
  const TOTAL_VAULT_BALANCE = fundsCycleData?.vaultBalanceSOL ?? 0
  const CLAIMS_COMPLETED = fundsCycleData?.config?.claimsCompleted ?? 0

  const configAddress = fundsCycleData?.configPda ?
    fundsCycleData.configPda.slice(0, 8) + "..." + fundsCycleData.configPda.slice(-8) :
    "N/A"

  // Use beneficiary data directly if available, otherwise search in beneficiaries list
  const currentUserBeneficiary = fundsCycleData?.beneficiary ? {
    ...fundsCycleData.beneficiary,
    wallet: account?.address // Add wallet for consistency
  } : beneficiaries.find(b => b.wallet === account?.address)

  const isAdmin = currentUserBeneficiary?.index === 0 // Admin is typically at index 0

  const handleDepositCollateral = async () => {
    if (!currentUserBeneficiary) {
      toast.error("You must be a beneficiary to deposit collateral")
      return
    }

    if (currentUserBeneficiary.collateralPaid) {
      toast.error("Collateral already paid")
      return
    }

    try {
      await depositCollateralMutation.mutateAsync()
    } catch (error) {
      console.error("Failed to deposit collateral:", error)
    }
  }

  const handleDepositMonthlyPayout = async () => {
    if (!currentUserBeneficiary) {
      toast.error("You must be a beneficiary to deposit collateral")
      return
    }

    if (currentUserBeneficiary.monthlyPaid) {
      toast.error("Monthly already paid")
      return
    }

    try {
      await depositMonthlyMutation.mutateAsync()
    } catch (error) {
      console.error("Failed to deposit collateral:", error)
    }
  }

  const handleWithdrawCollateral = async () => {
    if (!currentUserBeneficiary) {
      toast.error("You must be a beneficiary to claim collateral")
      return
    }

    // Check if the cycle is complete or if this beneficiary has already claimed
    if (CLAIMS_COMPLETED < MAX_PARTICIPANTS) {
      toast.error("Cannot claim collateral until the cycle is complete")
      return
    }

    try {
      await claimCollateralMutation.mutateAsync()
    } catch (error) {
      console.error("Failed to claim collateral:", error)
    }
  }

  const handleWithdrawMonthlyPayout = async () => {
    if (!currentUserBeneficiary) {
      toast.error("You must be a beneficiary to withdraw")
      return
    }

    // Check if it's the user's turn to withdraw (current index matches user's index)
    if (currentUserBeneficiary.index !== CURRENT_INDEX) {
      toast.error("It's not your turn to withdraw yet")
      return
    }

    try {
      await withdrawMutation.mutateAsync()
    } catch (error) {
      console.error("Failed to withdraw:", error)
    }
  }

  const handleRefreshStatus = () => {
    refetch()
  }

  const progressValue = beneficiaries.length > 0 ? (CURRENT_INDEX / MAX_PARTICIPANTS) * 100 : 0

  const ActionButton = ({ children, onClick, disabled = false }: { children: React.ReactNode, onClick: () => void, disabled?: boolean }) => (
    <Button
      variant="outline"
      size="lg"
      className="h-12 px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 group"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
        {children}
      </span>
    </Button>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
        <div className="container mx-auto p-6 max-w-7xl relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-gray-500">Loading FundsCycle data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
        <div className="container mx-auto p-6 max-w-7xl relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <XCircle className="w-8 h-8 text-red-500" />
              <p className="text-red-600">Failed to load FundsCycle data</p>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 group"
                onClick={handleRefreshStatus}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!fundsCycleData && !isLoading && !error) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
        <div className="container mx-auto p-6 max-w-7xl relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4 text-center">
              <Settings className="w-12 h-12 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Not a Beneficiary</h2>
              <p className="text-gray-500 max-w-md">
                You are not a beneficiary of any FundsCycle. Contact an admin to be added to a cycle.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <div className="container mx-auto p-6 max-w-7xl relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900 dark:text-white">
              Beneficiary Dashboard
            </h1>
            <p className="text-gray-500 font-medium text-lg">
              Config: {configAddress} | Max: {MAX_PARTICIPANTS} | Current: {beneficiaries.length}
            </p>
            <div className="w-24 h-1 bg-gray-900 dark:bg-white rounded-full mt-3" />
          </div>
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 group"
            onClick={handleRefreshStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>

        {/* Vault Account */}
        <Card className="mb-10 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                <Vault className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Vault Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Vault Address</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {fundsCycleData?.vaultPda ?
                  fundsCycleData.vaultPda.slice(0, 8) + "..." + fundsCycleData.vaultPda.slice(-8) :
                  "N/A"
                }
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-muted-foreground font-medium mb-1">Balance</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {TOTAL_VAULT_BALANCE.toFixed(9)} SOL
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Status Cards - Only show if user is a beneficiary */}
        {currentUserBeneficiary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <StatCard
              icon={User}
              title="Your Position"
              value={`#${currentUserBeneficiary.index + 1}`}
            />
            <StatCard
              icon={currentUserBeneficiary.collateralPaid ? CheckCircle : X}
              title="Collateral"
              value={currentUserBeneficiary.collateralPaid ? "Paid" : "Unpaid"}
              iconColor={currentUserBeneficiary.collateralPaid ? "text-green-500" : "text-red-500"}
            />
            <StatCard
              icon={currentUserBeneficiary.monthlyPaid ? CheckCircle : X}
              title="Monthly Payment"
              value={currentUserBeneficiary.monthlyPaid ? "Paid" : "Unpaid"}
              iconColor={currentUserBeneficiary.monthlyPaid ? "text-green-500" : "text-red-500"}
            />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            icon={Users}
            title="Participants"
            value={`${beneficiaries.length}/${MAX_PARTICIPANTS}`}
          />
          <StatCard
            icon={Vault}
            title="Total Vault"
            value={`${TOTAL_VAULT_BALANCE.toFixed(9)} SOL`}
          />
          <StatCard
            icon={Settings}
            title="Current Index"
            value={`${CURRENT_INDEX}`}
          />
          <StatCard
            icon={CheckCircle}
            title="Claims Done"
            value={`${CLAIMS_COMPLETED}/${MAX_PARTICIPANTS}`}
          />
        </div>

        {/* Cycle Configuration */}
        <Card className="lg:col-span-2  shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Cycle Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Collateral Required</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{COLLATERAL_AMOUNT.toFixed(9)} SOL</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Monthly Contribution</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{MONTHLY_PAYOUT.toFixed(9)} SOL</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Payment Interval</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{PAYMENT_INTERVAL.toFixed(0)} days</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Withdraw %</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{WITHDRAW_PERCENT}%</p>
            </div>
            <div className="col-span-full">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-muted-foreground font-medium">Cycle Progress</span>
                <span className="text-sm text-muted-foreground font-medium">{progressValue.toFixed(0)}%</span>
              </div>
              <Progress value={progressValue} className="h-3" />
            </div>
          </CardContent>
        </Card>


        {/* Available Actions - Only show if user is a beneficiary */}
        {currentUserBeneficiary && (
          <Card className="mt-10 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-100 to-purple-100">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Available Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ActionButton
                onClick={handleDepositCollateral}
                disabled={
                  !currentUserBeneficiary ||
                  currentUserBeneficiary.collateralPaid ||
                  depositCollateralMutation.isPending
                }
              >
                {depositCollateralMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Depositing...
                  </>
                ) : (
                  `Deposit Collateral (${COLLATERAL_AMOUNT.toFixed(9)} SOL)`
                )}
              </ActionButton>

              <ActionButton
                onClick={handleDepositMonthlyPayout}
                disabled={
                  !currentUserBeneficiary ||
                  currentUserBeneficiary.monthlyPaid ||
                  depositMonthlyMutation.isPending
                }
              >
                {depositMonthlyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Depositing...
                  </>
                ) : (
                  `Deposit Monthly payout (${MONTHLY_PAYOUT.toFixed(9)} SOL)`
                )}
              </ActionButton>

              <ActionButton
                onClick={handleWithdrawCollateral}
                disabled={
                  !currentUserBeneficiary ||
                  CLAIMS_COMPLETED < MAX_PARTICIPANTS ||
                  claimCollateralMutation.isPending
                }
              >
                {claimCollateralMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Claiming...
                  </>
                ) : (
                  "Claim Collateral"
                )}
              </ActionButton>

              <ActionButton
                onClick={handleWithdrawMonthlyPayout}
                disabled={
                  !currentUserBeneficiary ||
                  currentUserBeneficiary.index !== CURRENT_INDEX ||
                  withdrawMutation.isPending
                }
              >
                {withdrawMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Withdrawing...
                  </>
                ) : (
                  "Withdraw Monthly Payout"
                )}
              </ActionButton>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}