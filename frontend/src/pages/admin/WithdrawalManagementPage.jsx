import React, { useState, useEffect } from 'react';
import { Check, X, Clock, Eye, Edit2 } from 'lucide-react';
import { useNotice } from '../../context/NoticeContext';

const WithdrawalManagementPage = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotice } = useNotice();

  const normalizeWithdrawal = (w) => ({
    ...w,
    code: w.code || w.kode || String(w.id || '-').slice(0, 8),
    username: w.users?.username || w.username || '-',
    memberName: w.users?.name || w.memberName || w.name || '-',
    bankName: w.bank_name || w.bankName || '-',
    accountNumber: w.account_number || w.accountNumber || '-',
    accountName: w.account_name || w.accountName || '-',
    amount: Number(w.amount || 0),
    date: w.created_at || w.date || '-',
    status: w.status || 'pending',
    crypto_type: w.crypto_type,
    wallet_address: w.wallet_address
  });

  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  const [filterStatus, setFilterStatus] = useState('pending');

  const filteredWithdrawals = withdrawals.filter(w => 
    filterStatus === 'all' ? true : w.status === filterStatus
  );

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredWithdrawals.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const handleUpdateStatus = () => {
    if (!newStatus) return;
    
    const base = import.meta.env.VITE_API_URL || '';
    const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');

    fetch(`${base}/api/admin/withdrawals/${selectedWithdrawal.id}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        status: newStatus,
        admin_id: adminUser.id 
      }) 
    })
      .then((r) => {
        if (!r.ok) throw r;
        setWithdrawals((prev) => prev.map(w => w.id === selectedWithdrawal.id ? { ...w, status: newStatus } : w));
        showNotice('Status penarikan berhasil diubah.', 'success');
      })
      .catch(() => {
        showNotice('Gagal mengubah status penarikan.', 'error');
      })
      .finally(() => {
        setSelectedWithdrawal(null);
        setNewStatus('');
        setShowEditModal(false);
      });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Verifikasi';
      case 'approved':
        return 'Pending (Proses)';
      case 'paid':
        return 'Selesai';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/withdrawals`)
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => { if (!mounted) return; setWithdrawals(Array.isArray(data) ? data.map(normalizeWithdrawal) : []); })
      .catch(() => { if (!mounted) return; setWithdrawals([]); })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 transition-colors duration-500 dark:text-slate-100 sm:px-6 md:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Manajemen Penarikan Dana</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">Kelola dan perbarui status penarikan (withdrawal) member</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-amber-500">Menunggu Verifikasi</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{withdrawals.filter(w => w.status === 'pending').length}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-blue-500">Pending (Proses)</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{withdrawals.filter(w => w.status === 'approved').length}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-emerald-500">Selesai</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{withdrawals.filter(w => w.status === 'paid').length}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-rose-500">Ditolak</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{withdrawals.filter(w => w.status === 'rejected').length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Menunggu Verifikasi</option>
          <option value="approved">Pending (Proses)</option>
          <option value="paid">Selesai</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 sm:p-8 max-w-2xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto border border-gray-200 dark:border-white/10 shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">Detail Penarikan {selectedWithdrawal.code}</h2>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Kode Penarikan</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedWithdrawal.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Tanggal</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{new Date(selectedWithdrawal.date).toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Username</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">@{selectedWithdrawal.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Nama Member</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedWithdrawal.memberName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Bank / E-Wallet</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedWithdrawal.bankName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Nomor Rekening</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedWithdrawal.accountNumber || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Atas Nama</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedWithdrawal.accountName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Jumlah</p>
                  <p className="text-lg font-bold text-green-600">Rp {selectedWithdrawal.amount.toLocaleString('id-ID')}</p>
                </div>
              </div>
              
              {selectedWithdrawal.crypto_type && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">Kripto</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedWithdrawal.crypto_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">Alamat Dompet</p>
                    <p className="text-sm font-mono break-all text-gray-900 dark:text-white">{selectedWithdrawal.wallet_address}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 font-semibold">Status Saat Ini</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-1 ${getStatusColor(selectedWithdrawal.status)}`}>
                  {getStatusLabel(selectedWithdrawal.status)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-white/20"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {showEditModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 sm:p-8 max-w-sm w-full border border-gray-200 dark:border-white/10 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Ubah Status</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">Pilih Status Baru</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="" disabled>Pilih Status</option>
                <option value="pending">Menunggu Verifikasi</option>
                <option value="approved">Pending (Proses)</option>
                <option value="paid">Selesai / Sukses</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setNewStatus('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-white/20"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!newStatus || newStatus === selectedWithdrawal.status}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawals Table */}
      <div className="admin-panel overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-white/10 bg-slate-950/90 text-white dark:bg-white/10">
              <th className="px-6 py-3 text-left text-sm font-bold">Kode</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Username</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Tujuan</th>
              <th className="px-6 py-3 text-right text-sm font-bold">Jumlah</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Tanggal</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Status</th>
              <th className="px-6 py-3 text-center text-sm font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedWithdrawals.map((withdrawal) => (
              <tr key={withdrawal.id} className="border-b border-white/10 transition duration-300 hover:-translate-y-px hover:bg-slate-50/80 dark:hover:bg-white/5">
                <td className="px-6 py-4 font-semibold text-cyan-600 dark:text-cyan-400">{withdrawal.code}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">@{withdrawal.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{withdrawal.memberName}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-900 dark:text-white text-sm">
                  {withdrawal.crypto_type ? (
                    <div>
                      <p className="font-bold">{withdrawal.crypto_type}</p>
                      <p className="text-gray-500 truncate max-w-[120px]">{withdrawal.wallet_address}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold">{withdrawal.bankName}</p>
                      <p className="text-gray-500">{withdrawal.accountNumber}</p>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                  Rp {withdrawal.amount.toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {new Date(withdrawal.date).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(withdrawal.status)}`}>
                    {getStatusLabel(withdrawal.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setSelectedWithdrawal(withdrawal);
                        setShowDetailModal(true);
                      }}
                      className="rounded-xl bg-cyan-500/10 p-2 text-cyan-600 dark:text-cyan-400 transition hover:-translate-y-0.5 hover:bg-cyan-500/20"
                      title="Lihat Detail"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedWithdrawal(withdrawal);
                        setNewStatus(withdrawal.status);
                        setShowEditModal(true);
                      }}
                      className="rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400 transition hover:-translate-y-0.5 hover:bg-blue-500/20"
                      title="Ubah Status"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {filteredWithdrawals.length === 0 && (
        <div className="rounded-3xl border border-white/70 bg-white/75 p-8 text-center text-slate-500 shadow-soft-xl backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/75 dark:text-slate-400 mt-6">
          <p>Tidak ada data penarikan</p>
        </div>
      )}

      {filteredWithdrawals.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Menampilkan {(safeCurrentPage - 1) * itemsPerPage + 1} - {Math.min(safeCurrentPage * itemsPerPage, filteredWithdrawals.length)} dari {filteredWithdrawals.length} data
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-200"
            >
              Sebelumnya
            </button>
            <span className="text-sm text-slate-700 dark:text-slate-300">Halaman {safeCurrentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-200"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalManagementPage;
