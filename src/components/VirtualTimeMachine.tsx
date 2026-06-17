import { useState } from 'react';
import { FastForward, Clock, Lock, Info, AlertTriangle } from 'lucide-react';
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
  const [showLockedMessage, setShowLockedMessage] = useState(false);

  const handleLeap = () => {
    setShowLockedMessage(true);
    setTimeout(() => setShowLockedMessage(false), 5000);
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
          <h3 className="text-xl font-bold font-sans">Lafarge Stock Platform Time</h3>
          <p className="text-xs text-green-200/80 max-w-md">
            Held Lafarge share options automatically accumulate high daily compound yields over their 30-day term cycle directly in real-time!
          </p>
        </div>
        
        {/* Timestamp */}
        <div className="p-3 bg-black/40 border border-green-800/40 rounded-xl space-y-1 flex items-center justify-between gap-4">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-green-400 font-bold block">Current System Clock</span>
            <span className="text-sm font-bold font-mono tracking-wide text-green-50">
              {formatTime(simulatedTime)}
            </span>
          </div>
          <span className="text-[10px] font-bold text-amber-500 bg-amber-955/40 border border-amber-900/50 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
            <Lock className="w-3 h-3" /> SECURITY LOCKED
          </span>
        </div>

        {showLockedMessage && (
          <div className="p-3 bg-amber-950/80 border border-amber-900/50 text-amber-200 rounded-xl text-xs flex items-start gap-1.5 leading-normal animate-shake">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>⚠️ Manual time manipulation is permanently disabled on this node to secure shareholder capital and ensure real-time dividend validity.</span>
          </div>
        )}
      </div>

      <div className="shrink-0 space-y-3.5 w-full md:w-auto relative z-10">
        <span className="text-xs font-black text-green-200 uppercase tracking-widest block text-center md:text-right">Jump Controls</span>
        
        <div className="grid grid-cols-3 gap-2 w-full md:w-[320px]">
          <button
            id="btn-time-leap-1h"
            onClick={handleLeap}
            className="py-3 bg-green-950/40 hover:bg-green-950/60 text-green-400/60 rounded-xl text-xs font-bold border border-green-900/30 hover:border-amber-900/50 transition-all text-center cursor-not-allowed flex flex-col items-center justify-center gap-0.5 group relative"
          >
            <Lock className="w-3.5 h-3.5 text-amber-500/80 absolute top-1 right-1 opacity-100" />
            <span className="text-sm tracking-tight line-through opacity-50">+1 Hr</span>
            <span className="text-[8px] opacity-30 font-medium">Locked</span>
          </button>

          <button
            id="btn-time-leap-1d"
            onClick={handleLeap}
            className="py-3 bg-green-950/40 hover:bg-green-950/60 text-white/50 rounded-xl text-xs font-semibold border border-green-900/30 hover:border-amber-900/50 transition-all text-center cursor-not-allowed flex flex-col items-center justify-center gap-0.5 shadow relative"
          >
            <Lock className="w-3.5 h-3.5 text-amber-500/80 absolute top-1 right-1 opacity-100" />
            <span className="text-sm font-bold tracking-tight line-through opacity-50">+1 Day</span>
            <span className="text-[8px] opacity-30 font-medium">Locked</span>
          </button>

          <button
            id="btn-time-leap-30d"
            onClick={handleLeap}
            className="py-3 bg-green-950/40 hover:bg-green-950/60 text-green-50/50 rounded-xl text-xs font-semibold transition-all text-center cursor-not-allowed flex flex-col items-center justify-center gap-0.5 shadow-md border border-green-900/30 hover:border-amber-900/50 relative"
          >
            <Lock className="w-3.5 h-3.5 text-amber-500/80 absolute top-1 right-1 opacity-100" />
            <span className="text-sm font-black tracking-tight flex items-center gap-1 line-through opacity-50">
              <FastForward className="w-3.5 h-3.5 opacity-30" /> +30 Days
            </span>
            <span className="text-[8px] text-amber-500 opacity-60 font-semibold">Locked</span>
          </button>
        </div>

        {activeInvestmentsCount === 0 && (
          <div className="p-2 bg-black/40 border border-green-800/20 rounded-xl text-[10px] text-green-300 flex items-start gap-1.5 leading-normal">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-green-400" />
            <span>Buy Lafarge shares to automatically generate secure compounding real-time dividends.</span>
          </div>
        )}
      </div>

    </div>
  );
}
