import { Landmark, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';
import { formatNGN } from '../utils';
import { UserWallet, ActiveInvestment } from '../types';

interface StatsGridProps {
  wallet: UserWallet;
  onOpenModal: (type: 'deposit' | 'withdraw') => void;
  activeInvestments?: ActiveInvestment[];
}

export default function StatsGrid({ wallet, onOpenModal, activeInvestments = [] }: StatsGridProps) {
  // calculate accrued profit from active investments belonging to this user that have completed at least 24 hours
  const userActiveInvestments = activeInvestments.filter(
    (inv) => inv.status === 'active' && inv.userEmail?.toLowerCase() === wallet?.email?.toLowerCase()
  );
  const activeAccruedProfit = userActiveInvestments.reduce((sum, inv) => sum + (inv.totalAccrued || 0), 0);
  const allTimeCumulative = wallet.earnedBalance + activeAccruedProfit;
  return (
    <div className="space-y-6">
      
      {/* Alert/Interactive Promo banner */}
      <div className="bg-green-50 border border-green-100 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex gap-3">
          <div className="p-2.5 bg-green-105 rounded-xl text-[#028A34] shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm md:text-base">2.50% Daily Dividends Active</h4>
            <p className="text-gray-500 text-xs mt-0.5 max-w-xl">
              Acquire Lafarge Africa Plc production shares starting at ₦3,000 to generate guaranteed daily dividends (2.50% daily). Fast compounding options live!
            </p>
          </div>
        </div>
        <div className="flex gap-2.5 w-full md:w-auto shrink-0">
          <button
            id="btn-shortcut-deposit"
            onClick={() => onOpenModal('deposit')}
            className="flex-1 md:flex-none px-4 py-2.5 bg-[#028A34] hover:bg-[#027029] text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
          >
            Deposit Capital (₦)
          </button>
          <button
            id="btn-shortcut-withdraw"
            onClick={() => onOpenModal('withdraw')}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white hover:bg-green-50 text-green-800 border border-green-200 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            Withdraw Profit (₦)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Wallet Balance Card */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4 hover:border-green-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Liquid Naira Cash</span>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-gray-950 tracking-tight font-mono">
              {formatNGN(wallet.walletBalance)}
            </h3>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Available for stock positions</p>
          </div>
        </div>

        {/* Active Investments Balance Card */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4 hover:border-green-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Deployed Capital Share</span>
            <div className="p-2 bg-green-50 rounded-lg text-[#028A34]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-green-800 tracking-tight font-mono">
              {formatNGN(wallet.investedBalance)}
            </h3>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Earning High-Yield Daily Dividends</p>
          </div>
        </div>

        {/* Total Interest Earned Card */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4 hover:border-green-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">All-Time Cumulative Dividends</span>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-[#028A34] tracking-tight font-mono">
              {formatNGN(allTimeCumulative)}
            </h3>
            <p className="text-[10px] text-green-600/80 font-bold uppercase tracking-wider">Total profit accrued</p>
          </div>
        </div>

        {/* Total Withdrawals Card */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4 hover:border-green-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Withdrawn to Bank</span>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-gray-800 tracking-tight font-mono">
              {formatNGN(wallet.withdrawnBalance)}
            </h3>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Liquidated to Nigerian bank</p>
          </div>
        </div>

      </div>
    </div>
  );
}
