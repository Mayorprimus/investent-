import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Factory, Gem, Boxes, Cpu, AlertCircle, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { InvestmentProduct } from '../types';
import { formatNGN } from '../utils';

interface ProductCardProps {
  product: InvestmentProduct;
  walletBalance: number;
  onInvest: (productId: string, amount: number, isCompounding: boolean) => void;
  onOpenDeposit: () => void;
}

export default function ProductCard({
  product,
  walletBalance,
  onInvest,
  onOpenDeposit
}: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [isCompounding, setIsCompounding] = useState(true);
  const [errorText, setErrorText] = useState('');

  // Custom icons reflecting Lafarge Africa industrial options
  const getIcon = () => {
    if (product.id.includes('ewekoro')) {
      return <Factory className="w-8 h-8 text-green-700" />;
    }
    if (product.id.includes('sagamu')) {
      return <Boxes className="w-8 h-8 text-green-700" />;
    }
    if (product.id.includes('ashaka')) {
      return <Cpu className="w-8 h-8 text-green-700" />;
    }
    if (product.id.includes('mfamosing')) {
      return <Gem className="w-8 h-8 text-green-700" />;
    }
    if (product.id.includes('calabar')) {
      return <Boxes className="w-8 h-8 text-green-700" />;
    }
    if (product.id.includes('lagos')) {
      return <Factory className="w-8 h-8 text-green-700" />;
    }
    if (product.id.includes('abuja')) {
      return <ShieldCheck className="w-8 h-8 text-green-700" />;
    }
    if (product.id.includes('huaxin')) {
      return <Cpu className="w-8 h-8 text-green-700" />;
    }
    if (product.id.includes('alternative')) {
      return <Sparkles className="w-8 h-8 text-green-700" />;
    }
    return <Factory className="w-8 h-8 text-green-700" />;
  };

  const handleOpenModal = () => {
    setAmount(product.minAmount.toString());
    setErrorText('');
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    const amtNum = parseFloat(amount);

    if (isNaN(amtNum)) {
      setErrorText('Please enter a valid investable amount.');
      return;
    }

    if (amtNum < product.minAmount || amtNum > product.maxAmount) {
      setErrorText(`Investment must be between ${formatNGN(product.minAmount)} and ${formatNGN(product.maxAmount)} for this stock product.`);
      return;
    }

    if (amtNum > walletBalance) {
      setErrorText('Insufficient wallet balance. Please add funds into your Naira wallet.');
      return;
    }

    onInvest(product.id, amtNum, isCompounding);
    setIsModalOpen(false);
  };

  return (
    <>
      <motion.div 
        whileHover={{ y: -5, scale: 1.015 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white border border-gray-150 hover:border-green-200 hover:shadow-xl hover:shadow-green-900/[0.02] rounded-2xl p-6 flex flex-col justify-between transition-all relative overflow-hidden group font-sans"
      >
        
        {/* Top visual accent for active hovering */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-green-50 rounded-xl">
              {getIcon()}
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
              {product.category}
            </span>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xl font-bold text-gray-900 group-hover:text-green-950 transition-colors">
              {product.name}
            </h4>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing tier metrics */}
          <div className="p-4 bg-gray-50 border border-slate-100/80 rounded-xl space-y-2">
            <div className="flex justify-between items-start text-xs text-gray-500">
              <span className="font-semibold mt-0.5">Minimum Share Options:</span>
              <div className="text-right">
                <strong className="text-gray-900 font-bold block">{formatNGN(product.minAmount)}</strong>
                <span className="text-[10px] text-[#028A34] font-black block">Yields Total: {formatNGN(product.minAmount * 1.60)}</span>
              </div>
            </div>
            <div className="flex justify-between items-start text-xs text-gray-500 pt-1 border-t border-dashed border-gray-200">
              <span className="font-semibold mt-0.5">Maximum Limit:</span>
              <div className="text-right">
                <strong className="text-gray-900 font-bold block">{formatNGN(product.maxAmount)}</strong>
                <span className="text-[10px] text-[#028A34] font-black block">Yields Total: {formatNGN(product.maxAmount * 1.60)}</span>
              </div>
            </div>
            <div className="border-t border-gray-200/50 pt-2 flex justify-between items-center">
              <span className="text-xs text-[#028A34] font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> High-yield cycle:
              </span>
              <strong className="text-green-700 font-black text-sm">{product.termDays} Days Cycle</strong>
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Daily Dividends</span>
              <span className="text-3xl font-black text-[#028A34] tracking-tight">15.0%</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest block">Cumulative Payout</span>
              <span className="text-xs font-semibold text-gray-500">60% in 4 Days</span>
            </div>
          </div>
        </div>

        <button
          id={`btn-open-invest-${product.id}`}
          onClick={handleOpenModal}
          className="w-full mt-6 py-3 bg-white hover:bg-green-700 border border-[#028A34] hover:border-green-700 text-[#028A34] hover:text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          Acquire Share Options
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </motion.div>

      {isModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-[#062817]/65 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.93, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-white border border-green-100 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden"
          >
            <div className="h-1.5 bg-green-600 w-full" />
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#028A34] bg-green-100 px-2 py-0.5 rounded">
                  Portfolio Placement
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{product.name} Allocation</h3>
              </div>
              <button
                id="btn-close-invest-setup"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <XComp />
              </button>
            </div>

            {errorText && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-2.5 text-rose-700 text-xs font-bold leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>{errorText}</p>
                  {errorText.includes('Insufficient wallet balance') && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        onOpenDeposit();
                      }}
                      className="text-green-700 font-extrabold hover:underline block cursor-pointer"
                    >
                      Fund your Naira account Instantly &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Share Capital (Naira ₦)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">₦</span>
                  <input
                    id="input-invest-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 border-2 border-green-104 rounded-xl text-3xl font-black bg-gray-50 focus:bg-white focus:border-green-600 focus:outline-none transition-all text-gray-850"
                  />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-gray-400 font-semibold">
                  <span>Limits: {formatNGN(product.minAmount)} - {formatNGN(product.maxAmount)}</span>
                  <span>Balance: <strong className="text-green-800">{formatNGN(walletBalance)}</strong></span>
                </div>
              </div>

              {/* Compounding Toggle */}
              <div className="p-4 bg-green-50/40 border border-green-150 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-green-905 uppercase tracking-wider block">Auto-Rollover Payouts</span>
                  <label className="relative inline-flex items-center cursor-not-allowed">
                    <input
                      id="checkbox-compound"
                      type="checkbox"
                      checked={true}
                      disabled={true}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-[#028A34]/30 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all translate-x-0 peer-checked:after:translate-x-full after:translate-x-4 peer-checked:bg-[#028A34] bg-[#028A34]"></div>
                  </label>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                  Compounding is <strong className="text-green-800">Always Active</strong> on all Lafarge cement development allocations to guarantee maximum shareholder compound returns.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-green-800 font-black pt-1 bg-green-100/20 px-2 py-1 rounded">
                  <Sparkles className="w-3.5 h-3.5 text-green-600 animate-pulse" /> Rollover Pipeline: Activated and Secured
                </div>
              </div>

              {/* Real-time Forecast Calculations */}
              <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl space-y-1.5 text-xs text-gray-555 font-semibold">
                <div className="flex justify-between">
                  <span>Daily Yield Dividends:</span>
                  <strong className="text-green-700">
                    +{formatNGN(parseFloat(amount || '0') * 0.10)} / Day
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Return in {product.termDays} Days (Term):</span>
                  <strong className="text-gray-900 font-mono">
                    +{formatNGN(parseFloat(amount || '0') * 0.10 * product.termDays)} ({(10 * product.termDays).toFixed(0)}.0%)
                  </strong>
                </div>
                <div className="flex justify-between border-t border-gray-200/50 pt-1.5 mt-1.5">
                  <span>Principal + Profit Paid Back:</span>
                  <strong className="text-[#028A34] text-sm font-mono">
                    {formatNGN(parseFloat(amount || '0') * (1 + 0.10 * product.termDays))}
                  </strong>
                </div>
                {true && (
                  <div className="flex justify-between border-t border-dashed border-gray-200 mt-2 pt-2 text-[#028A34] font-extrabold text-[12px]">
                    <span>Expected Compound (3 cycles):</span>
                    <span className="font-mono">{formatNGN(parseFloat(amount || '0') * Math.pow(1 + 0.10 * product.termDays, 3))}</span>
                  </div>
                )}
              </div>

              <button
                id="btn-confirm-investment"
                type="submit"
                className="w-full py-3 bg-[#028A34] hover:bg-[#027029] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                Acquire Option Position
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

function XComp() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
