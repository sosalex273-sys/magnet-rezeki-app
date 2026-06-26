import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, TrendingUp, Wallet } from 'lucide-react';
import { useUser } from '../../context/UserContext'; // Pastikan import UserContext
import api from '../../utils/api';

const WalletPage = () => {
  const navigate = useNavigate();
  const { user, wallet } = useUser(); // Ambil user dan wallet dari context
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    let mounted = true;
    const loadTransactions = async () => {
      if (!user?.id) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/api/transactions/${user.id}`);
        if (mounted) setTransactions(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        if (mounted) setTransactions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadTransactions();
    return () => { mounted = false; };
  }, [user]);

  const summary = useMemo(() => {
    const normalizeAmount = (value) => Number(value || 0);

    const deposits = transactions
      .filter((transaction) => transaction.type === 'deposit')
      .reduce((sum, transaction) => sum + Math.max(normalizeAmount(transaction.amount), 0), 0);

    const investments = transactions
      .filter((transaction) => transaction.type === 'investment')
      .reduce((sum, transaction) => sum + Math.abs(normalizeAmount(transaction.amount)), 0);

    const profits = transactions
      .filter((transaction) => transaction.type === 'profit')
      .reduce((sum, transaction) => sum + Math.max(normalizeAmount(transaction.amount), 0), 0);

    const today = new Date().toISOString().split('T')[0];
    const todayProfit = transactions
      .filter((transaction) => transaction.type === 'profit' && transaction.created_at?.startsWith(today))
      .reduce((sum, transaction) => sum + Math.max(normalizeAmount(transaction.amount), 0), 0);

    const bonuses = transactions
      .filter((transaction) => transaction.type === 'bonus')
      .reduce((sum, transaction) => sum + Math.max(normalizeAmount(transaction.amount), 0), 0);

    const withdrawals = transactions
      .filter((transaction) => transaction.type === 'withdrawal')
      .reduce((sum, transaction) => sum + Math.abs(normalizeAmount(transaction.amount)), 0);

    return {
      currentBalance: Number(wallet?.balance || 0),
      investments,
      deposits,
      profits,
      bonuses,
      withdrawals,
      totalProfit: Number(wallet?.total_profit || (profits + bonuses)),
      todayProfit
    };
  }, [transactions, wallet?.balance, wallet?.total_profit]);

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <ArrowDown className="text-green-600" />;
      case 'investment':
        return <ArrowUp className="text-blue-600" />;
      case 'profit':
        return <TrendingUp className="text-green-600" />;
      case 'bonus':
        return <TrendingUp className="text-yellow-600" />;
      case 'withdrawal':
        return <ArrowUp className="text-red-600" />;
      default:
        return <Wallet className="text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'profit':
      case 'bonus':
        return 'text-green-600';
      case 'investment':
      case 'withdrawal':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'investment':
        return 'Investasi';
      case 'profit':
        return 'Profit';
      case 'bonus':
        return 'Bonus';
      case 'withdrawal':
        return 'Penarikan';
      default:
        return type;
    }
  };

  const totalPages = Math.max(1, Math.ceil(transactions.length / itemsPerPage));
  const paginatedTransactions = transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:to-dark-900 px-3 sm:px-6 md:px-8 py-4 sm:py-8 pb-20 sm:pb-24">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-1 sm:mb-2">Dompet (Wallet)</h1>
        <p className="text-sm sm:text-base text-dark-600 dark:text-white/70">Kelola saldo dan lihat riwayat transaksi Anda</p>
      </div>

      {loading && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/70">
          Memuat data wallet...
        </div>
      )}

      {/* Balance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Main Balance Card */}
        <div className="lg:col-span-2 rounded-2xl p-4 sm:p-6 bg-white text-dark-900 shadow-soft-xl border border-gray-200 dark:bg-white/5 dark:text-white dark:border-white/10 backdrop-blur-xl">
          <p className="text-dark-600 dark:text-white/70 text-xs sm:text-sm font-semibold mb-2">Saldo Utama</p>
          <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 text-primary-600 dark:text-primary-400">
            Rp {summary.currentBalance.toLocaleString('id-ID')}
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm text-dark-700 dark:text-white/80">
            <div>
              <p className="text-dark-500 dark:text-white/60">Tersedia</p>
              <p className="font-bold text-dark-900 dark:text-white">Rp {summary.currentBalance.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <p className="text-dark-500 dark:text-white/60">Diinvestasikan</p>
              <p className="font-bold text-dark-900 dark:text-white">Rp {summary.investments.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* Total Profit Card */}
        <div className="rounded-2xl p-4 sm:p-6 bg-white text-dark-900 shadow-soft-xl border border-gray-200 dark:bg-white/5 dark:text-white dark:border-white/10 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 sm:w-24 sm:h-24 bg-[#12b76a]/10 rounded-full blur-2xl group-hover:bg-[#12b76a]/20 transition-all duration-500"></div>
          <p className="text-dark-600 dark:text-white/70 text-xs sm:text-sm font-semibold mb-1 sm:mb-2 relative z-10">Total Profit</p>
          <h3 className="text-xl sm:text-3xl font-bold animate-pulse drop-shadow-[0_2px_8px_rgba(18,183,106,0.3)] relative z-10" style={{ color: '#12b76a' }}>{summary.totalProfit > 0 ? '+' : ''}Rp {summary.totalProfit.toLocaleString('id-ID')}</h3>
          <p className="text-dark-500 dark:text-white/60 text-[10px] sm:text-xs mt-2 sm:mt-4 relative z-10">Dari profit & bonus</p>
        </div>

        {/* Total Deposited Card */}
        <div className="rounded-2xl p-4 sm:p-6 bg-white text-dark-900 shadow-soft-xl border border-gray-200 dark:bg-white/5 dark:text-white dark:border-white/10 backdrop-blur-xl">
          <p className="text-dark-600 dark:text-white/70 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Total Deposit</p>
          <h3 className="text-xl sm:text-3xl font-bold text-dark-900 dark:text-white">Rp {summary.deposits.toLocaleString('id-ID')}</h3>
          <p className="text-dark-500 dark:text-white/60 text-[10px] sm:text-xs mt-2 sm:mt-4">Total uang yang masuk</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-white/5 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-white/10 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-12 h-12 sm:w-16 sm:h-16 bg-[#12b76a]/10 rounded-full blur-xl group-hover:bg-[#12b76a]/20 transition-all duration-500"></div>
          <p className="text-gray-600 dark:text-white/60 text-xs sm:text-sm font-semibold mb-1 sm:mb-2 relative z-10">Profit Hari Ini</p>
          <h3 className="text-lg sm:text-2xl font-bold animate-pulse drop-shadow-[0_2px_8px_rgba(18,183,106,0.3)] relative z-10" style={{ color: '#12b76a' }}>Rp {summary.todayProfit.toLocaleString('id-ID')}</h3>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-white/50 mt-1 sm:mt-2 relative z-10">Profit hari ini</p>
        </div>
        <div className="bg-white dark:bg-white/5 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-white/10 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-12 h-12 sm:w-16 sm:h-16 bg-[#12b76a]/10 rounded-full blur-xl group-hover:bg-[#12b76a]/20 transition-all duration-500"></div>
          <p className="text-gray-600 dark:text-white/60 text-xs sm:text-sm font-semibold mb-1 sm:mb-2 relative z-10">Bonus Terkumpul</p>
          <h3 className="text-lg sm:text-2xl font-bold animate-pulse drop-shadow-[0_2px_8px_rgba(18,183,106,0.3)] relative z-10" style={{ color: '#12b76a' }}>Rp {summary.bonuses.toLocaleString('id-ID')}</h3>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-white/50 mt-1 sm:mt-2 relative z-10">Dari referral komisi</p>
        </div>
        <div className="bg-white dark:bg-white/5 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-white/10">
          <p className="text-gray-600 dark:text-white/60 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Total Tarik</p>
          <h3 className="text-lg sm:text-2xl font-bold text-red-600">Rp {summary.withdrawals.toLocaleString('id-ID')}</h3>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-white/50 mt-1 sm:mt-2">Dana yang sudah dicairkan</p>
        </div>
      </div>

      {/* Transactions Header */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Riwayat Transaksi</h2>

      {/* Transactions List */}
      {paginatedTransactions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
          Belum ada riwayat transaksi. Akun baru dimulai dari saldo 0 sampai admin menambahkannya.
        </div>
      )}
      <div className="md:hidden space-y-4">
        {paginatedTransactions.map((transaction) => (
          <div key={transaction.id} className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-full">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{getTypeLabel(transaction.type)}</p>
                  <p className="text-xs text-gray-600 dark:text-white/60">{transaction.description}</p>
                </div>
              </div>
              <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-200 text-[11px] font-bold rounded-full">
                Selesai
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-white/50 text-xs">Tanggal</p>
                <p className="text-gray-900 dark:text-white">
                  {transaction.created_at ? new Date(transaction.created_at).toLocaleString('id-ID') : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-white/50 text-xs">Jumlah</p>
                <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-white dark:bg-white/5 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 dark:text-white/70">Tipe</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 dark:text-white/70">Deskripsi</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 dark:text-white/70">Tanggal</th>
                <th className="px-6 py-3 text-right text-sm font-bold text-gray-700 dark:text-white/70">Jumlah</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 dark:text-white/70">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-full">
                      {getTransactionIcon(transaction.type)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{getTypeLabel(transaction.type)}</p>
                      <p className="text-xs text-gray-600 dark:text-white/60">{transaction.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-white/60">
                    {transaction.created_at ? new Date(transaction.created_at).toLocaleString('id-ID') : '-'}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${getTransactionColor(transaction.type)}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-200 text-xs font-bold rounded-full">
                      Selesai
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 mt-6 mb-3">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-white/70 disabled:opacity-40"
        >
          Prev
        </button>
        <div className="text-sm text-gray-600 dark:text-white/60">
          Halaman {currentPage} dari {totalPages}
        </div>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-white/70 disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button 
          onClick={() => navigate('/dashboard/deposit')}
          className="flex-1 btn-primary"
        >
          + Deposit Lagi
        </button>
        {/* Tombol Investasi disembunyikan sementara */}
        {/* <button 
          onClick={() => navigate('/dashboard/investments')}
          className="flex-1 btn-primary bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
        >
          💰 Investasi Sekarang
        </button> */}
      </div>
    </div>
  );
};

export default WalletPage;
