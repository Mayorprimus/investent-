import { ActiveInvestment } from '../types';
import { formatNGN } from '../utils';
import { Clock, CheckCircle, ArrowUpRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface ActiveInvestmentsProps {
  investments: ActiveInvestment[];
  simulatedTime: number;
  onToggleCompounding: (id: string, value: boolean) => void;
  onClaim: (id: string) => void;
  onOpenInvestTab: () => void;
}

export default function ActiveInvestments({
  investments,
  simulatedTime,
  onToggleCompounding,
  onClaim,
  onOpenInvestTab
}: ActiveInvestmentsProps) {
  
  const getProgress = (inv: ActiveInvestment) => {
    if (inv.status === 'matured' || simulatedTime >= inv.endDate) return 100;
    const totalDuration = inv.endDate - inv.startDate;
    const elapsed = simulatedTime - inv.startDate;
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const getTimeLeftStr = (inv: ActiveInvestment) => {
    const msLeft = inv.endDate - simulatedTime;
    if (msLeft <= 0 || inv.status === 'matured') return 'Matured';
    
    const minutes = Math.floor((msLeft / (1000 * 60)) % 60);
    const hours = Math.floor((msLeft / (1000 * 60 * 60)) % 24);
    const days = Math.floor(msLeft / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days}d ${hours}h left`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  const activeInvestmentsList = investments.filter(i => i.status === 'active' || i.status === 'matured');
  const pendingInvestmentsList = investments.filter(i => i.status === 'pending');

  return (
    <div className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-950 font-sans flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" /> Lafarge Stock Portfolio
          </h3>
          <p className="text-xs text-gray-400 font-medium">Track your cement production allocations yielding premium daily dividends.</p>
        </div>
        <span className="text-xs font-bold text-[#028A34] bg-green-50 border border-green-150 px-3 py-1.5 rounded-full inline-block self-start">
          {activeInvestmentsList.length} Active Position{activeInvestmentsList.length === 1 ? '' : 's'}
        </span>
      </div>

      {pendingInvestmentsList.length > 0 && (
        <div className="space-y-3 border-b border-gray-100 pb-5">
          <span className="text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-150 px-2.5 py-1 rounded-md uppercase tracking-wider inline-block">
            ⚙️ Awaiting Supervisor Placements ({pendingInvestmentsList.length})
          </span>
          <div className="space-y-3">
            {pendingInvestmentsList.map((inv) => (
              <div key={inv.id} className="p-4 bg-amber-50/10 border border-dashed border-amber-200 rounded-xl flex items-center justify-between gap-4 font-sans text-xs">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-amber-900">{inv.productName}</h4>
                  <div className="flex items-center gap-2 text-gray-550 font-bold font-mono text-[10px]">
                    <span>Capital: {formatNGN(inv.amountInvested)}</span>
                    <span>•</span>
                    <span>Expected profit: {formatNGN(inv.expectedReturn)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50/50 px-2 py-1 rounded-md border border-amber-100 uppercase tracking-wider shrink-0 animate-pulse">
                  <Clock className="w-3.5 h-3.5" /> Verification Pending
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeInvestmentsList.length === 0 ? (
        <div className="text-center py-12 px-6 max-w-sm mx-auto space-y-4">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-700">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-sm">No Active Positions</h4>
            <p className="text-xs text-gray-400 flex flex-col md:inline">You do not hold any Lafarge shares right now. Acquire shares or bonds to start receiving daily dividends (e.g., ₦1,500 plan to yield ₦15,000 in 30 days).</p>
          </div>
          <button
            id="btn-no-invest-shortcut"
            onClick={onOpenInvestTab}
            className="px-5 py-2.5 bg-[#028A34] hover:bg-[#027029] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Acquire Shares Now
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {activeInvestmentsList.map((inv) => {
            const currentRate = inv.rate || 0.10;
            const termDays = inv.termDays || Math.round(inv.expectedReturn / (inv.amountInvested * currentRate)) || 4;
            const progress = getProgress(inv);
            const isMatured = inv.status === 'matured' || simulatedTime >= inv.endDate;
            const dailyYield = inv.amountInvested * currentRate;
            const fullPotentialYield = inv.expectedReturn || (inv.amountInvested * currentRate * termDays);

            return (
              <div 
                key={inv.id} 
                className={`p-5 rounded-2xl border transition-all ${
                  isMatured 
                    ? 'border-green-300 bg-green-50/10' 
                    : 'border-slate-105 bg-white hover:border-gray-200'
                }`}
              >
                {/* Upper metrics row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-extrabold text-[#028A34] tracking-wider">
                        {inv.productName}
                      </span>
                      {isMatured ? (
                        <span className="bg-[#028A34] text-white text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase font-sans animate-bounce">
                          MATURED (100%)
                        </span>
                      ) : (
                        <span className="bg-green-100 text-[#027029] text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase font-mono animate-pulse">
                          YIELDING DAILY
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-lg font-black text-gray-950 font-mono">
                        {formatNGN(inv.amountInvested)}
                      </h4>
                      <span className="text-xs text-gray-400 font-medium font-mono">invested capital</span>
                    </div>
                  </div>

                  {/* Dividends and cycle durations */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t sm:border-t-0 pt-4 sm:pt-0">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Daily Dividends</span>
                      <strong className="text-green-700 font-black text-sm block">+{formatNGN(dailyYield)}</strong>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Accumulated Dividend</span>
                      <strong className="text-[#028A34] font-black text-sm block">
                        +{formatNGN(inv.totalAccrued)} / {formatNGN(fullPotentialYield)}
                      </strong>
                    </div>

                    <div className="space-y-0.5 col-span-2 md:col-span-1">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Maturity Date</span>
                      <span className="text-gray-700 font-bold text-xs truncate max-w-[130px] block">
                        {new Date(inv.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {isMatured ? `${termDays} days cycle completed` : `Progress: ${getTimeLeftStr(inv)}`}
                    </span>
                    <span className="font-mono text-green-900 font-bold">{progress.toFixed(0)}%</span>
                  </div>
                  
                  {/* Outer rail */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${isMatured ? 'bg-[#028A34]' : 'bg-[#00A844]'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Compound configuration and claiming controls */}
                <div className="mt-5 pt-4 border-t border-dashed border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  
                  {/* Dynamic interactive compound option */}
                  <div className="flex items-center gap-2.5">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inv.isCompounding !== false}
                        onChange={() => onToggleCompounding(inv.id, inv.isCompounding === false)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#028A34]" />
                    </label>
                    <div className="leading-tight">
                      <span className="text-xs font-bold text-gray-900 block">Auto-Rollover Reinvest</span>
                      <p className="text-[10px] text-gray-400 font-semibold">
                        {inv.isCompounding !== false 
                          ? `Automatically restart ${termDays}-day cycle at +${(termDays * currentRate * 100).toFixed(0)}% gain`
                          : `Disburses principal on maturity date (${new Date(inv.endDate).toLocaleDateString()})`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Claim buttons */}
                  {isMatured ? (
                    <button
                      id={`btn-claim-${inv.id}`}
                      onClick={() => onClaim(inv.id)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#028A34] hover:bg-[#027029] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      Withdraw Capital & Daily Profits (₦{formatNGN(fullPotentialYield)})
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 font-black flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" /> Cumulative daily dividends locked in {termDays}-day package cycle. Withdraws available upon maturity.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
