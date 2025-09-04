import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { BeneficiaryAccount } from "@project/anchor"
import { Loader2, X } from "lucide-react"
import {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react"

// ✅ Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "default" | "destructive" | "outline"
  size?: "default" | "sm" | "lg"
  className?: string
}

export const Button = ({
  children,
  onClick,
  disabled = false,
  variant = "default",
  size = "default",
  className = "",
  ...props
}: ButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md font-medium transition-colors ${
      variant === "destructive"
        ? "bg-red-600 text-white hover:bg-red-700"
        : variant === "outline"
        ? "border border-gray-300 bg-white hover:bg-gray-50"
        : "bg-blue-600 text-white hover:bg-blue-700"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    {...props}
  >
    {children}
  </button>
)

// ✅ Card + subcomponents
interface ChildrenProps {
  children: ReactNode
  className?: string
}

export const Card = ({ children, className = "" }: ChildrenProps) => (
  <div className={`bg-white rounded-lg border shadow ${className}`}>
    {children}
  </div>
)

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export const CardHeader = ({ children, className = "" }: CardHeaderProps) => (
  <div className={`p-6 pb-0 ${className}`}>{children}</div>
)

export const CardTitle = ({ children, className = "" }: ChildrenProps) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
)

export const CardContent = ({ children, className = "" }: ChildrenProps) => (
  <div className={`p-6 ${className}`}>{children}</div>
)

// ✅ Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export const Input = ({
  value,
  onChange,
  placeholder,
  className = "",
  ...props
}: InputProps) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
)

// ✅ Badge
interface BadgeProps {
  children: ReactNode
  variant?: "default" | "outline"
  className?: string
}

export const Badge = ({
  children,
  variant = "default",
  className = "",
}: BadgeProps) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      variant === "outline" ? "border" : "bg-gray-100"
    } ${className}`}
  >
    {children}
  </span>
)

// ✅ Label
interface LabelProps {
  children: ReactNode
  className?: string
}

export const Label = ({ children, className = "" }: LabelProps) => (
  <label className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
)

// ✅ AdminTable
interface AdminTableProps {
  beneficiaries: BeneficiaryAccount[]
  isAdmin: boolean
  handlePunish: (wallet: string) => void
  punishMutation: { isPending: boolean }
}

export const AdminTable = ({
  beneficiaries,
  isAdmin,
  handlePunish,
  punishMutation,
}: AdminTableProps) => {
  if (!beneficiaries || beneficiaries.length === 0) {
    return null
  }

  return (
    <Card className="mt-6 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-800/20">
      <CardHeader>
        <CardTitle className="text-xl">
          Beneficiaries ({beneficiaries.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Wallet Address</TableHead>
              <TableHead>Collateral Paid</TableHead>
              <TableHead>Monthly Paid</TableHead>
              <TableHead>Index</TableHead>
              {isAdmin && (
                <TableHead className="pr-6 text-left">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {beneficiaries.map((beneficiary) => (
              <TableRow key={beneficiary.wallet}>
                <TableCell className="font-mono text-xs">
                  {beneficiary.wallet.slice(0, 8)}...
                  {beneficiary.wallet.slice(-8)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      beneficiary.collateralPaid
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }
                  >
                    {beneficiary.collateralPaid ? "Paid" : "Unpaid"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      beneficiary.monthlyPaid
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }
                  >
                    {beneficiary.monthlyPaid ? "Paid" : "Unpaid"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-700 border-blue-200"
                  >
                    #{beneficiary.index + 1}
                  </Badge>
                </TableCell>
                {isAdmin && (
                  <TableCell className="pr-6 text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handlePunish(beneficiary.wallet)}
                      disabled={punishMutation.isPending}
                      className="group flex items-center justify-center gap-2"
                    >
                      {punishMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <span className="hidden sm:inline">Punish</span>
                          <X className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
