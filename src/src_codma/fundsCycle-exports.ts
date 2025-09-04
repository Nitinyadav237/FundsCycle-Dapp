// Central export file for the FundsCycle Anchor program

import { Account, Address, address, getBase58Decoder, SolanaClient } from 'gill'
import { SolanaClusterId } from '@wallet-ui/react'
import { getProgramAccountsDecoded } from './helpers/get-program-accounts-decoded'

// Import generated accounts
import {
  BeneficiaryAccount,
  BENEFICIARY_ACCOUNT_DISCRIMINATOR,
  getBeneficiaryAccountDecoder,

  ConfigAccount,
  CONFIG_ACCOUNT_DISCRIMINATOR,
  getConfigAccountDecoder,

  VaultAccount,
  VAULT_ACCOUNT_DISCRIMINATOR,
  getVaultAccountDecoder,

  FUNDS_CYCLE_PROGRAM_PROGRAM_ADDRESS,
} from "./client/js/index"

// import FundsCycleIDL from '../target/idl/funds_cycle_program.json'

// ----------------------
// Types
// ----------------------

export type Beneficiary = Account<BeneficiaryAccount, string>
export type Config = Account<ConfigAccount, string>
export type Vault = Account<VaultAccount, string>

// Re-export the generated IDL
// export { FundsCycleIDL }

// ----------------------
// Helpers
// ----------------------

// Program ID per cluster
export function getFundsCycleProgramId(cluster: SolanaClusterId) {
  switch (cluster) {
    case 'solana:devnet':
    case 'solana:testnet':
      return address('BAmKovDnmFfuvXASrEoRa115N3F4QEBCkjUQtRAvkpAj')
    case 'solana:mainnet':
    default:
      return FUNDS_CYCLE_PROGRAM_PROGRAM_ADDRESS
  }
}

// Fetch Beneficiary accounts
export function getBeneficiaryAccounts(rpc: SolanaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getBeneficiaryAccountDecoder(),
    filter: getBase58Decoder().decode(BENEFICIARY_ACCOUNT_DISCRIMINATOR),
    programAddress: FUNDS_CYCLE_PROGRAM_PROGRAM_ADDRESS,
  })
}

// Fetch Config accounts
export function getConfigAccounts(rpc: SolanaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getConfigAccountDecoder(),
    filter: getBase58Decoder().decode(CONFIG_ACCOUNT_DISCRIMINATOR),
    programAddress: FUNDS_CYCLE_PROGRAM_PROGRAM_ADDRESS,
  })
}


export * from './client/js'

// Fetch Vault accounts
export function getVaultAccounts(rpc: SolanaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getVaultAccountDecoder(),
    filter: getBase58Decoder().decode(VAULT_ACCOUNT_DISCRIMINATOR),
    programAddress: FUNDS_CYCLE_PROGRAM_PROGRAM_ADDRESS,
  })
}
