import { useState } from 'react';
import { X, Gift, ShieldAlert, CheckCircle, Landmark, User, Mail, HelpCircle } from 'lucide-react';
import { formatNGN } from '../utils';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulatedTime: number;
  onRegisterSuccess: (newUser: {
    fullName: string;
    email: string;
    accountNumber: string;
    referralUsed: string;
    password?: string;
  }) => void;
}

export default function RegisterModal({
  isOpen,
  onClose,
  simulatedTime,
  onRegisterSuccess
}: RegisterModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [bankName, setBankName] = useState('Access Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!acceptedTerms) {
      setErrorMsg('You must read and accept the Shareholder Terms & Conditions before registering.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full official name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (accountNumber.length !== 10 || isNaN(Number(accountNumber))) {
      setErrorMsg('Nigerian bank NUBAN account number must be exactly 10 digits.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Security PIN/Password must be at least 4 characters.');
      return;
    }

    // Success state
    setIsSuccess(true);
    setTimeout(() => {
      onRegisterSuccess({
        fullName: fullName.trim(),
        email: email.trim(),
        accountNumber: `NG-ACC-${accountNumber}|${bankName}`,
        referralUsed: referralCode.trim(),
        password: password.trim()
      });
      setIsSuccess(false);
      onClose();
      // Reset form
      setFullName('');
      setEmail('');
      setAccountNumber('');
      setPassword('');
      setReferralCode('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto" id="register-modal-container">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-100 flex flex-col">
          
          {/* Header block */}
          <div className="bg-gradient-to-r from-green-800 to-emerald-950 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-green-150 hover:text-white transition-colors cursor-pointer bg-black/10 hover:bg-black/25 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 rounded-2xl text-white shadow-xl shadow-amber-500/20">
                <Gift className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-display font-black text-lg tracking-tight uppercase">Register & Earn ₦500.00</h4>
                <p className="text-emerald-100 text-xs font-semibold leading-none mt-1">Lafarge shareholder welcome program</p>
              </div>
            </div>
          </div>

          {isSuccess ? (
            <div className="p-10 text-center space-y-4 animate-fade-in flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-10 h-10 text-green-600 animate-bounce" />
              </div>
              <h3 className="text-xl font-black text-gray-950">Registration Completed!</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium leading-relaxed">
                Congratulations! We have instantiated your secure portfolio ledger and credited your liquid wallet with <strong className="text-green-700 font-extrabold text-base">₦500.00</strong> sign-up welcome bonus.
              </p>
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-widest animate-pulse">
                Deploying local workspace...
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Highlight Promo banner */}
              <div className="p-3 bg-amber-50 border border-amber-150 rounded-xl flex gap-2.5 items-start">
                <Gift className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
                  Lafarge guarantees <strong>₦500.00 welcome bonus credit</strong> immediately upon registration of brand new shareholder accounts. No initial deposit is required to lock in the bonus!
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-red-700 text-xs font-bold leading-normal flex gap-2 items-center">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                  {errorMsg}
                </div>
              )}

              {/* Grid 2-col inputs */}
              <div className="space-y-4 font-sans">
                
                {/* Full Name field */}
                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" /> Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Babajide Chinedu"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 focus:border-green-600 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
                  />
                </div>

                {/* Email address field */}
                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. chinedu@example.com"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 focus:border-green-600 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
                  />
                </div>

                {/* Simulated payout bank account */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5 flex items-center gap-1">
                      <Landmark className="w-3.5 h-3.5 text-gray-400" /> Receiving Bank
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      <option>Access Bank</option>
                      <option>Zenith Bank</option>
                      <option>GTBank</option>
                      <option>UBA Plc</option>
                      <option>Fidelity Bank</option>
                      <option>First Bank of Nigeria</option>
                      <option>OPay</option>
                      <option>PalmPay</option>
                      <option>Moniepoint Microfinance</option>
                      <option>Kuda Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5 flex items-center gap-1">
                      NUBAN Account
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit Account No"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 focus:border-green-600 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Security PIN or password */}
                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                    Security Account PIN / Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 focus:border-green-600 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
                  />
                </div>

                {/* Optional Referral Code used to claim referee rewards */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider flex items-center gap-1">
                      Referral Code <span className="text-[9px] text-green-700 italic font-black">(Optional)</span>
                    </label>
                    <span className="text-[9px] text-gray-400 font-bold" title="Entering a referral code grants ₦505 to the referrer">What is this?</span>
                  </div>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="e.g. LAF-OBAZEE-2026"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 focus:border-green-600 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none uppercase tracking-wide transition-all"
                  />
                  {referralCode.trim() && (
                    <div className="mt-1.5 p-2 bg-green-50/50 rounded-lg text-[10px] text-[#028A34] font-bold flex gap-1 items-center">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" /> Code format logged. Referrer will receive rewards upon your deposits.
                    </div>
                  )}
                </div>

                {/* Mandatory Terms & Conditions Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#028A34] focus:ring-[#028A34]"
                    />
                    <span className="text-[10px] text-gray-500 font-semibold leading-snug">
                      I accept the <span className="text-[#028A34] font-bold underline">Shareholder Terms & Conditions</span>, Lafarge Africa investment guidelines, and confirm my bank details are accurate.
                    </span>
                  </label>
                </div>

              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={!acceptedTerms}
                className={`w-full py-3 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md mt-2 cursor-pointer flex items-center justify-center gap-1.5 ${
                  acceptedTerms 
                    ? 'bg-[#028A34] hover:bg-green-800 shadow-green-150' 
                    : 'bg-gray-300 shadow-none cursor-not-allowed opacity-60'
                }`}
              >
                Create Shareholder Account & Activate Vault
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
