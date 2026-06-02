export interface UserWallet {
  walletBalance: number;
  investedBalance: number;
  withdrawnBalance: number;
  earnedBalance: number;
  accountNumber: string;
  fullName: string;
  email: string;
  referralCode: string;
  referralsCount: number;
  referralEarnings: number;
  isFlagged?: boolean;
  requireReferralToWithdraw?: boolean;
  hasClaimedBonus?: boolean;
  password?: string;
}

export interface InvestmentProduct {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  rate: number; // e.g. 0.15 for 15%
  termDays: number; // e.g. 3
  riskLevel: 'Low' | 'Moderate' | 'High';
  category: string;
}

export interface ActiveInvestment {
  id: string;
  productId: string;
  productName: string;
  amountInvested: number;
  startDate: number; // unix ms
  endDate: number; // unix ms
  lastAccrualTime: number; // last time interest was collected
  status: 'pending' | 'active' | 'matured' | 'withdrawn' | 'cancelled';
  totalAccrued: number; // how much has been generated so far
  expectedReturn: number; // standard 15% return amount
  isCompounding: boolean;
  userEmail?: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'invest' | 'payout' | 'refund';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: number; // unix ms
  reference: string;
  description: string;
  userEmail?: string;
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'agent' | 'admin';
  senderName: string;
  text: string;
  date: number;
}

export interface SupportTicket {
  id: string;
  userEmail: string;
  userFullName: string;
  category: string;
  subject: string;
  status: 'pending' | 'resolved';
  date: number;
  messages: TicketMessage[];
}

export interface DepositAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  isActive: boolean;
}
