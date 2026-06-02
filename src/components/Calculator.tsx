import { useState } from 'react';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { formatNGN } from '../utils';

export default function Calculator() {
  const [calcAmount, setCalcAmount] = useState<number>(3000);
  const [cycles, setCycles] = useState<number>(3); // default 3 cycles (12 days)

  // Each 4-day cycle delivers 15% daily dividends, summing up to 60.0% returns per cycle term.
  const returnRatePerCycle = 0.60; 
  
  // Calculate standard profit
  const standardReturn = calcAmount * returnRatePerCycle * cycles;
  const standardTotal = calcAmount + standardReturn;

  // Calculate compounding profit (1.60^cycles)
  const compoundTotal = calcAmount * Math.pow(1 + returnRatePerCycle, cycles);
  const compoundReturn = compoundTotal - calcAmount;

  return (
    <div className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-6">
      
      {/* Title */}
      <div>
        <h3 className="text-lg font-bold text-gray-950 font-sans flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" /> Dividend Growth Calculator
        </h3>
        <p className="text-xs text-gray-400">Simulate Lafarge stock options growth. Contrast standard withdrawals with the 4-day rolling compounding engine.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sliders and Inputs */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-bold uppercase tracking-wider">Simulated Share Capital Size</span>
              <strong className="text-green-700 font-black text-lg font-mono">{formatNGN(calcAmount)}</strong>
            </div>
            
            <input
              id="calculator-range-amount"
              type="range"
              min="3000"
              max="500000"
              step="1000"
              value={calcAmount}
              onChange={(e) => setCalcAmount(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-150 rounded-lg appearance-none cursor-pointer accent-green-600 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-semibold uppercase">
              <span>₦3,000</span>
              <span>₦100,000</span>
              <span>₦250,500</span>
              <span>₦500,000</span>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Simulation Terms (4-day Rolling Cycles)</span>
            
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '4 Days', val: 1 },
                { label: '12 Days', val: 3 },
                { label: '20 Days', val: 5 },
                { label: '40 Days', val: 10 }
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  id={`calc-cycle-${item.val}`}
                  onClick={() => setCycles(item.val)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    cycles === item.val
                      ? 'bg-[#028A34] border-[#028A34] text-white shadow shadow-green-600/10'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                  <span className="block text-[9px] opacity-75 font-medium mt-0.5">{item.val} Turn{item.val > 1 ? 's' : ''}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-green-50/35 border border-green-105 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-green-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <span className="text-xs font-extrabold text-green-900 uppercase tracking-wide block">Compounding Factor: 1.60x Per Turn</span>
              <p className="text-[11px] text-gray-450 leading-relaxed font-semibold">
                By enabling rollover compounding, your 15% daily dividends (₦450 per ₦3,000) are automatically folded back into your holdings. At 60.0% term gain per 4 days, your capital grows geometrically, delivering extreme asset compounding.
              </p>
            </div>
          </div>
        </div>

        {/* Results comparisons */}
        <div className="lg:col-span-15 bg-gray-50/50 border border-slate-100/80 rounded-2xl p-5 space-y-4 lg:col-span-5">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest block border-b border-gray-150 pb-2">Projections</span>
          
          <div className="space-y-3">
            {/* Standard Return box */}
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-gray-500 font-bold">Standard Daily Cashouts</span>
                <span className="text-sm font-extrabold text-gray-805 font-mono">{formatNGN(standardTotal)}</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gray-400 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (standardTotal / compoundTotal) * 100)}%` }} 
                  / >
              </div>
              <p className="text-[10px] text-gray-400">Liquid dividends are extracted daily, and principal returns after cycles.</p>
            </div>

            {/* Compounded Return box */}
            <div className="space-y-1 pt-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-green-800 font-black flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Rolling Compound Pipeline
                </span>
                <span className="text-lg font-black text-[#028A34] font-mono">{formatNGN(compoundTotal)}</span>
              </div>
              <div className="w-full bg-green-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#028A34] h-full rounded-full" style={{ width: '100%' }} />
              </div>
              <p className="text-[10px] text-green-700/80 font-semibold">Maximum acceleration backed by exponential dry cement block capacity expansion.</p>
            </div>
          </div>

          <div className="border-t border-gray-250 pt-4 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Initial Share Buy-in:</span>
              <span className="font-bold text-gray-900 font-mono">{formatNGN(calcAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-green-800 font-semibold bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-100">
              <span className="flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 shrink-0" /> Net Yield Projection:
              </span>
              <span className="font-mono font-black text-[#028A34]">+{formatNGN(compoundReturn)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
