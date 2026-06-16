import { useState } from 'react';
import { FastForward, Clock, Check, Info } from 'lucide-react';
import { formatTime } from '../utils';

interface VirtualTimeMachineProps {
  simulatedTime: number;
  onAdvanceTime: (ms: number) => void;
  activeInvestmentsCount: number;
}

export default function VirtualTimeMachine({
  simulatedTime,
  onAdvanceTime,
  activeInvestmentsCount
}: VirtualTimeMachineProps) {
  const [justAdvanced, setJustAdvanced] = useState(false);
  const [lastLeap, setLastLeap] = useState('');

  const handleLeap = (days: number, hours: number = 0) => {
    const ms = (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000);
    onAdvanceTime(ms);
    setJustAdvanced(true);
    setLastLeap(days > 0 ? `+${days} Day` + (days > 1 ? 's' : '') : `+${hours} Hour` + (hours > 1 ? 's' : ''));
    
    // reset animation state
    setTimeout(() => {
      setJustAdvanced(false);
    }, 2200);
  };

  return (
    <div className="bg-[#062817] text-white rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Decorative ambient backdrop */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-700/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      <div className="space-y-2.5 relative z-10 w-full md:w-auto">
        <span className="text-[10px] font-bold text-green-305 uppercase tracking-widest bg-green-950 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 shrink-0 text-green-400" /> Stock Simulation Engine
        </span>
        <div className="space-y-1">
          <h3 className="text-xl font-bold font-sans">Accelerate Stock Platform Time</h3>
          <p className="text-xs text-green-200/80 max-w-md">
            Skip days instantly to test dividend accrual. Held Lafarge share options automatically accumulate high compound dividends over their 30-day term cycle!
          </p>
        </div>
        
        {/* Timestamp */}
        <div className="p-3 bg-black/40 border border-green-800/40 rounded-xl space-y-1 flex items-center justify-between gap-4">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-green-400 font-bold block">Current Simulated Time</span>
            <span className="text-sm font-bold font-mono tracking-wide text-green-50">
              {formatTime(simulatedTime)}
            </span>
          </div>
          {justAdvanced && (
            <span className="text-xs font-black text-green-400 bg-green-950 border border-green-800 px-2.5 py-1 rounded animate-pulse flex items-center gap-1 shrink-0">
              <Check className="w-3.5 h-3.5 shrink-0" /> Jumped {lastLeap}!
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 space-y-3.5 w-full md:w-auto relative z-10">
        <span className="text-xs font-black text-green-200 uppercase tracking-widest block text-center md:text-right">Jump Intervals</span>
        
        <div className="grid grid-cols-3 gap-2 w-full md:w-[320px]">
          <button
            id="btn-time-leap-1h"
            onClick={() => handleLeap(0, 1)}
            className="py-3 bg-green-900/60 hover:bg-green-850 text-green-100 rounded-xl text-xs font-bold border border-green-800/50 hover:border-green-600 active:scale-95 transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-0.5"
          >
            <span className="text-sm tracking-tight">+1 Hr</span>
            <span className="text-[8px] opacity-65 font-medium">Partial cycle</span>
          </button>

          <button
            id="btn-time-leap-1d"
            onClick={() => handleLeap(1)}
            className="py-3 bg-green-800 hover:bg-green-750 text-white rounded-xl text-xs font-semibold border border-green-700/50 hover:border-green-500 active:scale-95 transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-0.5 shadow"
          >
            <span className="text-sm font-bold tracking-tight">+1 Day</span>
            <span className="text-[8px] opacity-75 font-medium">Daily Dividend</span>
          </button>

          <button
            id="btn-time-leap-30d"
            onClick={() => handleLeap(30)}
            className="py-3 bg-white hover:bg-green-50 text-green-950 rounded-xl text-xs font-semibold active:scale-95 transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-0.5 shadow-md shadow-green-950/20"
          >
            <span className="text-sm font-black tracking-tight flex items-center gap-1">
              <FastForward className="w-3.5 h-3.5 fill-green-950 text-green-950" /> +30 Days
            </span>
            <span className="text-[8px] text-[#028A34] font-extrabold">Complete Cycle</span>
          </button>
        </div>

        {activeInvestmentsCount === 0 && (
          <div className="p-2 bg-black/40 border border-green-800/20 rounded-xl text-[10px] text-green-300 flex items-start gap-1.5 leading-normal">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-green-400" />
            <span>Buy Lafarge shares before advancing time to trigger daily interest payouts!</span>
          </div>
        )}
      </div>

    </div>
  );
}
