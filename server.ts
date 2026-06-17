import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  const DB_FILE = path.join(process.cwd(), 'server-db.json');

  // Hardcoded initial defaults to preserve full demonstration state
  const initialRegisteredUsers = [
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
      requireReferralDepositToWithdraw: false
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
      requireReferralDepositToWithdraw: false
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
      requireReferralDepositToWithdraw: false
    }
  ];

  const initialTransactions = [
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

  const initialActiveInvestments = [
    {
      id: 'inv-initial-share-pack',
      title: 'Ewekoro Dry Kiln Option',
      rate: '2.5%',
      type: 'daily' as const,
      cycle: '11 Days',
      amountInvested: 30000,
      startDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
      endDate: Date.now() + 10 * 24 * 60 * 60 * 1000,
      lastAccrualTime: Date.now() - 1 * 24 * 60 * 60 * 1000,
      status: 'active' as const,
      totalAccrued: 750,
      expectedReturn: 8250,
      isCompounding: true,
      termDays: 11,
      userEmail: 'jeremiahobazee11@gmail.com'
    }
  ];

  const initialDepositAccounts = [
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

  const initialCsTickets = [
    {
      id: 'TCK-924401',
      userEmail: 'jeremiahobazee11@gmail.com',
      userFullName: 'Obazee Jeremiah',
      category: 'Deposit Upgrade',
      subject: 'Paystack transfer delay verification',
      status: 'resolved' as const,
      date: Date.now() - 2 * 24 * 60 * 60 * 1000,
      messages: [
        {
          id: 'msg_1',
          sender: 'user' as const,
          text: 'Hello admin, I updated my deposit package via direct bank ledger option but wait time exceeds 30 minutes, kindly check status.',
          time: '2 days ago'
        },
        {
          id: 'msg_2',
          sender: 'agent' as const,
          text: 'Hello Mr. Jeremiah, we appreciate your patience. The transaction reference check indicates a bank gateway settlement delay. We managed to bypass this and immediately credited your wallet capital with ₦154,500.00.',
          time: '1 day ago'
        }
      ]
    }
  ];

  const initialUserChatThreads = {
    'jeremiahobazee11@gmail.com': [
      {
        sender: 'user' as const,
        text: 'Hello support, looking to find active details on high leverage option contracts.',
        time: 'Just now'
      }
    ]
  };

  // Initial State Database Struct
  let dbState = {
    version: 1,
    registeredUsers: initialRegisteredUsers,
    transactions: initialTransactions,
    activeInvestments: initialActiveInvestments,
    depositAccounts: initialDepositAccounts,
    csTickets: initialCsTickets,
    userChatThreads: initialUserChatThreads,
    referrals: [] as any[],
    adminApprovalSettings: {
      requireDepositApproval: true,
      requireInvestmentApproval: true,
      requireWithdrawalApproval: true,
      customReferralLink: '',
      isReferralLinkStatic: false,
      csNumber: '08158432605',
      officialWhatsAppGroup: 'https://chat.whatsapp.com/KHZgCi1h24154DqIIHz3VE',
      minReferralWithdrawal: 5000,
      allowAnytimeWithdrawal: false
    }
  };

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      // Merge with default values in case of schema expansions or empty fields
      dbState = {
        version: data.version || 1,
        registeredUsers: data.registeredUsers || initialRegisteredUsers,
        transactions: data.transactions || initialTransactions,
        activeInvestments: data.activeInvestments || initialActiveInvestments,
        depositAccounts: data.depositAccounts || initialDepositAccounts,
        csTickets: data.csTickets || initialCsTickets,
        userChatThreads: data.userChatThreads || initialUserChatThreads,
        referrals: data.referrals || [],
        adminApprovalSettings: {
          requireDepositApproval: data.adminApprovalSettings?.requireDepositApproval ?? true,
          requireInvestmentApproval: data.adminApprovalSettings?.requireInvestmentApproval ?? true,
          requireWithdrawalApproval: data.adminApprovalSettings?.requireWithdrawalApproval ?? true,
          customReferralLink: data.adminApprovalSettings?.customReferralLink ?? '',
          isReferralLinkStatic: data.adminApprovalSettings?.isReferralLinkStatic ?? false,
          csNumber: data.adminApprovalSettings?.csNumber ?? '08158432605',
          officialWhatsAppGroup: data.adminApprovalSettings?.officialWhatsAppGroup ?? 'https://chat.whatsapp.com/KHZgCi1h24154DqIIHz3VE',
          minReferralWithdrawal: data.adminApprovalSettings?.minReferralWithdrawal ?? 5000,
          allowAnytimeWithdrawal: data.adminApprovalSettings?.allowAnytimeWithdrawal ?? false
        }
      };

      // Self-healing migration to inject new OPay default account if it's not present
      const opayExists = dbState.depositAccounts.some((acc: any) => acc.accountNumber === '8158432605');
      if (!opayExists) {
        dbState.depositAccounts.unshift({
          id: 'da-opay-default',
          bankName: 'OPay',
          accountName: 'Lafarge Africa Option Escrow Ledger',
          accountNumber: '8158432605',
          isActive: true
        });
        fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2));
      }
    } catch (e) {
      console.error("Error reading database, using defaults", e);
    }
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2));
  }

  // GET and POST endpoint for synced full stack live operation
  app.get("/api/sync", (req, res) => {
    res.json(dbState);
  });

  app.post("/api/sync", (req, res) => {
    try {
      const updates = req.body;
      const clientVersion = Number(updates.clientVersion || 0);

      // Optimistic concurrency safety check to prevent overwriting server database with stale user states
      if (clientVersion < dbState.version) {
        console.log(`Rejecting stale sync push: clientVersion ${clientVersion} is less than serverVersion ${dbState.version}`);
        return res.json(dbState);
      }

      dbState.version += 1;

      if (updates.registeredUsers !== undefined) dbState.registeredUsers = updates.registeredUsers;
      if (updates.transactions !== undefined) dbState.transactions = updates.transactions;
      if (updates.activeInvestments !== undefined) dbState.activeInvestments = updates.activeInvestments;
      if (updates.depositAccounts !== undefined) dbState.depositAccounts = updates.depositAccounts;
      if (updates.csTickets !== undefined) dbState.csTickets = updates.csTickets;
      if (updates.userChatThreads !== undefined) dbState.userChatThreads = updates.userChatThreads;
      if (updates.referrals !== undefined) dbState.referrals = updates.referrals;
      if (updates.adminApprovalSettings !== undefined) dbState.adminApprovalSettings = updates.adminApprovalSettings;

      fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2));
      res.json(dbState);
    } catch (error) {
      console.error("Full stack Sync API encountered an error:", error);
      res.status(500).json({ error: "Db Sync Failed" });
    }
  });

  // Serve static assets / Handle SPA routes in production or Vite Dev server in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Live Server running on port ${PORT}`);
  });
}

startServer();
