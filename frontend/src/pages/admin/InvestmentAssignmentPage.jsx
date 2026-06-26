import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

const InvestmentAssignmentPage = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const [newAssignment, setNewAssignment] = useState({
    username: '',
    memberName: '',
    packageName: 'BASIC',
    amount: '',
    duration: 30
  });

  const packages = {
    BASIC: { dailyReturn: '0.5-1%', totalReturn: '15-30%' },
    SILVER: { dailyReturn: '1.5-2%', totalReturn: '45-60%' },
    GOLD: { dailyReturn: '2-3%', totalReturn: '60-90%' },
    VIP: { dailyReturn: '3-5%', totalReturn: '90-150%' }
  };

  const filteredInvestments = investments.filter(inv =>
    filterStatus === 'all' ? true : inv.status === filterStatus
  );

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredInvestments.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedInvestments = filteredInvestments.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const handleAssignInvestment = () => {
    if (!newAssignment.username || !newAssignment.amount) {
      alert('Username dan jumlah harus diisi');
      return;
    }

    const investment = {
      id: investments.length + 1,
      code: `INV${new Date().toISOString().split('T')[0].replace(/-/g, '')}${String(investments.length + 1).padStart(3, '0')}`,
      username: newAssignment.username,
      memberName: newAssignment.memberName,
      packageName: newAssignment.packageName,
      amount: parseInt(newAssignment.amount),
      dailyReturn: Math.floor(parseInt(newAssignment.amount) * 0.02),
      totalReturn: packages[newAssignment.packageName].totalReturn,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + newAssignment.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration: newAssignment.duration,
      status: 'active',
      totalEarned: 0
    };

    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/investments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(investment) })
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => {
        const newInv = Array.isArray(data.data) ? data.data[0] : data.data || investment;
        setInvestments(prev => [newInv, ...prev]);
      })
      .catch(() => {
        setInvestments([investment, ...investments]);
      });
    setShowAssignForm(false);
    setNewAssignment({
      username: '',
      memberName: '',
      packageName: 'BASIC',
      amount: '',
      duration: 30
    });
    alert('✓ Investasi berhasil diberikan!');
  };

  const handleDelete = (id) => {
    if (window.confirm('Hapus investasi ini?')) {
      const base = import.meta.env.VITE_API_URL || '';
      fetch(`${base}/api/admin/investments/${id}`, { method: 'DELETE' })
        .then((r) => { if (!r.ok) throw r; setInvestments(prev => prev.filter(inv => String(inv.id) !== String(id))); })
        .catch(() => setInvestments(prev => prev.filter(inv => String(inv.id) !== String(id))));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const calculateProgress = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const total = end - start;
    const current = now - start;
    return Math.min(100, Math.max(0, Math.round((current / total) * 100)));
  };

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/investments`).then(r => r.ok ? r.json() : Promise.reject(r)).then(data => { if (!mounted) return; setInvestments(Array.isArray(data) ? data : []); }).catch(() => { if (!mounted) return; setInvestments([]); }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 transition-colors duration-500 dark:text-slate-100 sm:px-6 md:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Penugasan Investasi</h1>
          <p className="text-slate-600 dark:text-slate-300">Kelola dan berikan investasi kepada member</p>
        </div>
        <button
          onClick={() => setShowAssignForm(true)}
          className="flex items-center gap-2 rounded-full bg-gradient-success px-6 py-3 font-bold text-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-glow"
        >
          <Plus size={20} /> Beri Investasi
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-cyan-500">Total Investasi</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{investments.length}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-emerald-500">Aktif</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{investments.filter(i => i.status === 'active').length}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-violet-500">Selesai</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{investments.filter(i => i.status === 'completed').length}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-amber-500">Total Dana</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">Rp {(investments.reduce((sum, i) => sum + (Number(i.amount)||0), 0) / 1000000).toFixed(0)}M</p>
        </div>
      </div>

      {/* Assign Form Modal */}
      {showAssignForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="admin-panel max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto p-6 sm:p-8">
            <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Berikan Investasi Baru</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Username Member</label>
                  <input
                    type="text"
                    value={newAssignment.username}
                    onChange={(e) => setNewAssignment({ ...newAssignment, username: e.target.value })}
                    placeholder="budi"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Nama Member</label>
                  <input
                    type="text"
                    value={newAssignment.memberName}
                    onChange={(e) => setNewAssignment({ ...newAssignment, memberName: e.target.value })}
                    placeholder="Budi Santoso"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Paket Investasi</label>
                <select
                  value={newAssignment.packageName}
                  onChange={(e) => setNewAssignment({ ...newAssignment, packageName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
                >
                  <option value="BASIC">BASIC (0.5-1% daily, 15-30% total)</option>
                  <option value="SILVER">SILVER (1.5-2% daily, 45-60% total)</option>
                  <option value="GOLD">GOLD (2-3% daily, 60-90% total)</option>
                  <option value="VIP">VIP (3-5% daily, 90-150% total)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Jumlah (Rp)</label>
                  <input
                    type="number"
                    value={newAssignment.amount}
                    onChange={(e) => setNewAssignment({ ...newAssignment, amount: e.target.value })}
                    placeholder="5000000"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Durasi (Hari)</label>
                  <input
                    type="number"
                    value={newAssignment.duration}
                    onChange={(e) => setNewAssignment({ ...newAssignment, duration: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAssignForm(false)}
                className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Batal
              </button>
              <button
                onClick={handleAssignInvestment}
                className="flex-1 rounded-full bg-gradient-success px-4 py-2.5 font-bold text-white transition duration-300 hover:-translate-y-0.5"
              >
                Berikan Investasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedInvestment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="admin-panel max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto p-6 sm:p-8">
            <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Detail Investasi {selectedInvestment.code}</h2>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Username</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">@{selectedInvestment.username}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Nama Member</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedInvestment.memberName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Paket</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedInvestment.packageName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-1 ${getStatusColor(selectedInvestment.status)}`}>
                    {getStatusLabel(selectedInvestment.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Jumlah</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">Rp {selectedInvestment.amount.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Return Harian</p>
                  <p className="text-lg font-bold text-emerald-500">Rp {selectedInvestment.dailyReturn.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tanggal Mulai</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedInvestment.startDate}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tanggal Berakhir</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedInvestment.endDate}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Progress</p>
                <div className="h-2 w-full rounded-full bg-slate-200/80 dark:bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-success"
                    style={{ width: `${calculateProgress(selectedInvestment.startDate, selectedInvestment.endDate)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{calculateProgress(selectedInvestment.startDate, selectedInvestment.endDate)}% selesai</p>
              </div>

              <div className="admin-card p-3">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total Penghasilan</p>
                <p className="text-lg font-bold text-emerald-500">Rp {selectedInvestment.totalEarned.toLocaleString('id-ID')}</p>
              </div>
            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="completed">Selesai</option>
        </select>
      </div>

      {/* Investments Table */}
      <div className="admin-panel overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-white/10 bg-slate-950/90 text-white dark:bg-white/10">
              <th className="px-6 py-3 text-left text-sm font-bold">Kode</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Member</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Paket</th>
              <th className="px-6 py-3 text-right text-sm font-bold">Jumlah</th>
              <th className="px-6 py-3 text-right text-sm font-bold">Return/Hari</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Tanggal Mulai</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Status</th>
              <th className="px-6 py-3 text-center text-sm font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInvestments.map((inv) => (
              <tr key={inv.id} className="border-b border-white/10 transition duration-300 hover:-translate-y-px hover:bg-slate-50/80 dark:hover:bg-white/5">
                <td className="px-6 py-4 font-semibold text-cyan-500">{inv.code}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">@{inv.username}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{inv.memberName}</p>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{inv.packageName}</td>
                <td className="px-6 py-4 text-right font-bold">Rp {inv.amount.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-right font-bold text-emerald-500">Rp {inv.dailyReturn.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{inv.startDate}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(inv.status)}`}>
                    {getStatusLabel(inv.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setSelectedInvestment(inv);
                        setShowDetailModal(true);
                      }}
                      className="rounded-xl bg-cyan-500/10 p-2 text-cyan-500 transition hover:-translate-y-0.5 hover:bg-cyan-500/20"
                      title="Lihat Detail"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="rounded-xl bg-rose-500/10 p-2 text-rose-500 transition hover:-translate-y-0.5 hover:bg-rose-500/20"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {filteredInvestments.length === 0 && (
        <div className="rounded-3xl border border-white/70 bg-white/75 p-8 text-center text-slate-500 shadow-soft-xl backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/75 dark:text-slate-400">
          <p>Tidak ada investasi</p>
        </div>
      )}

      {filteredInvestments.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Menampilkan {(safeCurrentPage - 1) * itemsPerPage + 1} - {Math.min(safeCurrentPage * itemsPerPage, filteredInvestments.length)} dari {filteredInvestments.length} investasi
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

export default InvestmentAssignmentPage;
