import React, { useState, useEffect } from 'react';
import { Check, X, Clock, Eye } from 'lucide-react';
import { useNotice } from '../../context/NoticeContext';

const DepositVerificationPage = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotice } = useNotice();

  const normalizeDeposit = (deposit) => ({
    ...deposit,
    code: deposit.code || deposit.kode || String(deposit.id || '-').slice(0, 8),
    username: deposit.username || deposit.user_id || '-',
    memberName: deposit.memberName || deposit.name || '-',
    bankName: deposit.bankName || deposit.bank_name || '-',
    accountNumber: deposit.accountNumber || deposit.account_number || '-',
    accountName: deposit.accountName || deposit.account_name || '-',
    amount: Number(deposit.amount || 0),
    date: deposit.date || deposit.created_at || '-',
    note: deposit.note || deposit.notes || ''
  });

  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [verificationNote, setVerificationNote] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  const filteredDeposits = deposits.filter(d => 
    filterStatus === 'all' ? true : d.status === filterStatus
  );

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredDeposits.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedDeposits = filteredDeposits.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const handleVerify = (id) => {
    const base = import.meta.env.VITE_API_URL || '';
    const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
    
    fetch(`${base}/api/admin/deposits/${id}/verify`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        notes: verificationNote,
        admin_id: adminUser.id 
      }) 
    })
      .then((r) => {
        if (!r.ok) throw r;
        // Gunakan status 'confirmed' agar sesuai dengan database
        setDeposits((prev) => prev.map(d => d.id === id ? { ...d, status: 'confirmed', note: verificationNote || 'Terverifikasi oleh admin' } : d));
        showNotice('Deposit berhasil diverifikasi.', 'success');
      })
      .catch(() => {
        showNotice('Gagal memverifikasi deposit.', 'error');
      })
      .finally(() => {
        setSelectedDeposit(null);
        setVerificationNote('');
        setRejectionNote('');
        setShowDetailModal(false);
      });
  };

  const handleReject = (id) => {
    const reason = (rejectionNote || verificationNote || '').trim();
    if (!reason) {
      showNotice('Masukkan alasan penolakan terlebih dahulu.', 'warning');
      return;
    }
    const base = import.meta.env.VITE_API_URL || '';
    const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');

    fetch(`${base}/api/admin/deposits/${id}/reject`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        notes: reason,
        admin_id: adminUser.id
      }) 
    })
      .then((r) => {
        if (!r.ok) throw r;
        setDeposits((prev) => prev.map(d => d.id === id ? { ...d, status: 'rejected', note: reason } : d));
        showNotice('Deposit berhasil ditolak.', 'success');
      })
      .catch(() => {
        showNotice('Gagal menolak deposit.', 'error');
      })
      .finally(() => {
        setSelectedDeposit(null);
        setVerificationNote('');
        setRejectionNote('');
        setShowDetailModal(false);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Hapus deposit ini?')) return;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/deposits/${id}`, { method: 'DELETE' })
      .then((r) => { if (!r.ok) throw r; setDeposits((prev) => prev.filter(d => d.id !== id)); })
      .catch(() => setDeposits((prev) => prev.filter(d => d.id !== id)));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Verifikasi';
      case 'confirmed':
      case 'verified':
        return 'Terverifikasi';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/deposits`)
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => { if (!mounted) return; setDeposits(Array.isArray(data) ? data.map(normalizeDeposit) : []); })
      .catch(() => { if (!mounted) return; setDeposits([]); })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 transition-colors duration-500 dark:text-slate-100 sm:px-6 md:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Verifikasi Deposit</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">Kelola dan verifikasi deposit member</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-amber-500">Menunggu Verifikasi</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{deposits.filter(d => d.status === 'pending').length}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-emerald-500">Terverifikasi</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{deposits.filter(d => d.status === 'verified').length}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-rose-500">Ditolak</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{deposits.filter(d => d.status === 'rejected').length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Menunggu Verifikasi</option>
          <option value="verified">Terverifikasi</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-8 max-w-2xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Detail Deposit {selectedDeposit.code}</h2>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Kode Deposit</p>
                  <p className="text-lg font-bold">{selectedDeposit.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Tanggal</p>
                  <p className="text-lg font-bold">{selectedDeposit.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Username</p>
                  <p className="text-lg font-bold">@{selectedDeposit.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Nama Member</p>
                  <p className="text-lg font-bold">{selectedDeposit.memberName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Bank Pengirim</p>
                  <p className="text-lg font-bold">{selectedDeposit.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Nomor Rekening</p>
                  <p className="text-lg font-bold">{selectedDeposit.accountNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Atas Nama</p>
                  <p className="text-lg font-bold">{selectedDeposit.accountName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Jumlah</p>
                  <p className="text-lg font-bold text-green-600">Rp {selectedDeposit.amount.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-semibold">Status Saat Ini</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-1 ${getStatusColor(selectedDeposit.status)}`}>
                  {getStatusLabel(selectedDeposit.status)}
                </span>
              </div>

              {selectedDeposit.status === 'pending' && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Catatan Verifikasi (Opsional)</p>
                  <textarea
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    placeholder="Tambahkan catatan tentang verifikasi ini"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    rows="3"
                  />
                </div>
              )}

              {selectedDeposit.status === 'pending' && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Alasan Penolakan (Wajib saat tolak)</p>
                  <textarea
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                    placeholder="Masukkan alasan penolakan"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    rows="3"
                  />
                </div>
              )}

              {selectedDeposit.note && (
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-sm text-gray-600 font-semibold">Catatan Admin</p>
                  <p className="text-gray-700">{selectedDeposit.note}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-bold"
              >
                Tutup
              </button>
              {selectedDeposit.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleReject(selectedDeposit.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <X size={18} /> Tolak
                  </button>
                  <button
                    onClick={() => handleVerify(selectedDeposit.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Verifikasi
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deposits Table */}
      <div className="admin-panel overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-white/10 bg-slate-950/90 text-white dark:bg-white/10">
              <th className="px-6 py-3 text-left text-sm font-bold">Kode</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Username</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Bank</th>
              <th className="px-6 py-3 text-right text-sm font-bold">Jumlah</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Tanggal</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Status</th>
              <th className="px-6 py-3 text-center text-sm font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDeposits.map((deposit) => (
              <tr key={deposit.id} className="border-b border-white/10 transition duration-300 hover:-translate-y-px hover:bg-slate-50/80 dark:hover:bg-white/5">
                <td className="px-6 py-4 font-semibold text-cyan-500">{deposit.code}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-gray-900">@{deposit.username}</p>
                    <p className="text-sm text-gray-600">{deposit.memberName}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-900 dark:text-white">{deposit.bankName}</td>
                <td className="px-6 py-4 text-right font-bold">Rp {deposit.amount.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{deposit.date}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(deposit.status)}`}>
                    {getStatusLabel(deposit.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setSelectedDeposit(deposit);
                        setShowDetailModal(true);
                      }}
                      className="rounded-xl bg-cyan-500/10 p-2 text-cyan-500 transition hover:-translate-y-0.5 hover:bg-cyan-500/20"
                      title="Lihat Detail"
                    >
                      <Eye size={16} />
                    </button>
                    {deposit.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleReject(deposit.id)}
                          className="rounded-xl bg-rose-500/10 p-2 text-rose-500 transition hover:-translate-y-0.5 hover:bg-rose-500/20"
                          title="Tolak"
                        >
                          <X size={16} />
                        </button>
                        <button
                          onClick={() => handleVerify(deposit.id)}
                          className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500 transition hover:-translate-y-0.5 hover:bg-emerald-500/20"
                          title="Verifikasi"
                        >
                          <Check size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {filteredDeposits.length === 0 && (
        <div className="rounded-3xl border border-white/70 bg-white/75 p-8 text-center text-slate-500 shadow-soft-xl backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/75 dark:text-slate-400">
          <p>Tidak ada deposit</p>
        </div>
      )}

      {filteredDeposits.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Menampilkan {(safeCurrentPage - 1) * itemsPerPage + 1} - {Math.min(safeCurrentPage * itemsPerPage, filteredDeposits.length)} dari {filteredDeposits.length} deposit
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

export default DepositVerificationPage;
