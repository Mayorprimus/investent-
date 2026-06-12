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

            <div className="p-4 sm:p-5 text-center space-y-4">
              
              {/* Main Badge Graphic */}
              <div className="relative inline-flex items-center justify-center p-3 bg-gradient-to-br from-emerald-50 to-green-155 rounded-xl border border-green-200 mx-auto mt-1">
                <Gift className="w-8 h-8 text-[#028A34]" />
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-0.5 -right-0.5"
                >
                  <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                </motion.div>
              </div>

              {/* Header Title with Brand Touch */}
              <div className="space-y-1">
                <span className="text-[9px] font-black tracking-widest text-[#028A34] uppercase bg-green-50 border border-green-150 px-2 py-0.5 rounded-full inline-block">
                  Registration Bonus Active
                </span>
                <h3 className="text-lg font-black text-gray-950 font-display tracking-tight leading-tight">
                  Unlock ₦500.00 Referrals + 5-Level Comms!
                </h3>
                <p className="text-[11px] text-gray-500 font-semibold max-w-xs mx-auto leading-relaxed">
                  Every user you invite credits your balance with <strong className="text-green-800">₦500.00</strong> setup bonus. 
                  Plus, unlock up to <strong className="text-emerald-700">5 levels of daily network commission</strong> starting from 1.0% (Level 1) up to 5.0% (Level 5) as your referral footprint expands!
                </p>
              </div>

              {/* Payment Account Notice Indicator */}
              <div className="p-3 bg-amber-50/70 border border-amber-150 rounded-xl text-left">
                <div className="flex gap-2 items-start text-xs font-bold text-amber-950">
                  <span className="w-5 h-5 rounded-lg bg-amber-100 text-amber-800 text-[10px] shrink-0 font-extrabold flex items-center justify-center">Bank</span>
                  <div className="space-y-0.5">
                    <span>Change Payment Account Choice</span>
                    <p className="text-[10px] text-amber-700 font-medium leading-normal">
                      Did you enter wrong bank details? You can easily adjust or change your receiving bank brand or account number at any time via your dashboard <strong>Profile Settings</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Your Personal Referral Code / Card */}
              <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 text-left space-y-1">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
                  Your Personal Shareholder Invite Link
                </span>
                <input
                  type="text"
                  readOnly
                  value={getReferralLink()}
                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-[10px] text-gray-500 font-mono focus:outline-none select-all font-semibold"
                />
              </div>

              {/* Mega Action Button */}
              <div className="pt-1 space-y-2">
                <button
                  type="button"
                  id="promo-copy-btn"
                  onClick={handleCopyLink}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-[0.98] ${
                    copied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-[#028A34] hover:bg-green-800 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" /> Copied Successfully!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Invite Link
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-center text-[10px] text-gray-400 hover:text-gray-600 font-bold uppercase tracking-wider py-1 transition-colors cursor-pointer"
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
