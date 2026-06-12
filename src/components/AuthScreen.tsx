import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Landmark, User, Mail, Lock, Gift, HelpCircle, ShieldCheck } from 'lucide-react';
import { formatNGN } from '../utils';
import { UserWallet } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (userWallet: UserWallet, isAdmin: boolean) => void;
  registeredUsers: UserWallet[];
  onRegisterUser: (newUser: UserWallet) => void;
}

export default function AuthScreen({
  onLoginSuccess,
  registeredUsers,
  onRegisterUser
}: AuthScreenProps) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup states
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [bankName, setBankName] = useState('Access Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-detect referral code from URL search param or pathname
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      if (refParam) {
        setReferralCode(refParam.trim());
        setTab('signup');
      }
    } catch (e) {}
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const targetEmail = email.trim().toLowerCase();
    const targetPassword = password;

    // 1. Admin login checking
    if (targetEmail === 'admin1234@gmail.com' && targetPassword === 'admin1234') {
      setIsSuccess(true);
      setTimeout(() => {
        // Admin user profile structure
        onLoginSuccess({
          fullName: 'Corporate Admin',
          email: 'admin1234@gmail.com',
          walletBalance: 0,
          investedBalance: 0,
          withdrawnBalance: 0,
          earnedBalance: 0,
          accountNumber: 'NG-ACC-ADMIN',
          referralCode: 'LAF-ADMIN-2026',
          referralsCount: 0,
          referralEarnings: 0,
          hasClaimedBonus: true,
          password: 'admin1234'
        }, true);
        setIsSuccess(false);
      }, 1000);
      return;
    }

    // 2. Regular customer login checking
    const userMatch = registeredUsers.find(
      u => u.email.toLowerCase() === targetEmail && (!u.password || u.password === targetPassword)
    );

    if (userMatch) {
      setIsSuccess(true);
      setTimeout(() => {
        onLoginSuccess(userMatch, false);
        setIsSuccess(false);
      }, 1000);
    } else {
      setErrorMsg('Incorrect shareholder email address or security account PIN/password.');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!acceptedTerms) {
      setErrorMsg('You must agree to the Shareholder Terms & Conditions before registering.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full legal official name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMsg('Please enter a valid shareholder email address.');
      return;
    }
    if (signupEmail.trim().toLowerCase() === 'admin1234@gmail.com') {
      setErrorMsg('The email administrative routing space is restricted. Please use your private email.');
      return;
    }
    if (accountNumber.length !== 10 || isNaN(Number(accountNumber))) {
      setErrorMsg('Nigerian bank NUBAN account number must be exactly 10 digits.');
      return;
    }
    if (signupPassword.length < 4) {
      setErrorMsg('Security Password PIN must be at least 4 alphanumeric digits.');
      return;
    }

    // Check if user already exists
    const exists = registeredUsers.some(u => u.email.toLowerCase() === signupEmail.trim().toLowerCase());
    if (exists) {
      setErrorMsg('A shareholder workspace already exists for this email address. Please sign in instead.');
      return;
    }

    // Create a brand new wallet that starts empty (0 balance)
    const cleanNamePart = fullName.trim().split(' ')[0]?.toUpperCase().replace(/[^A-Z]/g, '') || 'MEMBER';
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const generatedReferralCode = `LAF-${cleanNamePart}-${randCode}`;
    const newWallet: UserWallet = {
      fullName: fullName.trim(),
      email: signupEmail.trim(),
      accountNumber: `NG-ACC-${accountNumber}|${bankName}`,
      walletBalance: 0, // Fresh shareholder starts with 0 Naira
      investedBalance: 0,
      withdrawnBalance: 0,
      earnedBalance: 0,
      referralCode: generatedReferralCode,
      referralsCount: 0,
      referralEarnings: 0,
      hasClaimedBonus: false,
      password: signupPassword,
      isFlagged: false,
      requireReferralToWithdraw: false,
      referredBy: referralCode.trim() || undefined
    };

    onRegisterUser(newWallet);
    setIsSuccess(true);
    setSuccessMsg('Portfolio ledger successfully designated!');

    setTimeout(() => {
      onLoginSuccess(newWallet, false);
      setIsSuccess(false);
      // Reset signup fields
      setFullName('');
      setSignupEmail('');
      setAccountNumber('');
      setSignupPassword('');
      setReferralCode('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-800 via-[#028A34] to-yellow-500" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        {/* Brand visual header */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-50 border border-emerald-150 rounded-2xl">
          <div className="w-6 h-6 rounded-lg bg-[#028A34] flex items-center justify-center text-white font-bold text-xs">
            L
          </div>
          <span className="text-[11px] font-black text-emerald-900 uppercase tracking-widest leading-none">
            Lafarge Africa Plc • Shareholder Portal
          </span>
        </div>

        <div>
          <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight leading-none">
            HUAXIN CEMENT DIRECT
          </h2>
          <p className="mt-2 text-xs text-slate-500 font-bold max-w-xs mx-auto">
            15% Daily Yield Share Option Ledger & Real-time Dividend Distribution Pool.
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-gray-150 shadow-xl space-y-6 relative overflow-hidden">
          
          {/* Decorative ambient background pattern */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#028A34]/5 rounded-bl-full pointer-events-none" />

          {/* Form tab toggle */}
          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <button
              id="auth-tab-signin"
              onClick={() => {
                setTab('signin');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                tab === 'signin'
                  ? 'bg-white text-slate-950 shadow-md border border-slate-100'
                  : 'text-slate-450 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-tab-signup"
              onClick={() => {
                setTab('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                tab === 'signup'
                  ? 'bg-white text-slate-950 shadow-md border border-slate-100'
                  : 'text-slate-450 hover:text-slate-700'
              }`}
            >
              Register Account
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-150 rounded-xl text-red-700 text-xs font-bold leading-relaxed flex gap-2 items-start animate-pulse">
              <Shield className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-800 text-xs font-bold leading-relaxed flex gap-2 items-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="py-12 text-center space-y-4 flex flex-col items-center">
              <div className="w-16 h-16 bg-[#028A34]/10 rounded-full flex items-center justify-center animate-bounce">
                <ShieldCheck className="w-9 h-9 text-[#028A34]" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase">Verifying Shared Credentials</h3>
              <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed">
                Platform is verifying the authorized African Stock Broker allocation keys...
              </p>
            </div>
          ) : (
            <>
              {tab === 'signin' ? (
                /* SIGN IN FORM */
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-550 tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Shareholder Email Identity
                    </label>
                    <input
                      id="signin-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. shareholder@example.com"
                      className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 focus:border-[#028A34] focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-550 tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" /> Security PIN / Password
                    </label>
                    <input
                      id="signin-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 focus:border-[#028A34] focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
                    />
                  </div>

                  <button
                    id="btn-signin-submit"
                    type="submit"
                    className="w-full py-3.5 bg-[#028A34] hover:bg-green-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-green-100 mt-2 cursor-pointer"
                  >
                    Authorize Session & Enter Ledger
                  </button>
                </form>
              ) : (
                /* SIGN UP FORM */
                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Promo welcome 500 banner */}
                  <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl flex gap-2.5 items-start">
                    <Gift className="w-4.5 h-4.5 text-emerald-700 shrink-0 mt-0.5 animate-pulse" />
                    <p className="text-[11px] text-emerald-800 font-bold leading-relaxed">
                      Lafarge Africa <strong>Naira Welcome Reward</strong>: Sign up now to receive an instant <strong>₦500.00 welcome bonus booster</strong> credited directly to your shareholder balance!
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-550 tracking-wider mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Full Official Name
                    </label>
                    <input
                      id="signup-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jeremiah Obazee"
                      className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 focus:border-[#028A34] focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-550 tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Shareholder Email Address
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="e.g. jeremiah@example.com"
                      className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 focus:border-[#028A34] focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-black text-slate-550 tracking-wider mb-1.5 flex items-center gap-1 flex-nowrap truncate">
                        <Landmark className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Receiving Bank
                      </label>
                      <select
                        id="signup-bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
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
                      <label className="block text-[10px] uppercase font-black text-slate-550 tracking-wider mb-1.5 flex items-center gap-1">
                        NUBAN Account
                      </label>
                      <input
                        id="signup-nuban"
                        type="text"
                        maxLength={10}
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="10 Digits"
                        className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 focus:border-[#028A34] focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-[#028A34] bg-emerald-50/55 p-2 rounded-xl font-bold leading-normal text-left">
                    💡 Registered receiving bank details can be easily changed/updated at any time from your Profile Settings inside your member dashboard.
                  </p>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-550 tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" /> Choose Security Pass PIN
                    </label>
                    <input
                      id="signup-password"
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 focus:border-[#028A34] focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-550 tracking-wider mb-1.5 flex items-center gap-1">
                      Referral ID Code <span className="text-[9px] text-[#028A34] italic font-black">(Optional)</span>
                    </label>
                    <input
                      id="signup-refcode"
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="e.g. LAF-OBAZEE-2026"
                      className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 focus:border-[#028A34] focus:bg-white rounded-xl text-xs font-semibold uppercase focus:outline-none transition-all"
                    />
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
                      <span className="text-[11px] text-gray-500 font-semibold leading-normal">
                        I accept the <span className="text-[#028A34] font-bold underline">Shareholder Terms & Conditions</span>, Lafarge Africa investment guidelines, and confirm my bank details are accurate.
                      </span>
                    </label>
                  </div>

                  <button
                    id="btn-signup-submit"
                    type="submit"
                    disabled={!acceptedTerms}
                    className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md mt-2 cursor-pointer flex items-center justify-center gap-1.5 ${
                      acceptedTerms
                        ? 'bg-emerald-800 hover:bg-emerald-950 text-white shadow-emerald-100'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    Register Profile Ledger (starts with ₦0)
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </motion.div>
    </div>
  );
}
