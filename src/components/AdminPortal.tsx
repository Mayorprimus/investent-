import { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  FileText, 
  Coins, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Activity, 
  AlertCircle, 
  Users, 
  Landmark, 
  Sliders,
  DollarSign,
  Headphones,
  MessageSquare,
  Plus,
  Trash,
  Send,
  User,
  ToggleRight,
  Eye,
  Gift
} from 'lucide-react';
import { formatNGN } from '../utils';
import { Transaction, ActiveInvestment, UserWallet, SupportTicket, DepositAccount, ReferralRelationship } from '../types';

interface CsChatMsg {
  sender: 'user' | 'agent' | 'admin';
  text: string;
  time: string;
}

interface AdminPortalProps {
  transactions: Transaction[];
  activeInvestments: ActiveInvestment[];
  wallet: UserWallet;
  simulatedTime: number;
  adminApprovalSettings: {
    requireDepositApproval: boolean;
    requireInvestmentApproval: boolean;
    requireWithdrawalApproval: boolean;
  };
  onSaveSettings: (settings: {
    requireDepositApproval: boolean;
    requireInvestmentApproval: boolean;
    requireWithdrawalApproval: boolean;
  }) => void;
  onApproveDeposit: (txId: string) => void;
  onDeclineDeposit: (txId: string) => void;
  onApproveWithdrawal: (txId: string) => void;
  onDeclineWithdrawal: (txId: string) => void;
  onApproveInvestment: (invId: string) => void;
  onDeclineInvestment: (invId: string) => void;
  onUpdateUserWallet: (updates: Partial<UserWallet>) => void;
  registeredUsers: UserWallet[];
  onSelectUser: (email: string) => void;

  // Escrow configuration props
  depositAccounts: DepositAccount[];
  onAddDepositAccount: (bankName: string, accountName: string, accountNumber: string) => void;
  onRemoveDepositAccount: (id: string) => void;
  onToggleDepositAccount: (id: string) => void;

  // Support tickets props
  csTickets: SupportTicket[];
  onReplyToTicket: (ticketId: string, text: string) => void;
  onUpdateTicketStatus: (ticketId: string, status: 'pending' | 'resolved') => void;

  // Direct Live Chat thread mapping
  userChatThreads: Record<string, CsChatMsg[]>;
  onSendAdminChat: (userEmail: string, text: string, role: 'admin' | 'agent') => void;
  referralsList: ReferralRelationship[];
  onApproveReferral: (refId: string) => void;
  onDeclineReferral: (refId: string) => void;
}

export default function AdminPortal({
  transactions,
  activeInvestments,
  wallet,
  simulatedTime,
  adminApprovalSettings,
  onSaveSettings,
  onApproveDeposit,
  onDeclineDeposit,
  onApproveWithdrawal,
  onDeclineWithdrawal,
  onApproveInvestment,
  onDeclineInvestment,
  onUpdateUserWallet,
  registeredUsers,
  onSelectUser,
  depositAccounts,
  onAddDepositAccount,
  onRemoveDepositAccount,
  onToggleDepositAccount,
  csTickets,
  onReplyToTicket,
  onUpdateTicketStatus,
  userChatThreads,
  onSendAdminChat,
  referralsList,
  onApproveReferral,
  onDeclineReferral
}: AdminPortalProps) {
  // Authentication states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('lafarge_admin_auth') === 'true';
  });
  const [loginError, setLoginError] = useState('');

  // Tab state inside admin portal
  const [adminTab, setAdminTab] = useState<'overview' | 'users' | 'deposits' | 'withdrawals' | 'investments' | 'settings' | 'cs' | 'deposit-accounts' | 'referrals'>('overview');

  // Shareholders directory state
  const [shareholderSearch, setShareholderSearch] = useState('');
  const [shareholderFilter, setShareholderFilter] = useState<'all' | 'active' | 'flagged'>('all');

  // Input editing states to manipulate user balances directly (for simulation and testing)
  const [editBalance, setEditBalance] = useState('');
  const [walletSuccessMsg, setWalletSuccessMsg] = useState('');

  // Customer Service / Ticketing States
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedUserEmailForChat, setSelectedUserEmailForChat] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [adminRole, setAdminRole] = useState<'admin' | 'agent'>('agent');
  const [supportMode, setSupportMode] = useState<'tickets' | 'chats'>('tickets');

  // Deposit Accounts Form States
  const [newBankName, setNewBankName] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [bankAddSuccess, setBankAddSuccess] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Specific Hardcoded Credentials requested is strictly email and password
    if (email.trim().toLowerCase() === 'admin1234@gmail.com' && password === 'admin1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('lafarge_admin_auth', 'true');
    } else {
      setLoginError('Access denied. Invalid corporate admin email or security token passphrase.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('lafarge_admin_auth');
  };

  // Login Guard View
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-xl animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#028A34] to-amber-500" />
        
        <div className="text-center space-y-3 mb-6">
          <div className="w-14 h-14 bg-red-55/15 rounded-2xl flex items-center justify-center mx-auto text-red-650 border border-red-100 shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-display font-black text-gray-950 text-xl tracking-tight uppercase">Admin Secure Vault</h3>
            <p className="text-xs text-gray-400 font-semibold leading-relaxed mt-1">
              Enter your corporate supervisor email and security token to manage shareholder ledgers & payout approvals.
            </p>
          </div>
        </div>

        {loginError && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-750 text-[11px] font-bold leading-relaxed mb-4 flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 font-sans">
          <div>
            <label className="block text-[10px] uppercase font-black text-gray-450 tracking-wider mb-1.5">
              Admin Corporate Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin1234@gmail.com"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-green-600 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-black text-gray-450 tracking-wider mb-1.5">
              Security Token Passphrase
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-green-600 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
            />
          </div>

          {/* Prompt Credentials for easy testing since we are in local development preview */}
          <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
            <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider block">🔑 LOCAL DEV ACCESS INFO</span>
            <p className="text-[10px] text-gray-500 leading-normal">
              Email: <strong className="text-gray-900">admin1234@gmail.com</strong><br />
              Password: <strong className="text-gray-900">admin1234</strong>
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-950 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Key className="w-4 h-4 text-amber-500" /> Authenticate Supervisor
          </button>
        </form>
      </div>
    );
  }

  // Derived statistics for overview tab
  const pendingDeposits = transactions.filter(tx => tx.type === 'deposit' && tx.status === 'pending');
  const pendingWithdrawals = transactions.filter(tx => tx.type === 'withdraw' && tx.status === 'pending');
  const pendingInvestments = activeInvestments.filter(inv => inv.status === 'pending');

  const completedDepositsTotal = transactions
    .filter(tx => tx.type === 'deposit' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const completedWithdrawalsTotal = transactions
    .filter(tx => tx.type === 'withdraw' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalCapitalInActiveDeploys = activeInvestments
    .filter(inv => inv.status === 'active')
    .reduce((sum, inv) => sum + inv.amountInvested, 0);

  const handleUpdateBalanceDirectly = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdjustBalance('set');
  };

  const handleAdjustBalance = (action: 'add' | 'remove' | 'set') => {
    const valFloat = parseFloat(editBalance);
    if (isNaN(valFloat) || valFloat < 0) {
      setWalletSuccessMsg('Please enter a valid non-negative amount.');
      return;
    }

    let nextBalance = wallet.walletBalance;
    if (action === 'add') {
      nextBalance = wallet.walletBalance + valFloat;
      onUpdateUserWallet({ walletBalance: nextBalance });
      setWalletSuccessMsg(`Credited +₦${formatNGN(valFloat)} directly to ${wallet.fullName}'s balance! New balance is ₦${formatNGN(nextBalance)}.`);
    } else if (action === 'remove') {
      nextBalance = Math.max(0, wallet.walletBalance - valFloat);
      onUpdateUserWallet({ walletBalance: nextBalance });
      setWalletSuccessMsg(`Deducted -₦${formatNGN(valFloat)} directly from ${wallet.fullName}'s balance! New balance is ₦${formatNGN(nextBalance)}.`);
    } else {
      nextBalance = valFloat;
      onUpdateUserWallet({ walletBalance: nextBalance });
      setWalletSuccessMsg(`Overrode ${wallet.fullName}'s balance absolutely to ₦${formatNGN(valFloat)}!`);
    }

    setEditBalance('');
    setTimeout(() => setWalletSuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="admin-portal-dashboard">
      
      {/* Banner Header */}
      <div className="border-b border-gray-150 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-150 px-3 py-1 rounded-full uppercase tracking-widest inline-block">
            🛡️ Supervisor Workspace
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-black text-gray-950 tracking-tight">Lafarge Africa Controlling Ledger</h2>
          <p className="text-sm text-gray-500 max-w-xl">
            Authorize deposits, verify investment packages, process withdrawals, or override shareholder capital credentials directly.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-900 border border-red-150 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          Secured Sign Out
        </button>
      </div>

      {/* Admin Horizontal Tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-105 pb-px">
        {[
          { id: 'overview', name: 'Executive Overview', count: 0, icon: Landmark },
          { id: 'users', name: 'Shareholders Directory', count: registeredUsers.length, icon: Users },
          { id: 'deposits', name: 'Deposit Approvals', count: pendingDeposits.length, icon: Coins },
          { id: 'investments', name: 'Package Allocations', count: pendingInvestments.length, icon: TrendingUp },
          { id: 'withdrawals', name: 'Withdrawal Approvals', count: pendingWithdrawals.length, icon: DollarSign },
          { id: 'referrals', name: 'Referral Approvals', count: referralsList ? referralsList.filter(r => r.status === 'pending').length : 0, icon: Gift },
          { id: 'cs', name: 'Live Message Desk', count: csTickets.filter(t => t.status === 'pending').length, icon: Headphones },
          { id: 'deposit-accounts', name: 'Deposit Escrow Channels', count: depositAccounts ? depositAccounts.filter(a => a.isActive).length : 0, icon: Landmark },
          { id: 'settings', name: 'Policy Rules', count: 0, icon: Sliders }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold font-sans cursor-pointer transition-all ${
                isSelected 
                  ? 'border-[#028A34] text-[#028A34]' 
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-black animate-pulse">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Admin Content Area */}
      {adminTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold block">Platform Active Shares</span>
              <span className="text-xl font-black font-mono text-gray-950 block">{formatNGN(totalCapitalInActiveDeploys)}</span>
              <span className="text-[10px] text-gray-400 font-bold leading-none flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-green-500 shrink-0" /> Currently yielding 15% daily
              </span>
            </div>

            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold block">Cum. Inflow Deposits</span>
              <span className="text-xl font-black font-mono text-[#028A34] block">{formatNGN(completedDepositsTotal)}</span>
              <span className="text-[10px] text-gray-400 font-bold leading-none">
                Excludes declined/failed transactions
              </span>
            </div>

            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold block">Processed Payouts</span>
              <span className="text-xl font-black font-mono text-red-700 block">{formatNGN(completedWithdrawalsTotal)}</span>
              <span className="text-[10px] text-gray-400 font-bold leading-none">
                Capital & referral dividend payouts
              </span>
            </div>

            <div className="bg-white border border-amber-200 bg-amber-50/20 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] text-amber-805 uppercase tracking-widest font-black block">Tasks Pending Review</span>
              <span className="text-xl font-black font-mono text-amber-700 block">
                {pendingDeposits.length + pendingWithdrawals.length + pendingInvestments.length} files
              </span>
              <span className="text-[10px] text-gray-400 font-bold leading-none">
                Inflow, outflow and share allocation holds
              </span>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* User Account Override Panel */}
            <div className="lg:col-span-5 bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
              <div className="flex gap-2.5 items-center">
                <Users className="w-5 h-5 text-[#028A34]" />
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Shareholder Account overrides</h4>
              </div>

              {/* Selector for specific users */}
              <div className="space-y-1.5 font-sans">
                <label className="block text-[10px] uppercase font-black text-gray-450 tracking-wider">
                  Select User Account to Manage:
                </label>
                <select
                  id="admin-user-selector"
                  value={wallet.email}
                  onChange={(e) => {
                    onSelectUser(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-green-600 transition-colors cursor-pointer"
                >
                  <option value="admin1234@gmail.com">
                    Corporate Admin (admin1234@gmail.com) • (Admin Office)
                  </option>
                  {registeredUsers.map((user) => (
                    <option key={user.email} value={user.email}>
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-105 rounded-xl space-y-3 font-sans text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Full Account Owner</span>
                  <span className="font-extrabold text-gray-900 text-sm block">{wallet.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Lafarge ID / Email</span>
                  <span className="font-semibold text-gray-650 font-mono block">{wallet.email}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-150">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 block">NUBAN Code</span>
                    <span className="font-bold text-gray-700 block font-mono">{wallet.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 block">Wallet Cash</span>
                    <span className="font-black text-gray-950 block font-mono">{formatNGN(wallet.walletBalance)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dashed border-slate-200">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 block">Active Referrals</span>
                    <span className="font-bold text-gray-750 block font-mono">{wallet.referralsCount} invited</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 block">Account Status</span>
                    <span className={`font-black text-[10px] uppercase tracking-wider block ${wallet.isFlagged ? 'text-red-650' : 'text-green-700'}`}>
                      {wallet.isFlagged ? '🔴 FLAGGED / FROZEN' : '🟢 ACTIVE / EARNING'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security & Override Rules */}
              <div className="space-y-3 pt-3 border-t border-gray-150 font-sans">
                <span className="text-[10px] uppercase font-black text-gray-450 tracking-wider block">Security & Payout Holds</span>
                
                {/* Override 1: Flag Account */}
                <div className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-red-950 block">Flag Account Outflows</span>
                    <span className="text-[10px] text-gray-400 block font-medium">Freezes all active withdraws</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="checkbox-flag-account"
                      type="checkbox"
                      checked={!!wallet.isFlagged}
                      onChange={(e) => onUpdateUserWallet({ isFlagged: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                {/* Override 2: Require 1 Referral to Withdraw */}
                <div className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-amber-955 block">Require 1 Ref to Withdraw</span>
                    <span className="text-[10px] text-gray-400 block font-medium">Enforces 1 invite rule</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="checkbox-require-ref-withdraw"
                      type="checkbox"
                      checked={!!wallet.requireReferralToWithdraw}
                      onChange={(e) => onUpdateUserWallet({ requireReferralToWithdraw: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {/* Override 3: Require Referral to Deposit to Withdraw */}
                <div className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-indigo-950 block">Require Referral Deposit</span>
                    <span className="text-[10px] text-gray-400 block font-medium">A referral must deposit for them to withdraw</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="checkbox-require-ref-deposit-withdraw"
                      type="checkbox"
                      checked={!!wallet.requireReferralDepositToWithdraw}
                      onChange={(e) => onUpdateUserWallet({ requireReferralDepositToWithdraw: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {walletSuccessMsg && (
                <div className="p-3 bg-green-50 border border-green-150 rounded-xl text-green-700 text-xs font-bold leading-relaxed">
                  {walletSuccessMsg}
                </div>
              )}

              {/* Direct manual balance adjustments */}
              <div className="space-y-3 font-sans">
                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">Adjust Wallet Balance (Naira)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-gray-450 font-bold font-mono">₦</span>
                    <input
                      id="input-admin-adjust-amount"
                      type="number"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full pl-8 pr-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-green-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-admin-add-funds"
                    type="button"
                    onClick={() => handleAdjustBalance('add')}
                    className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    ➕ Credit / Add Funds
                  </button>
                  <button
                    id="btn-admin-remove-funds"
                    type="button"
                    onClick={() => handleAdjustBalance('remove')}
                    className="py-2.5 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    ➖ Debit / Remove
                  </button>
                </div>

                <button
                  id="btn-admin-set-absolute"
                  type="button"
                  onClick={() => handleAdjustBalance('set')}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Set Absolute Override (₦)
                </button>
              </div>
            </div>

            {/* Quick Pending Items Lists Summaries */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" /> Pending Files For Immediate Review
                  </h4>
                  <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                    {pendingDeposits.length + pendingWithdrawals.length + pendingInvestments.length} Total holds
                  </span>
                </div>

                <div className="space-y-3.5">
                  {pendingDeposits.length === 0 && pendingWithdrawals.length === 0 && pendingInvestments.length === 0 ? (
                    <div className="py-6 text-center text-gray-400 font-semibold text-xs space-y-1">
                      <p>✨ Platform operations are 100% synchronized.</p>
                      <p className="text-[10px] text-gray-400">All shareholder deposit, withdraw & package contracts are approved and active.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 font-sans text-xs">
                      {pendingDeposits.map((tx) => (
                        <div key={tx.id} className="p-3 bg-amber-50/20 border border-amber-100 rounded-xl flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-black tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">DEPOSIT GATE HOLD</span>
                            <div className="font-black text-gray-950 font-mono">{formatNGN(tx.amount)}</div>
                            <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">{tx.description}</p>
                          </div>
                          <button
                            onClick={() => setAdminTab('deposits')}
                            className="p-2 hover:bg-amber-100 rounded-lg text-amber-800 font-black cursor-pointer uppercase text-[9px] tracking-wider flex items-center gap-1 border border-amber-200"
                          >
                            Review <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {pendingInvestments.map((inv) => (
                        <div key={inv.id} className="p-3 bg-amber-50/20 border border-amber-100 rounded-xl flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-black tracking-wider text-green-800 bg-green-50 px-2 py-0.5 rounded border border-green-200">PACKAGE OPTION ACTIVATE HOLD</span>
                            <div className="font-black text-gray-950 font-mono">{formatNGN(inv.amountInvested)}</div>
                            <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">{inv.productName} Option Lock</p>
                          </div>
                          <button
                            onClick={() => setAdminTab('investments')}
                            className="p-2 hover:bg-amber-100 rounded-lg text-amber-800 font-black cursor-pointer uppercase text-[9px] tracking-wider flex items-center gap-1 border border-amber-200"
                          >
                            Review <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {pendingWithdrawals.map((tx) => (
                        <div key={tx.id} className="p-3 bg-amber-50/20 border border-amber-100 rounded-xl flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-black tracking-wider text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-200">WITHDRAW PAYOUT CAPTURE</span>
                            <div className="font-black text-gray-950 font-mono">{formatNGN(tx.amount)}</div>
                            <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">{tx.description}</p>
                          </div>
                          <button
                            onClick={() => setAdminTab('withdrawals')}
                            className="p-2 hover:bg-amber-100 rounded-lg text-amber-800 font-black cursor-pointer uppercase text-[9px] tracking-wider flex items-center gap-1 border border-amber-200"
                          >
                            Review <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* Shareholders directory view */}
      {adminTab === 'users' && (
        <div className="space-y-6 animate-fade-in" id="admin-shareholders-directory">
          <div className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-105">
              <div>
                <h3 className="text-lg font-bold text-gray-950 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#028A34]" /> Shareholders Directory
                </h3>
                <p className="text-xs text-gray-400 font-medium font-sans">Verify credentials, review active wallets, manage status overrides, or search accounts for the live platform.</p>
              </div>
              <span className="text-[10px] font-black uppercase text-green-800 bg-green-50 border border-green-150 px-2.5 py-1 rounded-md self-start sm:self-center font-mono">
                {registeredUsers.length} total shareholders
              </span>
            </div>

            {/* Filter and Search Box */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Query by Name, Email address or Account Code..."
                  value={shareholderSearch}
                  onChange={(e) => setShareholderSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-green-600 focus:bg-white bg-slate-50 transition-colors"
                />
                <User className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
              </div>
              
              <div className="flex gap-2">
                {(['all', 'active', 'flagged'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setShareholderFilter(mode)}
                    className={`px-3 py-1.5 border rounded-xl text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer ${
                      shareholderFilter === mode
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-slate-50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Shareholders Grid / List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50 text-[10px] uppercase font-black text-gray-400">
                    <th className="py-3 px-4">Account Holder</th>
                    <th className="py-3 px-4">Direct Banking Ledger (NUBAN)</th>
                    <th className="py-3 px-4 text-right">Wallet Capital</th>
                    <th className="py-3 px-4 text-right">In Share Packs</th>
                    <th className="py-3 px-4 text-right">Cum. Payouts</th>
                    <th className="py-3 px-4 text-center">Security Status</th>
                    <th className="py-3 px-4 text-center">Platform Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {registeredUsers
                    .filter((u) => {
                      const query = shareholderSearch.toLowerCase().trim();
                      const matchQuery = !query || u.fullName.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || (u.accountNumber && u.accountNumber.toLowerCase().includes(query));
                      const matchFilter = shareholderFilter === 'all' || 
                                          (shareholderFilter === 'active' && !u.isFlagged) || 
                                          (shareholderFilter === 'flagged' && u.isFlagged);
                      return matchQuery && matchFilter;
                    })
                    .map((usr) => {
                      const isCurrentlyManaged = wallet.email.toLowerCase() === usr.email.toLowerCase();
                      return (
                        <tr key={usr.email} className={`hover:bg-slate-50/50 transition-colors ${isCurrentlyManaged ? 'bg-green-50/20' : ''}`}>
                          <td className="py-3.5 px-4 space-y-0.5">
                            <span className="font-extrabold text-slate-900 text-xs block">{usr.fullName}</span>
                            <span className="font-medium text-gray-400 text-[10px] lowercase font-mono block">{usr.email}</span>
                            {usr.referredBy && (
                              <span className="text-[9px] uppercase font-bold text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-150 inline-block font-mono">Ref code: {usr.referralCode}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 space-y-0.5 font-semibold text-slate-700">
                            <span className="font-mono block text-xs">{usr.accountNumber ? usr.accountNumber.split('|')[0] : 'N/A'}</span>
                            <span className="text-[10px] text-gray-400 block uppercase tracking-wider">{usr.accountNumber ? usr.accountNumber.split('|')[1] || 'Main Bank' : 'N/A'}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-black font-mono text-[#028A34] text-xs">
                            {formatNGN(usr.walletBalance)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold font-mono text-amber-700 text-xs">
                            {formatNGN(usr.investedBalance || 0)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold font-mono text-rose-700 text-xs">
                            {formatNGN(usr.withdrawnBalance || 0)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                              usr.isFlagged
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {usr.isFlagged ? '🔴 FROZEN' : '🟢 ACTIVE'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => {
                                  onSelectUser(usr.email);
                                  setAdminTab('overview');
                                }}
                                className={`px-2.5 py-1 text-[10px] uppercase font-black rounded-lg transition-all border cursor-pointer ${
                                  isCurrentlyManaged
                                    ? 'bg-[#028A34] border-[#028A34] text-white'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-slate-50'
                                }`}
                              >
                                {isCurrentlyManaged ? 'Active Override' : 'Override Balance'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {registeredUsers.filter((u) => {
                const query = shareholderSearch.toLowerCase().trim();
                const matchQuery = !query || u.fullName.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || (u.accountNumber && u.accountNumber.toLowerCase().includes(query));
                const matchFilter = shareholderFilter === 'all' || 
                                    (shareholderFilter === 'active' && !u.isFlagged) || 
                                    (shareholderFilter === 'flagged' && u.isFlagged);
                return matchQuery && matchFilter;
              }).length === 0 && (
                <div className="text-center py-12 px-6 max-w-sm mx-auto space-y-1">
                  <Users className="w-8 h-8 text-gray-350 block mx-auto text-center" />
                  <h4 className="font-bold text-gray-900 text-xs">No shareholders match search filters</h4>
                  <p className="text-[10px] text-gray-400">Try checking spelling or adjusting Active/Flagged filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Referrals Tab Queue */}
      {adminTab === 'referrals' && (
        <div className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-6 animate-fade-in" id="admin-referrals-tab">
          <div>
            <h3 className="text-lg font-bold text-gray-950">Referral Program Auditing</h3>
            <p className="text-xs text-gray-400 font-medium font-sans">Verify promotional signup referrals. Approving a referral will credit the respective referrer with their ₦500.00 booster reward.</p>
          </div>

          {!referralsList || referralsList.length === 0 ? (
            <div className="text-center py-12 px-6 max-w-sm mx-auto space-y-2">
              <Gift className="w-10 h-10 text-emerald-600 block mx-auto animate-pulse" />
              <h4 className="font-bold text-gray-900 text-sm">No referrals tracked yet</h4>
              <p className="text-xs text-gray-400 font-sans">Any brand-new signups containing specified active promo codes will register here for supervisor review.</p>
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-gray-100">
              {referralsList.map((ref) => (
                <div key={ref.id} className="pt-4 first:pt-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-sans text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 border border-amber-150 text-amber-700 rounded-md">
                        REWARD: ₦{formatNGN(ref.amount)}
                      </span>
                      <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-md tracking-wider border ${
                        ref.status === 'approved' 
                          ? 'bg-green-50 text-green-700 border-green-150' 
                          : ref.status === 'rejected'
                          ? 'bg-red-50 text-red-650 border-red-150'
                          : 'bg-yellow-50 text-yellow-750 border-yellow-150 animate-pulse'
                      }`}>
                        {ref.status}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">ID: {ref.id}</span>
                    </div>

                    <div className="space-y-0.5 text-gray-600 font-semibold text-[11px]">
                      <p>
                        Referrer Email: <strong className="text-gray-900 font-bold">{ref.referrerEmail}</strong>
                        <span className="ml-1 font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold">[{ref.referrerCode}]</span>
                      </p>
                      <p>
                        Referred Sign-up: <strong className="text-green-700 font-extrabold">{ref.referredName}</strong> ({ref.referredEmail})
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono font-bold leading-none mt-1">Date Registered: {new Date(ref.date).toLocaleString()}</p>
                    </div>
                  </div>

                  {ref.status === 'pending' && (
                    <div className="flex items-center gap-2 w-full md:w-auto self-end md:self-center shrink-0">
                      <button
                        onClick={() => onDeclineReferral(ref.id)}
                        className="flex-1 md:flex-initial px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-150 text-red-700 hover:text-red-950 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Reject referral
                      </button>
                      <button
                        onClick={() => onApproveReferral(ref.id)}
                        className="flex-1 md:flex-initial px-5 py-2.5 bg-[#028A34] hover:bg-green-800 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-green-150"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve & Credit Row
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deposits Tab Queue */}
      {adminTab === 'deposits' && (
        <div className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-bold text-gray-950">Deposit Approvals Pipeline</h3>
            <p className="text-xs text-gray-400 font-medium">Verify bank receipts or Paystack triggers, then release Naira capital balance credits to shareholder ledgers.</p>
          </div>

          {pendingDeposits.length === 0 ? (
            <div className="text-center py-12 px-6 max-w-sm mx-auto space-y-2">
              <CheckCircle className="w-10 h-10 text-green-600 block mx-auto animate-bounce" />
              <h4 className="font-bold text-gray-900 text-sm">Deposit queue empty</h4>
              <p className="text-xs text-gray-400 leading-relaxed">No deposit verifications are currently outstanding. Shareholders get credited automatically if manual policy override settings are toggled 'Off'.</p>
            </div>
          ) : (
            <div className="space-y-4 font-sans justify-normal">
              {pendingDeposits.map((tx) => (
                <div key={tx.id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:bg-slate-50/80">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-100 border border-amber-150 text-amber-800 uppercase font-black text-[9px] tracking-wider rounded">Pending Review</span>
                      <span className="text-[10px] font-mono text-gray-400 font-black">{tx.reference}•{new Date(tx.date).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black font-mono text-gray-950">{formatNGN(tx.amount)}</span>
                      <span className="text-xs text-[#028A34] font-black uppercase tracking-wider">Fund Upgrade Direct Credit</span>
                    </div>
                    <p className="text-xs text-gray-550 leading-relaxed font-semibold">{tx.description}</p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2.5 w-full md:w-auto self-end md:self-center shrink-0">
                    <button
                      onClick={() => onDeclineDeposit(tx.id)}
                      className="flex-1 md:flex-initial px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-150 text-red-700 hover:text-red-950 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Reject & Fail
                    </button>
                    <button
                      onClick={() => onApproveDeposit(tx.id)}
                      className="flex-1 md:flex-initial px-5 py-2.5 bg-[#028A34] hover:bg-green-800 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-green-150"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve Deposit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Investments Tab Queue */}
      {adminTab === 'investments' && (
        <div className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-bold text-gray-950">Corporative Option Allocations</h3>
            <p className="text-xs text-gray-400 font-medium">Underwrite package investment applications. Approved allocations will start accumulating the 15% daily dividends instantly.</p>
          </div>

          {pendingInvestments.length === 0 ? (
            <div className="text-center py-12 px-6 max-w-sm mx-auto space-y-2">
              <CheckCircle className="w-10 h-10 text-green-600 block mx-auto animate-bounce" />
              <h4 className="font-bold text-gray-900 text-sm">Package queue empty</h4>
              <p className="text-xs text-gray-400 leading-relaxed">All ongoing shareholder purchases have been allocated. New package activations are ready to proceed with standard dividends.</p>
            </div>
          ) : (
            <div className="space-y-4 font-sans justify-normal">
              {pendingInvestments.map((inv) => (
                <div key={inv.id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:bg-slate-50/80">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-100 border border-amber-150 text-amber-800 uppercase font-black text-[9px] tracking-wider rounded">Awaiting Placement</span>
                      <span className="text-[10px] font-mono text-gray-400 font-bold">INV-ID: {inv.id}</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black font-mono text-gray-950">{formatNGN(inv.amountInvested)}</span>
                      <span className="text-xs text-emerald-805 font-extrabold uppercase tracking-widest">{inv.productName} Option Lock</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider pt-1 border-t border-slate-105">
                      <div>
                        Daily Profit Potential: <strong className="text-[#028A34] block">+{formatNGN(inv.amountInvested * 0.10)}/day</strong>
                      </div>
                      <div>
                        Maturity: <strong className="text-gray-700 block">4 Days</strong>
                      </div>
                      <div>
                        Expected Return: <strong className="text-gray-700 block">{formatNGN(inv.expectedReturn)}</strong>
                      </div>
                      <div>
                        Auto Compounds <strong className="text-gray-700 block">{inv.isCompounding ? 'YES' : 'NO'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2.5 w-full md:w-auto self-end md:self-center shrink-0">
                    <button
                      onClick={() => onDeclineInvestment(inv.id)}
                      className="flex-1 md:flex-initial px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-150 text-red-700 hover:text-red-950 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Decline & Refund
                    </button>
                    <button
                      onClick={() => onApproveInvestment(inv.id)}
                      className="flex-1 md:flex-initial px-5 py-2.5 bg-[#028A34] hover:bg-green-800 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-green-150"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve Option Active
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Withdrawals Tab Queue */}
      {adminTab === 'withdrawals' && (
        <div className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-bold text-gray-950">Withdrawal Payout Approvals</h3>
            <p className="text-xs text-gray-400 font-medium font-sans">Payout triggers captured on client-side bank transfers. Ensure the simulated platform time meets daily windows, then authorize direct payout releases.</p>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <div className="text-center py-12 px-6 max-w-sm mx-auto space-y-2">
              <CheckCircle className="w-10 h-10 text-green-600 block mx-auto animate-bounce" />
              <h4 className="font-bold text-gray-900 text-sm">Payout queue empty</h4>
              <p className="text-xs text-gray-400 leading-relaxed">No withdrawal requests are currently outstanding. Shareholders receive funds immediately inside their specified virtual NUBAN router upon approval.</p>
            </div>
          ) : (
            <div className="space-y-4 font-sans justify-normal">
              {pendingWithdrawals.map((tx) => (
                <div key={tx.id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:bg-slate-50/80">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-red-100 border border-red-150 text-red-800 uppercase font-black text-[9px] tracking-wider rounded">Awaiting Approval</span>
                      <span className="text-[10px] font-mono text-gray-400 font-bold">REF: {tx.reference}</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black font-mono text-gray-950">{formatNGN(tx.amount)}</span>
                      <span className="text-xs text-red-700 font-bold uppercase tracking-widest">Payout Exit Transfer</span>
                    </div>
                    <p className="text-xs text-gray-550 leading-relaxed font-semibold">{tx.description}</p>
                    <div className="p-2.5 bg-white border border-gray-150 rounded-lg text-[10px] text-gray-500 font-semibold space-y-0.5">
                      <div>Receiving Account: <strong className="text-gray-900 font-bold">{wallet.fullName} ({wallet.accountNumber})</strong></div>
                      <div>Requested on platform time: <strong className="text-gray-900 font-bold">{new Date(tx.date).toLocaleString()}</strong></div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2.5 w-full md:w-auto self-end md:self-center shrink-0">
                    <button
                      onClick={() => onDeclineWithdrawal(tx.id)}
                      className="flex-1 md:flex-initial px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-150 text-red-700 hover:text-red-950 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Decline & Refund Wallet
                    </button>
                    <button
                      onClick={() => onApproveWithdrawal(tx.id)}
                      className="flex-1 md:flex-initial px-5 py-2.5 bg-[#028A34] hover:bg-green-800 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-green-150"
                    >
                      <CheckCircle className="w-4 h-4" /> Verify & Authorize Payout
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Policy Rules & Platform Settings Tab */}
      {adminTab === 'settings' && (
        <div className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-6 animate-fade-in font-sans">
          <div>
            <h3 className="text-lg font-bold text-gray-950">Corporate Policy Settings Override</h3>
            <p className="text-xs text-gray-400 font-medium">Dynamically toggle between immediate self-approving client behaviors and strict corporate manual supervisor locks.</p>
          </div>

          <div className="space-y-4">
            
            {/* Setting 1: Deposits Rule */}
            <div className="flex items-center justify-between p-4 border border-emerald-150 bg-emerald-50/20 rounded-2xl">
              <div className="space-y-0.5 max-w-sm sm:max-w-md pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-950 block">Require Strict Deposit Approval</span>
                  <span className="text-[9px] uppercase font-bold text-white bg-[#028A34] px-2 py-0.5 rounded-full font-mono">Enforced Live Policy</span>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold leading-normal">
                  All Paystack and bank transfer deposits go into the pending queue. Corporate supervisors must verify receipts manually. This rule is locked to guarantee platform audit compliance.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-[#028A34] rounded-full after:translate-x-full after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            {/* Setting 2: Investments Rule */}
            <div className="flex items-center justify-between p-4 border border-emerald-150 bg-emerald-50/20 rounded-2xl">
              <div className="space-y-0.5 max-w-sm sm:max-w-md pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-950 block">Require Share Allocation Approval</span>
                  <span className="text-[9px] uppercase font-bold text-white bg-[#028A34] px-2 py-0.5 rounded-full font-mono">Enforced Live Policy</span>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold leading-normal">
                  Newly acquired investment packages must be manually underwritten by a corporate supervisor before acquiring active interest yields. This rule is locked to guarantee platform audit compliance.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-[#028A34] rounded-full after:translate-x-full after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            {/* Setting 3: Withdrawal Rule */}
            <div className="flex items-center justify-between p-4 border border-emerald-150 bg-emerald-50/20 rounded-2xl">
              <div className="space-y-0.5 max-w-sm sm:max-w-md pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-950 block">Require Strict Payout Withdrawal Review</span>
                  <span className="text-[9px] uppercase font-bold text-white bg-[#028A34] px-2 py-0.5 rounded-full font-mono">Enforced Live Policy</span>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold leading-normal">
                  All bank withdrawal payout claims are parked under pending queues for direct supervision reviews. They will never fire or clear instantly to secure institutional transparency.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-[#028A34] rounded-full after:translate-x-full after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

          </div>

          <div className="p-4 bg-[#028A34]/5 border border-[#028A34]/15 rounded-2xl space-y-2">
            <span className="text-xs font-black text-[#028A34]">💡 Testing Guideline</span>
            <p className="text-xs text-gray-550 leading-relaxed font-semibold">
              By default, all approvals can be toggled <strong className="text-zinc-900">On</strong> or <strong className="text-zinc-500">Off</strong> in real-time. Want to test how a user's experience feels when their deposit is locked? Just toggle <strong>Require Strict Deposit Approval</strong> to <span className="text-green-700 font-black font-mono">ON</span> here, switch back to the Portfolio tab, trigger a Deposit, and watch it request verification. Then, return to Admin Portal to approve it!
            </p>
          </div>
        </div>
      )}

      {/* Customer Service / Messaging Desk */}
      {adminTab === 'cs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in font-sans">
          
          {/* Support Mode Controller Header */}
          <div className="col-span-12 bg-white border border-gray-150 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs text-left">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Headphones className="w-5 h-5 text-[#028A34]" /> 
                Client Relations Communications Hub
              </h3>
              <p className="text-xs text-gray-400 font-medium font-sans">Coordinate live client messages individually or review formalized priority help tickets.</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => { setSupportMode('tickets'); setSelectedTicketId(null); setSelectedUserEmailForChat(null); }}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  supportMode === 'tickets'
                    ? 'bg-green-50 text-green-800 border-green-200 font-extrabold shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:text-gray-800'
                }`}
              >
                🎟️ Support Ticket Queue ({csTickets.length})
              </button>
              <button
                onClick={() => { setSupportMode('chats'); setSelectedTicketId(null); setSelectedUserEmailForChat(null); }}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  supportMode === 'chats'
                    ? 'bg-green-50 text-green-800 border-green-200 font-extrabold shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:text-gray-800'
                }`}
              >
                💬 User Direct Chats ({Object.keys(userChatThreads || {}).length})
              </button>
            </div>
          </div>

          {/* Left panel selector list */}
          <div className="lg:col-span-5 bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs h-[500px] flex flex-col">
            <div className="bg-slate-50 border-b border-gray-150 p-4 font-bold text-xs uppercase tracking-wider text-slate-600 flex justify-between items-center shrink-0">
              <span>{supportMode === 'tickets' ? 'Priority Support Tickets' : 'Active Shareholder Chats'}</span>
              <span className="px-2 py-0.5 bg-gray-200 text-gray-750 font-mono text-[10px] rounded-full font-black">
                {supportMode === 'tickets' ? csTickets.filter(t => t.status === 'pending').length + ' Pending' : registeredUsers.length + ' Total'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-1 bg-slate-50/20">
              {supportMode === 'tickets' ? (
                csTickets.map((t) => {
                  const isSelected = selectedTicketId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer gap-2 flex flex-col ${
                        isSelected 
                          ? 'bg-green-50/50 border-green-250 shadow-xs' 
                          : 'bg-white border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-black">{t.id}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          t.status === 'resolved'
                            ? 'bg-green-100 text-green-850'
                            : 'bg-rose-100 text-rose-800 animate-pulse'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 line-clamp-1 leading-tight">{t.subject}</h4>
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <span className="text-emerald-700">{t.category}</span>
                        <span className="text-gray-500 font-semibold">{t.userFullName || 'Guest'}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                registeredUsers.map((usr) => {
                  const chatLogs = userChatThreads[usr.email.toLowerCase()] || [];
                  const isSelected = selectedUserEmailForChat?.toLowerCase() === usr.email.toLowerCase();
                  const lastMsg = chatLogs[chatLogs.length - 1];

                  return (
                    <button
                      key={usr.email}
                      onClick={() => setSelectedUserEmailForChat(usr.email)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer gap-2 flex flex-col ${
                        isSelected 
                          ? 'bg-green-50/50 border-green-250 shadow-xs' 
                          : 'bg-white border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs font-black text-gray-800">{usr.fullName}</span>
                        <span className="text-[9px] font-bold text-gray-400 font-mono italic">{usr.email}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-semibold line-clamp-1 italic">
                        {lastMsg ? `"${lastMsg.text}"` : 'No messages securely transmitted.'}
                      </p>
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-450">
                        <span className="text-[#028A34]">Bal: ₦{formatNGN(usr.walletBalance)}</span>
                        <span>{chatLogs.length} messages</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel message display */}
          <div className="lg:col-span-7 bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs h-[500px] flex flex-col">
            
            {/* If support mode is ticket and a ticket is selected */}
            {supportMode === 'tickets' && selectedTicketId ? (() => {
              const ticket = csTickets.find(t => t.id === selectedTicketId);
              if (!ticket) return null;
              return (
                <div className="flex flex-col h-full overflow-hidden text-left">
                  {/* Topic Header */}
                  <div className="bg-slate-50 border-b border-gray-150 p-4 flex justify-between items-center shrink-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[#028A34]">{ticket.category}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] font-mono text-gray-400">{ticket.id}</span>
                      </div>
                      <h4 className="text-xs font-black text-gray-950 mt-1 leading-snug">{ticket.subject}</h4>
                    </div>
                    
                    {/* Status Toggle buttons */}
                    <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl">
                      <button
                        onClick={() => onUpdateTicketStatus(ticket.id, 'resolved')}
                        className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                          ticket.status === 'resolved'
                            ? 'bg-[#028A34] text-white'
                            : 'bg-white text-gray-400 hover:text-gray-800'
                        }`}
                      >
                        Resolved
                      </button>
                      <button
                        onClick={() => onUpdateTicketStatus(ticket.id, 'pending')}
                        className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                          ticket.status === 'pending'
                            ? 'bg-rose-500 text-white'
                            : 'bg-white text-gray-400 hover:text-gray-800'
                        }`}
                      >
                        Pending
                      </button>
                    </div>
                  </div>

                  {/* Ticket messages scroll list */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30 flex flex-col">
                    <div className="bg-[#028A34]/5 border border-[#028A34]/10 rounded-xl p-3.5 text-xs leading-normal space-y-1">
                      <span className="text-[10px] font-black text-[#028A34] uppercase tracking-wider block">🚨 Shareholder Initial Prompt Inquiry</span>
                      <p className="font-extrabold text-slate-800 font-sans">"{ticket.subject}"</p>
                      <span className="block text-[8px] text-gray-400 font-mono font-bold leading-none mt-1">
                        Opened on {new Date(ticket.date).toLocaleString()} by {ticket.userFullName} ({ticket.userEmail})
                      </span>
                    </div>

                    {ticket.messages && ticket.messages.map((m) => (
                      <div 
                        key={m.id}
                        className={`flex flex-col max-w-[85%] ${
                          m.sender === 'user' ? 'self-start items-start' : 'self-end items-end'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-450 mb-1 leading-none">{m.senderName}</span>
                        <div className={`px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs ${
                          m.sender === 'user'
                            ? 'bg-white border border-gray-150 text-slate-900 rounded-tl-none'
                            : 'bg-[#028A34] text-white rounded-tr-none'
                        }`}>
                          {m.text}
                        </div>
                        <span className="text-[8px] text-gray-400 mt-1 px-1 font-mono">{new Date(m.date).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Submit Reply form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!replyInput.trim()) return;
                      onReplyToTicket(ticket.id, replyInput);
                      setReplyInput('');
                    }}
                    className="p-4 border-t border-gray-150 bg-white flex gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-green-500"
                      placeholder={`Send official reply to ${ticket.userFullName}...`}
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!replyInput.trim()}
                      className="px-5 py-2.5 bg-[#028A34] text-white hover:bg-green-800 transition-all font-bold text-xs rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      Reply <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              );
            })() : supportMode === 'chats' && selectedUserEmailForChat ? (() => {
              const chatLogs = userChatThreads[selectedUserEmailForChat.toLowerCase()] || [];
              const userObj = registeredUsers.find(u => u.email.toLowerCase() === selectedUserEmailForChat.toLowerCase());
              
              return (
                <div className="flex flex-col h-full overflow-hidden text-left">
                  {/* Chat User Details Header */}
                  <div className="bg-slate-50 border-b border-gray-150 p-4 flex justify-between items-center shrink-0">
                    <div>
                      <h4 className="text-xs font-black text-gray-950 flex items-center gap-1.5 leading-none">
                        <User className="w-4 h-4 text-[#028A34]" />
                        {userObj ? userObj.fullName : selectedUserEmailForChat}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold block leading-none">
                        Active live session thread for: {selectedUserEmailForChat}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white border border-gray-200 p-1 rounded-xl text-[9px] font-extrabold uppercase">
                      <span className="text-slate-400 pl-1 uppercase font-black text-[8px]">As:</span>
                      <button
                        onClick={() => setAdminRole('agent')}
                        className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                          adminRole === 'agent' ? 'bg-[#028A34] text-white' : 'hover:bg-slate-50 text-gray-500'
                        }`}
                      >
                        Blessing
                      </button>
                      <button
                        onClick={() => setAdminRole('admin')}
                        className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                          adminRole === 'admin' ? 'bg-green-800 text-white' : 'hover:bg-slate-50 text-gray-500'
                        }`}
                      >
                        Corporate Admin
                      </button>
                    </div>
                  </div>

                  {/* Direct chat scroll pane */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30 flex flex-col font-sans">
                    {chatLogs.map((m, idx) => (
                      <div 
                        key={idx}
                        className={`flex flex-col max-w-[85%] ${
                          m.sender === 'user' ? 'self-start items-start' : 'self-end items-end'
                        }`}
                      >
                        <span className="text-[9px] font-bold text-slate-400 mb-1 leading-none">
                          {m.sender === 'user' ? (userObj ? userObj.fullName : 'Shareholder') : m.sender === 'agent' ? 'Blessing Adebayo (Strategic Advisor)' : 'Lafarge Corporate Desk'}
                        </span>
                        <div className={`px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs ${
                          m.sender === 'user'
                            ? 'bg-white border border-slate-150 text-slate-900 rounded-tl-none'
                            : m.sender === 'agent'
                              ? 'bg-emerald-700 text-white rounded-tr-none'
                              : 'bg-green-800 text-white rounded-tr-none'
                        }`}>
                          {m.text}
                        </div>
                        <span className="text-[8px] text-gray-400 mt-1 px-1 font-mono">{m.time}</span>
                      </div>
                    ))}
                    {chatLogs.length === 0 && (
                      <div className="my-auto text-center font-bold text-xs text-gray-400 py-10">
                        No active live chat transcripts transmitted yet for this user.
                      </div>
                    )}
                  </div>

                  {/* Dispatch reply form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!replyInput.trim()) return;
                      onSendAdminChat(selectedUserEmailForChat, replyInput, adminRole);
                      setReplyInput('');
                    }}
                    className="p-4 border-t border-gray-150 bg-white flex gap-2 shrink-0 font-sans"
                  >
                    <input
                      type="text"
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-green-500 font-sans"
                      placeholder={`Type direct message as ${adminRole === 'agent' ? 'Blessing' : 'System Supervisor'}...`}
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!replyInput.trim()}
                      className="px-5 py-2.5 bg-[#028A34] text-white hover:bg-green-800 transition-all font-bold text-xs rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      Send <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              );
            })() : (
              <div className="my-auto text-center p-8 space-y-2 text-left shrink-0">
                <Headphones className="w-12 h-12 text-[#028A34]/20 mx-auto" />
                <h4 className="font-extrabold text-slate-900 text-sm text-center">No Conversation Thread Selected</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto text-center font-sans">Please pick a support ticket or user conversation on the left panel to begin providing individual client assistance.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deposit Escrow Acc Management Tab */}
      {adminTab === 'deposit-accounts' && (
        <div className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-6 animate-fade-in font-sans text-left">
          
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-base font-black text-slate-900 font-display">Configure Escrow Channels for Client Funding</h3>
            <p className="text-xs text-gray-400 font-medium">Add, activate, or suspend physical bank routing details that are served to users inside their Deposit funding drawer.</p>
          </div>

          {/* Preset list of Escrow Banks active on platform */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-gray-450 uppercase tracking-wider block">Currently Configured Escrow Channels</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {depositAccounts && depositAccounts.map((acc, index) => (
                <div 
                  key={acc.id} 
                  className={`p-4 border rounded-2xl space-y-3 relative overflow-hidden flex flex-col justify-between transition-all ${
                    acc.isActive 
                      ? 'border-green-250 bg-green-50/5' 
                      : 'border-slate-200 bg-slate-55 opacity-70'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-[#028A34]">{acc.bankName}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 text-[8px] tracking-wide uppercase font-black rounded-md ${
                          acc.isActive ? 'bg-green-150 text-green-900 border border-green-200' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {acc.isActive ? 'Active Channel' : 'Suspended'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 font-bold"><span className="text-gray-400 font-semibold font-sans">Account Name:</span> {acc.accountName}</p>
                    <p className="text-xs text-slate-900 font-semibold leading-none flex items-center gap-1 mt-0.5">
                      <span className="text-gray-400 font-semibold font-sans">NUBAN:</span> 
                      <strong className="font-mono text-sm leading-none">{acc.accountNumber}</strong>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-150/55 flex gap-2">
                    <button
                      onClick={() => onToggleDepositAccount(acc.id)}
                      className={`flex-1 py-1.5 text-[10px] uppercase font-black tracking-wide border rounded-lg transition-all cursor-pointer text-center ${
                        acc.isActive 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-705 border-slate-200' 
                          : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                      }`}
                    >
                      {acc.isActive ? 'Suspend channel' : 'Activate Channel'}
                    </button>
                    <button
                      onClick={() => onRemoveDepositAccount(acc.id)}
                      className="px-2.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-650 rounded-lg cursor-pointer transition-colors"
                      title="Remove Account"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {(!depositAccounts || depositAccounts.length === 0) && (
                <div className="col-span-1 md:col-span-2 py-8 text-center border border-dashed border-gray-150 rounded-2xl text-xs text-slate-400 font-black font-sans">
                  No escrow ledger accounts configured. You must add at least one account to let users pay.
                </div>
              )}
            </div>
          </div>

          {/* Form to Add New Bank Acc */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!newBankName.trim() || !newAccountNumber.trim()) return;
              onAddDepositAccount(newBankName, newAccountName || 'Lafarge Africa Plc Option Escrow', newAccountNumber);
              setNewBankName('');
              setNewAccountName('');
              setNewAccountNumber('');
              setBankAddSuccess('Physical Escrow account added successfully and published across NIBSS platform gateways.');
              setTimeout(() => setBankAddSuccess(''), 5500);
            }}
            className="p-5 border border-slate-200 rounded-2xl bg-slate-55/40 space-y-4 shadow-sm text-left font-sans"
          >
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider block font-sans">Add New Institutional Escrow Channel</h4>
            
            {bankAddSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-xl animate-fade-in flex items-center gap-1.5 font-sans">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                {bankAddSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans mr-px">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 font-sans">Bank Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Access Bank Plc"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-green-500 font-sans"
                />
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 font-sans">Owner Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lafarge Premium Africa Ltd"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-green-500 font-sans"
                />
              </div>

              <div className="space-y-1.5 font-sans font-mono">
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 font-sans">NUBAN Account Number (10 Digits)</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="e.g. 0134491048"
                  value={newAccountNumber}
                  onChange={(e) => setNewAccountNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-green-500 font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!newBankName.trim() || !newAccountNumber.trim() || newAccountNumber.length !== 10}
              className="px-5 py-2.5 bg-[#028A34] hover:bg-green-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add & Publish Bank Account
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
