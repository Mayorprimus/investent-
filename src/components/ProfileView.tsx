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
  EyeOff
} from 'lucide-react';
import { UserWallet } from '../types';

interface ProfileViewProps {
  wallet: UserWallet;
  onUpdateProfile: (updates: Partial<UserWallet>) => void;
  simulatedTime: number;
}

export default function ProfileView({ wallet, onUpdateProfile, simulatedTime }: ProfileViewProps) {
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
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Double-Reward Shareholder Link</span>
                <div className="flex gap-1.5 shrink-0">
                  <input
                    type="text"
                    readOnly
                    value={getReferralLink()}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-[10px] text-gray-500 font-mono focus:outline-none select-all"
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
