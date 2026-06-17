import { useState, useEffect } from 'react';
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
  Gift,
  Award,
  Sparkles,
  ArrowRight,
  Copy,
  Check
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
    customReferralLink?: string;
    isReferralLinkStatic?: boolean;
    csNumber?: string;
    officialWhatsAppGroup?: string;
    minReferralWithdrawal?: number;
    allowAnytimeWithdrawal?: boolean;
  };
  onSaveSettings: (settings: {
    requireDepositApproval: boolean;
    requireInvestmentApproval: boolean;
    requireWithdrawalApproval: boolean;
    customReferralLink?: string;
    isReferralLinkStatic?: boolean;
    csNumber?: string;
    officialWhatsAppGroup?: string;
    minReferralWithdrawal?: number;
    allowAnytimeWithdrawal?: boolean;
  }) => void;
  onApproveDeposit: (txId: string) => void;
  onDeclineDeposit: (txId: string) => void;
  onApproveWithdrawal: (txId: string) => void;
  onDeclineWithdrawal: (txId: string) => void;
  onApproveInvestment: (invId: string) => void;
  onDeclineInvestment: (invId: string) => void;
  onUpdateUserWallet: (updates: Partial<UserWallet>) => void;
  onAdminUpdateSpecificUser: (email: string, updates: Partial<UserWallet>) => void;
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
  onDeleteUser?: (email: string) => void;
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
  onAdminUpdateSpecificUser,
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
  onDeclineReferral,
  onDeleteUser
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

  // Global Referral Link States
  const [customRefLink, setCustomRefLink] = useState(adminApprovalSettings.customReferralLink || '');
  const [isRefLinkStatic, setIsRefLinkStatic] = useState(adminApprovalSettings.isReferralLinkStatic || false);
  const [adminCsNumber, setAdminCsNumber] = useState(adminApprovalSettings.csNumber || '08158432605');
  const [adminGroupLink, setAdminGroupLink] = useState(adminApprovalSettings.officialWhatsAppGroup || 'https://chat.whatsapp.com/KHZgCi1h24154DqIIHz3VE');
  const [adminMinRefWithdrawal, setAdminMinRefWithdrawal] = useState(adminApprovalSettings.minReferralWithdrawal || 5000);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');

  // Manual Approval Override States
  const [reqDepositApp, setReqDepositApp] = useState(adminApprovalSettings.requireDepositApproval);
  const [reqInvestApp, setReqInvestApp] = useState(adminApprovalSettings.requireInvestmentApproval);
  const [reqWithdrawApp, setReqWithdrawApp] = useState(adminApprovalSettings.requireWithdrawalApproval);
  const [allowAnytimeWithdraw, setAllowAnytimeWithdraw] = useState(adminApprovalSettings.allowAnytimeWithdrawal || false);

  useEffect(() => {
    if (adminApprovalSettings) {
      setCustomRefLink(adminApprovalSettings.customReferralLink || '');
      setIsRefLinkStatic(adminApprovalSettings.isReferralLinkStatic || false);
      setAdminCsNumber(adminApprovalSettings.csNumber || '08158432605');
      setAdminGroupLink(adminApprovalSettings.officialWhatsAppGroup || 'https://chat.whatsapp.com/KHZgCi1h24154DqIIHz3VE');
      setAdminMinRefWithdrawal(adminApprovalSettings.minReferralWithdrawal ?? 5000);
      setReqDepositApp(adminApprovalSettings.requireDepositApproval);
      setReqInvestApp(adminApprovalSettings.requireInvestmentApproval);
      setReqWithdrawApp(adminApprovalSettings.requireWithdrawalApproval);
      setAllowAnytimeWithdraw(adminApprovalSettings.allowAnytimeWithdrawal || false);
    }
  }, [adminApprovalSettings]);

  // Customer Service / Ticketing States
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedUserEmailForChat, setSelectedUserEmailForChat] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [adminRole, setAdminRole] = useState<'admin' | 'agent'>('agent');
  const [supportMode, setSupportMode] = useState<'tickets' | 'chats'>('tickets');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleSaveCustomSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...adminApprovalSettings,
      requireDepositApproval: reqDepositApp,
      requireInvestmentApproval: reqInvestApp,
      requireWithdrawalApproval: reqWithdrawApp,
      customReferralLink: customRefLink,
      isReferralLinkStatic: isRefLinkStatic,
      csNumber: adminCsNumber,
      officialWhatsAppGroup: adminGroupLink,
      minReferralWithdrawal: Number(adminMinRefWithdrawal) || 5000,
      allowAnytimeWithdrawal: allowAnytimeWithdraw
    });
    setSettingsSuccessMsg('Platform policy settings successfully saved and deployed live!');
    setTimeout(() => setSettingsSuccessMsg(''), 4000);
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
      <div className="flex overflow-x-auto overflow-y-hidden gap-1 border-b border-gray-105 pb-px -mx-4 px-4 sm:mx-0 sm:px-0 whitespace-nowrap scrollbar-hide scroll-smooth">
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
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold font-sans cursor-pointer transition-all shrink-0 ${
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

                {/* Override 4: Force/Enable User Auto-Invest */}
                <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">Enable Auto-Invest Rollover</span>
                    <span className="text-[10px] text-gray-400 block font-medium">Toggles automated compound cycle rollover on maturity</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="checkbox-admin-toggle-autoinvest"
                      type="checkbox"
                      checked={wallet.autoInvest !== false}
                      onChange={(e) => onUpdateUserWallet({ autoInvest: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
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
                              {usr.email.toLowerCase() !== 'admin1234@gmail.com' && onDeleteUser && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to permanently delete user ${usr.fullName} (${usr.email})? This action is irreversible.`)) {
                                      onDeleteUser(usr.email);
                                    }
                                  }}
                                  className="p-1 px-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                  title="Delete User Account"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              )}
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

          {/* Shareholder Level Upgrades Subsection */}
          {(() => {
            const pendingLevelUpgrades = registeredUsers.filter(u => u.pendingLevelUpgrade);
            return (
              <div className="border bg-slate-50/50 border-gray-150 rounded-2xl p-4 md:p-5 space-y-4">
                <div>
                  <h4 className="text-xs font-black text-gray-950 flex items-center gap-1.5 uppercase tracking-wide">
                    <Award className="w-4 h-4 text-emerald-600" /> Shareholder Rank Upgrade Requests
                  </h4>
                  <p className="text-[10px] text-gray-400 font-sans font-medium mt-0.5">Verify list of rank applications to unlock upper-tier statuses based on multi-level network referral codes.</p>
                </div>

                {pendingLevelUpgrades.length === 0 ? (
                  <div className="text-center py-6 px-4 bg-white border border-gray-100 rounded-xl max-w-sm mx-auto space-y-1">
                    <Award className="w-6 h-6 text-gray-300 block mx-auto opacity-75" />
                    <h5 className="font-bold text-gray-900 text-[11px]">No rank upgrade requests pending</h5>
                    <p className="text-[9.5px] text-gray-400 font-sans">Shareholders will request ranks when they reach their network invitation thresholds.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingLevelUpgrades.map((usr) => {
                      // Precompute user multi-level referral counts
                      const getNetworkCountsForUser = (userWallet: UserWallet) => {
                        const codeNormalized = (userWallet.referralCode || '').trim().toLowerCase();
                        if (!codeNormalized) return { lv1: 0, lv2: 0, lv3: 0, lv4: 0, lv5: 0 };
                        
                        const lv1Users = registeredUsers.filter(u => u.referredBy?.trim().toLowerCase() === codeNormalized);
                        const lv2Users = registeredUsers.filter(u => {
                          if (!u.referredBy) return false;
                          const refByCode = u.referredBy.trim().toLowerCase();
                          return lv1Users.some(l1 => l1.referralCode.trim().toLowerCase() === refByCode);
                        });
                        const lv3Users = registeredUsers.filter(u => {
                          if (!u.referredBy) return false;
                          const refByCode = u.referredBy.trim().toLowerCase();
                          return lv2Users.some(l2 => l2.referralCode.trim().toLowerCase() === refByCode);
                        });
                        const lv4Users = registeredUsers.filter(u => {
                          if (!u.referredBy) return false;
                          const refByCode = u.referredBy.trim().toLowerCase();
                          return lv3Users.some(l3 => l3.referralCode.trim().toLowerCase() === refByCode);
                        });
                        const lv5Users = registeredUsers.filter(u => {
                          if (!u.referredBy) return false;
                          const refByCode = u.referredBy.trim().toLowerCase();
                          return lv4Users.some(l4 => l4.referralCode.trim().toLowerCase() === refByCode);
                        });
                        
                        return {
                          lv1: lv1Users.length,
                          lv2: lv2Users.length,
                          lv3: lv3Users.length,
                          lv4: lv4Users.length,
                          lv5: lv5Users.length
                        };
                      };

                      const usrCounts = getNetworkCountsForUser(usr);
                      const requested = usr.pendingLevelUpgrade!;
                      
                      let currentCount = 0;
                      let requiredCount = 0;
                      if (requested === 'Bronze') { currentCount = usrCounts.lv1; requiredCount = 5; }
                      else if (requested === 'Silver') { currentCount = usrCounts.lv2; requiredCount = 10; }
                      else if (requested === 'Gold') { currentCount = usrCounts.lv3; requiredCount = 15; }
                      else if (requested === 'Platinum') { currentCount = usrCounts.lv4; requiredCount = 20; }
                      else if (requested === 'Diamond') { currentCount = usrCounts.lv5; requiredCount = 25; }

                      const hasMetReq = currentCount >= requiredCount;

                      return (
                        <div key={usr.email} className="p-3 bg-white border border-gray-150 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs font-sans">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-900">{usr.fullName}</span>
                              <span className="text-[10px] text-gray-400 font-mono">({usr.email})</span>
                              <span className="text-[9px] uppercase font-black px-1.5 py-0.2 bg-slate-50 text-slate-655 border border-slate-200 rounded font-mono">
                                Code: {usr.referralCode}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                              <span className="text-[9.5px] font-bold text-slate-500">
                                Current Active Rank: <strong className="text-slate-800 font-extrabold">{usr.approvedLevel || 'Standard Member'}</strong>
                              </span>
                              <span className="text-gray-300">|</span>
                              <span className="text-[9.5px] font-black text-amber-850 bg-amber-50 border border-amber-150 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                                Pending upgrade: <strong className="uppercase font-extrabold">{requested}</strong>
                              </span>
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 pt-1 flex items-center gap-1 flex-wrap">
                              <span>Level Network:</span>
                              <span className={hasMetReq ? 'text-[#028A34] font-extrabold font-mono' : 'text-amber-600 font-black font-mono'}>{currentCount} / {requiredCount} refs</span> 
                              <span>{hasMetReq ? '✔ (Requirements Met)' : '❌ (Insufficient Network Depth)'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 md:self-center w-full md:w-auto">
                            <button
                              id={`decline-rank-${usr.email}`}
                              onClick={() => {
                                onAdminUpdateSpecificUser(usr.email, {
                                  pendingLevelUpgrade: undefined
                                });
                              }}
                              className="flex-1 md:flex-initial px-3 py-1.5 border border-red-200 hover:border-red-300 bg-red-50 text-red-700 font-bold uppercase text-[9.5px] rounded-lg transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              id={`approve-rank-${usr.email}`}
                              onClick={() => {
                                onAdminUpdateSpecificUser(usr.email, {
                                  approvedLevel: requested,
                                  pendingLevelUpgrade: undefined
                                });
                              }}
                              className="flex-1 md:flex-initial px-3.5 py-2 bg-[#028A34] hover:bg-green-700 text-white font-black uppercase text-[9.5px] rounded-lg transition-colors shadow-sm shadow-green-150 cursor-pointer"
                            >
                              Approve Rank
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          <div className="pt-2 border-t border-dashed border-gray-150">
            <h4 className="text-[10.5px] font-black text-gray-400 uppercase tracking-widest block mb-1">Standard Signup Referral Audits</h4>
          </div>

          {!referralsList || referralsList.length === 0 ? (
            <div className="text-center py-12 px-6 max-w-sm mx-auto space-y-2">
              <Gift className="w-10 h-10 text-emerald-600 block mx-auto animate-pulse" />
              <h4 className="font-bold text-gray-900 text-sm">No referrals tracked yet</h4>
              <p className="text-xs text-gray-400 font-sans">Any brand-new signups containing specified active promo codes will register here for supervisor review.</p>
            </div>
          ) : (
            <div className="space-y-6 divide-y divide-gray-150">
              {referralsList.map((ref, idx) => {
                const referrerUser = registeredUsers.find(
                  u => u.email.toLowerCase() === ref.referrerEmail.toLowerCase()
                );
                const refereeUser = registeredUsers.find(
                  u => u.email.toLowerCase() === ref.referredEmail.toLowerCase()
                );
                const referrerName = referrerUser ? referrerUser.fullName : 'Sponsor User';
                const referrerRank = referrerUser ? (referrerUser.approvedLevel || 'Standard Member') : 'Standard Member';

                return (
                  <div key={ref.id} className={`space-y-3 font-sans text-xs ${idx > 0 ? 'pt-6' : ''}`}>
                    {/* Status & Reward Badge Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-md tracking-wide">
                          REWARD: ₦{formatNGN(ref.amount)}
                        </span>
                        <span className={`text-[9.5px] uppercase font-black px-2.5 py-1 rounded-md tracking-wider border ${
                          ref.status === 'approved' 
                            ? 'bg-green-50 text-green-700 border-green-150' 
                            : ref.status === 'rejected'
                            ? 'bg-red-50 text-red-650 border-red-150'
                            : 'bg-yellow-50 text-yellow-750 border-yellow-150 animate-pulse'
                        }`}>
                          STATUS: {ref.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">Ledger ID: {ref.id}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-sans font-bold">
                        Registered At: {new Date(ref.date).toLocaleString()}
                      </span>
                    </div>

                    {/* Flow Relationship Visualizer - Who Referred Who */}
                    <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center border border-gray-155 p-3 rounded-xl bg-white shadow-3xs">
                      
                      {/* Referrer Column */}
                      <div className="md:col-span-5 bg-emerald-50/10 border border-emerald-100/75 p-3 rounded-lg space-y-1">
                        <span className="text-[9px] uppercase font-black tracking-widest text-[#028A34] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150 inline-block mb-1">
                          👤 SPONSOR / REFERRER
                        </span>
                        <h5 className="font-black text-gray-950 text-sm leading-tight">{referrerName}</h5>
                        <p className="text-[10.5px] text-gray-500 font-semibold">{ref.referrerEmail}</p>
                        <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-gray-400">
                          <span>Invite Code:</span>
                          <code className="text-[#028A34] font-mono bg-[#028A34]/5 border border-[#028A34]/15 px-1.5 py-0.2 rounded font-black">{ref.referrerCode}</code>
                          <span>|</span>
                          <span>Rank:</span>
                          <span className="text-slate-800 font-black">{referrerRank}</span>
                        </div>
                      </div>

                      {/* Direction Arrow Component */}
                      <div className="md:col-span-1 flex flex-col items-center justify-center py-1 md:py-0 text-center">
                        <div className="text-[9px] font-black text-emerald-800 tracking-widest uppercase font-mono bg-emerald-50 border border-emerald-150 px-1.5 py-0.5 rounded-full mb-1">
                          referred
                        </div>
                        <div className="hidden md:block text-emerald-600">
                          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div className="md:hidden text-emerald-600 rotate-90 my-0.5">
                          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                        </div>
                      </div>

                      {/* Referee Column */}
                      <div className="md:col-span-5 bg-sky-50/10 border border-sky-100/75 p-3 rounded-lg space-y-1">
                        <span className="text-[9px] uppercase font-black tracking-widest text-sky-850 bg-sky-50 px-2 py-0.5 rounded border border-sky-150 inline-block mb-1">
                          ✨ REFERRED SIGN-UP
                        </span>
                        <h5 className="font-black text-gray-950 text-sm leading-tight">{ref.referredName}</h5>
                        <p className="text-[10.5px] text-gray-500 font-semibold">{ref.referredEmail}</p>
                        <div className="pt-1 flex flex-wrap items-center gap-1 text-[10px] font-semibold text-gray-400">
                          <span className="text-sky-750 font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                            Get ₦500.00 onboarding reward credited live
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Pending Action Buttons */}
                    {ref.status === 'pending' && (
                      <div className="flex items-center gap-2 self-end justify-end w-full pt-1.5">
                        <button
                          onClick={() => onDeclineReferral(ref.id)}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-150 text-red-700 hover:text-red-950 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                        >
                          <XCircle className="w-4 h-4" /> Reject referral
                        </button>
                        <button
                          onClick={() => onApproveReferral(ref.id)}
                          className="px-5 py-2.5 bg-[#028A34] hover:bg-green-800 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-green-150 transition-all"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve & Credit Sponsor
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
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
                        Daily Profit Potential: <strong className="text-[#028A34] block font-mono">+{formatNGN(inv.amountInvested * (inv.rate || 0.10))}/day</strong>
                      </div>
                      <div>
                        Maturity: <strong className="text-gray-700 block font-mono">{inv.termDays || 4} Days</strong>
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
              {pendingWithdrawals.map((tx) => {
                const applicant = registeredUsers.find(u => u.email.toLowerCase() === (tx.userEmail || '').toLowerCase());
                const applicantName = applicant ? applicant.fullName : 'Premium Shareholder';
                const applicantAccount = applicant ? (applicant.accountNumber || 'Pending settlement setup') : 'Pending settlement setup';

                // Parse account details
                let paymentType = 'Unknown Method';
                let parsedAccountNum = applicantAccount;
                let parsedBankBrand = 'Configured Route';

                if (applicantAccount.startsWith('NG-ACC-')) {
                  const stripped = applicantAccount.replace('NG-ACC-', '');
                  const parts = stripped.split('|');
                  paymentType = 'Commercial Bank Transfer (NUBAN)';
                  parsedAccountNum = parts[0] || 'N/A';
                  parsedBankBrand = parts[1] || 'Commercial Bank';
                } else if (applicantAccount.startsWith('OPAY-')) {
                  paymentType = 'OPay Microfinance e-Wallet';
                  parsedAccountNum = applicantAccount.replace('OPAY-', '');
                  parsedBankBrand = 'OPay (Mobile Money)';
                } else if (applicantAccount.startsWith('T') && applicantAccount.length >= 26) {
                  paymentType = 'USDT Ledger Address (TRC-20)';
                  parsedAccountNum = applicantAccount;
                  parsedBankBrand = 'TRON Network (USDT)';
                } else if (applicantAccount.includes('|')) {
                  const parts = applicantAccount.split('|');
                  parsedAccountNum = parts[0] || 'N/A';
                  parsedBankBrand = parts[1] || 'Custom Route';
                }

                return (
                  <div key={tx.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-start gap-5 transition-all hover:bg-slate-50/80">
                    <div className="space-y-3.5 flex-1 w-full">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 bg-red-100 border border-red-150 text-red-800 uppercase font-black text-[9px] tracking-wider rounded">Awaiting Approval</span>
                          <span className="text-[10px] font-mono text-gray-400 font-bold">REF: {tx.reference}</span>
                          {tx.userEmail && (
                            <span className="text-[10px] font-mono text-[#028A34] font-black bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">
                              {tx.userEmail}
                            </span>
                          )}
                        </div>
                        <span className="text-[10.5px] text-gray-450 font-bold">
                          Requested: {new Date(tx.date).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1.5 border-b border-gray-200 pb-2">
                        <span className="text-2xl font-black font-mono text-gray-950">{formatNGN(tx.amount)}</span>
                        <span className="text-[11px] text-red-705 font-black uppercase tracking-wider">Payout Claim Outflow</span>
                      </div>

                      <p className="text-xs text-gray-550 leading-relaxed font-semibold bg-white p-2.5 rounded-xl border border-gray-150">
                        <strong className="text-gray-400 text-[10px] uppercase font-black block mb-0.5">Withdrawal Narrative:</strong>
                        {tx.description}
                      </p>

                      {/* Payee Disbursement Slip */}
                      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-3xs space-y-3.5">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                          <span className="text-[9.5px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">🏦 Direct Payee Disbursement Coordinates</span>
                          <span className="text-[9.5px] font-black text-[#028A34] bg-[#028A34]/5 border border-[#028A34]/15 px-2.5 py-0.5 rounded uppercase font-mono tracking-wider">
                            {paymentType}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Beneficiary Name */}
                          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2.5 relative flex flex-col justify-between">
                            <div className="pr-12">
                              <span className="text-[8.5px] text-gray-400 uppercase font-black tracking-wider block mb-0.5">Beneficiary Name</span>
                              <p className="text-xs font-extrabold text-gray-900 select-all">{applicantName}</p>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(applicantName);
                                setCopiedId(`${tx.id}-name`);
                                setTimeout(() => setCopiedId(null), 1500);
                              }}
                              className="absolute top-2.5 right-2 p-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-800 rounded-md transition-all cursor-pointer flex items-center gap-1 text-[8px] font-black uppercase tracking-wider"
                            >
                              {copiedId === `${tx.id}-name` ? (
                                <><Check className="w-3 h-3 text-green-600" /> <span className="text-green-600 font-extrabold">Copied</span></>
                              ) : (
                                <><Copy className="w-3 h-3 text-gray-400" /> <span>Copy</span></>
                              )}
                            </button>
                          </div>

                          {/* Account number / USDT */}
                          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2.5 relative flex flex-col justify-between">
                            <div className="pr-12">
                              <span className="text-[8.5px] text-gray-400 uppercase font-black tracking-wider block mb-0.5">Account NUBAN / Coordinates</span>
                              <p className="text-xs font-black text-[#028A34] font-mono tracking-wide select-all break-all">{parsedAccountNum}</p>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(parsedAccountNum);
                                setCopiedId(`${tx.id}-acc`);
                                setTimeout(() => setCopiedId(null), 1500);
                              }}
                              className="absolute top-2.5 right-2 p-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-800 rounded-md transition-all cursor-pointer flex items-center gap-1 text-[8px] font-black uppercase tracking-wider"
                            >
                              {copiedId === `${tx.id}-acc` ? (
                                <><Check className="w-3 h-3 text-green-600" /> <span className="text-green-600 font-extrabold">Copied</span></>
                              ) : (
                                <><Copy className="w-3 h-3 text-gray-400" /> <span>Copy</span></>
                              )}
                            </button>
                          </div>

                          {/* Bank Branch / Network */}
                          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2.5 relative flex flex-col justify-between">
                            <div className="pr-12">
                              <span className="text-[8.5px] text-gray-400 uppercase font-black tracking-wider block mb-0.5">Receiving Institute</span>
                              <p className="text-xs font-extrabold text-gray-900 select-all">{parsedBankBrand}</p>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(parsedBankBrand);
                                setCopiedId(`${tx.id}-bank`);
                                setTimeout(() => setCopiedId(null), 1500);
                              }}
                              className="absolute top-2.5 right-2 p-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-800 rounded-md transition-all cursor-pointer flex items-center gap-1 text-[8px] font-black uppercase tracking-wider"
                            >
                              {copiedId === `${tx.id}-bank` ? (
                                <><Check className="w-3 h-3 text-green-600" /> <span className="text-green-600 font-extrabold">Copied</span></>
                              ) : (
                                <><Copy className="w-3 h-3 text-gray-400" /> <span>Copy</span></>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Extra guide */}
                        <div className="p-2.5 rounded-xl bg-orange-50/50 border border-orange-100 text-[10.5px] text-amber-800 leading-normal font-sans space-y-0.5">
                          <p className="font-extrabold">&#9755; Corporate Payout Guide:</p>
                          <p>
                            Disperse exactly <strong>₦{tx.amount.toLocaleString()}</strong> utilizing your business bank application. Set account number to <strong>{parsedAccountNum}</strong>, select <strong>{parsedBankBrand}</strong>, and verify receipt name reads <strong>{applicantName}</strong> before clearing.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions buttons */}
                    <div className="flex flex-row md:flex-col items-center gap-2 w-full md:w-auto md:self-stretch justify-end shrink-0 md:pt-4">
                      <button
                        onClick={() => onDeclineWithdrawal(tx.id)}
                        className="flex-1 md:flex-initial px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-150 text-red-700 hover:text-red-955 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all w-full"
                      >
                        <XCircle className="w-4 h-4" /> Decline & Refund
                      </button>
                      <button
                        onClick={() => onApproveWithdrawal(tx.id)}
                        className="flex-1 md:flex-initial px-5 py-3 bg-[#028A34] hover:bg-green-800 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-green-150 transition-all w-full"
                      >
                        <CheckCircle className="w-4 h-4" /> Authorize Payout
                      </button>
                    </div>
                  </div>
                );
              })}
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
                  <span className={`text-[9px] uppercase font-bold text-white px-2 py-0.5 rounded-full font-mono ${reqDepositApp ? 'bg-[#028A34]' : 'bg-gray-400'}`}>
                    {reqDepositApp ? '🟢 STRICT MANUAL VERIFICATION' : '⚡ IMMEDIATE AUTO-CREDIT'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold leading-normal">
                  Toggle whether all bank transfer & card deposits go into the pending queue for direct corporate receipts verification, or credit immediately.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={reqDepositApp}
                  onChange={(e) => setReqDepositApp(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028A34]"></div>
              </label>
            </div>

            {/* Setting 2: Investments Rule */}
            <div className="flex items-center justify-between p-4 border border-emerald-150 bg-emerald-50/20 rounded-2xl">
              <div className="space-y-0.5 max-w-sm sm:max-w-md pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-950 block">Require Share Allocation Approval</span>
                  <span className={`text-[9px] uppercase font-bold text-white px-2 py-0.5 rounded-full font-mono ${reqInvestApp ? 'bg-[#028A34]' : 'bg-gray-400'}`}>
                    {reqInvestApp ? '🟢 CEO REVIEW REQUIRED' : '⚡ INSTANT POSITION ACQUISITION'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold leading-normal">
                  When enabled, newly acquired investment share contracts must be underwritten manually by a supervisor before running active dividend yields.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={reqInvestApp}
                  onChange={(e) => setReqInvestApp(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028A34]"></div>
              </label>
            </div>

            {/* Setting 3: Withdrawal Rule */}
            <div className="flex items-center justify-between p-4 border border-emerald-150 bg-emerald-50/20 rounded-2xl">
              <div className="space-y-0.5 max-w-sm sm:max-w-md pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-950 block">Require Strict Payout Withdrawal Review</span>
                  <span className={`text-[9px] uppercase font-bold text-white px-2 py-0.5 rounded-full font-mono ${reqWithdrawApp ? 'bg-[#028A34]' : 'bg-gray-400'}`}>
                    {reqWithdrawApp ? '🟢 MANUAL REVIEW HOLD' : '⚡ INSTANT ACCOUNT PAYOUT'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold leading-normal">
                  All bank withdrawal payout claims are parked under pending queues, or processed automatically inside specified virtual NUBAN routes instantly without manual review.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={reqWithdrawApp}
                  onChange={(e) => setReqWithdrawApp(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028A34]"></div>
              </label>
            </div>

            {/* Setting 4: Enable 24/7 Global Unlimited Withdrawals */}
            <div className="flex items-center justify-between p-4 border border-emerald-150 bg-emerald-50/20 rounded-2xl animate-fade-in">
              <div className="space-y-0.5 max-w-sm sm:max-w-md pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-950 block">Force Open Withdrawal Window (24/7 Bypass)</span>
                  <span className={`text-[9px] uppercase font-bold text-white px-2 py-0.5 rounded-full font-mono ${allowAnytimeWithdraw ? 'bg-[#028A34]' : 'bg-gray-400'}`}>
                    {allowAnytimeWithdraw ? '🟢 OPEN WIDE (24/7)' : '🔒 RESTRICTED (10AM-12PM)'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold leading-normal">
                  When enabled, shareholders can bypass the restricted simulated 10:00 AM - 12:00 PM time window, allowing them to submit payout claims at any hour of the day.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={allowAnytimeWithdraw}
                  onChange={(e) => setAllowAnytimeWithdraw(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028A34]"></div>
              </label>
            </div>

          </div>

          {/* Custom Global Referral Link Config Form */}
          <hr className="border-gray-150 my-6" />

          <form onSubmit={handleSaveCustomSettings} className="space-y-5">
            <div>
              <h4 className="text-sm font-black text-gray-950 flex items-center gap-1.5">
                🔗 Custom Global Referral Link Policy
              </h4>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                Configure a custom platform link (e.g. your WhatsApp/Telegram bot link or landing page) that will be displayed on all shareholder profiles.
              </p>
            </div>

            {settingsSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-150 text-[#028A34] text-xs font-bold rounded-xl animate-fade-in">
                {settingsSuccessMsg}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black text-gray-450 tracking-wider">
                    📞 Customer Service (CS) WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={adminCsNumber}
                    onChange={(e) => setAdminCsNumber(e.target.value)}
                    placeholder="e.g. 08158432605"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#028A34]"
                  />
                  <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                    Enter the WhatsApp support hot number (including zero or dial code). This will update all contact links on the shareholder dashboard instantly.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black text-gray-450 tracking-wider">
                    💬 Official WhatsApp Group Link
                  </label>
                  <input
                    type="text"
                    value={adminGroupLink}
                    onChange={(e) => setAdminGroupLink(e.target.value)}
                    placeholder="e.g. https://chat.whatsapp.com/..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#028A34]"
                  />
                  <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                    Optionally configure an official interactive WhatsApp community chat group link for all new and existing registered shareholders.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black text-gray-450 tracking-wider">
                  Custom Referral Link URL / Path
                </label>
                <input
                  type="text"
                  value={customRefLink}
                  onChange={(e) => setCustomRefLink(e.target.value)}
                  placeholder="e.g. https://t.me/LafargePortBot or https://yoursite.com/register"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#028A34]"
                />
                <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                  Leave blank to use the default web domain. Include placeholder <code>{"{CODE}"}</code> if you need the referral code inserted at a custom location, otherwise it will append <code>?ref=CODE</code> (or <code>&ref=CODE</code> if the link already contains options).
                </p>
              </div>

              <div className="space-y-1.5 p-4 border border-zinc-150 bg-gray-50/50 rounded-2xl">
                <label className="block text-[10px] uppercase font-black text-gray-450 tracking-wider">
                  ₦ Minimum Withdrawal for Referral Members
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₦</span>
                  <input
                    type="number"
                    value={adminMinRefWithdrawal}
                    onChange={(e) => setAdminMinRefWithdrawal(Number(e.target.value) || 0)}
                    placeholder="e.g. 5000"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-7 pr-3 py-2 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#028A34]"
                  />
                </div>
                <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                  Override the minimum eligible withdrawal amount for accounts that have referral records (currently <strong className="text-gray-850">₦{Number(adminMinRefWithdrawal).toLocaleString()}</strong>). Adjust anytime to 10,000 or any preferred value.
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 border border-amber-100 bg-amber-50/10 rounded-2xl">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-black text-gray-950 block">Static Identical Link For Everyone</span>
                  <p className="text-[10px] text-gray-550 font-semibold leading-normal">
                    When toggled ON, everyone sees exactly the identical, static URL link written above (such as a generic group link) and the application will NOT automatically append their personal referral code.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isRefLinkStatic}
                    onChange={(e) => setIsRefLinkStatic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-green-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028A34]"></div>
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#028a34] hover:bg-green-800 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-green-950/10 active:scale-95 cursor-pointer"
                >
                  Deploy Link Policy Live
                </button>
              </div>
            </div>
          </form>

          <hr className="border-gray-150 my-6" />

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
