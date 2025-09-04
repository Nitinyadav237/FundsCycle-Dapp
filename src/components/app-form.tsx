"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWalletUi } from "@wallet-ui/react"
import { useWalletUiSigner } from "@/components/solana/use-wallet-ui-signer"
import {
  useFundsCycleInitializeMutation,
  useAccountExistsQuery,
} from "@/components/fundsCycle/fundsCycle-data-access"
import {
  Address,
  getProgramDerivedAddress,
  getAddressEncoder,
  getBytesEncoder,
} from "gill"
import { FUNDS_CYCLE_PROGRAM_PROGRAM_ADDRESS } from "@/src_codma"
import { toast } from "sonner"
import { expectAddress } from "@/src_codma"

export function AppForm({
  children,
  title,
  submitLabel,
  triggerText,
  triggerClassName,
  triggerVariant = "outline",
}: {
  children?: ReactNode
  title: string
  submitLabel?: string
  triggerText?: string
  triggerClassName?: string
  triggerVariant?:
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
}) {
  const [formData, setFormData] = useState({
    collateralAmount: "",
    monthlyPayout: "",
    maxMembers: "",
    paymentInterval: "30",
    withdrawPercent: "10",
  })
  const [configPda, setConfigPda] = useState<Address | undefined>(undefined)
  const [dialogOpen, setDialogOpen] = useState(false)

  const router = useRouter()
  const { account, cluster } = useWalletUi()
  const walletSigner = useWalletUiSigner()
  
  // ✅ Then conditionally use the result
  const signer = account && cluster ? walletSigner : undefined
  
  const initializeMutation = useFundsCycleInitializeMutation()

  // 🔍 Query: check if config account already exists
  const { data: exists, isLoading: checkingExists } = useAccountExistsQuery(configPda)
  console.log(exists, checkingExists, configPda, " exist,checking conigpda")

  // 🔁 Redirect automatically if account already exists
  useEffect(() => {
    if (exists) {
      toast.info("Account already exists, redirecting to dashboard")
      router.push("/account")
    }
  }, [exists, router])

  // 🚀 Trigger click: derive PDA and open dialog
  const handleTriggerClick = async () => {
    if (!account) {
      toast.error("Please connect your wallet first")
      return
    }

    try {
      const [pda] = await getProgramDerivedAddress({
        programAddress: FUNDS_CYCLE_PROGRAM_PROGRAM_ADDRESS as Address,
        seeds: [
          getBytesEncoder().encode(new Uint8Array([99, 111, 110, 102, 105, 103])), // "config"
          getAddressEncoder().encode(expectAddress(account.address as Address)),
        ],
      })

      setConfigPda(pda)
      console.log(pda, "hanfeltrick")
      setDialogOpen(true)
    } catch (err) {
      console.error("Error deriving PDA:", err)
      toast.error("Failed to prepare account check")
    }
  }

  // 🚀 Submit handler
  const handleSubmit = async () => {
    if (!formData.collateralAmount || !formData.monthlyPayout || !formData.maxMembers) {
      toast.error("Please fill in all required fields")
      return
    }
    if (!signer) {
      toast.error("Wallet not connected")
      return
    }

    try {
      const collateralAmount = BigInt(formData.collateralAmount)
      const monthlyPayout = BigInt(formData.monthlyPayout)
      const maxBeneficiaries = parseInt(formData.maxMembers, 10)
      const paymentIntervalDays = parseInt(formData.paymentInterval, 10)
      const withdrawPercent = parseInt(formData.withdrawPercent, 10)

      // Validation
      if (collateralAmount <= 0n) {
        toast.error("Collateral amount must be greater than 0 lamports")
        return
      }
      if (monthlyPayout <= 0n) {
        toast.error("Monthly payout must be greater than 0 lamports")
        return
      }
      if (monthlyPayout > collateralAmount) {
        toast.error("Monthly payout cannot exceed collateral amount")
        return
      }
      if (maxBeneficiaries < 3 || maxBeneficiaries > 50) {
        toast.error("Max members must be between 3 and 50")
        return
      }
      if (paymentIntervalDays < 1 || paymentIntervalDays > 365) {
        toast.error("Payment interval must be between 1 and 365 days")
        return
      }
      if (withdrawPercent < 1 || withdrawPercent > 50) {
        toast.error("Withdraw percent must be between 1 and 50")
        return
      }

      await initializeMutation.mutateAsync({
        collateralAmount,
        monthlyPayout,
        paymentIntervalDays,
        maxBeneficiaries,
        withdrawPercent,
      })

      toast.success("Funds cycle created successfully!")
      setDialogOpen(false)

      // 2 second delay before redirect
      setTimeout(() => {
        router.push("/account")
      }, 2000)
    } catch (err) {
      console.error("Error creating cycle:", err)
      toast.error("Failed to create cycle")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const isFormValid =
    formData.collateralAmount &&
    formData.monthlyPayout &&
    formData.maxMembers &&
    BigInt(formData.collateralAmount || "0") > 0n &&
    BigInt(formData.monthlyPayout || "0") > 0n &&
    parseInt(formData.maxMembers, 10) >= 3 &&
    parseInt(formData.maxMembers, 10) <= 50

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          className={triggerClassName}
          onClick={handleTriggerClick}
          disabled={!account}
        >
          {triggerText || title}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[90vh] border shadow-xl flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
          <div className="grid gap-6 py-6">
            {checkingExists ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Spinner size="large" />
                <p className="mt-4 text-lg font-medium">Checking account...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Connecting to Solana blockchain
                </p>
              </div>
            ) : exists ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-lg font-medium">Account Already Exists</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Redirecting to your dashboard...
                </p>
              </div>
            ) : (
              <div className="space-y-6 px-6 pb-2">
                {/* Collateral Amount */}
                <div className="space-y-2">
                  <Label htmlFor="collateral-amount" className="text-sm font-medium">
                    Collateral Amount (lamports) *
                  </Label>
                  <Input
                    id="collateral-amount"
                    type="number"
                    min="1"
                    placeholder="Enter collateral amount in lamports"
                    value={formData.collateralAmount}
                    onChange={(e) =>
                      handleInputChange("collateralAmount", e.target.value)
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Total amount to be deposited as collateral
                  </p>
                </div>

                {/* Monthly Payout */}
                <div className="space-y-2">
                  <Label htmlFor="monthly-payout" className="text-sm font-medium">
                    Monthly Payout (lamports) *
                  </Label>
                  <Input
                    id="monthly-payout"
                    type="number"
                    min="1"
                    placeholder="Enter monthly payout amount"
                    value={formData.monthlyPayout}
                    onChange={(e) =>
                      handleInputChange("monthlyPayout", e.target.value)
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Amount each member receives per payment cycle
                  </p>
                </div>

                {/* Max Members */}
                <div className="space-y-2">
                  <Label htmlFor="max-members" className="text-sm font-medium">
                    Maximum Members *
                  </Label>
                  <Input
                    id="max-members"
                    type="number"
                    min="3"
                    max="50"
                    placeholder="3-50 members"
                    value={formData.maxMembers}
                    onChange={(e) =>
                      handleInputChange("maxMembers", e.target.value)
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of beneficiaries (3-50)
                  </p>
                </div>

                {/* Payment Interval */}
                <div className="space-y-2">
                  <Label htmlFor="payment-interval" className="text-sm font-medium">
                    Payment Interval (days)
                  </Label>
                  <Input
                    id="payment-interval"
                    type="number"
                    min="1"
                    max="365"
                    placeholder="Payment frequency in days"
                    value={formData.paymentInterval}
                    onChange={(e) =>
                      handleInputChange("paymentInterval", e.target.value)
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    How often payments are distributed (1-365 days)
                  </p>
                </div>

                {/* Withdraw Percent */}
                <div className="space-y-2">
                  <Label htmlFor="withdraw-percent" className="text-sm font-medium">
                    Withdraw Percentage
                  </Label>
                  <Input
                    id="withdraw-percent"
                    type="number"
                    min="1"
                    max="50"
                    placeholder="Withdrawal percentage"
                    value={formData.withdrawPercent}
                    onChange={(e) =>
                      handleInputChange("withdrawPercent", e.target.value)
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentage of collateral that can be withdrawn (1-50%)
                  </p>
                </div>


                {/* Summary Section */}
                {isFormValid && (
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                    <h4 className="font-medium mb-3">Configuration Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Collateral:</span>
                        <span className="font-mono">{formData.collateralAmount} lamports</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Payout:</span>
                        <span className="font-mono">{formData.monthlyPayout} lamports</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Members:</span>
                        <span className="font-mono">{formData.maxMembers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Interval:</span>
                        <span className="font-mono">{formData.paymentInterval} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Withdraw %:</span>
                        <span className="font-mono">{formData.withdrawPercent}%</span>
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!isFormValid || initializeMutation.isPending}
                    className="h-10 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    {initializeMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <Spinner size="small" />
                        <span>Creating...</span>
                      </div>
                    ) : (
                      submitLabel || "Create Cycle"
                    )}
                  </Button>
                </DialogFooter>

                {children}
              </div>
            )}
          </div>
        </div>



      </DialogContent>
    </Dialog>
  )
}