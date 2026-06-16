import { InvestmentProduct } from './types';

export const productsList: InvestmentProduct[] = [
  {
    id: 'prod-lagoon-1500',
    name: 'Lafarge Lagoon Starter Shares',
    description: 'Sustained micro-allocation entry options. Spend ₦1,500 to yield ₦400 daily (₦12,000 total return in 30 days).',
    minAmount: 1500,
    maxAmount: 1500,
    rate: 0.26666666666666666, // 400 daily -> 400 / 1500 = 26.67% daily
    termDays: 30,
    riskLevel: 'Low',
    category: 'Industrial Share'
  },
  {
    id: 'prod-ewekoro-3k',
    name: 'Ewekoro Plant Standard Shares',
    description: 'Direct exposure to Ogun State clinker wet/dry kiln supply lines in Ewekoro cement plant. Spend ₦3,000 to yield ₦800 daily (₦24,000 total return in 30 days).',
    minAmount: 3000,
    maxAmount: 3000,
    rate: 0.26666666666666666, // 800 daily -> 800 / 3000 = 26.67% daily
    termDays: 30,
    riskLevel: 'Low',
    category: 'Industrial Share'
  },
  {
    id: 'prod-sagamu-5k',
    name: 'Sagamu Eco-Concrete Units',
    description: 'Underpinned by high-performance low-carbon masonry and alternative builders. Spend ₦5,000 to yield ₦1,300 daily (₦39,000 total return in 30 days).',
    minAmount: 5000,
    maxAmount: 5000,
    rate: 0.26, // 1,300 daily -> 1300 / 5000 = 26.0% daily
    termDays: 30,
    riskLevel: 'Low',
    category: 'Green Tech'
  },
  {
    id: 'prod-ashaka-10k',
    name: 'Ashaka Coal Optimization Shares',
    description: 'Regional Gombe State fuel cost conversion programs delivering boosted operational savings. Spend ₦10,000 to yield ₦2,500 daily (₦75,000 total return in 30 days).',
    minAmount: 10000,
    maxAmount: 10000,
    rate: 0.25, // 2,500 daily -> 2500 / 10000 = 25.0% daily
    termDays: 30,
    riskLevel: 'Low',
    category: 'Energy Option'
  },
  {
    id: 'prod-mfamosing-20k',
    name: 'Mfamosing Quarry Lease Options',
    description: 'Calabar-based high-purity limestone aggregate reserves feeding regional construction centers. Spend ₦20,000 to yield ₦5,000 daily (₦150,000 total return in 30 days).',
    minAmount: 20000,
    maxAmount: 20000,
    rate: 0.25, // 5,000 daily -> 5000 / 20000 = 25.0% daily
    termDays: 30,
    riskLevel: 'Low',
    category: 'Quarry Option'
  },
  {
    id: 'prod-calabar-30k',
    name: 'Calabar Port Bulk Cement Options',
    description: 'Strategic port expansion silos enabling massive bulk clinker marine offloading and dry-bulk shipping. Spend ₦30,000 to yield ₦7,800 daily (₦234,000 total return in 30 days).',
    minAmount: 30000,
    maxAmount: 30000,
    rate: 0.26, // 7,800 daily -> 7800 / 30000 = 26.0% daily
    termDays: 30,
    riskLevel: 'Moderate',
    category: 'Logistics Share'
  }
];

export const faqList = [
  {
    question: 'How do the Lafarge stock investment returns work?',
    answer: 'Once you acquire shares or bonds in any of our production facilities (like Lagoon, Ewekoro, or Sagamu), your funds are deployed. For every day, you receive a guaranteed outstanding daily dividend payout based on your chosen option. Each option plan runs for a fixed 30-day term cycle, bringing exceptional compound yields (e.g., ₦1,500 package yields ₦15,000, and ₦30,000 package yields ₦80,000 gross returned upon maturity).'
  },
  {
    question: 'Is compounding available for these shares?',
    answer: 'Yes! Automated rollover compounding allows you to automatically reinvest your daily returns or the entire mature capital into another term cycle, allowing you to build heavy compound yield on your Lafarge options.'
  },
  {
    question: 'How do I fund my Lafarge wallet?',
    answer: 'Deposits can be made instantly via simulated Nigerian bank transfers (GTBank, Zenith, Access Bank, etc.) or card payments. Your account is credited instantly in Naira (₦) with a minimum deposit of ₦1,000.'
  },
  {
    question: 'Are withdrawals processed smoothly?',
    answer: 'Absolutely. On maturity, cumulative returns are immediately available. You can request a payout directly to any registered bank account in Nigeria with a minimum withdrawal amount of ₦2,000.'
  }
];
