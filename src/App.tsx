import { useState, useEffect, useRef } from 'react';
import { 
  Factory, 
  TrendingUp, 
  Clock, 
  HelpCircle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldCheck, 
  Landmark, 
  CheckCircle,
  Menu,
  X,
  Plus,
  Compass,
  Lock,
  Gift,
  Users,
  Copy,
  Check,
  Headphones,
  MessageSquare,
  Send,
  User,
  Share2,
  Sparkles,
  Phone
} from 'lucide-react';

import { ActiveInvestment, UserWallet, Transaction, SupportTicket, DepositAccount, ReferralRelationship } from './types';
import { productsList } from './data';
import { formatNGN, generateRef } from './utils';

// Import child components
import StatsGrid from './components/StatsGrid';
import ProductCard from './components/ProductCard';
import ActiveInvestments from './components/ActiveInvestments';
import Calculator from './components/Calculator';
import VirtualTimeMachine from './components/VirtualTimeMachine';
import TransactionHistory from './components/TransactionHistory';
import DepositWithdrawModal from './components/DepositWithdrawModal';
import RegisterModal from './components/RegisterModal';
import AdminPortal from './components/AdminPortal';
import AuthScreen from './components/AuthScreen';
import ProfileView from './components/ProfileView';
import SplashScreen from './components/SplashScreen';
import PromoReferralModal from './components/PromoReferralModal';
import { motion } from 'motion/react';

export default function App() {
  const [isSplashActive, setIsSplashActive] = useState(true);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const isJustRegisteredRef = useRef(false);
  const syncLock = useRef(false);
  const localVersion = useRef(0);
  const isInitializedFromServer = useRef(false);
  const isSyncingFromServer = useRef(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'invest' | 'simulator' | 'faq' | 'cs' | 'admin' | 'profile'>('dashboard');
  const [adminApprovalSettings, setAdminApprovalSettings] = useState({
    requireDepositApproval: true,
    requireInvestmentApproval: true,
    requireWithdrawalApproval: true,
    customReferralLink: '',
    isReferralLinkStatic: false,
    csNumber: '08158432605',
    officialWhatsAppGroup: 'https://chat.whatsapp.com/KHZgCi1h24154DqIIHz3VE',
    minReferralWithdrawal: 5000
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Real-time Virtual Simulate Date Clock
  const [simulatedTime, setSimulatedTime] = useState<number>(Date.now());

  // Modal handler states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw'>('deposit');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [referredByCode, setReferredByCode] = useState(() => {
    return localStorage.getItem('lafarge_referred_by_code') || '';
  });

  const [referrals, setReferrals] = useState<ReferralRelationship[]>(() => {
    const saved = localStorage.getItem('lafarge_referrals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  const checkAndRecordReferral = (referredUser: UserWallet, currentUsers: UserWallet[]) => {
    const rawRefCode = referredUser.referredBy;
    if (rawRefCode) {
      const referrer = currentUsers.find(
        (u) => u.referralCode.trim().toLowerCase() === rawRefCode.trim().toLowerCase()
      );
      if (referrer) {
        setReferrals((prev) => {
          const alreadyExists = prev.some(
            (r) => r.referredEmail.toLowerCase() === referredUser.email.toLowerCase()
          );
          if (!alreadyExists) {
            const refObj: ReferralRelationship = {
              id: `ref-${Math.random().toString(36).substring(2, 9)}`,
              referrerEmail: referrer.email,
              referrerCode: referrer.referralCode,
              referredEmail: referredUser.email,
              referredName: referredUser.fullName,
              amount: 500, // ₦500 referral reward
              status: 'pending',
              date: Date.now()
            };
            return [refObj, ...prev];
          }
          return prev;
        });
      }
    }
  };

  // Local state of registered shareholder accounts stored in persistent DB storage
  const [registeredUsers, setRegisteredUsers] = useState<UserWallet[]>(() => {
    const saved = localStorage.getItem('lafarge_registered_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return [
      {
        fullName: 'Jeremiah Obazee',
        email: 'jeremiahobazee11@gmail.com',
        walletBalance: 120000,
        investedBalance: 30000,
        withdrawnBalance: 4500,
        earnedBalance: 4500,
        accountNumber: 'NG-ACC-1013449104',
        referralCode: 'LAF-OBAZEE-2026',
        referralsCount: 4,
        referralEarnings: 2000,
        hasClaimedBonus: true,
        password: '2026',
        isFlagged: false,
        requireReferralToWithdraw: false,
        autoInvest: true
      },
      {
        fullName: 'Chioma Adebayo',
        email: 'chioma.a@demoland.com',
        walletBalance: 45000,
        investedBalance: 0,
        withdrawnBalance: 0,
        earnedBalance: 0,
        accountNumber: 'NG-ACC-2094810293',
        referralCode: 'LAF-CHIOMA-992',
        referralsCount: 0,
        referralEarnings: 0,
        hasClaimedBonus: true,
        password: '1234',
        isFlagged: false,
        requireReferralToWithdraw: false,
        autoInvest: true
      },
      {
        fullName: 'Emeka Okafor',
        email: 'emeka.o@demoland.com',
        walletBalance: 98000,
        investedBalance: 50000,
        withdrawnBalance: 12000,
        earnedBalance: 12000,
        accountNumber: 'NG-ACC-3049182041',
        referralCode: 'LAF-EMEKA-105',
        referralsCount: 2,
        referralEarnings: 1000,
        hasClaimedBonus: true,
        password: '1234',
        isFlagged: false,
        requireReferralToWithdraw: false,
        autoInvest: true
      }
    ];
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const sessionStr = localStorage.getItem('lafarge_login_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session && session.expiresAt > Date.now()) {
          return true;
        }
      } catch (e) {}
    }
    return false;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    const sessionStr = localStorage.getItem('lafarge_login_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session && session.expiresAt > Date.now()) {
          return !!session.isAdmin;
        }
      } catch (e) {}
    }
    return false;
  });

  // Active wallet state bound to current logged in session
  const [wallet, setWallet] = useState<UserWallet>(() => {
    const sessionStr = localStorage.getItem('lafarge_login_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session && session.expiresAt > Date.now()) {
          const savedUsers = localStorage.getItem('lafarge_registered_users');
          if (savedUsers) {
            const users = JSON.parse(savedUsers);
            const userMatch = users.find((u: any) => u.email.toLowerCase() === session.email.toLowerCase());
            if (userMatch) return userMatch;
          }
          if (session.isAdmin) {
            return {
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
            };
          }
        }
      } catch (e) {}
    }
    // Default fallback to Jeremiah
    return {
      fullName: 'Jeremiah Obazee',
      email: 'jeremiahobazee11@gmail.com',
      walletBalance: 120000,
      investedBalance: 30000,
      withdrawnBalance: 4500,
      earnedBalance: 4500,
      accountNumber: 'NG-ACC-1013449104',
      referralCode: 'LAF-OBAZEE-2026',
      referralsCount: 4,
      referralEarnings: 2000,
      hasClaimedBonus: true,
      password: '2026',
      isFlagged: false,
      requireReferralToWithdraw: false,
      autoInvest: true
    };
  });

  // Active investments array setup with a mock Calabar Port Bulk Cement Option share position
  const [activeInvestments, setActiveInvestments] = useState<ActiveInvestment[]>(() => {
    const saved = localStorage.getItem('lafarge_active_investments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'inv-first-calabar',
        productId: 'prod-calabar-30k',
        productName: 'Calabar Port Bulk Cement Options',
        amountInvested: 30000,
        startDate: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
        endDate: Date.now() + 10 * 24 * 60 * 60 * 1000,   // 10 days left for 11-day cycle
        lastAccrualTime: Date.now() - 1 * 24 * 60 * 60 * 1000,
        status: 'active',
        totalAccrued: 7800, // ₦7,800 daily dividend (26.0% of ₦30,000) pre-accrued for demonstration!
        expectedReturn: 234000, // 26.0% daily * 30 days on 30,000 is 234,000 profit
        isCompounding: true,
        termDays: 30,
        rate: 0.26,
        userEmail: 'jeremiahobazee11@gmail.com'
      }
    ];
  });

  // Interactive Customer Service chat and ticket states
  const [depositAccounts, setDepositAccounts] = useState<DepositAccount[]>(() => {
    const defaultAccounts = [
      {
        id: 'da-opay-default',
        bankName: 'OPay',
        accountName: 'Lafarge Africa Option Escrow Ledger',
        accountNumber: '8158432605',
        isActive: true
      },
      {
        id: 'da-1',
        bankName: 'Access International Bank PLC',
        accountName: 'Lafarge Africa Plc Option Escrow Ledger',
        accountNumber: '1019014197',
        isActive: true
      },
      {
        id: 'da-2',
        bankName: 'OPay Digital Ltd (Escrow)',
        accountName: 'Lafarge Africa Hub Escrow Holdings',
        accountNumber: '9082914104',
        isActive: true
      },
      {
        id: 'da-3',
        bankName: 'Moniepoint Microfinance Bank',
        accountName: 'Lafarge Treasury Premium Africa',
        accountNumber: '5039294103',
        isActive: true
      }
    ];

    const saved = localStorage.getItem('lafarge_deposit_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const hasNew = parsed.some(acc => acc.accountNumber === '8158432605');
          if (!hasNew) {
            return [defaultAccounts[0], ...parsed];
          }
          return parsed;
        }
      } catch (e) {}
    }
    return defaultAccounts;
  });

  const [csTickets, setCsTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('lafarge_cs_tickets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'TCK-924401',
        userEmail: 'jeremiahobazee11@gmail.com',
        userFullName: 'Obazee Jeremiah',
        category: 'Deposit Upgrade',
        subject: 'Paystack transfer delay verification',
        status: 'resolved',
        date: Date.now() - 2 * 24 * 60 * 60 * 1000,
        messages: [
          {
            id: 'msg_1',
            sender: 'user',
            senderName: 'Obazee Jeremiah',
            text: 'I sent my deposit of 50,000 NGN via Paystack but it has not shown up in my wallet. Please check.',
            date: Date.now() - 2 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000
          },
          {
            id: 'msg_2',
            sender: 'agent',
            senderName: 'Blessing Adebayo',
            text: 'Hello Obazee, thank you for providing the transaction details! We have verified the transaction against our hub ledger and manually credited your account. Wishing you prosperous returns on your options.',
            date: Date.now() - 2 * 24 * 60 * 60 * 1000
          }
        ]
      },
      {
        id: 'TCK-104932',
        userEmail: 'jeremiahobazee11@gmail.com',
        userFullName: 'Obazee Jeremiah',
        category: 'Withdrawal Window',
        subject: 'Clarification on 10am limits',
        status: 'resolved',
        date: Date.now() - 1 * 24 * 60 * 60 * 1000,
        messages: [
          {
            id: 'msg_3',
            sender: 'user',
            senderName: 'Obazee Jeremiah',
            text: 'Can I request a withdrawal at any time of day, or is it only permitted during specified daily corporate hours?',
            date: Date.now() - 1 * 24 * 60 * 60 * 1000 - 45 * 60 * 1000
          },
          {
            id: 'msg_4',
            sender: 'agent',
            senderName: 'Blessing Adebayo',
            text: 'Our payout desk processes settlement claims in batches, with premium options cleared between 10 AM and 4 PM NIBSS time. Your request can be submitted whenever convenient!',
            date: Date.now() - 1 * 24 * 60 * 60 * 1005
          }
        ]
      }
    ];
  });

  const [userChatThreads, setUserChatThreads] = useState<Record<string, { sender: 'user' | 'agent' | 'admin'; text: string; time: string; }[]>>(() => {
    const saved = localStorage.getItem('lafarge_user_chat_threads');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      'jeremiahobazee11@gmail.com': [
        {
          sender: 'agent',
          text: 'Good day! Welcome to Lafarge-Huaxin Africa Client Relations Desk. I am Blessing Adebayo, your dedicated investment advisor today. How may I help you maximize or solve issues regarding your high-yield daily dividend packages?',
          time: 'Just now'
        }
      ]
    };
  });

  const csChatMessages = userChatThreads[wallet.email.toLowerCase()] || [
    {
      sender: 'agent',
      text: 'Good day! Welcome to Lafarge-Huaxin Africa Client Relations Desk. I am Blessing Adebayo, your dedicated investment advisor today. How may I help you maximize or solve issues regarding your high-yield daily dividend packages?',
      time: 'Just now'
    }
  ];

  const [currentCsInput, setCurrentCsInput] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Deposit Issue');
  const [ticketSuccessInfo, setTicketSuccessInfo] = useState('');

  // Comprehensive historic txn list corresponding safely to visual balances in database storage
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('lafarge_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'tx-initial-deployment',
        type: 'invest',
        amount: 30000,
        status: 'completed',
        date: Date.now() - 1 * 24 * 60 * 60 * 1000,
        reference: 'TX-LAF9086',
        description: 'Acquired Ewekoro Dry Kiln Share Options',
        userEmail: 'jeremiahobazee11@gmail.com'
      },
      {
        id: 'tx-dividend-claim-prev',
        type: 'payout',
        amount: 4500,
        status: 'completed',
        date: Date.now() - 0.5 * 24 * 60 * 60 * 1000,
        reference: 'TX-EARN451',
        description: 'Withdrew Day 1 Lafarge Stock Dividend',
        userEmail: 'jeremiahobazee11@gmail.com'
      },
      {
        id: 'tx-initial-deposit',
        type: 'deposit',
        amount: 154500,
        status: 'completed',
        date: Date.now() - 1.5 * 24 * 60 * 60 * 1000,
        reference: 'TX-ACC-PAYSTACK',
        description: 'Funded account via paystack gateway',
        userEmail: 'jeremiahobazee11@gmail.com'
      }
    ];
  });

  // Dynamic automatic synchronization hooks for the local database
  useEffect(() => {
    localStorage.setItem('lafarge_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem('lafarge_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('lafarge_active_investments', JSON.stringify(activeInvestments));
  }, [activeInvestments]);

  useEffect(() => {
    localStorage.setItem('lafarge_deposit_accounts', JSON.stringify(depositAccounts));
  }, [depositAccounts]);

  useEffect(() => {
    localStorage.setItem('lafarge_cs_tickets', JSON.stringify(csTickets));
  }, [csTickets]);

  useEffect(() => {
    localStorage.setItem('lafarge_user_chat_threads', JSON.stringify(userChatThreads));
  }, [userChatThreads]);

  useEffect(() => {
    localStorage.setItem('lafarge_referred_by_code', referredByCode);
  }, [referredByCode]);

  useEffect(() => {
    localStorage.setItem('lafarge_referrals', JSON.stringify(referrals));
  }, [referrals]);

  // Dynamic automatic synchronization with full-stack server
  useEffect(() => {
    let isMounted = true;
    const poll = async () => {
      try {
        const res = await fetch('/api/sync');
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data && (data.version > localVersion.current || !isInitializedFromServer.current)) {
            // New changes exist on server database. Lock synchronizer feedback and update state.
            isSyncingFromServer.current = true;
            localVersion.current = data.version;

            if (data.registeredUsers) setRegisteredUsers(data.registeredUsers);
            if (data.transactions) setTransactions(data.transactions);
            if (data.activeInvestments) setActiveInvestments(data.activeInvestments);
            if (data.depositAccounts) setDepositAccounts(data.depositAccounts);
            if (data.csTickets) setCsTickets(data.csTickets);
            if (data.userChatThreads) setUserChatThreads(data.userChatThreads);
            if (data.referrals) setReferrals(data.referrals);
            if (data.adminApprovalSettings) {
              setAdminApprovalSettings({
                requireDepositApproval: data.adminApprovalSettings.requireDepositApproval ?? true,
                requireInvestmentApproval: data.adminApprovalSettings.requireInvestmentApproval ?? true,
                requireWithdrawalApproval: data.adminApprovalSettings.requireWithdrawalApproval ?? true,
                customReferralLink: data.adminApprovalSettings.customReferralLink ?? '',
                isReferralLinkStatic: data.adminApprovalSettings.isReferralLinkStatic ?? false,
                csNumber: data.adminApprovalSettings.csNumber ?? '08158432605',
                officialWhatsAppGroup: data.adminApprovalSettings.officialWhatsAppGroup ?? 'https://chat.whatsapp.com/KHZgCi1h24154DqIIHz3VE',
                minReferralWithdrawal: data.adminApprovalSettings.minReferralWithdrawal ?? 5000
              });
            }

            isInitializedFromServer.current = true;

            setTimeout(() => {
              isSyncingFromServer.current = false;
            }, 800);
          }
        }
      } catch (e) {
        // Gracefully warning-log transient network/restart errors, only error on true logical bugs
        const errorMsg = e instanceof Error ? e.message : String(e);
        if (errorMsg.includes('Failed to fetch') || errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('Load failed')) {
          console.warn("Sync server is temporarily offline or restarting, retrying soon...");
        } else {
          console.error("Online poll error:", e);
        }
      }
    };

    poll();
    const interval = setInterval(poll, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // If the state has not been initialized from the server, do NOT push
    if (!isInitializedFromServer.current) {
      return;
    }

    // If the state changes were downloaded from polling/syncing, do NOT trigger feedback loop push
    if (isSyncingFromServer.current) {
      return;
    }

    const pushChanges = async () => {
      try {
        const payload = {
          registeredUsers,
          transactions,
          activeInvestments,
          depositAccounts,
          csTickets,
          userChatThreads,
          referrals,
          adminApprovalSettings,
          clientVersion: localVersion.current
        };

        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.version) {
            localVersion.current = data.version;
          }
        }
      } catch (error) {
        // Gracefully warning-log transient connection errors, only error on true logical bugs
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (errorMsg.includes('Failed to fetch') || errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('Load failed')) {
          console.warn("Sync push is temporarily deferred due to offline/restart state. Will retry...");
        } else {
          console.error("Sync push error:", error);
        }
      }
    };

    pushChanges();
  }, [
    registeredUsers,
    transactions,
    activeInvestments,
    depositAccounts,
    csTickets,
    userChatThreads,
    referrals,
    adminApprovalSettings
  ]);

  useEffect(() => {
    if (!wallet || !wallet.email || wallet.email.toLowerCase() === 'admin1234@gmail.com') return;
    setRegisteredUsers((prevUsers) => {
      const match = prevUsers.find((u) => u.email.toLowerCase() === wallet.email.toLowerCase());
      if (match) {
        const hasDiff = Object.keys(wallet).some(
          (key) => (wallet as any)[key] !== (match as any)[key]
        );
        if (hasDiff) {
          return prevUsers.map((u) =>
            u.email.toLowerCase() === wallet.email.toLowerCase() ? { ...wallet } : u
          );
        }
      }
      return prevUsers;
    });
  }, [wallet]);

  useEffect(() => {
    if (!wallet || !wallet.email || wallet.email.toLowerCase() === 'admin1234@gmail.com') return;
    const match = registeredUsers.find((u) => u.email.toLowerCase() === wallet.email.toLowerCase());
    if (match) {
      const hasDiff = Object.keys(match).some(
        (key) => (wallet as any)[key] !== (match as any)[key]
      );
      if (hasDiff) {
        setWallet(match);
      }
    } else if (isInitializedFromServer.current) {
      handleLogout();
    }
  }, [registeredUsers]);

  // Filter user-specific lists so each registered account has their own isolated ledger
  const userTransactions = transactions.filter(
    (tx) => tx.userEmail?.toLowerCase() === (wallet?.email || '').toLowerCase()
  );
  const userActiveInvestments = activeInvestments.filter(
    (inv) => inv.userEmail?.toLowerCase() === (wallet?.email || '').toLowerCase()
  );
  const userActiveCount = userActiveInvestments.filter(i => i.status === 'active').length;

  // Global Time Machine Engine updating state dynamically!
  const handleAdvanceTime = (msToAdd: number) => {
    setSimulatedTime((prevTime) => {
      const newTime = prevTime + msToAdd;

      // Scan and mutate maturing/accumulating investments
      setActiveInvestments((prevInvestments) => {
        const userEarnings: Record<string, number> = {};
        const referrerCommissions: Record<string, number> = {};
        let newTransactions: Transaction[] = [];

        // Pre-build referee to referrer map based on current registered users
        const refereeReferrerMap: Record<string, { referrerEmail: string, refereeName: string }> = {};
        registeredUsers.forEach((usr) => {
          if (usr.referredBy) {
            const code = usr.referredBy.trim().toLowerCase();
            const referrer = registeredUsers.find(
              (r) => r.referralCode?.trim().toLowerCase() === code
            );
            if (referrer) {
              refereeReferrerMap[usr.email.toLowerCase()] = {
                referrerEmail: referrer.email.toLowerCase(),
                refereeName: usr.fullName
              };
            }
          }
        });

        // Precompute multi-level referral counts for all registered users (needed for level unlock thresholds)
        const userNetworkCounts: Record<string, { lv1: number; lv2: number; lv3: number; lv4: number; lv5: number }> = {};
        registeredUsers.forEach((usr) => {
          const emailLower = usr.email.toLowerCase();
          const codeNormalized = (usr.referralCode || '').trim().toLowerCase();
          if (!codeNormalized) {
            userNetworkCounts[emailLower] = { lv1: 0, lv2: 0, lv3: 0, lv4: 0, lv5: 0 };
            return;
          }
          
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
          
          userNetworkCounts[emailLower] = {
            lv1: lv1Users.length,
            lv2: lv2Users.length,
            lv3: lv3Users.length,
            lv4: lv4Users.length,
            lv5: lv5Users.length
          };
        });

        const updatedList = prevInvestments.map((inv) => {
          if (inv.status !== 'active') return inv;

          let workingInv = { ...inv };
          const email = (workingInv.userEmail || 'jeremiahobazee11@gmail.com').toLowerCase();
          if (!userEarnings[email]) {
            userEarnings[email] = 0;
          }
          
          const currentRate = workingInv.rate || 0.10;
          const termDays = workingInv.termDays || Math.round(workingInv.expectedReturn / (workingInv.amountInvested * currentRate)) || 4;
          
          let refereeYieldThisJump = 0;

          // Calculate old elapsed days to find the change during this jump
          const oldElapsedMs = prevTime - inv.startDate;
          const oldElapsedDays = Math.floor(Math.max(0, oldElapsedMs) / (24 * 60 * 60 * 1000));
          const oldCappedDays = Math.min(termDays, Math.max(0, oldElapsedDays));
          const oldAccrued = inv.amountInvested * currentRate * oldCappedDays;

          while (newTime >= workingInv.endDate) {
            const cycleProfit = workingInv.amountInvested * currentRate * termDays;
            userEarnings[email] += cycleProfit;
            refereeYieldThisJump += cycleProfit;

            if (workingInv.isCompounding) {
              // Roll over BOTH principal and profit for next term cycle
              const newAmountCompounded = workingInv.amountInvested * (1 + (currentRate * termDays));
              const prevEndDate = workingInv.endDate;

              newTransactions.push({
                id: `tx-comp-payout-${Math.random().toString(36).substring(2, 9)}`,
                type: 'payout',
                amount: cycleProfit,
                status: 'completed',
                date: prevEndDate,
                reference: generateRef(),
                description: `Roll dividend release: ${workingInv.productName}`,
                userEmail: email
              });

              newTransactions.push({
                id: `tx-comp-reinvest-${Math.random().toString(36).substring(2, 9)}`,
                type: 'invest',
                amount: workingInv.amountInvested,
                status: 'completed',
                date: prevEndDate,
                reference: generateRef(),
                description: `Rollover compound reinvest: ${workingInv.productName}`,
                userEmail: email
              });

              workingInv.startDate = prevEndDate;
              workingInv.endDate = prevEndDate + (termDays * 24 * 60 * 60 * 1000); // dynamic days
              workingInv.amountInvested = newAmountCompounded;
              workingInv.expectedReturn = newAmountCompounded * currentRate * termDays;
              workingInv.totalAccrued = 0; // reset accrued so far
            } else {
              // Stop compounding. Set to matured, capital goes wait for manual payout claim
              workingInv.status = 'matured';
              workingInv.totalAccrued = cycleProfit; // fully accrued 40%-150%
              break;
            }
          }

          // Update active partial accruals dynamically if still active
          if (workingInv.status === 'active') {
            const elapsedMs = newTime - workingInv.startDate;
            const elapsedDays = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
            const cappedDays = Math.min(termDays, Math.max(0, elapsedDays));
            workingInv.totalAccrued = workingInv.amountInvested * currentRate * cappedDays;

            // Compute part yield accrued during the non-rollover portion of this jump
            if (workingInv.startDate === inv.startDate) {
              const diff = Math.max(0, workingInv.totalAccrued - oldAccrued);
              refereeYieldThisJump += diff;
            } else {
              refereeYieldThisJump += workingInv.totalAccrued;
            }
          }

          // Distribute 5-Level Daily Referral Bonus Commission to upstream referrers!
          if (refereeYieldThisJump > 0) {
            let currentSponsorEmail = email;
            
            // Loop up to 5 levels of upstream sponsors
            for (let level = 1; level <= 5; level++) {
              const currentSponsorUsr = registeredUsers.find(
                (u) => u.email.toLowerCase() === currentSponsorEmail.toLowerCase()
              );
              if (!currentSponsorUsr || !currentSponsorUsr.referredBy) break;

              const code = currentSponsorUsr.referredBy.trim().toLowerCase();
              const referrer = registeredUsers.find(
                (r) => r.referralCode?.trim().toLowerCase() === code
              );
              if (!referrer) break;

              const referrerEmailLower = referrer.email.toLowerCase();
              const counts = userNetworkCounts[referrerEmailLower] || { lv1: 0, lv2: 0, lv3: 0, lv4: 0, lv5: 0 };

              // Check commission rates and referral requirements per level:
              // Level 1: 0.1% (Unlocked if level 1 refs >= 5)
              // Level 2: 0.2% (Unlocked if level 2 refs >= 10)
              // Level 3: 0.3% (Unlocked if level 3 refs >= 15)
              // Level 4: 0.4% (Unlocked if level 4 refs >= 20)
              // Level 5: 0.5% (Unlocked if level 5 refs >= 25)
              let commRate = 0;
              if (level === 1 && counts.lv1 >= 5) {
                commRate = 0.001;
              } else if (level === 2 && counts.lv2 >= 10) {
                commRate = 0.002;
              } else if (level === 3 && counts.lv3 >= 15) {
                commRate = 0.003;
              } else if (level === 4 && counts.lv4 >= 20) {
                commRate = 0.004;
              } else if (level === 5 && counts.lv5 >= 25) {
                commRate = 0.005;
              }

              if (commRate > 0) {
                const commAmount = refereeYieldThisJump * commRate;
                if (commAmount > 0.001) {
                  referrerCommissions[referrerEmailLower] = (referrerCommissions[referrerEmailLower] || 0) + commAmount;

                  newTransactions.push({
                    id: `tx-ref-level-${level}-${Math.random().toString(36).substring(2, 9)}`,
                    type: 'payout',
                    amount: commAmount,
                    status: 'completed',
                    date: newTime,
                    reference: generateRef(),
                    description: `Level ${level} Commission (${(commRate * 100).toFixed(1)}%): ₦${commAmount.toFixed(2)} from level-${level} referee ${workingInv.userEmail}'s options yield!`,
                    userEmail: referrerEmailLower
                  });
                }
              }

              // Advance sponsor chain to next upstream tier
              currentSponsorEmail = referrerEmailLower;
            }
          }

          return workingInv;
        });

        // Update each registered user's balance based on earned yields and active investments
        setRegisteredUsers((prevUsers) =>
          prevUsers.map((u) => {
            const email = u.email.toLowerCase();
            const earnedAdd = userEarnings[email] || 0;
            const commAdd = referrerCommissions[email] || 0;
            
            const userActiveInvests = updatedList.filter(
              (i) => i.status === 'active' && (i.userEmail || '').toLowerCase() === email
            );
            const deltaActive = userActiveInvests.reduce((sum, i) => sum + i.amountInvested, 0);

            if (earnedAdd > 0 || commAdd > 0 || u.investedBalance !== deltaActive) {
              const nextU = {
                ...u,
                walletBalance: u.walletBalance + commAdd,
                earnedBalance: u.earnedBalance + earnedAdd + commAdd,
                referralEarnings: u.referralEarnings + commAdd,
                investedBalance: deltaActive
              };

              // Explicitly sync current logged-in user's wallet
              if (wallet && wallet.email.toLowerCase() === email) {
                setWallet(nextU);
              }

              return nextU;
            }
            return u;
          })
        );

        if (newTransactions.length > 0) {
          setTransactions((prevTx) => [...newTransactions, ...prevTx]);
        }

        return updatedList;
      });

      return newTime;
    });
  };

  // Launch Lafarge share investment
  const handleDeployCapital = (productId: string, amountToDeploy: number, isCompounding: boolean) => {
    const productDef = productsList.find(p => p.id === productId);
    if (!productDef) return;

    const requireApproval = false; // Anyone with enough balance to purchase a product can purchase without admin approval.
    const newInst: ActiveInvestment = {
      id: `inv-${Math.random().toString(36).substring(2, 9)}`,
      productId,
      productName: productDef.name,
      amountInvested: amountToDeploy,
      startDate: simulatedTime,
      endDate: simulatedTime + (productDef.termDays * 24 * 60 * 60 * 1000), // exactly product.termDays
      lastAccrualTime: simulatedTime,
      status: requireApproval ? 'pending' : 'active',
      totalAccrued: 0,
      expectedReturn: amountToDeploy * productDef.rate * productDef.termDays,
      isCompounding,
      userEmail: wallet.email,
      termDays: productDef.termDays,
      rate: productDef.rate
    };

    // Update state lists
    setActiveInvestments((prev) => [...prev, newInst]);
    setWallet((prev) => ({
      ...prev,
      walletBalance: requireApproval ? prev.walletBalance : prev.walletBalance - amountToDeploy,
      investedBalance: requireApproval ? prev.investedBalance : prev.investedBalance + amountToDeploy
    }));

    setRegisteredUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.email.toLowerCase() === wallet.email.toLowerCase()
          ? {
              ...u,
              walletBalance: requireApproval ? u.walletBalance : u.walletBalance - amountToDeploy,
              investedBalance: requireApproval ? u.investedBalance : u.investedBalance + amountToDeploy
            }
          : u
      )
    );

    setTransactions((prev) => [
      {
        id: `tx-${Math.random().toString(36).substring(2, 9)}`,
        type: 'invest',
        amount: amountToDeploy,
        status: requireApproval ? 'pending' : 'completed',
        date: simulatedTime,
        reference: generateRef(),
        description: `Acquired ${productDef.name} Share Options${requireApproval ? ' (Awaiting Corporate Underwrite)' : ''}`,
        userEmail: wallet.email
      },
      ...prev
    ]);
  };

  // Claim dividends or matured stock positions dynamically!
  const handleClaimMatured = (investmentId: string) => {
    const target = activeInvestments.find(i => i.id === investmentId);
    if (!target) return;

    if (target.status === 'matured') {
      const currentRate = target.rate || 0.10;
      const termDays = target.termDays || Math.round(target.expectedReturn / (target.amountInvested * currentRate)) || 4;
      const profit = target.expectedReturn || (target.amountInvested * currentRate * termDays);
      const grossReturn = target.amountInvested + profit;

      setActiveInvestments((prev) => 
        prev.map(i => i.id === investmentId ? { ...i, status: 'withdrawn', totalAccrued: 0 } : i)
      );

      setWallet((prev) => ({
        ...prev,
        walletBalance: prev.walletBalance + grossReturn,
        investedBalance: prev.investedBalance - target.amountInvested,
        earnedBalance: prev.earnedBalance + profit
      }));

      setRegisteredUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.email.toLowerCase() === wallet.email.toLowerCase()
            ? {
                ...u,
                walletBalance: u.walletBalance + grossReturn,
                investedBalance: u.investedBalance - target.amountInvested,
                earnedBalance: u.earnedBalance + profit
              }
            : u
        )
      );

      setTransactions((prev) => [
        {
          id: `tx-claims-${Math.random().toString(36).substring(2, 10)}`,
          type: 'payout',
          amount: profit,
          status: 'completed',
          date: simulatedTime,
          reference: generateRef(),
          description: `Withdrew matured dividends: ${target.productName}`,
          userEmail: wallet.email
        },
        {
          id: `tx-refund-${Math.random().toString(36).substring(2, 10)}`,
          type: 'refund',
          amount: target.amountInvested,
          status: 'completed',
          date: simulatedTime,
          reference: generateRef(),
          description: `Lafarge share capital unlocked: ${target.productName}`,
          userEmail: wallet.email
        },
        ...prev
      ]);
    } else if (target.status === 'active' && target.totalAccrued > 0) {
      // Partial claim of daily accrued dividends before maturity!
      const dividendToClaim = target.totalAccrued;

      setActiveInvestments((prev) => 
        prev.map(i => i.id === investmentId ? { ...i, totalAccrued: 0, startDate: simulatedTime } : i)
      );

      setWallet((prev) => ({
        ...prev,
        walletBalance: prev.walletBalance + dividendToClaim,
        earnedBalance: prev.earnedBalance + dividendToClaim
      }));

      setRegisteredUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.email.toLowerCase() === wallet.email.toLowerCase()
            ? {
                ...u,
                walletBalance: u.walletBalance + dividendToClaim,
                earnedBalance: u.earnedBalance + dividendToClaim
              }
            : u
        )
      );

      setTransactions((prev) => [
        {
          id: `tx-claims-${Math.random().toString(36).substring(2, 10)}`,
          type: 'payout',
          amount: dividendToClaim,
          status: 'completed',
          date: simulatedTime,
          reference: generateRef(),
          description: `Withdrew accumulated daily dividend yields: ${target.productName}`,
          userEmail: wallet.email
        },
        ...prev
      ]);
    }
  };

  // Toggle compounding on active nodes
  const handleToggleCompounding = (id: string, toggleVal: boolean) => {
    setActiveInvestments(prev => 
      prev.map(i => i.id === id ? { ...i, isCompounding: toggleVal } : i)
    );
  };

  const handleToggleGlobalAutoInvest = (enabled: boolean) => {
    setWallet(prev => {
      const next = { ...prev, autoInvest: enabled };
      
      setRegisteredUsers(prevUsers =>
        prevUsers.map(u => u.email.toLowerCase() === prev.email.toLowerCase() ? { ...u, autoInvest: enabled } : u)
      );
      
      return next;
    });

    // Sync all user's active/pending investments compounding status to match global preferences!
    setActiveInvestments(prev => 
      prev.map(inv => {
        if (inv.userEmail?.toLowerCase() === wallet.email.toLowerCase()) {
          return { ...inv, isCompounding: enabled };
        }
        return inv;
      })
    );
  };

  // Add mock deposits/withdraws
  const handleConfirmDepositWithdraw = (amount: number, txType: 'deposit' | 'withdraw', logDetails: string) => {
    if (txType === 'deposit') {
      const requireApproval = adminApprovalSettings.requireDepositApproval;
      
      if (!requireApproval) {
        const activeReferrer = referredByCode;
        if (activeReferrer) {
          setReferredByCode(''); // reset after first deposit
        }

        setWallet(prev => ({
          ...prev,
          walletBalance: prev.walletBalance + amount
        }));

        setRegisteredUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.email.toLowerCase() === wallet.email.toLowerCase()
              ? {
                  ...u,
                  walletBalance: u.walletBalance + amount
                }
              : u
          )
        );
      }

      setTransactions(prev => {
        const baseTxList = [
          {
            id: `tx-dep-${Math.random().toString(36).substring(2, 9)}`,
            type: 'deposit' as const,
            amount,
            status: requireApproval ? ('pending' as const) : ('completed' as const),
            date: simulatedTime,
            reference: generateRef(),
            description: logDetails + (requireApproval ? ' (Awaiting Paystack Audit Review)' : ' (Processed - Autocredited Instantly)'),
            userEmail: wallet.email
          },
          ...prev
        ];

        // Only auto-trigger referral payout if not requiring manual deposit audits!
        if (!requireApproval && referredByCode) {
          baseTxList.unshift({
            id: `tx-ref-trig-${Math.random().toString(36).substring(2, 9)}`,
            type: 'payout' as const,
            amount: 500,
            status: 'completed' as const,
            date: simulatedTime,
            reference: generateRef(),
            description: `Referral Reward: Referrer code ${referredByCode} credited with ₦500.00 booster bonus!`,
            userEmail: wallet.email
          });
        }

        return baseTxList;
      });
    } else {
      const requireApproval = adminApprovalSettings.requireWithdrawalApproval;
      
      setWallet(prev => ({
        ...prev,
        walletBalance: prev.walletBalance - amount,
        withdrawnBalance: requireApproval ? prev.withdrawnBalance : prev.withdrawnBalance + amount
      }));

      setRegisteredUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.email.toLowerCase() === wallet.email.toLowerCase()
            ? {
                ...u,
                walletBalance: u.walletBalance - amount,
                withdrawnBalance: requireApproval ? u.withdrawnBalance : u.withdrawnBalance + amount
              }
            : u
        )
      );

      setTransactions(prev => [
        {
          id: `tx-with-${Math.random().toString(36).substring(2, 9)}`,
          type: 'withdraw',
          amount,
          status: requireApproval ? ('pending' as const) : ('completed' as const),
          date: simulatedTime,
          reference: generateRef(),
          description: logDetails + (requireApproval ? ' (Pending Corporate Executive Approval)' : ' (Processed - Instant Bank Outflow)'),
          userEmail: wallet.email
        },
        ...prev
      ]);
    }
  };

  // Supervisor Approval Handlers
  const handleApproveReferral = (refId: string) => {
    setReferrals((prevRefs) =>
      prevRefs.map((r) => {
        if (r.id === refId && r.status === 'pending') {
          // Credit the Referrer
          setRegisteredUsers((prevUsers) =>
            prevUsers.map((u) => {
              if (u.email.toLowerCase() === r.referrerEmail.toLowerCase()) {
                const nextUser = {
                  ...u,
                  walletBalance: u.walletBalance + r.amount,
                  earnedBalance: u.earnedBalance + r.amount,
                  referralEarnings: u.referralEarnings + r.amount,
                  referralsCount: u.referralsCount + 1
                };
                
                // If this is also the active wallet of the user, we update that too
                if (wallet && wallet.email.toLowerCase() === u.email.toLowerCase()) {
                  setWallet(nextUser);
                }
                
                return nextUser;
              }
              return u;
            })
          );

          // Append a transaction record for the referrer
          setTransactions((prevTxs) => [
            {
              id: `tx-ref-auth-${Math.random().toString(36).substring(2, 9)}`,
              type: 'payout' as const,
              amount: r.amount,
              status: 'completed' as const,
              date: simulatedTime,
              reference: generateRef(),
              description: `Referral Approved: Successfully credited ₦${r.amount.toFixed(2)} bonus for referring ${r.referredName}!`,
              userEmail: r.referrerEmail
            },
            ...prevTxs
          ]);

          return { ...r, status: 'approved' as const };
        }
        return r;
      })
    );
  };

  const handleDeclineReferral = (refId: string) => {
    setReferrals((prevRefs) =>
      prevRefs.map((r) => {
        if (r.id === refId && r.status === 'pending') {
          return { ...r, status: 'rejected' as const };
        }
        return r;
      })
    );
  };

  const handleApproveDeposit = (txId: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === txId && tx.status === 'pending') {
          const emailToUpdate = (tx.userEmail || '').toLowerCase() || 'jeremiahobazee11@gmail.com';
          
          setRegisteredUsers((prevUsers) =>
            prevUsers.map((u) => {
              if (u.email.toLowerCase() === emailToUpdate) {
                const updated = {
                  ...u,
                  walletBalance: u.walletBalance + tx.amount,
                };

                return updated;
              }
              return u;
            })
          );

          return {
            ...tx,
            status: 'completed' as const,
            description: tx.description.replace(' (Awaiting Paystack Audit Review)', ''),
          };
        }
        return tx;
      })
    );
  };

  const handleDeclineDeposit = (txId: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === txId && tx.status === 'pending') {
          return {
            ...tx,
            status: 'failed' as const,
            description: tx.description.replace(' (Awaiting Paystack Audit Review)', '') + ' (Declined by Corporate Supervisor)',
          };
        }
        return tx;
      })
    );
  };

  const handleApproveWithdrawal = (txId: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === txId && tx.status === 'pending') {
          const emailToUpdate = (tx.userEmail || '').toLowerCase() || 'jeremiahobazee11@gmail.com';
          setRegisteredUsers((prevUsers) =>
            prevUsers.map((u) => {
              if (u.email.toLowerCase() === emailToUpdate) {
                return {
                  ...u,
                  withdrawnBalance: u.withdrawnBalance + tx.amount,
                };
              }
              return u;
            })
          );
          return {
            ...tx,
            status: 'completed' as const,
            description: tx.description.replace(' (Pending Corporate Executive Approval)', ''),
          };
        }
        return tx;
      })
    );
  };

  const handleDeclineWithdrawal = (txId: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === txId && tx.status === 'pending') {
          const emailToUpdate = (tx.userEmail || '').toLowerCase() || 'jeremiahobazee11@gmail.com';
          setRegisteredUsers((prevUsers) =>
            prevUsers.map((u) => {
              if (u.email.toLowerCase() === emailToUpdate) {
                return {
                  ...u,
                  walletBalance: u.walletBalance + tx.amount,
                };
              }
              return u;
            })
          );
          return {
            ...tx,
            status: 'failed' as const,
            description: tx.description.replace(' (Pending Corporate Executive Approval)', '') + ' (Rejected by Financial Auditor)',
          };
        }
        return tx;
      })
    );
  };

  const handleApproveInvestment = (invId: string) => {
    setActiveInvestments((prev) =>
      prev.map((inv) => {
        if (inv.id === invId && inv.status === 'pending') {
          const emailToUpdate = (inv.userEmail || '').toLowerCase() || 'jeremiahobazee11@gmail.com';
          
          // Update local session wallet if it matches the target
          if (emailToUpdate === wallet.email.toLowerCase()) {
            setWallet((p) => ({
              ...p,
              walletBalance: p.walletBalance - inv.amountInvested,
              investedBalance: p.investedBalance + inv.amountInvested
            }));
          }

          setRegisteredUsers((prevUsers) =>
            prevUsers.map((u) => {
              if (u.email.toLowerCase() === emailToUpdate) {
                return {
                  ...u,
                  walletBalance: u.walletBalance - inv.amountInvested,
                  investedBalance: u.investedBalance + inv.amountInvested,
                };
              }
              return u;
            })
          );

          // Complete corresponding deposit/buy transaction
          setTransactions((prevTxs) =>
            prevTxs.map((tx) => {
              if (tx.type === 'invest' && tx.status === 'pending' && Math.abs(tx.amount - inv.amountInvested) < 0.01) {
                return {
                  ...tx,
                  status: 'completed' as const,
                  description: tx.description.replace(' (Awaiting Corporate Underwrite)', ''),
                };
              }
              return tx;
            })
          );

          return {
            ...inv,
            status: 'active' as const,
            startDate: simulatedTime,
            endDate: simulatedTime + (inv.termDays || 10) * 24 * 60 * 60 * 1000,
            lastAccrualTime: simulatedTime,
          };
        }
        return inv;
      })
    );
  };

  const handleDeclineInvestment = (invId: string) => {
    setActiveInvestments((prev) =>
      prev.map((inv) => {
        if (inv.id === invId && inv.status === 'pending') {
          const emailToUpdate = (inv.userEmail || '').toLowerCase() || 'jeremiahobazee11@gmail.com';
          setRegisteredUsers((prevUsers) =>
            prevUsers.map((u) => {
              if (u.email.toLowerCase() === emailToUpdate) {
                return {
                  ...u,
                };
              }
              return u;
            })
          );

          // Set corresponding transaction to failed
          setTransactions((prevTxs) =>
            prevTxs.map((tx) => {
              if (tx.type === 'invest' && tx.status === 'pending' && Math.abs(tx.amount - inv.amountInvested) < 0.01) {
                return {
                  ...tx,
                  status: 'failed' as const,
                  description: tx.description.replace(' (Awaiting Corporate Underwrite)', '') + ' (Placement Declined by Executive Board)',
                };
              }
              return tx;
            })
          );

          return {
            ...inv,
            status: 'cancelled' as const,
          };
        }
        return inv;
      })
    );
  };

  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedPromoMsg, setCopiedPromoMsg] = useState(false);
  
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

  const handleCopyRefLink = () => {
    navigator.clipboard.writeText(getReferralLink());
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const getPromoMessage = (refLink: string) => {
    return `🏗️ *Lafarge Cement Investment Shares Plc* 🏗️\nSecure your daily passive dividends with Nigeria's premier cement plant expansion options! Backed by physical assets and escrow-safe payouts. 📈\n\n💰 *Onboarding Reward:* Get *₦500.00* instantly credited to your register upon signup!\n📊 *Daily Passive Yields:* Earn up to *26.67% daily dividends* on professional options plans (Lagoon, Ewekoro, Sagamu, Ashaka, Mfamosing, Calabar).\n👥 *Passive Earnings:* Build a network and unlock up to 5 tiers of high-leveraged daily passive commissions!\n\nJoin our active stakeholder network instantly using my unique link:\n👇👇👇\n${refLink}`;
  };

  const handleCopyPromoMessage = () => {
    const msg = getPromoMessage(getReferralLink());
    navigator.clipboard.writeText(msg);
    setCopiedPromoMsg(true);
    setTimeout(() => setCopiedPromoMsg(false), 2000);
  };

  const getWhatsAppShareUrl = () => {
    const msg = getPromoMessage(getReferralLink());
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  };



  const handleRegisterSuccess = (newUser: {
    fullName: string;
    email: string;
    accountNumber: string;
    referralUsed: string;
    password?: string;
  }) => {
    const cleanNamePart = newUser.fullName.split(' ')[0]?.toUpperCase().replace(/[^A-Z]/g, '') || 'MEMBER';
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const generatedReferralCode = `LAF-${cleanNamePart}-${randCode}`;
    
    const newWallet: UserWallet = {
      walletBalance: 0, // Starts immediately with 0 Naira
      investedBalance: 0,
      withdrawnBalance: 0,
      earnedBalance: 0,
      accountNumber: newUser.accountNumber,
      fullName: newUser.fullName,
      email: newUser.email,
      referralCode: generatedReferralCode,
      referralsCount: 0,
      referralEarnings: 0,
      hasClaimedBonus: false,
      password: newUser.password || '1234', // Uses the user's custom chosen password
      isFlagged: false,
      requireReferralToWithdraw: false,
      referredBy: newUser.referralUsed || undefined,
      autoInvest: true
    };

    setWallet(newWallet);
    const latestUsers = [...registeredUsers, newWallet];
    setRegisteredUsers(latestUsers);
    setIsLoggedIn(true);
    setIsAdmin(false);

    // Write a 30-day persistent session to active log
    localStorage.setItem('lafarge_login_session', JSON.stringify({
      email: newWallet.email.toLowerCase(),
      isAdmin: false,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    }));

    // Clear portfolios for new registered user
    setActiveInvestments([]);

    // Keep transactions completely empty for new registration as requested!
    // Simply do not call setTransactions or set it to empty for this user.

    if (newUser.referralUsed) {
      setReferredByCode(newUser.referralUsed);
      localStorage.setItem('lafarge_referred_by_code', newUser.referralUsed);
      checkAndRecordReferral(newWallet, latestUsers);
    }
    setShowPromoModal(true);
  };

  const handleClaimBonus = () => {
    setWallet((prev) => {
      const next = {
        ...prev,
        walletBalance: prev.walletBalance + 500,
        earnedBalance: prev.earnedBalance + 500,
        hasClaimedBonus: true
      };

      // Sync into registeredUsers list
      setRegisteredUsers((prevUsers) =>
        prevUsers.map((u) => (u.email.toLowerCase() === prev.email.toLowerCase() ? { ...u, walletBalance: next.walletBalance, earnedBalance: next.earnedBalance, hasClaimedBonus: true } : u))
      );

      return next;
    });

    setTransactions((prevTx) => [
      {
        id: `tx-bonus-${Math.random().toString(36).substring(2, 9)}`,
        type: 'deposit',
        amount: 500,
        status: 'completed',
        date: simulatedTime,
        reference: generateRef(),
        description: 'Lafarge Shareholder Registration welcome booster bonus settled',
        userEmail: wallet.email
      },
      ...prevTx
    ]);
  };

  const handleSendMessageToAgent = (inputText: string) => {
    if (!inputText.trim()) return;

    const userEmailKey = wallet.email.toLowerCase();

    // 1. Appending user message to their private chat stream
    setUserChatThreads(prev => {
      const thread = prev[userEmailKey] || [];
      return {
        ...prev,
        [userEmailKey]: [
          ...thread,
          { sender: 'user' as const, text: inputText, time: 'Just now' }
        ]
      };
    });

    // 2. Clear input
    setCurrentCsInput('');
    setIsAgentTyping(true);

    // 3. Process reply inside timer
    setTimeout(() => {
      let responseText = "Thank you for contacting our support desk. Your query has been logged with Priority Support. Our team is checking the active account details for " + wallet.fullName + ". Let us know if this is regarding a specific transaction reference.";
      
      const textLower = inputText.toLowerCase();
      if (textLower.includes('withdr') || textLower.includes('time') || textLower.includes('10am') || textLower.includes('hour') || textLower.includes('limit')) {
        responseText = "I see you are inquiring about withdrawals! Please remember that all capital and accrued dividend withdrawals are approved between 10:00 AM and 12:00 PM daily. If the simulated time clock shows a different window, you can use the 'Virtual Time Machine' on the dashboard workspace to leap forward instantly and process your payout.";
      } else if (textLower.includes('deposit') || textLower.includes('fund') || textLower.includes('paystack') || textLower.includes('pay')) {
        responseText = "Our payment gateway supports secure instant bank deposits. Transfers typically verify within 1 to 5 minutes. If you completed a deposit and are waiting for it to show, please click 'Simulate Referee Deposit' on the dashboard referral card, or contact us with your reference number.";
      } else if (textLower.includes('refer') || textLower.includes('ref') || textLower.includes('bonus') || textLower.includes('friend') || textLower.includes('comm')) {
        responseText = "For every teammate you refer, you get ₦500.00 instantly upon their first concrete options placement. PLUS, you unlock up to 5 levels of high-yield daily passive commissions synchronized with their yield structure (Level 1: 0.1% at 5 refs, Level 2: 0.2% at 10 refs, Level 3: 0.3% at 15 refs, Level 4: 0.4% at 20 refs, Level 5: 0.5% at 25 refs)! Test this using the 'Simulate Referee Deposit' switch on your dashboard.";
      } else if (textLower.includes('comp') || textLower.includes('interest') || textLower.includes('rate') || textLower.includes('percent')) {
        responseText = "Lafarge's high-yield daily dividend packages (offering up to 26.67% daily return depending on your chosen tier) rollover after a fixed 30-day cycle. Both your principal capital and the accrued profits automatically compound into another cycle, compounding your returns exponentially!";
      }

      setUserChatThreads(prev => {
        const thread = prev[userEmailKey] || [];
        return {
          ...prev,
          [userEmailKey]: [
            ...thread,
            { sender: 'agent' as const, text: responseText, time: 'Just now' }
          ]
        };
      });
      setIsAgentTyping(false);
    }, 1500);
  };

  const handleCreateSupportTicket = (category: string, subject: string) => {
    if (!subject.trim()) return;

    const newTicket: SupportTicket = {
      id: `TCK-${Math.floor(100000 + Math.random() * 900000)}`,
      userEmail: wallet.email,
      userFullName: wallet.fullName,
      category,
      subject,
      status: 'pending',
      date: simulatedTime,
      messages: [
        {
          id: `msg-${Math.floor(100000 + Math.random() * 900000)}`,
          sender: 'user',
          senderName: wallet.fullName,
          text: subject,
          date: simulatedTime
        }
      ]
    };

    setCsTickets(prev => [newTicket, ...prev]);
  };

  const handleReplyToTicket = (ticketId: string, text: string) => {
    setCsTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const newMsg = {
            id: `msg-${Math.floor(100000 + Math.random() * 900000)}`,
            sender: 'agent' as const,
            senderName: 'Blessing Adebayo (Strategic Advisor)',
            text,
            date: simulatedTime
          };
          return {
            ...t,
            messages: [...(t.messages || []), newMsg]
          };
        }
        return t;
      })
    );
  };

  const handleUpdateTicketStatus = (ticketId: string, status: 'pending' | 'resolved') => {
    setCsTickets(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, status } : t))
    );
  };

  const handleSendAdminChatBySupervisor = (userEmail: string, text: string, role: 'admin' | 'agent') => {
    const key = userEmail.toLowerCase();
    setUserChatThreads(prev => {
      const thread = prev[key] || [];
      return {
        ...prev,
        [key]: [
          ...thread,
          { sender: role, text, time: 'Just now' }
        ]
      };
    });
  };

  const handleAddDepositAccount = (bankName: string, accountName: string, accountNumber: string) => {
    const newAcc: DepositAccount = {
      id: `da-${Math.floor(100000 + Math.random() * 900000)}`,
      bankName,
      accountName,
      accountNumber,
      isActive: true
    };
    setDepositAccounts(prev => [...prev, newAcc]);
  };

  const handleRemoveDepositAccount = (id: string) => {
    setDepositAccounts(prev => prev.filter(a => a.id !== id));
  };

  const handleToggleDepositAccount = (id: string) => {
    setDepositAccounts(prev =>
      prev.map(a => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleOpenModal = (type: 'deposit' | 'withdraw') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleSelectUser = (email: string) => {
    if (email.toLowerCase() === 'admin1234@gmail.com') {
      setWallet({
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
      });
      return;
    }
    const targetUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (targetUser) {
      setWallet(targetUser);
    }
  };

  const handleUpdateUserWalletByAdmin = (updates: Partial<UserWallet>) => {
    setWallet((prev) => {
      const next = { ...prev, ...updates };
      setRegisteredUsers((prevUsers) =>
        prevUsers.map((u) => u.email.toLowerCase() === prev.email.toLowerCase() ? { ...u, ...updates } : u)
      );

      if (updates.autoInvest !== undefined) {
        const isAuto = updates.autoInvest;
        setActiveInvestments(prevInv => 
          prevInv.map(inv => {
            if (inv.userEmail?.toLowerCase() === prev.email.toLowerCase()) {
              return { ...inv, isCompounding: isAuto };
            }
            return inv;
          })
        );
      }

      return next;
    });
  };

  const handleUpdateSpecificUser = (email: string, updates: Partial<UserWallet>) => {
    setRegisteredUsers((prevUsers) =>
      prevUsers.map((u) => u.email.toLowerCase() === email.toLowerCase() ? { ...u, ...updates } : u)
    );

    setWallet((prev) => {
      if (prev.email.toLowerCase() === email.toLowerCase()) {
        return { ...prev, ...updates };
      }
      return prev;
    });
  };

  const handleDeleteUser = (userEmail: string) => {
    if (userEmail.toLowerCase() === 'admin1234@gmail.com') {
      alert("Cannot delete primary Corporate Admin.");
      return;
    }

    setRegisteredUsers((prevUsers) => {
      const nextUsers = prevUsers.filter((u) => u.email.toLowerCase() !== userEmail.toLowerCase());
      
      if (wallet && wallet.email.toLowerCase() === userEmail.toLowerCase()) {
        const fallback = nextUsers.find(u => u.email.toLowerCase() === 'jeremiahobazee11@gmail.com') || nextUsers[0];
        if (fallback) {
          setWallet(fallback);
        }
      }
      return nextUsers;
    });

    setTransactions((prevTxs) => prevTxs.filter((tx) => tx.userEmail?.toLowerCase() !== userEmail.toLowerCase()));
    setActiveInvestments((prevInvestments) => prevInvestments.filter((inv) => (inv.userEmail || '').toLowerCase() !== userEmail.toLowerCase()));
    setReferrals((prevRefs) => prevRefs.filter((ref) => ref.referredEmail.toLowerCase() !== userEmail.toLowerCase() && ref.referrerEmail.toLowerCase() !== userEmail.toLowerCase()));
  };

  const handleRegisterUser = (newUser: UserWallet) => {
    isJustRegisteredRef.current = true;
    const latestUsers = [...registeredUsers, newUser];
    setRegisteredUsers(latestUsers);
    
    if (newUser.referredBy) {
      setReferredByCode(newUser.referredBy);
      localStorage.setItem('lafarge_referred_by_code', newUser.referredBy);
      checkAndRecordReferral(newUser, latestUsers);
    }
  };

  const handleLoginSuccess = (userWallet: UserWallet, adminStatus: boolean) => {
    setIsLoggedIn(true);
    setIsAdmin(adminStatus);
    setWallet(userWallet);
    
    // Save 30-day persistent session log
    localStorage.setItem('lafarge_login_session', JSON.stringify({
      email: userWallet.email.toLowerCase(),
      isAdmin: adminStatus,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // Lasts 30 days
    }));

    if (adminStatus) {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
      if (isJustRegisteredRef.current) {
        setShowPromoModal(true);
        isJustRegisteredRef.current = false;
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lafarge_login_session');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setActiveTab('dashboard');
  };

  if (isSplashActive) {
    return <SplashScreen onComplete={() => setIsSplashActive(false)} />;
  }

  if (!isLoggedIn) {
    return (
      <AuthScreen 
        onLoginSuccess={handleLoginSuccess}
        registeredUsers={registeredUsers}
        onRegisterUser={handleRegisterUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col antialiased">
      
      {/* Upper Brand Nav header */}
      <header className="bg-white border-b border-green-105 sticky top-0 z-40 shadow-sm/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Brand Logo - Customized with Industrial cement plant aesthetic */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="p-2 bg-[#028A34] rounded-xl text-white">
                <Factory className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-base font-black tracking-tight text-green-950 uppercase leading-none">
                  Lafarge
                </span>
                <span className="text-[10px] text-gray-450 leading-none tracking-widest font-extrabold uppercase mt-1">
                  Investment Hub
                </span>
              </div>
            </div>

            {/* Desktop Navigation Link Tabs */}
            <nav className="hidden md:flex space-x-1">
              {[
                { name: 'Portfolio View', id: 'dashboard', icon: Landmark },
                { name: 'Share Products', id: 'invest', icon: Compass },
                { name: 'Compounding Simulator', id: 'simulator', icon: TrendingUp },
                { name: 'My Profile', id: 'profile', icon: User },
                { name: 'Security & FAQs', id: 'faq', icon: HelpCircle },
                { name: 'Customer Service', id: 'cs', icon: Headphones },
                { name: 'Admin Portal', id: 'admin', icon: ShieldCheck }
              ].filter(t => t.id !== 'admin' || isAdmin).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`nav-${tab.id}`}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-green-50 text-green-905'
                        : 'text-gray-500 hover:text-gray-950 hover:bg-green-50/40'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-green-600" /> {tab.name}
                  </button>
                );
              })}
            </nav>

            {/* Wallet Cash Summary */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Balance (Naira)</span>
                <span className="text-sm font-black font-mono text-[#028A34] mt-1">{formatNGN(wallet.walletBalance)}</span>
              </div>
              
              <button
                id="btn-header-deposit"
                onClick={() => handleOpenModal('deposit')}
                className="p-2 bg-green-50 text-green-700 hover:bg-green-150 rounded-xl border border-green-100 cursor-pointer transition-colors"
                title="Deposit Capital"
              >
                <Plus className="w-4 h-4 text-[#028A34]" />
              </button>

              <div className="h-8 w-px bg-gray-150 mx-1 hidden sm:block" />

              {/* Sign Out Button */}
              <button
                id="btn-header-logout"
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-900 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Sign Out
              </button>

              <div className="h-8 w-px bg-gray-150 mx-1 hidden sm:block" />

              {/* Profile indicator */}
              <div className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-xl px-2.5 py-1.5 border border-slate-100 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-[#028A34] text-white flex items-center justify-center font-bold text-xs uppercase font-mono">
                  {wallet.fullName[0]}
                </div>
                <span className="text-xs font-bold text-gray-70s hidden md:block">{wallet.fullName}</span>
              </div>

              {/* Mobile Burger element */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-gray-500 md:hidden hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-green-100/80 px-4 py-3 space-y-2 flex flex-col z-35 shadow-lg relative">
          {[
            { name: 'Portfolio View', id: 'dashboard', icon: Landmark },
            { name: 'Share Products', id: 'invest', icon: Compass },
            { name: 'Compounding Simulator', id: 'simulator', icon: TrendingUp },
            { name: 'My Profile', id: 'profile', icon: User },
            { name: 'Security & FAQs', id: 'faq', icon: HelpCircle },
            { name: 'Customer Service', id: 'cs', icon: Headphones },
            { name: 'Admin Portal', id: 'admin', icon: ShieldCheck }
          ].filter(t => t.id !== 'admin' || isAdmin).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`mobile-nav-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-3 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-green-50 text-green-800'
                    : 'text-gray-550 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4.5 h-4.5 text-[#028A34]" /> {tab.name}
              </button>
            );
          })}
          <button
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3.5 py-3 bg-red-50 hover:bg-red-105 border border-red-150 rounded-lg text-xs font-black text-red-700 flex items-center gap-2 mt-4 cursor-pointer"
          >
            <X className="w-4.5 h-4.5 text-red-700" /> Sign Out from Portfolio
          </button>
        </div>
      )}

      {/* Primary Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-12 flex-1 w-full space-y-8">
        
        {/* Dynamic content render depending on ActiveTab */}
        
        {activeTab === 'dashboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            
            {/* Top Stats blocks */}
            <StatsGrid wallet={wallet} onOpenModal={handleOpenModal} activeInvestments={activeInvestments} />

            {/* Premium 5-Level Daily Referral Commission Matrix */}
            <div className="bg-gradient-to-r from-emerald-50 via-[#028A34]/5 to-yellow-500/5 border border-green-200/50 rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#028A34]" />
              
              <div className="flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
                <div className="space-y-2.5 font-sans flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="p-0.5 px-2 bg-gradient-to-r from-[#028A34] to-emerald-600 text-white text-[9px] font-black uppercase rounded-md tracking-wider">
                      5-LEVEL REFERRAL MATRIX
                    </span>
                    {(() => {
                      const netCounts = (() => {
                        const codeNormalized = (wallet.referralCode || '').trim().toLowerCase();
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
                      })();
                      const isSupreme = netCounts.lv1 >= 5 && netCounts.lv2 >= 10 && netCounts.lv3 >= 15 && netCounts.lv4 >= 20 && netCounts.lv5 >= 25;
                      if (isSupreme) {
                        return (
                          <span className="p-0.5 px-2 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-black uppercase rounded-md animate-pulse">
                            ⭐ SUPREME: ALL LEVELS UNLOCKED ⭐
                          </span>
                        );
                      } else {
                        return (
                          <span className="p-0.5 px-2 bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-black uppercase rounded-md">
                            {netCounts.lv1 < 5 
                              ? '🔒 ALL LEVELS LOCKED (Need 5 Lv1 Refs)' 
                              : netCounts.lv2 < 10 
                              ? '🔓 LEVEL 1 ACTIVE (Need 10 Lv2 Refs)' 
                              : netCounts.lv3 < 15 
                              ? '🔓 LEVEL 2 ACTIVE (Need 15 Lv3 Refs)' 
                              : netCounts.lv4 < 20 
                              ? '🔓 LEVEL 3 ACTIVE (Need 20 Lv4 Refs)' 
                              : '🔓 LEVEL 4 ACTIVE (Need 25 Lv5 Refs)'
                            }
                          </span>
                        );
                      }
                    })()}
                  </div>
                  
                  <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5.2 h-5.2 text-yellow-500 animate-pulse shrink-0" />
                    High-Yield Multi-Level Passive Commissions
                  </h4>
                  <p className="text-xs text-gray-550 leading-relaxed font-semibold">
                    Multiply your yield across 5 full tiers of network colleagues! Get an instant onboarding bonus of <strong className="text-gray-900">₦500.00</strong> + daily commissions synchronized with their active cement options yield:
                  </p>

                  {/* Multi-Level Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 pt-1">
                    {(() => {
                      const netCounts = (() => {
                        const codeNormalized = (wallet.referralCode || '').trim().toLowerCase();
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
                      })();

                      return [
                        { level: 1, rate: '0.1%', desc: 'Bronze Shareholder', req: 5, current: netCounts.lv1, name: 'Bronze' },
                        { level: 2, rate: '0.2%', desc: 'Silver Shareholder', req: 10, current: netCounts.lv2, name: 'Silver' },
                        { level: 3, rate: '0.3%', desc: 'Gold Shareholder', req: 15, current: netCounts.lv3, name: 'Gold' },
                        { level: 4, rate: '0.4%', desc: 'Platinum Shareholder', req: 20, current: netCounts.lv4, name: 'Platinum' },
                        { level: 5, rate: '0.5%', desc: 'Diamond Shareholder', req: 25, current: netCounts.lv5, name: 'Diamond' }
                      ].map((lv) => {
                        const isUnlocked = lv.current >= lv.req;
                        return (
                          <div 
                            key={lv.level} 
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              isUnlocked 
                                ? 'bg-white border-green-200/80 shadow-xs ring-2 ring-emerald-500/10' 
                                : 'bg-gray-100/65 border-gray-200 text-gray-400'
                            }`}
                          >
                            <span className="text-[8px] font-black uppercase tracking-wider block leading-none">{lv.name}</span>
                            <span className="text-[7.5px] font-semibold text-gray-400 block mt-0.5 leading-none">(Level {lv.level})</span>
                            <span className={`text-[10px] font-extrabold block my-0.5 ${isUnlocked ? 'text-[#028A34]' : 'text-gray-405'}`}>
                              {lv.rate}
                            </span>
                            <span className="text-[8px] font-black block mt-1 p-0.5 px-0.5 bg-gray-50 rounded border text-slate-705">
                              {lv.current} / {lv.req} refs
                            </span>
                            <span className="text-[8px] font-bold block mt-1">
                              {isUnlocked ? '✔ Active' : `🔒 Locked`}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div className="bg-white border border-green-100/60 shadow-xs rounded-2xl p-4 shrink-0 sm:self-center font-sans space-y-2 lg:w-64">
                  {(() => {
                    const netCounts = (() => {
                      const codeNormalized = (wallet.referralCode || '').trim().toLowerCase();
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
                    })();
                    const totalNetworkCount = netCounts.lv1 + netCounts.lv2 + netCounts.lv3 + netCounts.lv4 + netCounts.lv5;
                    
                    return (
                      <>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-semibold text-[10.5px]">Bronze Shareholder (Level 1):</span>
                            <span className="font-extrabold text-slate-800">{netCounts.lv1} / 5</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-semibold text-[10.5px]">Silver Shareholder (Level 2):</span>
                            <span className="font-extrabold text-slate-800">{netCounts.lv2} / 10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-semibold text-[10.5px]">Gold Shareholder (Level 3):</span>
                            <span className="font-extrabold text-slate-800">{netCounts.lv3} / 15</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-semibold text-[10.5px]">Platinum Shareholder (Level 4):</span>
                            <span className="font-extrabold text-slate-800">{netCounts.lv4} / 20</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-semibold text-[10.5px]">Diamond Shareholder (Level 5):</span>
                            <span className="font-extrabold text-slate-800">{netCounts.lv5} / 25</span>
                          </div>
                          <div className="border-t border-gray-100 pt-1 flex justify-between font-bold text-[#028A34]">
                            <span>Total Team:</span>
                            <span>{totalNetworkCount} members</span>
                          </div>
                        </div>
                        
                        {/* Progress bar to Level-5 unlock */}
                        <div className="space-y-1 pt-1.5">
                          <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase">
                            <span>Level-5 Progress</span>
                            <span>{netCounts.lv5} / 25 refs</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#028A34] transition-all duration-500"
                              style={{ 
                                width: `${Math.min(100, (netCounts.lv5 / 25) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  <p className="text-[9px] text-gray-400 font-bold leading-normal pt-1 break-words">
                    💡 Unlock levels: Bronze at 5 Lv1; Silver at 10 Lv2; Gold at 15 Lv3; Platinum at 20 Lv4; Diamond at 25 Lv5!
                  </p>
                </div>
              </div>
            </div>

            {/* Claim Welcome Bonus Banner */}
            {!wallet.hasClaimedBonus ? (
              <div id="bonus-claim-callout" className="bg-gradient-to-r from-[#028A34] to-emerald-950 border border-green-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md text-white relative overflow-hidden animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500 rounded-xl text-white shadow-md shadow-amber-500/20 shrink-0">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 font-sans">
                    <h3 className="font-extrabold text-amber-300 text-sm flex flex-wrap items-center gap-2">
                      Lafarge Shareholder Welcome Offer
                      <span className="px-2 py-0.5 bg-emerald-900 border border-emerald-800 text-emerald-100 rounded-md text-[10px] font-black uppercase tracking-wider">
                        ₦500.00 Awaiting
                      </span>
                    </h3>
                    <p className="text-xs text-emerald-100 leading-relaxed font-semibold">
                      Your shareholder profile is active, but your balance starts at ₦0.00. Claim your <span className="font-bold text-amber-300">₦500.00 free welcome booster credit</span> to initialize your dividend treasury.
                    </p>
                  </div>
                </div>
                <button
                  id="btn-claim-bonus"
                  onClick={handleClaimBonus}
                  className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 border border-yellow-300 font-black text-xs rounded-xl shadow-md transition-all hover:scale-[1.01] cursor-pointer shrink-0"
                >
                  Claim ₦500 Cash Bonus Now 🎁
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-50/50 to-slate-50 border border-green-150 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
                <span className="absolute top-0 right-0 p-1 bg-green-500 text-white font-black text-[8px] uppercase tracking-widest rotate-6 translate-x-2 translate-y-1 text-center font-mono py-0.5 px-3">
                  COMPLETED
                </span>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-xl text-[#028A34] border border-green-100 shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 font-sans">
                    <h3 className="font-extrabold text-green-900 text-sm flex flex-wrap items-center gap-2">
                      Lafarge Shareholder Program
                      <span className="px-2 py-0.5 bg-green-150 text-green-800 rounded-md text-[10px] font-black uppercase tracking-wider">
                        Shareholder Vault Active
                      </span>
                    </h3>
                    <p className="text-xs text-gray-550 leading-relaxed font-semibold">
                      Congratulations! Your shareholder wallet is now active. Fund your account and acquire shares or bonds to produce high-performance high-yield daily dividends.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Active Investments & Portfolio */}
              <div className="lg:col-span-8 space-y-8">
                <ActiveInvestments 
                  investments={userActiveInvestments}
                  simulatedTime={simulatedTime}
                  onToggleCompounding={handleToggleCompounding}
                  onClaim={handleClaimMatured}
                  onOpenInvestTab={() => setActiveTab('invest')}
                />

                <TransactionHistory transactions={userTransactions} />
              </div>

              {/* Right Column: Time machine simulation and security details */}
              <div className="lg:col-span-4 space-y-8">
                
                {/* Time machine controller */}
                <VirtualTimeMachine 
                  simulatedTime={simulatedTime}
                  onAdvanceTime={handleAdvanceTime}
                  activeInvestmentsCount={userActiveCount}
                />

                {/* Refer and Earn Card */}
                <div className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-950 text-sm">Refer & Earn ₦500.00</h4>
                      <p className="text-[11px] text-gray-400 font-medium">Friend deposit reward bonus</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-455 font-semibold leading-relaxed">
                    Invite colleagues to Lafarge Investment Hub. You instantly receive <strong className="text-[#028A34]">₦500.00</strong> when your referred friends complete their first package deposit.
                  </p>

                  {/* Ref Link copy area */}
                  <div className="space-y-1.5 font-sans">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Your Referral Link</label>
                    <div className="flex items-center gap-2 p-1.5 bg-gray-50 border border-slate-100 rounded-xl">
                      <code className="text-[11px] font-mono font-medium text-gray-600 truncate flex-1 pl-1">
                        {getReferralLink()}
                      </code>
                      <button
                        onClick={handleCopyRefLink}
                        className="p-1.5 bg-white text-green-700 hover:text-green-800 border border-slate-105 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors shrink-0"
                        title="Copy Referral Link"
                      >
                        {copiedRef ? <Check className="w-4 h-4 text-[#028A34]" /> : <Copy className="w-4 h-4 text-green-600" />}
                      </button>
                    </div>

                    {/* Integrated WhatsApp share handles */}
                    <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                      <button
                        type="button"
                        onClick={handleCopyPromoMessage}
                        className="flex items-center justify-center gap-1 py-1.5 px-2.5 border border-green-200 hover:border-green-300 bg-white hover:bg-green-50/40 text-green-700 font-bold text-[10px] rounded-xl transition-all shadow-xs cursor-pointer"
                        title="Copy pre-written message"
                      >
                        {copiedPromoMsg ? <Check className="w-3.5 h-3.5 text-[#028A34]" /> : <Copy className="w-3.5 h-3.5 text-green-600" />}
                        {copiedPromoMsg ? "Copied" : "Copy Invite Text"}
                      </button>
                      <a
                        href={getWhatsAppShareUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 py-1.5 px-2.5 bg-[#128C7E] hover:bg-[#075E54] text-white font-black text-[10px] rounded-xl transition-all shadow-xs shrink-0 text-center"
                        title="Share promotion directly to WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Share to WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Referral Statistics */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-green-50/20 border border-green-100/30 rounded-xl">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Referrals Count</span>
                      <span className="text-sm font-black font-mono text-gray-900 flex items-center gap-1 mt-0.5">
                        <Users className="w-4 h-4 text-green-600 shrink-0" /> {wallet.referralsCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Ref Earnings</span>
                      <span className="text-sm font-black font-mono text-[#028A34] mt-0.5">
                        {formatNGN(wallet.referralEarnings)}
                      </span>
                    </div>
                  </div>

                  </div>

                {/* Audit and Security trust widget */}
                <div className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                  <span className="text-[9px] font-bold text-green-800 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full inline-block">
                    Licensed Escrow Safe Guarantee
                  </span>
                  
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 leading-tight">Huaxin Cement Group Asset Backing</h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                      Underpinned by Lafarge Africa Plc’s massive 10.5 million metric tonnes annual concrete capacity. Positions correspond to real physical plant expansions across Ewekoro, Sagamu, Mfamosing, and Ashaka plants.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-150 space-y-2 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-[#028A34]" /> NIBSS & Paystack Gateway Security</div>
                    <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#028A34]" /> SEC Nigeria Registered Corporate Shares</div>
                    <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-[#028A34]" /> Huaxin Cement Board Audit Approved</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Global Auto-Invest setting at the bottom of Portfolio */}
            <div className="bg-white border border-green-150/40 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#028A34]" />
              
              <div className="space-y-1.5 md:pl-2 max-w-2xl font-sans">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-green-50 text-[#028A34] text-[10px] font-black uppercase tracking-wider rounded-md border border-green-100">
                    System Preference
                  </span>
                  {wallet.autoInvest !== false ? (
                    <span className="p-0.5 px-2 bg-[#028A34] text-white text-[9px] font-bold uppercase rounded-md animate-pulse">
                      ACTIVE & COMPACTING
                    </span>
                  ) : (
                    <span className="p-0.5 px-2 bg-slate-100 text-slate-500 border border-slate-200 text-[9px] font-bold uppercase rounded-md">
                      PAUSED
                    </span>
                  )}
                </div>
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500 shrink-0" /> Account Auto-Invest Reinvestment Node
                </h4>
                <p className="text-xs text-gray-550 leading-relaxed font-semibold">
                  With Auto-Invest enabled (ON by default), all your acquired positions will automatically roll over into a new cycle upon maturity. Disable this to payout matured funds straight into your liquid naira balance.
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0 sm:self-center">
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-150 rounded-2xl p-3 px-4 shadow-inner">
                  <span className="text-xs font-black text-gray-900 animate-pulse">
                    {wallet.autoInvest !== false ? 'Auto-Invest ON' : 'Auto-Invest OFF'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wallet.autoInvest !== false}
                      onChange={(e) => handleToggleGlobalAutoInvest(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028A34]" />
                  </label>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {activeTab === 'invest' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="border-b border-green-150 pb-5">
              <h2 className="text-2xl md:text-3xl font-display font-black text-gray-950 tracking-tight">Cement Production Stock Options</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-xl">Acquire shares in Nigeria's leading building material assets. Get robust daily dividends (up to 26.67% daily) with flexible options on static 30-day corporate schedules.</p>
            </div>

            {/* Product card matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {productsList.map((product) => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  walletBalance={wallet.walletBalance}
                  onInvest={handleDeployCapital}
                  onOpenDeposit={() => handleOpenModal('deposit')}
                  autoInvestDefault={wallet.autoInvest !== false}
                />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'simulator' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="border-b border-green-150 pb-5">
              <h2 className="text-2xl md:text-3xl font-display font-black text-gray-950 tracking-tight">Compound Option Projections</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-xl">Simulate Lafarge corporate options compounding velocity. Drag your capital stake slider below and witness high-volume rollover growth at exactly 10.0% daily dynamically for the total duration of each package.</p>
            </div>

            <Calculator />
          </motion.div>
        )}

        {activeTab === 'faq' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 max-w-3xl mx-auto"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-display font-black text-gray-950 tracking-tight">Help & Secure Disclosures</h2>
              <p className="text-sm text-gray-400">Everything you need to know about Lafarge Africa Plc share allocations and daily payouts.</p>
            </div>

            <div className="bg-white border border-gray-150 rounded-2xl p-6 md:p-8 shadow-sm divide-y divide-gray-150 space-y-6">
              {[
                {
                  q: 'Is this platform backed by Lafarge Africa Plc?',
                  a: 'Yes. This simulated share options portal models equity allocations in dry kilns, eco-binders, and quarry processing lines across Ewekoro, Sagamu, Mfamosing, and Ashaka plants, with security and financial controls supported by the Huaxin Cement Group.'
                },
                {
                  q: 'How does the daily dividend payout work?',
                  a: 'For every day your chosen cement position remains active, you accumulate high-yield daily returns. For instance, a ₦1,500 Lagoon Starter allocation yields up to ₦12,000 total returned upon maturity, and a ₦30,000 Calabar Port allocation yields ₦234,000 total returned. These yields accumulate in real-time, allowing you to withdraw them or roll them forward compounding up!'
                },
                {
                  q: 'What is the lock-in period for cement shares?',
                  a: 'All positions are held in a fixed 30-day term cycle. Once the term elapses, the position matures, releasing 100% of your initial capital and accrued yields back into your liquid wallet for manual withdrawal or compounding.'
                },
                {
                  q: 'What is the Multi-Level Daily Referral Commission system?',
                  a: 'We offer a highly rewarding 5-tier network structure. Beyond the setup onboarding bonus of ₦500.00, we reward our most active members with daily passive commissions proportional to their team\'s options yield: Level 1 (0.1% unlocked at 5 refs), Level 2 (0.2% unlocked at 10 refs), Level 3 (0.3% unlocked at 15 refs), Level 4 (0.4% unlocked at 20 refs), and Level 5 (0.5% unlocked at 25 refs).'
                },
                {
                  q: 'What are the channels for depositing and withdrawing funds?',
                  a: 'Deposits and payouts are handled via secure instant bank wire networks in Nigeria (using Access Bank escrow, GTBank, Zenith, etc.) and card gateways. USDT TRC20 stablecoin settlement is also fully integrated at real-time currency conversion rates.'
                }
              ].map((faq, idx) => (
                <div key={idx} className="pt-6 first:pt-0 space-y-2.5">
                  <h4 className="text-base font-bold text-gray-950 flex items-start gap-2.5 font-sans">
                    <span className="w-5 h-5 rounded-lg bg-green-50 text-[#028A34] text-[11px] font-black shrink-0 flex items-center justify-center mt-0.5">Q</span>
                    {faq.q}
                  </h4>
                  <p className="text-xs text-gray-455 font-semibold leading-relaxed pl-7">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'cs' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            {/* CS Banner Header */}
            <div className="border-b border-green-150 pb-5 space-y-2">
              <span className="text-[10px] font-bold text-[#028A34] bg-green-50 border border-green-100 px-3 py-1 rounded-full uppercase tracking-widest inline-block">
                🤝 24/7 Client Relations Desk
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-black text-gray-950 tracking-tight">Customer Service Portal</h2>
              <p className="text-sm text-gray-500 max-w-xl">
                Get real-time support from our priority desk agents. Resolve account inquiries, check withdrawal windows, or open ticket logs instantly.
              </p>
            </div>

            {/* Interactive CS Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Live Automated & Smart Assistant Chat (7 Cols) */}
              <div className="lg:col-span-7 bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                
                {/* Agent Header bar */}
                <div className="px-5 py-4 bg-slate-50 border-b border-gray-150 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-[#028A34] text-white font-bold flex items-center justify-center">
                        BA
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#028A34] border-2 border-white rounded-full animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs">Blessing Adebayo</h4>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Strategic Desk Advisor</p>
                    </div>
                  </div>
                  
                  <span className="text-[10px] text-[#028A34] bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider">
                    ● Active Now
                  </span>
                </div>

                {/* Chat window body */}
                <div className="p-4 h-[350px] overflow-y-auto space-y-4 bg-slate-50/50 flex flex-col">
                  {csChatMessages.map((msg, idx) => (
                    <div 
                      key={idx}
                      className={`flex flex-col max-w-[85%] ${
                        msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                      }`}
                    >
                      <div className={`px-4 py-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-[#028A34] text-white rounded-tr-none'
                          : 'bg-white text-gray-800 border border-gray-150 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1 px-1 font-mono">{msg.time}</span>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isAgentTyping && (
                    <div className="flex items-center gap-2 self-start bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-xs">
                      <span className="text-[10px] text-gray-450 font-bold italic">Blessing is typing</span>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-[#028A34] rounded-full animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 bg-[#028A34] rounded-full animate-bounce delay-200" />
                        <span className="w-1.5 h-1.5 bg-[#028A34] rounded-full animate-bounce delay-300" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Suggestion Chips */}
                <div className="p-4 border-t border-gray-105 bg-white space-y-2">
                  <span className="block text-[9px] uppercase tracking-wider font-bold text-gray-400">Popular support queries (tap to ask)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { text: 'Why is withdrawal closed?', search: 'When is withdrawal open?' },
                      { text: 'Explain dynamic returns', search: 'How do daily returns work?' },
                      { text: 'Where is my referral link?', search: 'How do I refer friends to get N500?' },
                      { text: 'How to roll over packages?', search: 'How do I compound?' }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessageToAgent(item.search)}
                        disabled={isAgentTyping}
                        className="text-[10px] px-3 py-1.5 bg-gray-50 hover:bg-green-50 hover:text-green-800 border border-gray-150 rounded-lg text-gray-600 font-bold cursor-pointer transition-colors"
                      >
                        {item.text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessageToAgent(currentCsInput);
                  }}
                  className="p-4 bg-white border-t border-gray-150 flex gap-2"
                >
                  <input
                    type="text"
                    value={currentCsInput}
                    onChange={(e) => setCurrentCsInput(e.target.value)}
                    placeholder="Type your message to Blessing..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#028A34]"
                  />
                  <button
                    type="submit"
                    disabled={!currentCsInput.trim() || isAgentTyping}
                    className="px-4 py-2.5 bg-[#028A34] hover:bg-green-800 text-white rounded-xl text-xs font-bold font-sans transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Send <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Right Column: Support Tickets & Physical Desk details (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Official Channels Link Cards */}
                <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Fast Support Hotline channels</h4>
                  
                  <div className="space-y-2.5">
                    <a 
                      href="https://t.me/DEVVERTEX" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border border-sky-100 bg-sky-50/10 hover:bg-sky-50/30 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-sky-55 text-sky-600 rounded-lg flex items-center justify-center font-bold">
                          <Send className="w-4 h-4 text-sky-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Direct CS Telegram Desk</p>
                          <p className="text-[10px] text-gray-400 font-semibold">Immediate 1-on-1 chatting support (@DEVVERTEX)</p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-sky-600 transition-colors" />
                    </a>

                    {adminApprovalSettings.officialWhatsAppGroup && (
                      <a 
                        href={adminApprovalSettings.officialWhatsAppGroup} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 border border-green-105 bg-green-55/5 hover:bg-green-55/15 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-emerald-600 rounded-lg text-white flex items-center justify-center font-bold">
                            <Share2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">Official WhatsApp Group</p>
                            <p className="text-[10px] text-gray-400 font-semibold">Join thousands of active shareholders live</p>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                      </a>
                    )}

                    <a 
                      href="https://t.me/+lXKtQC1GNbsxMzY0" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border border-sky-100 bg-sky-50/10 hover:bg-sky-50/30 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-sky-500 rounded-lg text-white flex items-center justify-center">
                          <Send className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Official Telegram Group</p>
                          <p className="text-[10px] text-gray-400 font-semibold">Join thousands of active shareholders</p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-sky-600 transition-colors" />
                    </a>

                    <a 
                      href="https://t.me/+kXjTOqAGZK1kYWJk" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border border-sky-100 bg-sky-50/10 hover:bg-sky-50/30 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-sky-600 rounded-lg text-white flex items-center justify-center">
                          <Send className="w-4 h-4 text-sky-100" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Official Telegram Channel</p>
                          <p className="text-[10px] text-gray-400 font-semibold">Get latest announcements & updates live</p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-sky-600 transition-colors" />
                    </a>
                  </div>
                </div>

                {/* Submit Support Ticket Card */}
                <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4.5 h-4.5 text-[#028A34]" />
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">File a Support Ticket</h4>
                  </div>

                  {ticketSuccessInfo ? (
                    <div className="p-3 bg-green-55/25 border border-green-200 text-green-805 text-xs rounded-xl font-bold space-y-2">
                      <p>{ticketSuccessInfo}</p>
                      <button 
                        onClick={() => setTicketSuccessInfo('')}
                        className="text-[10px] underline hover:text-green-950 font-black tracking-widest uppercase block cursor-pointer"
                      >
                        Dismiss & Create new
                      </button>
                    </div>
                  ) : (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleCreateSupportTicket(ticketCategory, ticketSubject);
                        setTicketSuccessInfo(`Ticket successfully generated! Lafarge financial agents will inspect Subject: "${ticketSubject}" shortly.`);
                        setTicketSubject('');
                      }}
                      className="space-y-3.5"
                    >
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Inquiry Department</label>
                        <select
                          value={ticketCategory}
                          onChange={(e) => setTicketCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
                        >
                          <option value="Deposit Issue">Deposit Channel Delayed (Paystack/Card/Wire)</option>
                          <option value="Withdrawal Window">Withdrawal Window Exception (10AM - 12PM)</option>
                          <option value="Referral System">Referral Earnings Error (₦500 Credit)</option>
                          <option value="Investment Deployment">Corporate share allocation issues</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Detailed Subject</label>
                        <textarea
                          rows={2}
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          placeholder="Explain what happened with transaction or account..."
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-green-50 hover:bg-green-100 text-[#028A34] hover:text-green-900 border border-green-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Submit priority ticket request
                      </button>
                    </form>
                  )}
                </div>

                {/* Tickets History Lists */}
                <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Your Ticket History</h4>
                  
                  <div className="space-y-3 divide-y divide-gray-100">
                    {csTickets.map((t, index) => (
                      <div key={t.id} className={`pt-3 first:pt-0 space-y-1.5`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-black text-gray-500">{t.id}</span>
                          <span className={`text-[9px] uppercase px-2 py-0.5 rounded-md font-bold tracking-wider ${
                            t.status === 'resolved'
                              ? 'bg-green-50 text-green-700 border border-green-150'
                              : 'bg-amber-50 text-amber-700 border border-amber-150 animate-pulse'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <h5 className="text-xs font-extrabold text-gray-950 leading-tight">{t.subject}</h5>
                        <div className="flex items-center gap-2 text-[9px] text-gray-450 font-bold uppercase tracking-wider">
                          <span>{t.category}</span>
                          <span>•</span>
                          <span>{new Date(t.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProfileView
              wallet={wallet}
              onUpdateProfile={handleUpdateUserWalletByAdmin}
              simulatedTime={simulatedTime}
              adminApprovalSettings={adminApprovalSettings}
              registeredUsers={registeredUsers}
              referralsList={referrals}
            />
          </motion.div>
        )}

         {activeTab === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <AdminPortal
              transactions={transactions}
              activeInvestments={activeInvestments}
              wallet={wallet}
              simulatedTime={simulatedTime}
              adminApprovalSettings={adminApprovalSettings}
              onSaveSettings={(settings) => setAdminApprovalSettings({
                requireDepositApproval: settings.requireDepositApproval,
                requireInvestmentApproval: settings.requireInvestmentApproval,
                requireWithdrawalApproval: settings.requireWithdrawalApproval,
                customReferralLink: settings.customReferralLink || '',
                isReferralLinkStatic: !!settings.isReferralLinkStatic,
                csNumber: settings.csNumber || '08158432605',
                officialWhatsAppGroup: settings.officialWhatsAppGroup || 'https://chat.whatsapp.com/KHZgCi1h24154DqIIHz3VE',
                minReferralWithdrawal: Number(settings.minReferralWithdrawal) || 5000
              })}
              onApproveDeposit={handleApproveDeposit}
              onDeclineDeposit={handleDeclineDeposit}
              onApproveWithdrawal={handleApproveWithdrawal}
              onDeclineWithdrawal={handleDeclineWithdrawal}
              onApproveInvestment={handleApproveInvestment}
              onDeclineInvestment={handleDeclineInvestment}
              onUpdateUserWallet={handleUpdateUserWalletByAdmin}
              onAdminUpdateSpecificUser={handleUpdateSpecificUser}
              registeredUsers={registeredUsers}
              onSelectUser={handleSelectUser}
              onDeleteUser={handleDeleteUser}
              depositAccounts={depositAccounts}
              onAddDepositAccount={handleAddDepositAccount}
              onRemoveDepositAccount={handleRemoveDepositAccount}
              onToggleDepositAccount={handleToggleDepositAccount}
              csTickets={csTickets}
              onReplyToTicket={handleReplyToTicket}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              userChatThreads={userChatThreads}
              onSendAdminChat={handleSendAdminChatBySupervisor}
              referralsList={referrals}
              onApproveReferral={handleApproveReferral}
              onDeclineReferral={handleDeclineReferral}
            />
          </motion.div>
        )}

      </main>

      {/* Global banking/deposit drawer */}
      <DepositWithdrawModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        walletBalance={wallet.walletBalance}
        onConfirm={handleConfirmDepositWithdraw}
        simulatedTime={simulatedTime}
        wallet={wallet}
        depositAccounts={depositAccounts}
        registeredUsers={registeredUsers}
        transactions={transactions}
        adminApprovalSettings={adminApprovalSettings}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        simulatedTime={simulatedTime}
        onRegisterSuccess={handleRegisterSuccess}
      />

      <PromoReferralModal
        isOpen={showPromoModal}
        onClose={() => setShowPromoModal(false)}
        wallet={wallet}
        adminApprovalSettings={adminApprovalSettings}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-green-105 py-6 text-center text-xs text-gray-400 font-bold mt-auto pb-24 md:pb-6 shrink-0 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} Lafarge Africa Plc. Controlled by Huaxin Cement Group. All options are fully collateralized.
      </footer>

      {/* Dynamic Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-green-105 z-50 px-2 py-3 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] flex justify-around items-center">
        {[
          { name: 'Portfolio', id: 'dashboard', icon: Landmark },
          { name: 'Shares', id: 'invest', icon: Compass },
          { name: 'Simulator', id: 'simulator', icon: TrendingUp },
          { name: 'Profile', id: 'profile', icon: User },
          { name: 'Support', id: 'cs', icon: Headphones },
          ...(isAdmin ? [{ name: 'Admin', id: 'admin', icon: ShieldCheck }] : [])
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`mobile-tab-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id as any);
                setIsMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center gap-1 py-0.5 px-3 rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'text-[#028A34]' 
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'text-[#028A34] scale-110' : 'text-gray-450'}`} />
              <span className={`text-[9px] uppercase tracking-wider font-extrabold whitespace-nowrap ${isActive ? 'text-[#028A34]' : 'text-gray-400'}`}>
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
