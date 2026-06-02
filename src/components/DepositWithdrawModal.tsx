import React, { useState } from 'react';
import { X, CheckCircle, Smartphone, Landmark, Wallet, AlertCircle, ArrowUpRight, ArrowDownLeft, Copy, Check } from 'lucide-react';
import { formatNGN, generateRef } from '../utils';
import { UserWallet, DepositAccount } from '../types';

interface DepositWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdraw';
  walletBalance: number;
  onConfirm: (amount: number, txType: 'deposit' | 'withdraw', details: string) => void;
  simulatedTime: number;
  wallet: UserWallet;
  depositAccounts: DepositAccount[];
}

export default function DepositWithdrawModal({
  isOpen,
  onClose,
  type,
  walletBalance,
  onConfirm,
  simulatedTime,
  wallet,
  depositAccounts
}: DepositWithdrawModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'bank' | 'card' | 'crypto'>('bank');
  
  // States for simulated fields
  const [bankName, setBankName] = useState('');
  const [otherBankName, setOtherBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cryptoAddress, setCryptoAddress] = useState('');
  
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: input, 2: processing/payment, 3: success receipt
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [finalTxRef, setFinalTxRef] = useState('');

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateStep1 = () => {
    setErrorMessage('');
    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setErrorMessage('Please enter a valid positive Naira amount.');
      return false;
    }

    if (type === 'withdraw') {
      if (wallet.isFlagged) {
        setErrorMessage("Withdrawal access has been flagged & locked by Lafarge Africa compliance officers. Please submit a support ticket via the Customer Service tab to verify your shareholder documentation and clear any regulatory holds.");
        return false;
      }

      if (wallet.requireReferralToWithdraw && wallet.referralsCount < 1) {
        setErrorMessage("Withdrawal Blocked: Shareholder program policies currently place a strict 1-Referral minimum rule on your account. Please invite at least 1 associate or simulation participant to join Lafarge sharing options before requesting a payout.");
        return false;
      }

      const simulatedDate = new Date(simulatedTime);
      const currentHour = simulatedDate.getHours();
      
      if (currentHour < 10 || currentHour >= 12) {
        const timeString = simulatedDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
        setErrorMessage(`Withdrawal processing window is strictly limited from 10:00 AM to 12:00 PM daily. The current simulated platform time is ${timeString}. Please use the Virtual Time Machine on the Dashboard to leap forward to the 10:00 AM withdrawal hours!`);
        return false;
      }

      if (amtNum > walletBalance) {
        setErrorMessage(`Insufficient funds. Your local balance is ${formatNGN(walletBalance)}.`);
        return false;
      }
      if (amtNum < 3000) {
        setErrorMessage('Minimum withdrawal amount is ₦3,000.00.');
        return false;
      }
    } else {
      if (amtNum < 3000) {
        setErrorMessage('Minimum deposit amount is ₦3,000.00 to match Lafarge share starter packages.');
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(amount);
    
    if (type === 'withdraw') {
      if (method === 'bank' && (!bankName || !accountNo)) {
        setErrorMessage('Please fill in bank name and account number details.');
        return;
      }
      if (method === 'crypto' && !cryptoAddress) {
        setErrorMessage('Please fill in your destination wallet address.');
        return;
      }
    } else {
      if (method === 'card' && (!cardNo || !cardExpiry || !cardCvv)) {
        setErrorMessage('Please fill in your processing card details.');
        return;
      }
    }

    setIsProcessing(true);
    setErrorMessage('');

    // Simulate Nigerian Inter-Bank Settlement System (NIBSS) or Paystack gateway processing latency
    setTimeout(() => {
      setIsProcessing(false);
      setFinalTxRef(generateRef());
      setStep(3);
      
      const resolvedBankName = bankName === 'Other Bank (Type custom)' ? otherBankName : bankName;
      const detailsText = type === 'deposit' 
        ? `Deposited to Lafarge via ${method.toUpperCase()} (${method === 'card' ? 'Verve/Mastercard' : method === 'bank' ? 'Instant Bank Transfer' : 'USDT TRC20 Equivalent'})`
        : `Withdrawn to ${method.toUpperCase()} (${method === 'bank' ? resolvedBankName + ' - ' + accountNo : cryptoAddress.substring(0, 6) + '...'})`;
      
      onConfirm(amtNum, type, detailsText);
    }, 1500);
  };

  const resetModal = () => {
    setAmount('');
    setStep(1);
    setErrorMessage('');
    setIsProcessing(false);
    onClose();
  };

  const nigerianBanks = [
    'Guaranty Trust Bank (GTBank)',
    'Zenith Bank',
    'Access Bank',
    'United Bank for Africa (UBA)',
    'First Bank of Nigeria',
    'Wema Bank / ALAT',
    'Sterling Bank',
    'Stanbic IBTC Bank',
    'Fidelity Bank',
    'Moniepoint Microfinance Bank',
    'OPay',
    'PalmPay',
    'Other Bank (Type custom)'
  ];

  return (
    <div className="fixed inset-0 bg-[#062817]/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white border border-green-100 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden transition-all duration-300 transform scale-100">
        
        {/* Top Accent bar using Lafarge Green */}
        <div className="h-2 bg-[#028A34] w-full" />

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
              {type === 'deposit' ? 'Lafarge Capital Deposit' : 'Secured Earnings Payout'}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-1.5 font-sans">
              {type === 'deposit' ? 'Fund Your Share Account' : 'Withdraw Cumulative Yield'}
            </h3>
          </div>
          <button 
            id={`btn-close-${type}`}
            onClick={resetModal}
            className="p-1.5 rounded-full hover:bg-gray-150 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Errors and warnings info */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Step 1: Input Amount and Select Method */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            {type === 'withdraw' ? (
              <div className="p-3.5 bg-green-50/50 border border-green-150 rounded-xl space-y-1">
                <span className="text-[10px] font-black uppercase text-green-805 tracking-widest block">⏰ WIthdrawal Window Check</span>
                <p className="text-[11px] text-gray-550 leading-relaxed font-semibold">
                  Payout approvals are active only between <strong className="text-[#028A34] font-black">10:00 AM and 12:00 PM</strong> daily. 
                  Use the <span className="font-bold underline text-green-800">Time Machine</span> on the dashboard to skip to the processing window.
                </p>
              </div>
            ) : null}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Enter Amount (Naira ₦)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">₦</span>
                <input
                  id="input-amount"
                  type="number"
                  placeholder="3,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-3.5 border-2 border-green-100 rounded-xl text-3xl font-bold bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition-all placeholder:text-gray-300 text-gray-800"
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>Min: ₦3,000.00</span>
                {type === 'withdraw' && (
                  <span>Withdrawable Balance: <strong className="text-green-700">{formatNGN(walletBalance)}</strong></span>
                )}
              </div>
            </div>

            {/* Quick amount shortcuts in Naira */}
            <div className="grid grid-cols-4 gap-2">
              {(type === 'deposit' ? [3000, 10000, 50000, 200000] : [3000, 12000, 60000, walletBalance]).map((preset, idx) => {
                const isMax = idx === 3 && type === 'withdraw';
                if (preset <= 0) return null;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAmount(preset.toFixed(0))}
                    className="py-1.5 text-xs font-semibold text-green-805 bg-green-50/50 hover:bg-green-100 border border-green-100/50 rounded-lg transition-colors cursor-pointer"
                  >
                    {isMax ? 'MAX' : `₦${preset.toLocaleString()}`}
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                Select Transaction Avenue
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setMethod('bank')}
                  className={`p-3 border-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                    method === 'bank'
                      ? 'border-[#028A34] bg-green-50/30 text-green-900 font-medium scale-102 shadow-sm'
                      : 'border-slate-100/80 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Landmark className="w-5 h-5 mx-auto text-green-600" />
                  <span className="text-xs">Bank Transfer</span>
                </button>

                {type === 'deposit' ? (
                  <button
                    type="button"
                    onClick={() => setMethod('card')}
                    className={`p-3 border-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                      method === 'card'
                        ? 'border-[#028A34] bg-green-50/30 text-green-900 font-medium scale-102 shadow-sm'
                        : 'border-slate-100/80 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                  >
                    <Smartphone className="w-5 h-5 mx-auto text-green-600" />
                    <span className="text-xs">Verve/Debit Card</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setMethod('crypto')}
                  className={`p-3 border-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                    method === 'crypto'
                      ? 'border-[#028A34] bg-green-50/30 text-green-900 font-medium scale-102 shadow-sm'
                      : 'border-slate-100/80 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Wallet className="w-5 h-5 mx-auto text-green-600" />
                  <span className="text-xs">USDT (TRC20)</span>
                </button>
              </div>
            </div>

            <button
              id="btn-modal-next"
              onClick={handleNextStep}
              className="w-full mt-2 py-3 bg-[#028A34] hover:bg-[#027029] text-white rounded-xl font-bold shadow-md shadow-green-700/10 hover:shadow-lg hover:shadow-green-700/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Continue Secure Gateway
              {type === 'deposit' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Step 2: Form submission and Details check */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-green-50/40 border border-green-100 p-4 rounded-xl space-y-1.5 text-sm mb-4">
              <div className="flex justify-between items-center text-gray-500">
                <span>Requested Amount (Naira):</span>
                <span className="font-bold text-gray-800">{formatNGN(parseFloat(amount))}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Gateway Process Fee:</span>
                <span className="text-green-700 font-semibold">{type === 'deposit' ? '₦0.00 (Free)' : '1.0% (₦' + (parseFloat(amount) * 0.01).toFixed(2) + ')'}</span>
              </div>
              <div className="border-t border-green-100/50 pt-2 flex justify-between items-center font-bold text-gray-900 text-base">
                <span>{type === 'deposit' ? 'Total to Pay:' : 'Net Outflow To Account:'}</span>
                <span className="text-[#028A34]">
                  {formatNGN(type === 'deposit' ? parseFloat(amount) : parseFloat(amount) * 0.99)}
                </span>
              </div>
            </div>

            {/* CONDITIONAL BILLING OR CRYPTO DETAILS */}
            {method === 'bank' && type === 'deposit' && (
              <div className="space-y-3.5 animate-fade-in text-left">
                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest block font-sans">Select Lafarge Escrow Deposit Bank Channel</span>
                <div className="space-y-3">
                  {depositAccounts && depositAccounts.filter(a => a.isActive).map((acc, index) => (
                    <div key={acc.id} className="p-4 bg-gray-50 border border-green-150/60 rounded-xl space-y-2 relative shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-[#028A34]">{acc.bankName}</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[8px] font-black uppercase rounded-md tracking-wider">
                          Active Channel #{index + 1}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-slate-700">
                        <p className="flex justify-between">
                          <span className="text-gray-400 font-semibold">Account Name:</span>
                          <strong className="text-gray-900 font-semibold">{acc.accountName}</strong>
                        </p>
                        <p className="flex justify-between items-center">
                          <span className="text-gray-400 font-semibold">Account Number:</span>
                          <span className="font-mono text-gray-900 font-extrabold flex items-center gap-1">
                            {acc.accountNumber}
                            <button
                              type="button"
                              onClick={() => handleCopy(acc.accountNumber)}
                              className="p-1 hover:bg-slate-200 text-slate-500 rounded cursor-pointer transition-colors"
                              title="Copy"
                            >
                              {copied ? <Check className="w-3.5 h-3.5 text-[#028A34]" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-400 font-semibold">Reference code:</span>
                          <strong className="text-green-700 font-mono font-black">LAFARGE-DEP-{amount}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!depositAccounts || depositAccounts.filter(a => a.isActive).length === 0) && (
                    <div className="p-4 text-center border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 font-bold">
                      No active bank transfer channels currently set up by Admin. Please try alternative payment methods or report to customer care.
                    </div>
                  )}
                </div>
                <div className="pt-2.5 border-t border-gray-150 text-[10px] text-gray-400 font-medium">
                  Transfer exactly ₦{parseFloat(amount).toLocaleString()} using your mobile banking application, and click below to confirm.
                </div>
              </div>
            )}

            {method === 'bank' && type === 'withdraw' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Select Payout Bank</label>
                  <select
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="">-- Choose Bank --</option>
                    {nigerianBanks.map((bnk, idx) => (
                      <option key={idx} value={bnk}>{bnk}</option>
                    ))}
                  </select>
                </div>

                {bankName === 'Other Bank (Type custom)' && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Type Custom Bank Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PalmPay, OPay, Sparkle"
                      value={otherBankName}
                      onChange={(e) => setOtherBankName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">NUBAN Account Number (10 Digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="e.g. 0123456789"
                    value={accountNo}
                    onChange={(e) => setAccountNo(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            {method === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="5061 2222 3333 4444 (Verve / Mastercard)"
                    maxLength={19}
                    value={cardNo}
                    onChange={(e) => setCardNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Expiry Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">CVV (3 Digits)</label>
                    <input
                      type="password"
                      required
                      placeholder="123"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'crypto' && type === 'deposit' && (
              <div className="p-4 bg-gray-50 border border-green-100 rounded-xl space-y-3 text-center">
                <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest block">USDT TRC20 Gateway Equivalent</span>
                <div className="w-32 h-32 mx-auto bg-gray-150 rounded-lg border border-gray-200 flex items-center justify-center p-2 relative overflow-hidden bg-white">
                  {/* Visual QR code placeholder */}
                  <div className="grid grid-cols-6 gap-0.5 w-full h-full opacity-80">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className={`rounded-sm ${(i * 7 + 13) % 5 === 0 || (i % 7 === 0) ? 'bg-[#062817]' : 'bg-transparent'}`} />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                    <span className="text-[10px] font-mono font-bold text-green-900 bg-green-50 border border-green-200 px-1 py-0.5 rounded">USDT QR</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-center py-1.5 px-2 bg-green-50 border border-green-100 rounded-lg">
                  <code className="text-xs font-mono text-green-800 font-semibold truncate flex-1">TYv1A8yG86mZPfCBzfCB9086d76eB0afLafarge</code>
                  <button
                    type="button"
                    onClick={() => handleCopy('TYv1A8yG86mZPfCBzfCB9086d76eB0afLafarge')}
                    className="p-1 text-green-700 hover:bg-green-100 rounded cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">Transfers are automatically converted to/from Naira at prevailing Central Bank rates.</p>
              </div>
            )}

            {method === 'crypto' && type === 'withdraw' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Destination USDT Address (TRC20)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TYv1A8yG86mZPfCBzfCB..."
                    value={cryptoAddress}
                    onChange={(e) => setCryptoAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 font-mono focus:border-green-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-amber-600 font-medium block mt-1.5 flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                    Funds convert dynamically from Naira into stablecoin assets at current markets.
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold text-gray-600 text-sm transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing Vault...
                  </>
                ) : (
                  type === 'deposit' ? 'Confirm Fund Transfer' : 'Confirm Payout Request'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success Receipt */}
        {step === 3 && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-green-150 rounded-full flex items-center justify-center mx-auto text-[#028A34]">
              <CheckCircle className="w-10 h-10 text-[#028A34]" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-xl font-bold text-gray-900">
                {type === 'deposit' ? 'Deposit Successful NIBSS' : 'Withdrawal Registered'}
              </h4>
              <p className="text-sm text-gray-400">
                {type === 'deposit' ? 'Your Lafarge wallet has been credited in Naira instantly.' : 'Funds are heading to your registered bank routing.'}
              </p>
            </div>

            <div className="border border-green-100 rounded-xl p-4 bg-green-50/20 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-450">Transaction Ref:</span>
                <span className="font-mono text-gray-750 font-semibold">{finalTxRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-450">Value Date:</span>
                <span className="text-gray-750 font-semibold">{new Date().toLocaleString('en-NG')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-451">Total Capital:</span>
                <span className="text-[#028A34] font-bold text-sm">{formatNGN(parseFloat(amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-450 font-semibold">Status:</span>
                <span className="bg-green-105 text-green-800 font-semibold px-2 py-0.5 rounded text-[10px]">COMPLETED</span>
              </div>
            </div>

            <button
              id="btn-receipt-dismiss"
              onClick={resetModal}
              className="w-full py-3 bg-[#028A34] hover:bg-[#027029] text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-green-700/10 cursor-pointer"
            >
              Return to Portfolio View
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
