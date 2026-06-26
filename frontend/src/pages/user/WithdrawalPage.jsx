import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, Check, X, RefreshCw } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import api from '../../utils/api';

const WithdrawalPage = () => {
  const { user, wallet, loading: loadingBalance } = useUser();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (user?.id) {
      const fetchWithdrawals = async () => {
        try {
          const response = await api.get(`/api/admin/withdrawals`);
          if (mounted && response.data) {
            // Filter hanya untuk user ini
            const userWithdrawals = response.data.filter(w => w.user_id === user.id);
            setWithdrawals(userWithdrawals);
          }
        } catch (error) {
          console.error('Failed to fetch withdrawals', error);
        } finally {
          if (mounted) setLoading(false);
        }
      };
      fetchWithdrawals();
    } else {
      setLoading(false);
    }
    return () => { mounted = false; };
  }, [user]);

  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const paymentMethods = [
    { code: 'BCA', name: 'BCA (Bank Central Asia)' },
    { code: 'MANDIRI', name: 'Bank Mandiri' },
    { code: 'BNI', name: 'BNI (Bank Negara Indonesia)' },
    { code: 'BRI', name: 'BRI (Bank Rakyat Indonesia)' },
    { code: 'BSI', name: 'Bank Syariah Indonesia' },
    { code: 'CIMB', name: 'CIMB Niaga' },
    { code: 'PERMATA', name: 'Bank Permata' },
    { code: 'DANA', name: 'DANA' },
    { code: 'OVO', name: 'OVO' },
    { code: 'GOPAY', name: 'GoPay' },
    { code: 'LINKAJA', name: 'LinkAja' },
    { code: 'SHOPEEPAY', name: 'ShopeePay' }
  ];

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount.replace(/[^0-9]/g, ''));
    
    if (amount < 100000) {
      alert('Minimal penarikan adalah Rp 100.000');
      return;
    }

    if (amount > wallet.balance) {
      alert('Saldo tidak cukup');
      return;
    }

    try {
      const response = await api.post('/api/withdrawals', {
        user_id: user.id,
        amount: amount,
        wallet_address: accountNumber,
        crypto_type: selectedBank,
        account_name: accountName
      });

      if (response.data) {
        // Refresh withdrawals
        const newResponse = await api.get(`/api/admin/withdrawals`);
        if (newResponse.data) {
          const userWithdrawals = newResponse.data.filter(w => w.user_id === user.id);
          setWithdrawals(userWithdrawals);
        }
      }

      setShowWithdrawForm(false);
      setWithdrawAmount('');
      setAccountNumber('');
      setAccountName('');
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Gagal membuat penarikan');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'approved':
        return <RefreshCw size={16} className="animate-spin" />;
      case 'completed':
      case 'paid':
        return <Check size={16} />;
      case 'rejected':
        return <X size={16} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Verifikasi';
      case 'approved':
        return 'Pending';
      case 'completed':
      case 'paid':
        return 'Selesai';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  const totalPages = Math.max(1, Math.ceil(withdrawals.length / itemsPerPage));
  const paginatedWithdrawals = withdrawals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-dark-950 dark:to-dark-900 px-3 sm:px-6 md:px-8 py-4 sm:py-8 pb-20 sm:pb-24">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Penarikan Dana</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-white/70">Tarik dana dari akun Anda ke rekening bank</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-cyan-500 rounded-lg p-4 sm:p-6 text-white mb-6 sm:mb-8 shadow-lg">
        <p className="text-blue-100 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Saldo Tersedia</p>
        <h2 className="text-3xl sm:text-4xl font-bold">Rp {!loadingBalance ? wallet.balance.toLocaleString('id-ID') : '...'}</h2>
        <p className="text-blue-100 text-[10px] sm:text-xs mt-2 sm:mt-3">Minimum penarikan: Rp 100.000</p>
      </div>

      {loadingBalance && (
        <div className="mb-6 sm:mb-8 rounded-lg border border-gray-200 bg-white p-3 sm:p-4 text-sm text-gray-600 shadow-sm dark:border-white/10 dark:bg-dark-900/70 dark:text-white/70">
          Memuat saldo wallet...
        </div>
      )}

      {/* Warning Box */}
      <div className="bg-blue-50 dark:bg-dark-900/70 border-l-4 border-blue-600 p-3 sm:p-4 rounded-lg mb-6 sm:mb-8 flex gap-3 shadow-sm dark:shadow-black/20">
        <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-white/75 w-full">
          <p className="font-bold mb-2 text-base">📌 Informasi Pencairan Profit</p>
          
          <div className="space-y-2">
            <p>
              Sebelum proses pencairan profit dilakukan, setiap investor diwajibkan terlebih dahulu melakukan pembayaran pembagian profit kepada perusahaan sebesar 30% dari nilai profit yang diperoleh.
            </p>
            
            <div className={!isInfoExpanded ? 'hidden sm:block space-y-2' : 'space-y-2'}>
              <div className="bg-white/50 dark:bg-white/5 p-3 rounded-md border border-blue-100 dark:border-white/10 mt-2">
                <p className="font-semibold mb-1">Contoh Perhitungan:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1">
                  <li>Total profit: Rp15.000.000</li>
                  <li>Pembagian profit kepada perusahaan (30%): Rp4.500.000</li>
                </ul>
              </div>
              <p>
                Silakan menyelesaikan pembayaran pembagian profit terlebih dahulu. Setelah pembayaran berhasil dikonfirmasi, proses pencairan profit akan dilakukan dan Anda akan menerima profit sesuai dengan nominal kemenangan yang menjadi hak Anda.
              </p>
              <div className="mt-3">
                <p className="font-semibold">Perlu diketahui bahwa:</p>
                <ul className="list-disc list-inside space-y-1 ml-1 mt-1">
                  <li>Profit tidak dapat dicairkan sebelum pembayaran pembagian profit diselesaikan.</li>
                  <li>Pembagian profit tidak dapat dipotong langsung dari hasil kemenangan.</li>
                </ul>
              </div>
              <p className="mt-3 italic">
                Ketentuan ini berlaku untuk seluruh member yang bergabung. Terima kasih. 🙏
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsInfoExpanded(!isInfoExpanded)}
            className="text-blue-600 dark:text-blue-400 font-semibold mt-3 text-xs sm:hidden hover:underline w-full text-center py-1.5 border border-blue-200 dark:border-white/10 rounded-md bg-white/40 dark:bg-black/20"
          >
            {isInfoExpanded ? 'Tampilkan Lebih Sedikit' : 'Selengkapnya...'}
          </button>
        </div>
      </div>

      {/* Withdrawal Button */}
      <button
        onClick={() => setShowWithdrawForm(true)}
        className="mb-6 sm:mb-8 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
      >
        + Penarikan Baru
      </button>

      {/* Withdrawal Form Modal */}
      {showWithdrawForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-900 rounded-2xl p-4 sm:p-6 max-w-lg w-full max-h-[calc(100vh-2rem)] overflow-y-auto border border-gray-200 dark:border-white/10 shadow-2xl dark:shadow-black/30 relative">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Form Penarikan Dana</h2>
              <button 
                onClick={() => setShowWithdrawForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white/80 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit}>
              {/* Bank Selection */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">Pilih Bank / E-Wallet Tujuan</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {paymentMethods.map(method => (
                    <option key={method.code} value={method.code}>{method.name}</option>
                  ))}
                </select>
              </div>

              {/* Account Number */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">
                  Nomor Rekening / E-Wallet
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Masukkan nomor tujuan..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Account Name */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">
                  Nama Pemilik Rekening / Akun E-Wallet
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Amount */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">Jumlah Penarikan (Rp)</label>
                <input
                  type="number"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Minimum Rp 100.000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-white/10 text-gray-800 dark:text-white rounded-lg font-bold hover:bg-gray-400 dark:hover:bg-white/15"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                >
                  Ajukan Penarikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 sm:p-8 max-w-[340px] sm:max-w-md w-full border border-gray-200 dark:border-white/10 shadow-2xl dark:shadow-black/50 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Permintaan Berhasil Dibuat</h2>
            <div className="text-sm text-gray-600 dark:text-white/75 space-y-4 mb-6 leading-relaxed">
              <p>
                Permintaan penarikan Anda telah dikirim dan sedang dalam proses peninjauan.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Riwayat Penarikan</h2>

      <div className="md:hidden space-y-4 mb-6">
        {paginatedWithdrawals.map((withdrawal) => (
          <div key={withdrawal.id} className="bg-white dark:bg-dark-900/70 rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-white/50">Kode</p>
                <p className="font-semibold text-blue-600 dark:text-blue-300 break-all">{withdrawal.code || withdrawal.id?.substring(0, 8) || '-'}</p>
              </div>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold ${getStatusColor(withdrawal.status)}`}>
                {getStatusIcon(withdrawal.status)}
                {getStatusLabel(withdrawal.status)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-white/50 text-xs">Bank</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {withdrawal.bank_name || withdrawal.bankName || withdrawal.crypto_type || 'Penarikan'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-white/50 text-xs">Tanggal</p>
                <p className="text-gray-900 dark:text-white">
                  {withdrawal.created_at ? new Date(withdrawal.created_at).toLocaleDateString('id-ID') : (withdrawal.date || '-')}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-white/50 text-xs">Jumlah</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">Rp {withdrawal.amount?.toLocaleString('id-ID') || 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-white dark:bg-dark-900/70 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-white/10">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 dark:text-white/70">Kode</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 dark:text-white/70">Bank Tujuan</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 dark:text-white/70">Nomor Rekening</th>
              <th className="px-6 py-3 text-right text-sm font-bold text-gray-700 dark:text-white/70">Jumlah</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 dark:text-white/70">Tanggal</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 dark:text-white/70">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedWithdrawals.map((withdrawal) => (
              <tr key={withdrawal.id} className="border-b border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-300">
                  {withdrawal.code || withdrawal.id?.substring(0, 8) || '-'}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                  {withdrawal.bank_name || withdrawal.bankName || withdrawal.crypto_type || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-white/60">
                  {withdrawal.account_number || withdrawal.accountNumber || withdrawal.wallet_address || '-'}
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                  Rp {withdrawal.amount?.toLocaleString('id-ID') || 0}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-white/60">
                  {withdrawal.created_at ? new Date(withdrawal.created_at).toLocaleString('id-ID') : (withdrawal.date || '-')}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(withdrawal.status)}`}>
                    {getStatusIcon(withdrawal.status)}
                    {getStatusLabel(withdrawal.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WithdrawalPage;
