import { useState } from 'react';
import { 
  User, 
  Lock, 
  Landmark, 
  CheckCircle, 
  ShieldAlert, 
  Copy, 
  Check, 
  CreditCard, 
  Coins, 
  Smartphone,
  Eye,
  EyeOff,
  Award,
  Sparkles,
  Clock
} from 'lucide-react';
import { UserWallet } from '../types';

interface ProfileViewProps {
  wallet: UserWallet;
  onUpdateProfile: (updates: Partial<UserWallet>) => void;
  simulatedTime: number;
  adminApprovalSettings?: {
    requireDepositApproval: boolean;
    requireInvestmentApproval: boolean;
    requireWithdrawalApproval: boolean;
    customReferralLink?: string;
    isReferralLinkStatic?: boolean;
  };
  registeredUsers: UserWallet[];
}

export default function ProfileView({ 
  wallet, 
  onUpdateProfile, 
  simulatedTime, 
  adminApprovalSettings,
  registeredUsers
}: ProfileViewProps) {
  // Precompute multi-level referral counts
  const codeNormalized = (wallet.referralCode || '').trim().toLowerCase();
  const getNetworkCounts = () => {
    if (!codeNormalized) return { lv1: 0, lv2: 0, lv3: 0, lv4: 0, lv5: 0 };
    
    const lv1Users = registeredUsers.filter(u => u.referredBy?.trim().toLowerCase() === codeNormalized);
    const lv2Users = registeredUsers.filter(u => {
      if (!u.referredBy) return false;
      const refByCode = u.referredBy.trim().toLowerCase();
      return lv1Users.some(l1 => l1.referralCode.trim().toLowerCase() === refByCode);
    });
    const lv3Users = registeredUsers.filter(u => {
      if (!u.referredBy) return false;
      const refByCode = u.referredBy.trim().toLowerCase();
      return lv2Users.some(l2 => l2.referralCode.trim().toLowerCase() === refByCode);
    });
    const lv4Users = registeredUsers.filter(u => {
      if (!u.referredBy) return false;
      const refByCode = u.referredBy.trim().toLowerCase();
      return lv3Users.some(l3 => l3.referralCode.trim().toLowerCase() === refByCode);
    });
    const lv5Users = registeredUsers.filter(u => {
      if (!u.referredBy) return false;
      const refByCode = u.referredBy.trim().toLowerCase();
      return lv4Users.some(l4 => l4.referralCode.trim().toLowerCase() === refByCode);
    });
    
    return {
      lv1: lv1Users.length,
      lv2: lv2Users.length,
      lv3: lv3Users.length,
      lv4: lv4Users.length,
      lv5: lv5Users.length
    };
  };

  const netCounts = getNetworkCounts();

  const handleRequestUnlock = (levelName: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond') => {
    onUpdateProfile({
      pendingLevelUpgrade: levelName
    });
  };

  // Account/Bank binding states
  const [bankName, setBankName] = useState(wallet.accountNumber?.split('|')[1] || 'Access Bank');
  const [accountNumber, setAccountNumber] = useState(wallet.accountNumber?.split('|')[0]?.replace('NG-ACC-', '') || '');
  const [accountName, setAccountName] = useState(wallet.fullName);
  const [withdrawalMethod, setWithdrawalMethod] = useState<string>(
    wallet.password?.includes('USDT') ? 'usdt' : (wallet.accountNumber?.includes('USDT') ? 'usdt' : 'bank')
  );
  const [usdtAddress, setUsdtAddress] = useState(wallet.accountNumber?.startsWith('TRX') ? wallet.accountNumber : '');
  const [opayPhone, setOpayPhone] = useState(wallet.accountNumber?.startsWith('OPAY-') ? wallet.accountNumber.replace('OPAY-', '') : '');

  // Password modification states
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status message states
  const [bankSuccess, setBankSuccess] = useState('');
  const [bankError, setBankError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  
  // Referral link copying
  const [copiedLink, setCopiedLink] = useState(false);

  const getReferralLink = () => {
    const link = adminApprovalSettings?.customReferralLink;
    if (link && link.trim() !== '') {
      if (adminApprovalSettings.isReferralLinkStatic) {
        return link.trim();
      }
      // If the link has {CODE} template, replace it
      if (link.includes('{CODE}')) {
        return link.replace('{CODE}', wallet.referralCode).trim();
      }
      // If it ends with = or is dynamic, let's append referral code nicely
      if (link.endsWith('=')) {
        return `${link.trim()}${wallet.referralCode}`;
      }
      // Otherwise append ?ref= or &ref=
      const separator = link.includes('?') ? '&' : '?';
      return `${link.trim()}${separator}ref=${wallet.referralCode}`;
    }
    return `${window.location.origin}?ref=${wallet.referralCode}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getReferralLink());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Submit bank/account updates
  const handleSaveSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    setBankSuccess('');
    setBankError('');

    if (withdrawalMethod === 'bank') {
      if (!accountNumber || accountNumber.length !== 10 || isNaN(Number(accountNumber))) {
        setBankError('Standard Nigerian NUBAN account number must be exactly 10 digits.');
        return;
      }
      if (!bankName) {
        setBankError('Please select a valid commercial partner banks.');
        return;
      }
      
      const newAccountNumber = `NG-ACC-${accountNumber}|${bankName}`;
      onUpdateProfile({
        accountNumber: newAccountNumber,
        fullName: accountName
      });
      setBankSuccess('Your commercial bank account has been securely bound to your portfolio.');
    } else if (withdrawalMethod === 'usdt') {
      if (!usdtAddress || usdtAddress.length < 26 || !usdtAddress.startsWith('T')) {
        setBankError('USDT TRC-20 wallet addresses must begin with the letter "T" and be at least 26 characters.');
        return;
      }
      
      onUpdateProfile({
        accountNumber: usdtAddress
      });
      setBankSuccess('Your USDT (TRC-20) cold-wallet coordinate has been bound securely.');
    } else if (withdrawalMethod === 'opay') {
      if (!opayPhone || opayPhone.length < 10 || isNaN(Number(opayPhone))) {
        setBankError('Standard OPay mobile wallet number must be at least 10 digits.');
        return;
      }
      
      const newAccountNumber = `OPAY-${opayPhone}`;
      onUpdateProfile({
        accountNumber: newAccountNumber
      });
      setBankSuccess('Your OPay mobile e-wallet phone line has been synchronized.');
    }
  };

  // Update password
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccess('');
    setPwdError('');

    if (currentPasswordInput !== wallet.password) {
      setPwdError('The current password or PIN you provided is incorrect.');
      return;
    }
    if (newPasswordInput.length < 4) {
      setPwdError('The new security passcode must be at least 4 digits/characters.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPwdError('The confirmed new password does not match.');
      return;
    }

    onUpdateProfile({
      password: newPasswordInput
    });

    setPwdSuccess('Your secure portfolio vault passcode was modified successfully!');
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Title */}
      <div className="border-b border-green-150 pb-5">
        <h2 className="text-2xl md:text-3xl font-display font-black text-gray-950 tracking-tight">
          Shareholder Vault Profile
        </h2>
        <p className="text-sm text-gray-500 mt-1 max-w-xl">
          Configure security credentials, bind your bank accounts, choosing preferred withdrawal settlement channels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Shareholder Profile Overview & Ref Hub */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#028A34] text-white flex items-center justify-center font-black text-lg shadow-md shadow-green-100 uppercase">
                {wallet.fullName[0]}
              </div>
              <div>
                <h3 className="font-sans font-black text-base text-gray-950 leading-tight">
                  {wallet.fullName}
                </h3>
                <span className="text-xs text-gray-400 font-bold block mt-0.5 font-mono">
                  {wallet.email}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-105 pt-4 space-y-3.5">
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-black tracking-wider block">Shareholder Rank Badge</span>
                <span className={`inline-flex items-center gap-1 text-[10.5px] font-extrabold uppercase rounded-full px-2.5 py-0.5 mt-1 border ${
                  wallet.approvedLevel === 'Diamond'
                    ? 'bg-cyan-50 border-cyan-200 text-cyan-800'
                    : wallet.approvedLevel === 'Platinum'
                    ? 'bg-purple-50 border-purple-200 text-purple-800'
                    : wallet.approvedLevel === 'Gold'
                    ? 'bg-yellow-50 border-yellow-250 text-amber-800'
                    : wallet.approvedLevel === 'Silver'
                    ? 'bg-slate-100 border-slate-300 text-slate-700'
                    : wallet.approvedLevel === 'Bronze'
                    ? 'bg-orange-50 border-orange-200 text-orange-850'
                    : 'bg-gray-100 border-gray-200 text-gray-500'
                }`}>
                  <Award className="w-3.5 h-3.5" />
                  {wallet.approvedLevel ? `${wallet.approvedLevel} Rank` : 'Standard Member'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-black tracking-wider block">Portfolio ID Ledger</span>
                <strong className="text-xs text-slate-800 font-bold font-mono">
                  LH-{wallet.email.split('@')[0]?.toUpperCase()}-{wallet.referralCode}
                </strong>
              </div>
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-black tracking-wider block">Security Status</span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-green-700 bg-green-50 border border-green-100 rounded-full px-2.5 py-0.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" /> Verified & Active
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-black tracking-wider block">Capital Bound Status</span>
                <strong className="text-xs text-gray-700 font-black font-sans block mt-0.5">
                  Controlled by Huaxin Cement Group
                </strong>
              </div>
            </div>
          </div>

          {/* Shareholder Milestones & Unlocks */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex gap-2.5 items-center">
              <div className="w-8 h-8 rounded-lg bg-[#028A34]/15 flex items-center justify-center text-[#028A34]">
                <Award className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-950 text-sm leading-none">Shareholder Milestones</h4>
                <p className="text-[10px] font-semibold text-gray-405 mt-1 block">Unlock next-tier ranks as your network expands</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { level: 1, name: 'Bronze' as const, reqCount: 5, current: netCounts.lv1, color: 'text-orange-600 bg-orange-50 border-orange-200' },
                { level: 2, name: 'Silver' as const, reqCount: 10, current: netCounts.lv2, color: 'text-slate-600 bg-slate-100 border-slate-300' },
                { level: 3, name: 'Gold' as const, reqCount: 15, current: netCounts.lv3, color: 'text-amber-700 bg-yellow-50 border-yellow-250' },
                { level: 4, name: 'Platinum' as const, reqCount: 20, current: netCounts.lv4, color: 'text-purple-700 bg-purple-50 border-purple-200' },
                { level: 5, name: 'Diamond' as const, reqCount: 25, current: netCounts.lv5, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' }
              ].map((lv) => {
                const isMet = lv.current >= lv.reqCount;
                const isApproved = wallet.approvedLevel === lv.name;
                const isPending = wallet.pendingLevelUpgrade === lv.name;
                
                return (
                  <div key={lv.level} className="flex flex-col gap-1.5 p-2.5 border border-gray-105 rounded-xl bg-gray-50/50 hover:bg-gray-50/80 transition-all">
                    <div className="flex justify-between items-center text-xs">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${lv.color}`}>
                        {lv.name} Shareholder (Level {lv.level})
                      </span>
                      <span className="text-[10px] font-mono font-black text-gray-550">
                        {lv.current} / {lv.reqCount} Refs
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-4 mt-0.5">
                      <div className="flex-1">
                        <div className="w-full h-1 bg-gray-150 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#028A34] transition-all duration-300"
                            style={{ width: `${Math.min(100, (lv.current / lv.reqCount) * 100)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="shrink-0">
                        {isApproved ? (
                          <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg flex items-center gap-1 leading-none shadow-xs font-sans">
                            <Check className="w-3 h-3 text-[#028A34] stroke-[3]" /> Approved
                          </span>
                        ) : isPending ? (
                          <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-pulse leading-none shadow-xs">
                            <Clock className="w-3 h-3 text-amber-600 stroke-[3]" /> Pending
                          </span>
                        ) : isMet ? (
                          <button
                            id={`unlock-btn-${lv.name}`}
                            onClick={() => handleRequestUnlock(lv.name)}
                            type="button"
                            className="text-[10px] font-black text-white bg-[#028A34] hover:bg-green-700 px-3 py-1 rounded-lg transition-all leading-none shadow-sm shadow-green-100 hover:shadow cursor-pointer flex items-center gap-0.5"
                          >
                            <Sparkles className="w-3 h-3" /> Unlock
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 border border-gray-150 px-2 py-1 rounded-lg leading-none flex items-center gap-0.5 shadow-xs font-sans">
                            <Lock className="w-3 h-3 opacity-60" /> Locked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Referral Invite card */}
          <div className="bg-gradient-to-r from-green-50/50 to-slate-50 border border-green-150 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex gap-2.5 items-center">
              <div className="w-8 h-8 rounded-lg bg-[#028A34]/15 flex items-center justify-center text-[#028A34]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-gray-950 text-sm leading-tight">Your Custom Referral Code</h4>
                <p className="text-[10px] font-semibold text-gray-400">Share with colleagues and receive ₦505.00 each</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-white border border-gray-150 rounded-xl flex items-center justify-between">
                <span className="font-mono font-black text-green-800 tracking-wider text-sm select-all">
                  {wallet.referralCode}
                </span>
                <span className="text-[9px] uppercase font-black px-2.5 py-1 bg-green-50 text-green-700 rounded-lg border border-green-100">
                  Code
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Double-Reward Shareholder Link</span>
                  {adminApprovalSettings?.customReferralLink && adminApprovalSettings.customReferralLink.trim() !== '' && (
                    <span className="text-[8px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 border border-green-150 rounded">
                      Official Admin Link Active
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <input
                    type="text"
                    readOnly
                    value={getReferralLink()}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-[10px] text-gray-500 font-mono focus:outline-none select-all font-semibold"
                  />
                  <button
                    id="profile-copy-ref"
                    onClick={handleCopyLink}
                    className="p-2 bg-[#028A34] text-white hover:bg-green-800 rounded-xl transition-all shadow-md shadow-green-200 shrink-0 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Binding Forms */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Withdrawal Channel Binder */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-sans font-black text-lg text-gray-950 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-[#028A34]" /> Bind Settlement Methods
              </h3>
              <p className="text-xs text-gray-400">
                Bind your receiving commercial bank details or crypto address to receive immediate daily dividends. 
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'bank', name: 'Nigerian Bank', icon: Landmark, desc: 'NUBAN Direct Transfer' },
                { id: 'usdt', name: 'USDT (TRC-20)', icon: Coins, desc: 'Crypto Settlement' },
                { id: 'opay', name: 'OPay / Mobile', icon: Smartphone, desc: 'OPay Quick Payout' }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = withdrawalMethod === item.id;
                return (
                  <button
                    key={item.id}
                    id={`settle-method-${item.id}`}
                    onClick={() => {
                      setWithdrawalMethod(item.id);
                      setBankSuccess('');
                      setBankError('');
                    }}
                    className={`p-3 rounded-2xl text-left border flex flex-col justify-between h-[82px] transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-green-50/70 border-[#028A34] text-[#028A34] shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#028A34]' : 'text-gray-400'}`} />
                    <div className="leading-none">
                      <span className="text-[11px] font-black block uppercase tracking-tight">{item.name}</span>
                      <span className="text-[8px] opacity-60 font-semibold uppercase font-mono tracking-widest mt-0.5 block">{item.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {bankSuccess && (
              <div className="p-3 bg-green-50 border border-green-150 rounded-xl text-green-800 text-xs font-bold flex gap-2 items-center">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <span>{bankSuccess}</span>
              </div>
            )}

            {bankError && (
              <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-red-700 text-xs font-bold flex gap-2 items-center">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                <span>{bankError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettlement} className="space-y-4 font-sans">
              {withdrawalMethod === 'bank' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                        Commercial Bank Name
                      </label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-green-600 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                      >
                        <option>Access Bank</option>
                        <option>Zenith Bank</option>
                        <option>Guaranty Trust Bank (GTBank)</option>
                        <option>United Bank for Africa (UBA)</option>
                        <option>Fidelity Bank</option>
                        <option>First Bank of Nigeria</option>
                        <option>Sterling Bank</option>
                        <option>Wema Bank Plc</option>
                        <option>OPay</option>
                        <option>PalmPay</option>
                        <option>Moniepoint Microfinance</option>
                        <option>Kuda Bank</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                        NUBAN Account Number
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 1013449104"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-green-600 focus:bg-white rounded-xl text-xs font-bold focus:outline-none transition-all tracking-wider font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                      Account Registered Name (Must Match Portfolio Identity)
                    </label>
                    <input
                      type="text"
                      required
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="e.g. Jeremiah Obazee"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-green-600 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {withdrawalMethod === 'usdt' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                      USDT TRC-20 Wallet Address
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TN2P98fX6H87Y6d... (Must start with T)"
                      value={usdtAddress}
                      onChange={(e) => setUsdtAddress(e.target.value.trim())}
                      className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 focus:border-green-600 focus:bg-white rounded-xl text-xs font-extrabold focus:outline-none transition-all tracking-wider font-mono"
                    />
                    <span className="text-[10px] text-gray-400 font-bold block mt-1.5 leading-relaxed">
                      * Payout logs using digital assets are processed internationally by Huaxin Cement foreign accounting offices and cleared within 15 minutes of validation.
                    </span>
                  </div>
                </div>
              )}

              {withdrawalMethod === 'opay' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                      OPay Account Registered Phone Line
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 08123456789"
                      value={opayPhone}
                      onChange={(e) => setOpayPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 focus:border-green-600 focus:bg-white rounded-xl text-xs font-bold focus:outline-none transition-all tracking-widest font-mono"
                    />
                    <span className="text-[10px] text-amber-600 italic font-bold block mt-1.5">
                      * Ensure this number is active and connected to your official Nigerian telephone account space.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-gray-105">
                <button
                  type="submit"
                  id="btn-save-settlement"
                  className="px-5 py-2.5 bg-[#028A34] hover:bg-green-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-green-100 cursor-pointer"
                >
                  Save Settlement Settlement Coordinate
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Panel */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-sans font-black text-lg text-gray-950 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#028A34]" /> Security Access Passcode Updates
              </h3>
              <p className="text-xs text-gray-400">
                Change your security access PIN/Password to insulate your ledger vault against unauthorized claims.
              </p>
            </div>

            {pwdSuccess && (
              <div className="p-3.5 bg-green-50 border border-green-150 rounded-xl text-green-850 text-xs font-bold leading-normal flex gap-2 items-center">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            {pwdError && (
              <div className="p-3.5 bg-red-50 border border-red-150 rounded-xl text-red-700 text-xs font-bold leading-normal flex gap-2 items-center">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 font-black" />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 font-sans">
              <div className="relative">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                  Current Security Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    placeholder="Enter current PIN / Passcode"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-green-600 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 shrink-0"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                    New Security Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Minimum 4 digits"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-green-600 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 shrink-0"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Repeat new PIN / Passcode"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-green-600 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-105">
                <button
                  type="submit"
                  id="btn-update-password"
                  className="px-5 py-2.5 bg-[#028A34] hover:bg-green-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-green-100 cursor-pointer"
                >
                  Change Account Password PIN
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
