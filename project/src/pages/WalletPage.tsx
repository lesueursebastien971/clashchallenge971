import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { supabase } from '../lib/supabase';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Trophy,
  Coins,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import type { Transaction, Wallet } from '../types/database';

interface TransactionWithChallenge extends Transaction {
  challenge?: { game_id: string; games: { name: string } | null };
}

export function WalletPage() {
  const { user } = useAuth();
  const { t, fmt } = useI18n();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<TransactionWithChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses'>('all');

  useEffect(() => {
    loadWalletData();
  }, [user]);

  async function loadWalletData() {
    if (!user) return;
    const { data: walletData } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    setWallet(walletData);

    const { data: transData } = await supabase
      .from('transactions')
      .select('*, challenge:challenges(game_id, games(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setTransactions((transData || []) as TransactionWithChallenge[]);
    setLoading(false);
  }

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'wins') return t.type === 'challenge_win' || t.type === 'bonus';
    if (filter === 'losses') return t.type === 'challenge_loss' || t.type === 'penalty';
    return true;
  });

  const winAmount = transactions
    .filter((tx) => tx.type === 'challenge_win' || tx.type === 'bonus')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const lossAmount = transactions
    .filter((tx) => tx.type === 'challenge_loss' || tx.type === 'penalty')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const transactionLabels: Record<string, string> = {
    challenge_win: t.wallet.typeWin,
    challenge_loss: t.wallet.typeLoss,
    bonus: t.wallet.typeBonus,
    penalty: t.wallet.typePenalty,
    refund: t.wallet.typeRefund,
    purchase: t.wallet.typePurchase,
  };

  const transactionIcons = {
    challenge_win: { icon: Trophy, color: 'text-gaming-neon-green', bg: 'bg-gaming-neon-green/20' },
    challenge_loss: { icon: ArrowDownLeft, color: 'text-gaming-neon-red', bg: 'bg-gaming-neon-red/20' },
    bonus: { icon: Coins, color: 'text-gaming-neon-yellow', bg: 'bg-gaming-neon-yellow/20' },
    penalty: { icon: ArrowDownLeft, color: 'text-gaming-neon-red', bg: 'bg-gaming-neon-red/20' },
    refund: { icon: ArrowUpRight, color: 'text-gaming-neon-blue', bg: 'bg-gaming-neon-blue/20' },
    purchase: { icon: ArrowDownLeft, color: 'text-gray-400', bg: 'bg-gray-500/20' },
  };

  const filterLabels: Record<string, string> = {
    all: t.wallet.filterAll,
    wins: t.wallet.filterWins,
    losses: t.wallet.filterLosses,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <WalletIcon className="w-8 h-8 text-gaming-neon-yellow" />
          {t.wallet.title}
        </h1>
        <p className="text-gray-400">{t.wallet.subtitle}</p>
      </div>

      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gaming-electric-500/20 via-gaming-dark-800 to-gaming-dark-700 p-6 md:p-8 border border-gaming-electric-500/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gaming-neon-yellow/5 rounded-full blur-3xl" />
        <div className="relative">
          <p className="text-gray-400 mb-2">{t.wallet.yourBalance}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl md:text-6xl font-bold text-white font-gaming">
              {wallet?.balance?.toLocaleString() || '0'}
            </span>
            <span className="text-xl text-gray-400">{t.common.credits}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-xl bg-gaming-neon-green/10 border border-gaming-neon-green/30">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-gaming-neon-green" />
                <span className="text-sm text-gray-400">{t.wallet.totalEarned}</span>
              </div>
              <p className="text-2xl font-bold text-gaming-neon-green">{winAmount.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-gaming-neon-red/10 border border-gaming-neon-red/30">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-5 h-5 text-gaming-neon-red" />
                <span className="text-sm text-gray-400">{t.wallet.totalLost}</span>
              </div>
              <p className="text-2xl font-bold text-gaming-neon-red">{lossAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'wins', 'losses'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === f
                ? 'bg-gaming-electric-500 text-white'
                : 'bg-gaming-dark-700 text-gray-400 hover:bg-gaming-dark-600'
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {/* Transactions */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-4">{t.wallet.transactionHistory}</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 rounded-full border-2 border-gaming-electric-500 border-t-transparent" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{t.wallet.noTransactions}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => {
              const config = transactionIcons[transaction.type as keyof typeof transactionIcons] ?? transactionIcons.bonus;
              const Icon = config.icon;
              return (
                <div key={transaction.id} className="flex items-center gap-4 p-4 rounded-xl bg-gaming-dark-700">
                  <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">
                      {transactionLabels[transaction.type] || transaction.type}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                      {new Date(transaction.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${transaction.amount > 0 ? 'text-gaming-neon-green' : 'text-gaming-neon-red'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{fmt(t.wallet.balance, { amount: transaction.balance_after })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
