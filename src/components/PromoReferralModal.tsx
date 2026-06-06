import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Copy, Check, Sparkles, X, Share2, Award, Coins } from 'lucide-react';
import { UserWallet } from '../types';

interface PromoReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: UserWallet;
  adminApprovalSettings?: {
    requireDepositApproval: boolean;
    requireInvestmentApproval: boolean;
    requireWithdrawalApproval: boolean;
    customReferralLink?: string;
    isReferralLinkStatic?: boolean;
  };
}

export default function PromoReferralModal({ isOpen, onClose, wallet, adminApprovalSettings }: PromoReferralModalProps) {
  const [copied, setCopied] = useState(false);

  const getReferralLink = () => {
    const link = adminApprovalSettings?.customReferralLink;
    if (link && link.trim() !== '') {
      if (adminApprovalSettings.isReferralLinkStatic) {
        return link.trim();
      }
      if (link.includes('{CODE}')) {
        return link.replace('{CODE}', wallet.referralCode).trim();
      }
      if (link.endsWith('=')) {
        return `${link.trim()}${wallet.referralCode}`;
      }
      const separator = link.includes('?') ? '&' : '?';
      return `${link.trim()}${separator}ref=${wallet.referralCode}`;
    }
    return `${window.location.origin}?ref=${wallet.referralCode}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getReferralLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#062817]/70 backdrop-blur-md flex items-center justify-center z-[1000] p-4 font-sans select-none"
        >
          <motion.div
            initial={{ scale: 0.93, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.93, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-white border border-green-100 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
          >
            {/* Top decorative gradient bar */}
            <div className="h-2 bg-gradient-to-r from-emerald-600 via-[#028A34] to-yellow-500 w-full" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
              aria-label="Close modal"
              id="close-promo-modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 text-center space-y-6">
              
              {/* Main Badge Graphic */}
              <div className="relative inline-flex items-center justify-center p-5 bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl border border-green-200 mx-auto mt-2">
                <Gift className="w-12 h-12 text-[#028A34] animate-bounce" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                </motion.div>
              </div>

              {/* Header Title with Brand Touch */}
              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-widest text-[#028A34] uppercase bg-green-50 border border-green-150 px-3 py-1 rounded-full inline-block">
                  Double Booster Reward Registered
                </span>
                <h3 className="text-2xl font-black text-gray-950 font-display tracking-tight leading-tight pt-1">
                  Share & Unlock ₦500.00 Referral Bonuses!
                </h3>
                <p className="text-xs text-gray-400 font-extrabold max-w-sm mx-auto">
                  Corporate Alliance Shareholder Expansion Incentive
                </p>
              </div>

              {/* Bonus Information highlight */}
              <div className="bg-slate-50 border border-gray-150 rounded-2xl p-4 text-left space-y-3.5">
                <div className="flex gap-3 items-start">
                  <div className="p-1.5 bg-green-50 text-[#028A34] rounded-lg shrink-0 border border-green-100 mt-0.5">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide leading-none">Instant ₦500.00 Payoffs</h4>
                    <p className="text-[11px] text-gray-500 font-semibold mt-1 leading-normal">
                      Every single partner you invite that completes their corporate options registration credits your wallet with an immediate <strong className="text-gray-950 font-bold">₦500.00 booster reward</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-1.5 bg-yellow-50 text-amber-700 rounded-lg shrink-0 border border-yellow-100 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide leading-none">Zero Cap on Earnings</h4>
                    <p className="text-[11px] text-gray-500 font-semibold mt-1 leading-normal">
                      There are no caps or throttles on how many alliance partners you can invite. Accumulate booster credits to withdraw or roll over into active cement production portfolios.
                    </p>
                  </div>
                </div>
              </div>

              {/* Your Personal Referral Code / Card */}
              <div className="border border-green-100 bg-green-50/10 rounded-2xl p-4 text-left space-y-2">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">
                  Your Personal Shareholder Referral Link
                </span>
                
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={getReferralLink()}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-[11px] text-gray-500 font-mono focus:outline-none select-all font-semibold"
                  />
                </div>
              </div>

              {/* Mega Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  id="promo-copy-btn"
                  onClick={handleCopyLink}
                  className={`w-full py-3 px-5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-[0.98] ${
                    copied 
                      ? 'bg-emerald-600 shadow-emerald-250 text-white' 
                      : 'bg-[#028A34] hover:bg-green-800 shadow-green-150 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 animate-scale" /> Link Securely Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy Shareholder Invite Link
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-center text-[10px] text-gray-400 hover:text-gray-600 font-black uppercase tracking-wider mt-3.5 transition-colors cursor-pointer"
                >
                  Continue to Asset Portfolio
                </button>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
