import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Copy, Check, Sparkles, X, Share2, Award, Coins, Send } from 'lucide-react';
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
  const [copiedMsg, setCopiedMsg] = useState(false);

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
    const baseDomain = "https://laferageinvestmentshares.xyz";
    return `${baseDomain}?ref=${wallet.referralCode}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getReferralLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getPromoMessage = (refLink: string) => {
    return `🏗️ *Lafarge Cement Investment Shares Plc* 🏗️\nSecure your daily passive dividends with Nigeria's premier cement plant expansion options! Backed by physical assets and escrow-safe payouts. 📈\n\n💰 *Onboarding Reward:* Get *₦500.00* instantly credited to your register upon signup!\n📊 *Daily Passive Yields:* Earn up to *26.67% daily dividends* on professional options plans (Lagoon, Ewekoro, Sagamu, Ashaka, Mfamosing, Calabar).\n👥 *Passive Earnings:* Build a network and unlock up to 5 tiers of high-leveraged daily passive commissions starting from 0.1%!\n\nJoin our active stakeholder network instantly using my unique link:\n👇👇👇\n${refLink}`;
  };

  const handleCopyPromo = () => {
    const msg = getPromoMessage(getReferralLink());
    navigator.clipboard.writeText(msg);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const getWhatsAppShareUrl = () => {
    const msg = getPromoMessage(getReferralLink());
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
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
                  Plus, unlock up to <strong className="text-emerald-700">5 levels of daily network commission</strong> starting from 0.1% (Level 1) up to 0.5% (Level 5) as your referral footprint expands!
                </p>
              </div>

              {/* Telegram Community Notice */}
              <div className="p-3 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 rounded-xl text-left">
                <div className="flex gap-2.5 items-start text-xs font-bold text-sky-950">
                  <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4 text-white" />
                  </div>
                  <div className="space-y-1 w-full">
                    <span className="text-gray-900 font-extrabold text-[12px]">Join Official Telegram Community</span>
                    <p className="text-[10.5px] text-gray-500 font-semibold leading-relaxed">
                      Make sure to join our active Telegram groups and channel for daily announcements, dividend payout confirmations, and fast support:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 pt-1 font-sans">
                      <a 
                        href="https://t.me/+kXjTOqAGZK1kYWJk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-2 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-[9px] rounded-lg tracking-wider transition-colors inline-block text-center shadow-xs"
                      >
                        📬 JOIN TELEGRAM CHANNEL
                      </a>
                      <a 
                        href="https://t.me/+lXKtQC1GNbsxMzY0"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-2 py-1.5 border border-sky-300 bg-white hover:bg-sky-50 text-sky-700 font-extrabold text-[9px] rounded-lg tracking-wider transition-colors inline-block text-center shadow-xs"
                      >
                        💬 TELEGRAM GROUP
                      </a>
                    </div>
                  </div>
                </div>
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
              <div className="bg-gray-50 border border-gray-150 rounded-2xl p-3.5 text-left space-y-3 font-sans">
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                    Your Personal Shareholder Invite Link
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getReferralLink()}
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-[10px] text-gray-500 font-mono focus:outline-none select-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-205 transition-colors cursor-pointer text-[10px] font-bold shrink-0"
                    >
                      {copied ? "Copied!" : "Copy URL"}
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-150 pt-2.5 space-y-1.5">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
                    💬 Pre-filled WhatsApp Promo Preview
                  </span>
                  <div className="bg-white border border-gray-150 rounded-lg p-2.5 text-[9px] font-medium leading-relaxed italic text-gray-500 max-h-16 overflow-y-auto select-all">
                    "🏗️ *Lafarge Cement Investment Shares Plc* 🏗️ Secure your daily passive dividends with Nigeria's premier cement plant expansion options..."
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                  <button
                    id="btn-promo-copy-pitch-modal"
                    type="button"
                    onClick={handleCopyPromo}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 border border-green-200 hover:border-green-300 bg-white hover:bg-green-50/40 text-green-750 font-bold text-[10px] rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    {copiedMsg ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedMsg ? "Message Copied" : "Copy Invite Text"}
                  </button>
                  <a
                    id="btn-promo-whatsapp-modal"
                    href={getWhatsAppShareUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#128C7E] hover:bg-[#075E54] text-white font-black text-[10px] rounded-xl transition-all shadow-sm shrink-0 text-center"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share template
                  </a>
                </div>
              </div>

              {/* Mega Action Button */}
              <div className="pt-1 space-y-2">
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
