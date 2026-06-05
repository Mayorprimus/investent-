import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Factory, ShieldCheck, Cpu, HardHat, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Security Node...');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const statuses = [
      { threshold: 15, text: 'Connecting to Lafarge Ledger Gateway...' },
      { threshold: 40, text: 'Securing Huaxin Cement Vault Auth...' },
      { threshold: 65, text: 'Syncing Ewekoro Dry Kiln Asset Options...' },
      { threshold: 85, text: 'Encrypting Shareholder Communications...' },
      { threshold: 95, text: 'Active Capital Security Validations Passed!' },
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 4;
        const currentProgress = next >= 100 ? 100 : next;

        const matchingStatus = [...statuses]
          .reverse()
          .find((s) => currentProgress >= s.threshold);
        if (matchingStatus) {
          setStatusText(matchingStatus.text);
        }

        if (currentProgress === 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
          }, 800);
        }
        return currentProgress;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          id="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 0.98,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-radial from-slate-900 via-slate-950 to-black text-white p-6 overflow-hidden select-none"
        >
          {/* Animated Ambient background grids & nodes */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]" />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#028A34]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
            
            {/* Animated Logo Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                transition: { delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }
              }}
              className="relative mb-8"
            >
              {/* Spinning/pulsing neon green aura ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset--3 rounded-2xl border border-[#028A34]/30 pointer-events-none"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute inset--2 rounded-2xl border border-dashed border-[#028A34]/25 pointer-events-none"
              />

              {/* Central Iconic Badge */}
              <div className="relative p-6 bg-gradient-to-br from-[#028a34] to-emerald-800 rounded-2xl shadow-2xl shadow-[#028A34]/30 border border-[#028A34]/40 flex items-center justify-center">
                <Factory className="w-12 h-12 text-white animate-pulse" />
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5] 
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-2 right-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300 fill-emerald-200" />
                </motion.div>
              </div>
            </motion.div>

            {/* Title Block */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                transition: { delay: 0.4, duration: 0.6 }
              }}
              className="space-y-2 mb-10"
            >
              <h1 className="font-display text-3xl font-black tracking-tight text-white uppercase flex items-center justify-center gap-2">
                LAFARGE <span className="text-emerald-450 font-normal text-xs px-2 py-0.5 border border-emerald-500/30 rounded bg-emerald-950/40 text-emerald-400">HUB</span>
              </h1>
              <p className="text-[10px] text-emerald-300 font-bold tracking-widest uppercase leading-none">
                Strategic Alliance Joint Portfolio Venture
              </p>
              <p className="text-[11px] text-slate-400 font-extrabold tracking-wide mt-2">
                Huaxin Cement Group Co-investment Network
              </p>
            </motion.div>

            {/* Unified Loading & Progress system */}
            <div className="w-full space-y-4 px-4">
              
              {/* Progress bar outer container */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden p-[1px] border border-slate-700/50">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 via-[#028a34] to-teal-400 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeInOut" }}
                />
              </div>

              {/* Extra visual indicators & percentage */}
              <div className="flex justify-between items-center text-slate-400 text-xxs font-mono">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-[#028A34]" /> Secure SSL Auth
                </span>
                <span className="text-emerald-400 font-black">{progress}%</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#028A34]" /> Ledger Active
                </span>
              </div>

              {/* Live updating status message */}
              <motion.p
                key={statusText}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-slate-350 text-xs font-semibold font-medium h-4 mt-1 text-slate-300"
              >
                {statusText}
              </motion.p>
            </div>

            {/* Footer trust badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] font-sans tracking-widest uppercase font-black text-slate-500"
            >
              <HardHat className="w-3 h-3" /> Powered by Lafarge Africa PLC Corporate Venture
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
