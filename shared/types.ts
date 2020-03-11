export interface WalletUser {
  id: string;
  createdDate: number;
  initialized: boolean;
  displayName?: string;
  email?: string;
  defaultAccount?: string;
  hasPin: boolean;
}

export interface WalletUserUpdate {
  initialized?: boolean;
  displayName?: string;
  email?: string;
  defaultAccount?: string;
  hasPin?: boolean;
}

export interface UserPin {
  userId: string;
  salt: string;
  iterations: number;
  keyLength: number;
  digest: string;
  pinHash: string;
  createdAt: number;
}

export interface Account {
  id: string;
  appId: string;
  balanceUnlocked: number;
  balanceLocked: number;
  createdAt: number;
  deleted: boolean;
  paymentId: string;
  depositAddress: string;
  depositQrCode: string;
  withdrawAddress?: string;
  data?: any;
}

export type TransferType = 'deposit' | 'withdrawal' | 'account';

export interface PreparedTransaction {
  id: string;
  userId: string;
  accountId: string;
  transferType: TransferType;
  address: string;
  amount: number;
  fees: number;
  recipientAccountId?: string;
  preparedWithdrawalId?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  timestamp: number;
  transferType: TransferType;
  amount: number;
  fee: number;
  confirmed: boolean;
  failed: boolean;
  sendAddress?: string;
  depositId?: string;
  withdrawalId?: string;
  accountTransferId?: string;
  txHash?: string;
  paymentID?: string;
  extra?: string;
}

export interface TransactionUpdate {
  confirmed?: boolean;
  failed?: boolean;
  txHash?: string;
}

export interface PriceQuote {
  price: number;
  volume_24h: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  market_cap: number;
  last_updated: Date;
}

export interface Contact {
  id: string;
  createdDate: number;
  name: string;
  address: string;
  email?: string;
}

export type PriceTrend = 'up' | 'flat' | 'down';

export interface ResetPinRequest {
  id: string;
  userId: string;
  email: string;
  createdAt: number;
  expireTime: number;
  consumed: boolean;
}

export interface ResetPinRequestUpdate {
  consumed?: boolean;
}
