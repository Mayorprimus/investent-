import { useState } from 'react';
import { Transaction } from '../types';
import { formatNGN, formatTime } from '../utils';
import { Search, ArrowDownLeft, ArrowUpRight, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdraw' | 'invest' | 'payout'>('all');

  // Filter transactions
  const filteredTx = transactions.filter(tx => {
    // search filter
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    // type filter
    const matchesType = filterType === 'all' || tx.type === filterType;

    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1 w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100 flex items-center gap-1 w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending
          </span>
        );
      default:
        return (
          <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-100 flex items-center gap-1 w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Failed
          </span>
        );
    }
  };

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <div className="p-2 bg-green-50 rounded-xl text-[#028A34] border border-green-100"><ArrowDownLeft className="w-4 h-4" /></div>;
      case 'withdraw':
        return <div className="p-2 bg-gray-50 rounded-xl text-gray-600 border border-gray-150"><ArrowUpRight className="w-4 h-4" /></div>;
      case 'invest':
        return <div className="p-2 bg-slate-50 rounded-xl text-[#028A34] border border-slate-100"><RefreshCw className="w-4 h-4 shrink-0 rotate-180" /></div>;
      case 'payout':
        return <div className="p-2 bg-green-50 rounded-xl text-green-700 border border-green-100"><CheckCircle className="w-4 h-4" /></div>;
      default:
        return <div className="p-2 bg-green-50 rounded-xl text-green-600 border border-green-100"><CheckCircle className="w-4 h-4" /></div>;
    }
  };

  return (
    <div className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-950 font-sans">Transaction Log</h3>
          <p className="text-xs text-gray-400 font-medium">Verifiable transaction ledger of your Lafarge Africa Plc share positions.</p>
        </div>
      </div>

      {/* Filters and Search toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="transaction-search"
            type="text"
            placeholder="Search by ref or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 focus:border-green-505 rounded-xl text-sm focus:outline-none transition-all placeholder:text-gray-300"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto shrink-0 pb-1 sm:pb-0">
          {(['all', 'deposit', 'withdraw', 'invest', 'payout'] as const).map((type) => (
            <button
              key={type}
              id={`filter-tx-${type}`}
              onClick={() => setFilterType(type)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                filterType === type
                  ? 'bg-green-700 border-green-700 text-white shadow shadow-green-450/10'
                  : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions list layout */}
      {filteredTx.length === 0 ? (
        <div className="text-center py-12 px-6 border border-dashed border-gray-200 rounded-xl space-y-3">
          <div className="p-2 bg-green-50 rounded-xl text-green-600 w-10 h-10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-gray-805">No Logs Discovered</p>
            <p className="text-xs text-gray-400 font-medium">No transactions match your search filter criteria.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                <th className="py-3 px-4">Transaction Details</th>
                <th className="py-3 px-4">Ref Number</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Processing status</th>
                <th className="py-3 px-4 text-right">Processed Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-55/50 transition-colors text-sm text-gray-750">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    {getTxIcon(tx.type)}
                    <div>
                      <span className="font-bold text-gray-900 block">{tx.description}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{tx.type}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <code className="text-xs font-mono bg-gray-100 px-1.5 py-1 rounded text-gray-600 font-semibold">{tx.reference}</code>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-gray-500">
                    {formatTime(tx.date)}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(tx.status)}
                  </td>
                  <td className={`py-3.5 px-4 text-right font-black font-mono ${
                    tx.type === 'withdraw' || tx.type === 'invest' ? 'text-gray-905' : 'text-green-700'
                  }`}>
                    {tx.type === 'withdraw' || tx.type === 'invest' ? '-' : '+'}{formatNGN(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
