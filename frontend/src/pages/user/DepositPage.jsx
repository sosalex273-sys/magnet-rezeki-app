import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import { Copy, Check, Clock, X } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const DepositPage = () => {
  const { user } = useUser();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDepositForm, setShowDepositForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('bank');
  const [depositAmount, setDepositAmount] = useState('');
  const [reference, setReference] = useState('');
  const [selectedBank, setSelectedBank] = useState('BCA');
  const [copiedCode, setCopiedCode] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const banks = [
    { code: 'BCA', name: 'BCA', accountNumber: '1234567890', accountName: 'PT Magnet Rezeki Syariah' },
    { code: 'MANDIRI', name: 'Mandiri', accountNumber: '1111111111', accountName: 'PT Magnet Rezeki Syariah' },
    { code: 'BNI', name: 'BNI', accountNumber: '2222222222', accountName: 'PT Magnet Rezeki Syariah' },
    { code: 'CIMB', name: 'CIMB Niaga', accountNumber: '3333333333', accountName: 'PT Magnet Rezeki Syariah' }
  ];

  const eWallets = [
    { code: 'DANA', name: 'Dana', number: '082123456789' },
    { code: 'OVO', name: 'OVO', number: '082123456789' },
    { code: 'GOPAY', name: 'GoPay', number: '082123456789' }
  ];

  const handleSubmitDeposit = () => {
    if (!(depositAmount && parseInt(depositAmount) >= 500000)) {
      alert('Minimum deposit adalah Rp 500.000');
      return;
    }

    const newDeposit = {
      id: Date.now(),
      amount: parseInt(depositAmount),
      paymentMethod: selectedPayment === 'bank' ? 'Bank Transfer' : 'E-Wallet',
      bankName: selectedPayment === 'bank' ? selectedBank : (eWallets.find(w => w.code === selectedBank)?.name || selectedBank),
      status: 'pending',
      date: new Date().toLocaleString('id-ID'),
      code: `DEP${new Date().toISOString().split('T')[0].replace(/-/g, '')}${String(deposits.length + 1).padStart(3, '0')}`
    };

    if (user?.id) {
      api.post(`/api/deposits`, { 
        user_id: user.id, 
        amount: newDeposit.amount, 
        bankName: newDeposit.bankName,
        reference: reference 
      }).then(() => {
        setDeposits((prev) => [newDeposit, ...prev]);
      }).catch(() => {
        setDeposits((prev) => [newDeposit, ...prev]);
      }).finally(() => {
        setShowDepositForm(false);
        setDepositAmount('');
        setReference('');
      });
    } else {
      setDeposits((prev) => [newDeposit, ...prev]);
      setShowDepositForm(false);
      setDepositAmount('');
      setReference('');
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user?.id) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/api/transactions/${user.id}`);
        const tx = Array.isArray(res.data) ? res.data : [];
        const depositsTx = tx.filter(t => t.type === 'deposit');
        if (mounted) setDeposits(depositsTx);
      } catch (err) {
        if (mounted) setDeposits([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [user]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
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
      case 'confirmed':
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
      case 'confirmed':
        return 'Terkonfirmasi';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  const totalPages = Math.max(1, Math.ceil(deposits.length / itemsPerPage));
  const paginatedDeposits = deposits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-blue px-3 sm:px-6 md:px-8 py-4 sm:py-8 pb-20 sm:pb-24">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-1 sm:mb-2">Deposit</h1>
        <p className="text-sm sm:text-base text-dark-600 dark:text-white/70">Tambahkan saldo ke akun Anda untuk mulai berinvestasi</p>
      </div>

      {/* Deposit Button */}
      <button
        onClick={() => setShowDepositForm(true)}
        className="mb-6 sm:mb-8 btn-primary px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-bold w-full max-w-xs"
      >
        + Deposit Sekarang
      </button>

      {/* Deposit Form Modal */}
      {showDepositForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm" onClick={() => setShowDepositForm(false)} />
          <div className="relative bg-white dark:bg-dark-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-soft-xl dark:shadow-black/30">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-dark-900 dark:text-white">Form Deposit</h2>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-dark-900 dark:text-white mb-3">Metode Pembayaran</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedPayment('bank')}
                  className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
                    selectedPayment === 'bank'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  🏦 Bank Transfer
                </button>
                <button
                  onClick={() => setSelectedPayment('ewallet')}
                  className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
                    selectedPayment === 'ewallet'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  📱 E-Wallet
                </button>
              </div>
            </div>

            {/* Bank/E-Wallet Selection */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">
                {selectedPayment === 'bank' ? 'Pilih Bank' : 'Pilih E-Wallet'}
              </label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {selectedPayment === 'bank' ? (
                  banks.map(bank => (
                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                  ))
                ) : (
                  eWallets.map(wallet => (
                    <option key={wallet.code} value={wallet.code}>{wallet.name}</option>
                  ))
                )}
              </select>
            </div>

            {/* Payment Info */}
            <div className="mb-6 rounded-xl bg-blue-50 dark:bg-dark-800 p-4 border border-blue-100 dark:border-white/10">
              <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-2 uppercase">Rekening Tujuan</p>
              <div className="text-sm text-dark-900 dark:text-white">
                <p className="font-bold">{banks.find(b => b.code === selectedBank)?.name || eWallets.find(w => w.code === selectedBank)?.name}</p>
                <p className="font-mono text-lg">{banks.find(b => b.code === selectedBank)?.accountNumber || eWallets.find(w => w.code === selectedBank)?.number}</p>
                <p>a.n. {banks.find(b => b.code === selectedBank)?.accountName || 'Magnet Rezeki'}</p>
              </div>
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">Jumlah Deposit (Rp)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Minimum Rp 500.000"
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <p className="text-xs text-gray-600 dark:text-white/55 mt-1">Minimum: Rp 500.000 | Tanpa maksimal</p>
            </div>

            {/* Reference */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">Bukti Transfer / Referensi</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Contoh: No. Referensi atau Link Bukti Transfer"
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDepositForm(false)}
                className="flex-1 btn-secondary"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitDeposit}
                className="flex-1 btn-primary"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Deposits List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-dark-600 dark:text-white/60">Memuat riwayat deposit...</p>
        ) : paginatedDeposits.length > 0 ? (
          paginatedDeposits.map(deposit => (
            <div key={deposit.id} className="bg-white dark:bg-dark-900/70 border border-gray-200 dark:border-white/10 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-dark-900 dark:text-white">Rp {deposit.amount.toLocaleString('id-ID')}</p>
                <p className="text-xs text-dark-600 dark:text-white/50">{deposit.date} - {deposit.code}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(deposit.status)}`}>
                {getStatusIcon(deposit.status)}
                {getStatusLabel(deposit.status)}
              </div>
            </div>
          ))
        ) : (
          <p className="text-dark-600 dark:text-white/60">Belum ada riwayat deposit.</p>
        )}
      </div>
    </div>
  );
};

export default DepositPage;
