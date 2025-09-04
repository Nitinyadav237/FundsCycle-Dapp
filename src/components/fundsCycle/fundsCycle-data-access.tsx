
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {  Base58EncodedBytes, createSolanaClient, getBase58Codec,  type Address } from "gill"
import {
  getProgramDerivedAddress,
  getAddressEncoder,
  getBytesEncoder,
} from "gill"
import {
  expectAddress,
  FUNDS_CYCLE_PROGRAM_PROGRAM_ADDRESS,
  BENEFICIARY_ACCOUNT_DISCRIMINATOR, 
  decodeBeneficiaryAccount, 
  type BeneficiaryAccount,
  getBeneficiaryAccountSize,
  getDepositCollateralInstructionAsync,
  getDepositMonthlyInstructionAsync,
  getWithdrawInstructionAsync,
  getClaimCollateralInstructionAsync,
  getExitInstructionAsync,
  getPunishInstruction, 
} from "@/src_codma"
import { useWalletUi } from "@wallet-ui/react"
import { useWalletUiSigner } from "@/components/solana/use-wallet-ui-signer"
import { useWalletTransactionSignAndSend } from "@/components/solana/use-wallet-transaction-sign-and-send"
import { toastTx } from "@/components/toast-tx"
import { toast } from "sonner"
import {
  fetchConfigAccount,
  fetchVaultAccount,
  getInitializeInstructionAsync,
  getAddBeneficiaryInstructionAsync,
  type InitializeInstructionDataArgs,
  type ConfigAccount,
  type VaultAccount,
} from "@/src_codma"

// -------------------------
// Solana client RPC
// -------------------------
const { rpc } = createSolanaClient({ urlOrMoniker: "devnet" })

// -------------------------
// Query Function for Account Existence
// -------------------------
async function fetchAccountExists(pda: Address): Promise<boolean> {
  try {
    const { value: accountInfo } = await rpc.getAccountInfo(pda).send()
    console.log(accountInfo, "fundscycle")
    return !!accountInfo
  } catch (err) {
    console.error("Failed to check account existence:", err)
    return false
  }
}

// -------------------------
// Hook: useAccountExistsQuery
// -------------------------
export function useAccountExistsQuery(pda?: Address) {
  return useQuery({
    queryKey: ["accountExists", pda],
    queryFn: () => {
      if (!pda) return Promise.resolve(false)
      return fetchAccountExists(pda)
    },
    enabled: !!pda, 
    staleTime: 30_000, 
  })
}

// -------------------------
// Hook: Initialize FundsCycle
// -------------------------
export function useFundsCycleInitializeMutation() {
  const { cluster } = useWalletUi()
  const queryClient = useQueryClient()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()

  return useMutation({
    mutationFn: async (args: InitializeInstructionDataArgs) => {
      const ix = await getInitializeInstructionAsync({
        admin: signer,
        ...args,
      })

      const configPda = ix.accounts[1].address as Address

      const exists = await fetchAccountExists(configPda)
      if (exists) {
        throw new Error("FundsCycle already exists for this admin")
      }

      return await signAndSend(ix, signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx, "✅ FundsCycle initialized")
      await queryClient.invalidateQueries({
        queryKey: ["fundsCycle", "accounts", { cluster }],
      })
    },
    onError: (err: any) => {
      console.error(err)
      toast.error(err.message || "❌ Failed to initialize FundsCycle")
    },
  })
}

// -------------------------
// Function: Derive Config PDA
// -------------------------
async function deriveConfigPda(adminAddress: Address): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: FUNDS_CYCLE_PROGRAM_PROGRAM_ADDRESS as Address,
    seeds: [
      getBytesEncoder().encode(new Uint8Array([99, 111, 110, 102, 105, 103])), // "config"
      getAddressEncoder().encode(expectAddress(adminAddress)),
    ],
  })
  return pda
}

// -------------------------
// Function: Derive Vault PDA
// -------------------------
async function deriveVaultPda(configAddress: Address): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: FUNDS_CYCLE_PROGRAM_PROGRAM_ADDRESS as Address,
    seeds: [
      getBytesEncoder().encode(new Uint8Array([118, 97, 117, 108, 116])), // "vault"
      getAddressEncoder().encode(expectAddress(configAddress)),
    ],
  })
  return pda
}

// -------------------------
// Function: Derive Beneficiary PDA - FIXED VERSION
// -------------------------
async function deriveBeneficiaryPda(
  configAddress: Address,
  walletAddress: Address
): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: FUNDS_CYCLE_PROGRAM_PROGRAM_ADDRESS as Address,
    seeds: [
      getBytesEncoder().encode(
        new Uint8Array([98, 101, 110, 101, 102, 105, 99, 105, 97, 114, 121])
      ), // "beneficiary
      getAddressEncoder().encode(expectAddress(configAddress)),
      getAddressEncoder().encode(expectAddress(walletAddress)),
    ],
  })
  return pda
}

// -------------------------
// Hook: Fetch FundsCycle Data
// -------------------------
export function useFundsCycleData() {
  const { account } = useWalletUi()

  return useQuery({
    queryKey: ["fundsCycleData", account?.address],
    queryFn: async () => {
      if (!account?.address) {
        throw new Error("Wallet not connected")
      }

      const adminAddress = expectAddress(account.address as Address)

      try {
        // Derive PDAs
        const configPda = await deriveConfigPda(adminAddress)
        const vaultPda = await deriveVaultPda(configPda)

        const [configAccountData, vaultAccountData, vaultBalanceResult] =
          await Promise.all([
            fetchConfigAccount(rpc, configPda),
            fetchVaultAccount(rpc, vaultPda),
            rpc.getBalance(vaultPda).send(),
          ])

        const vaultBalance = vaultBalanceResult.value

        return {
          config: configAccountData.data,
          vault: vaultAccountData.data,
          vaultBalance,
          configPda,
          vaultPda,
          // Convert lamports to SOL for display
          vaultBalanceSOL: Number(vaultBalance) / 1_000_000_000,
          collateralAmountSOL:
            Number(configAccountData.data.collateralAmount) / 1_000_000_000,
          monthlyPayoutSOL:
            Number(configAccountData.data.monthlyPayout) / 1_000_000_000,
        }
      } catch (err) {
        console.error("Failed to fetch account data:", err)
        throw new Error(`Failed to fetch FundsCycle data: ${err}`)
      }
    },
    enabled: !!account?.address,
    staleTime: 10_000, // Cache for 10 seconds
    refetchOnWindowFocus: true,
    retry: 2,
  })
}

// -------------------------
// Hook: Check if FundsCycle exists (using codama)
// -------------------------
export function useFundsCycleExists() {
  const { account } = useWalletUi()

  return useQuery({
    queryKey: ["fundsCycleExists", account?.address],
    queryFn: async () => {
      if (!account?.address) {
        return false
      }

      try {
        const adminAddress = expectAddress(account.address as Address)
        const configPda = await deriveConfigPda(adminAddress)

        await fetchConfigAccount(rpc, configPda)
        return true
      } catch (err) {
        return false
      }
    },
    enabled: !!account?.address,
    staleTime: 30_000,
  })
}

// -------------------------
// Function: Check if a beneficiary account exists for a given wallet address
// FIXED - Now requires configAddress parameter instead of using hook
// -------------------------
export async function checkBeneficiaryAccountExists(
  configAddress: Address,
  walletAddress: Address
): Promise<boolean> {
  const beneficiaryPda = await deriveBeneficiaryPda(configAddress, walletAddress)
  return fetchAccountExists(beneficiaryPda)
}

// -------------------------
// Hook: Add Beneficiary - FIXED VERSION
// -------------------------
export function useAddBeneficiaryMutation() {
  const queryClient = useQueryClient()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()
  const { data: fundsCycleData } = useFundsCycleData() // Hook called properly inside component

  return useMutation({
    mutationFn: async ({ wallet }: { wallet: Address }) => {
      if (!fundsCycleData) {
        throw new Error("FundsCycle data not loaded.")
      }
      if (!signer) {
        throw new Error("Wallet not connected.")
      }

      const beneficiaryExists = await checkBeneficiaryAccountExists(
        fundsCycleData.configPda,
        wallet
      )
      if (beneficiaryExists) {
        throw new Error("Beneficiary already exists for this wallet.")
      }

      const ix = await getAddBeneficiaryInstructionAsync({
        admin: signer,
        config: fundsCycleData.configPda,
        wallet,
      })

      return await signAndSend(ix, signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx, "✅ Beneficiary added")
      await queryClient.invalidateQueries({
        queryKey: ["beneficiaries", "config"],
      })
    },
    onError: (err: any) => {
      console.error(err)
      toast.error(err.message || "❌ Failed to add beneficiary")
    },
  })
}


// -------------------------
// Hook: Fetch Beneficiary Data
// -------------------------
export function useBeneficiaryData() {
    const { account: walletAccount } = useWalletUi() 
  return useQuery({
    queryKey: ["beneficiaryData", walletAccount?.address],
    queryFn: async () => {
      if (!walletAccount?.address) {
        return null
      }

      try {
        const walletAddress = expectAddress(walletAccount.address as Address)
        const discriminatorString = getBase58Codec().decode(BENEFICIARY_ACCOUNT_DISCRIMINATOR)
        const discriminatorBytes = discriminatorString as unknown as Base58EncodedBytes
        
        // Find beneficiary accounts for this wallet
        const accounts = await rpc.getProgramAccounts(FUNDS_CYCLE_PROGRAM_PROGRAM_ADDRESS, {
          encoding: 'base64',
          filters: [
            {
              memcmp: {
                offset: 0n,
                bytes: discriminatorBytes,
                encoding: 'base58',
              },
            },
            {
              memcmp: {
                offset: 40n, 
                bytes: walletAddress as unknown as Base58EncodedBytes,
                encoding: 'base58',
              },
            },
            {
              dataSize: BigInt(getBeneficiaryAccountSize()),
            },
          ],
        }).send()
        if (!accounts?.length || !accounts[0]?.account) {
          return null
        }


        const account = accounts[0]
        const [base64String] = account.account.data
        const decodedBytes = new Uint8Array(Buffer.from(base64String, 'base64'))

        const gillEncodedAccount = {
          address: account.pubkey,
          publicKey: account.pubkey,
          exists: true as const,
          executable: account.account.executable,
          owner: account.account.owner,
          lamports: account.account.lamports,
          rentEpoch: account.account.rentEpoch,
          data: decodedBytes,
          programAddress: account.account.owner,
          space: BigInt(account.account.space),
        }
        
        const beneficiaryAccount = decodeBeneficiaryAccount(gillEncodedAccount)
        if (!beneficiaryAccount || !('data' in beneficiaryAccount)) {
          throw new Error("Failed to decode beneficiary account")
        }

        const configPda = beneficiaryAccount.data.config
        const vaultPda = await deriveVaultPda(configPda)

        // Fetch config, vault data, and vault balance
        const [configAccountData, vaultAccountData, vaultBalanceResult] = await Promise.all([
          fetchConfigAccount(rpc, configPda),
          fetchVaultAccount(rpc, vaultPda),
          rpc.getBalance(vaultPda).send(),
        ])

        const vaultBalance = vaultBalanceResult.value

        return {
          config: configAccountData.data,
          vault: vaultAccountData.data,
          beneficiary: beneficiaryAccount.data,
          vaultBalance,
          configPda,
          vaultPda,
          vaultBalanceSOL: Number(vaultBalance) / 1_000_000_000,
          collateralAmountSOL: Number(configAccountData.data.collateralAmount) / 1_000_000_000,
          monthlyPayoutSOL: Number(configAccountData.data.monthlyPayout) / 1_000_000_000,
        }
      } catch (err) {
        console.error("Failed to fetch beneficiary data:", err)
        throw new Error(`Failed to fetch beneficiary data: ${err}`)
      }
    },
    enabled: !!walletAccount?.address,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
    retry: 2,
  })
}


// -------------------------
// Hook: Fetch all Beneficiary Accounts
// -------------------------
function isBeneficiaryAccount(
  account: BeneficiaryAccount | null
): account is BeneficiaryAccount {
  return account !== null;
}

export function useBeneficiariesQuery() {
  const { data: fundsCycleData } = useFundsCycleData()
  const { data: beneficiaryData } = useBeneficiaryData()
  

  const configAddress = fundsCycleData?.configPda || beneficiaryData?.configPda

  return useQuery<BeneficiaryAccount[]>({
    queryKey: ["beneficiaries", "config", configAddress],
    queryFn: async () => {
      if (!configAddress) {
        return []
      }

      try {
        const discriminatorString = getBase58Codec().decode(BENEFICIARY_ACCOUNT_DISCRIMINATOR)
        const discriminatorBytes = discriminatorString as unknown as Base58EncodedBytes
        const configBytes = configAddress as unknown as Base58EncodedBytes
        
        const accounts = await rpc.getProgramAccounts(FUNDS_CYCLE_PROGRAM_PROGRAM_ADDRESS, {
          encoding: 'base64', 
          filters: [
            {
              memcmp: {
                offset: 0n,
                bytes: discriminatorBytes,
                encoding: 'base58',
              },
            },
            {
              memcmp: {
                offset: 8n,
                bytes: configBytes,
                encoding: 'base58',
              },
            },
            {
              dataSize: BigInt(getBeneficiaryAccountSize()),
            },
          ],
        }).send()

        const beneficiariesWithNulls = accounts.map(account => {
          const [base64String] = account.account.data
          const decodedBytes = new Uint8Array(Buffer.from(base64String, 'base64'))

          const gillEncodedAccount = {
            address: account.pubkey,
            publicKey: account.pubkey,
            exists: true as const,
            executable: account.account.executable,
            owner: account.account.owner,
            lamports: account.account.lamports,
            rentEpoch: account.account.rentEpoch,
            data: decodedBytes,
            programAddress: account.account.owner,
            space: BigInt(account.account.space),
          }
          
          const maybeAccount = decodeBeneficiaryAccount(gillEncodedAccount)
          
          if (maybeAccount && 'data' in maybeAccount) {
            return maybeAccount.data
          }
          
          return null
        })

        return beneficiariesWithNulls.filter(isBeneficiaryAccount)

      } catch (error) {
        console.error("Failed to fetch beneficiaries:", error)
        return []
      }
    },
    enabled: !!configAddress,
    staleTime: 60_000,
  })
}

// -------------------------
// Hook: Deposit Collateral Mutation
// -------------------------
export function useDepositCollateralMutation() {
  const { cluster } = useWalletUi()
  const queryClient = useQueryClient()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()
  const { data: adminData } = useFundsCycleData()
  const { data: beneficiaryData } = useBeneficiaryData()
  
  const fundsCycleData = adminData || beneficiaryData

  return useMutation({
    mutationFn: async () => {
      if (!fundsCycleData) {
        throw new Error("FundsCycle data not loaded.")
      }
      if (!signer) {
        throw new Error("Wallet not connected.")
      }

      const ix = await getDepositCollateralInstructionAsync({
        wallet: signer,
        config: fundsCycleData.configPda,
        vault: fundsCycleData.vaultPda,
      })

      return await signAndSend(ix, signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx, `✅ Deposited ${fundsCycleData?.collateralAmountSOL} SOL as collateral`)
      
     
      await queryClient.invalidateQueries({
        queryKey: ["fundsCycleData"], 
      })
      await queryClient.invalidateQueries({
        queryKey: ["beneficiaryData"], 
      })
      await queryClient.invalidateQueries({
        queryKey: ["beneficiaries", "config"], 
      })
      await queryClient.invalidateQueries({
        queryKey: ["fundsCycle", "accounts", { cluster }],
      })
    },
    onError: (err: any) => {
      console.error("Deposit collateral error:", err)
      toast.error(err.message || "❌ Failed to deposit collateral")
    },
  })
}

export function useDepositMonthlyMutation() {
  const { cluster } = useWalletUi()
  const queryClient = useQueryClient()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()
  const { data: adminData } = useFundsCycleData()
  const { data: beneficiaryData } = useBeneficiaryData()
  
  const fundsCycleData = adminData || beneficiaryData

  return useMutation({
    mutationFn: async () => {
      if (!fundsCycleData) {
        throw new Error("FundsCycle data not loaded.")
      }
      if (!signer) {
        throw new Error("Wallet not connected.")
      }

      const ix = await getDepositMonthlyInstructionAsync({
        wallet: signer,
        config: fundsCycleData.configPda,
      })

      return await signAndSend(ix, signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx, `Deposited ${fundsCycleData?.monthlyPayoutSOL} SOL as monthly payout`)
      
      await queryClient.invalidateQueries({
        queryKey: ["fundsCycleData"], 
      })
      await queryClient.invalidateQueries({
        queryKey: ["beneficiaryData"], 
      })
      await queryClient.invalidateQueries({
        queryKey: ["beneficiaries", "config"], 
      })
      await queryClient.invalidateQueries({
        queryKey: ["fundsCycle", "accounts", { cluster }],
      })
    },
    onError: (err: any) => {
      console.error("Deposit monthly payout error:", err)
      toast.error(err.message || "Failed to deposit monthly payout")
    },
  })
}

// -------------------------
// Hook: Withdraw Mutation
// -------------------------
export function useWithdrawMutation() {
  const { cluster } = useWalletUi()
  const queryClient = useQueryClient()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()
  const { data: adminData } = useFundsCycleData()
  const { data: beneficiaryData } = useBeneficiaryData()
  
  const fundsCycleData = adminData || beneficiaryData

  return useMutation({
    mutationFn: async () => {
      if (!fundsCycleData) {
        throw new Error("FundsCycle data not loaded.")
      }
      if (!signer) {
        throw new Error("Wallet not connected.")
      }

      const beneficiaryExists = await checkBeneficiaryAccountExists(
        fundsCycleData.configPda,
        signer as unknown as Address 
      )
      if (!beneficiaryExists) {
        throw new Error("You are not a beneficiary of this FundsCycle.")
      }

      const ix = await getWithdrawInstructionAsync({
        wallet: signer,
        config: fundsCycleData.configPda,
      })

      return await signAndSend(ix, signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx, `Successfully withdrew ${fundsCycleData?.monthlyPayoutSOL} SOL`)
      
      
      await queryClient.invalidateQueries({
        queryKey: ["fundsCycleData"], 
      })
      await queryClient.invalidateQueries({
        queryKey: ["beneficiaryData"], 
      })
      await queryClient.invalidateQueries({
        queryKey: ["beneficiaries", "config"], 
      })
      await queryClient.invalidateQueries({
        queryKey: ["fundsCycle", "accounts", { cluster }],
      })
    },
    onError: (err: any) => {
      console.error("Withdraw error:", err)
      toast.error(err.message || "Failed to withdraw funds")
    },
  })
}

// -------------------------
// Hook: Claim Collateral Mutation
// -------------------------
export function useClaimCollateralMutation() {
  const { cluster } = useWalletUi()
  const queryClient = useQueryClient()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()
  const { data: adminData } = useFundsCycleData()
  const { data: beneficiaryData } = useBeneficiaryData()
  
  // Use data from either admin or beneficiary hook
  const fundsCycleData = adminData || beneficiaryData

  return useMutation({
    mutationFn: async () => {
      // Ensure we have the necessary data
      if (!fundsCycleData) {
        throw new Error("FundsCycle data not loaded.")
      }
      if (!signer) {
        throw new Error("Wallet not connected.")
      }

      // Check if the beneficiary account exists for this wallet
      const beneficiaryExists = await checkBeneficiaryAccountExists(
        fundsCycleData.configPda,
        signer as unknown as Address
      )
      if (!beneficiaryExists) {
        throw new Error("You are not a beneficiary of this FundsCycle.")
      }

      // Build the claim collateral instruction using the codama-generated function
      const ix = await getClaimCollateralInstructionAsync({
        signer: signer,
        config: fundsCycleData.configPda,
        // vault and beneficiary PDAs will be auto-derived by the instruction
      })

      // Sign and send the transaction
      return await signAndSend(ix, signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx, "Successfully claimed collateral")
      
      // Invalidate relevant queries to refresh the data
      await queryClient.invalidateQueries({
        queryKey: ["fundsCycleData"], // This will refresh admin data
      })
      await queryClient.invalidateQueries({
        queryKey: ["beneficiaryData"], // This will refresh beneficiary data
      })
      await queryClient.invalidateQueries({
        queryKey: ["beneficiaries", "config"], // This will refresh beneficiary status
      })
      await queryClient.invalidateQueries({
        queryKey: ["fundsCycle", "accounts", { cluster }],
      })
    },
    onError: (err: any) => {
      console.error("Claim collateral error:", err)
      toast.error(err.message || "Failed to claim collateral")
    },
  })
}

export function useExitMutation() {
  const { cluster } = useWalletUi()
  const queryClient = useQueryClient()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()
  const { data: fundsCycleData } = useFundsCycleData()

  return useMutation({
    mutationFn: async () => {
      if (!fundsCycleData) {
        throw new Error("FundsCycle data not loaded.")
      }
      if (!signer) {
        throw new Error("Wallet not connected.")
      }

      const ix = await getExitInstructionAsync({
        admin: signer,
        config: fundsCycleData.configPda,
      })

      return await signAndSend(ix, signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx, "✅ Successfully exited program and reclaimed remaining funds")
      
      await queryClient.invalidateQueries({
        queryKey: ["fundsCycleData"], 
      })
      await queryClient.invalidateQueries({
        queryKey: ["beneficiaries", "config"], 
      })
      await queryClient.invalidateQueries({
        queryKey: ["fundsCycle", "accounts", { cluster }],
      })
      await queryClient.invalidateQueries({
        queryKey: ["fundsCycleExists"], 
      })
    },
    onError: (err: any) => {
      console.error("Exit program error:", err)
      toast.error(err.message || "❌ Failed to exit program")
    },
  })
}

// -------------------------
// Hook: Punish Mutation
// -------------------------
export function usePunishMutation() {
  const { cluster } = useWalletUi()
  const queryClient = useQueryClient()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()
  const { data: fundsCycleData } = useFundsCycleData()

  return useMutation({
    mutationFn: async ({ beneficiaryAddress }: { beneficiaryAddress: Address }) => {
      if (!fundsCycleData) {
        throw new Error("FundsCycle data not loaded.")
      }
      if (!signer) {
        throw new Error("Wallet not connected.")
      }

      const beneficiaryPda = await deriveBeneficiaryPda(
        fundsCycleData.configPda,
        beneficiaryAddress
      )

      const ix = getPunishInstruction({
        admin: signer,
        config: fundsCycleData.configPda,
        beneficiary: beneficiaryPda,
      })

      return await signAndSend(ix, signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx, "✅ Beneficiary punished successfully")
      
      await queryClient.invalidateQueries({
        queryKey: ["beneficiaries", "config"], 
      })
      await queryClient.invalidateQueries({
        queryKey: ["fundsCycleData"],
      })
    },
    onError: (err: any) => {
      console.error("Punish beneficiary error:", err)
      toast.error(err.message || "❌ Failed to punish beneficiary")
    },
  })
}

// Export types for use in components
export type { ConfigAccount, VaultAccount, BeneficiaryAccount }