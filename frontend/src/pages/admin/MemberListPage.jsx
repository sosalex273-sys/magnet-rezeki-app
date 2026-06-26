import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Lock, Unlock, Search } from 'lucide-react';
import { useNotice } from '../../context/NoticeContext';

const MemberListPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotice } = useNotice();

  const normalizeMember = (member) => {
    const status = member.status || (member.is_active ? 'active' : 'suspended');
    return {
      ...member,
      username: member.username || '-',
      name: member.name || '-',
      email: member.email || '-',
      status,
      totalInvestment: Number(member.totalInvestment ?? member.total_investment ?? 0),
      totalProfit: Number(member.totalProfit ?? member.total_profit ?? 0)
    };
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({});

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedMembers = filteredMembers.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const handleEdit = (member) => {
    setEditingId(member.id);
    setEditData(member);
    setShowEditForm(true);
  };

  const handleSaveEdit = () => {
    const base = import.meta.env.VITE_API_URL || '';
    (async () => {
      try {
        const res = await fetch(`${base}/api/admin/members/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editData) });
        if (!res.ok) throw res;
        setMembers(prev => prev.map(m => m.id === editingId ? editData : m));
        showNotice('Member berhasil diperbarui.', 'success');
      } catch (e) {
        showNotice('Gagal memperbarui member.', 'error');
      } finally {
        setShowEditForm(false);
        setEditingId(null);
      }
    })();
  };

  const handleDelete = (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus member ini?')) return;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/members/${id}`, { method: 'DELETE' })
      .then((r) => {
        if (!r.ok) throw r;
        setMembers(prev => prev.filter(m => m.id !== id));
        showNotice('Member berhasil dihapus.', 'success');
      })
      .catch(() => showNotice('Gagal menghapus member.', 'error'));
  };

  const [showAddBalance, setShowAddBalance] = useState(false);
  const [balanceTarget, setBalanceTarget] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceNote, setBalanceNote] = useState('');

  const handleOpenAddBalance = (member) => {
    setBalanceTarget(member);
    setBalanceAmount('');
    setBalanceNote('');
    setShowAddBalance(true);
  };

  const handleSubmitAddBalance = async () => {
    if (!balanceTarget) return;
    const payload = { amount: Number(balanceAmount), description: balanceNote };
    const base = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${base}/api/admin/wallets/${balanceTarget.id}/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambah saldo');
      showNotice('Saldo berhasil ditambahkan.', 'success');
      setShowAddBalance(false);
    } catch (err) {
      showNotice(`Gagal menambah saldo: ${err.message || err}`, 'error');
    }
  };

  const handleToggleStatus = (id) => {
    const current = members.find(m => m.id === id);
    const nextIsActive = !(current && current.status === 'active');
    const newStatus = nextIsActive ? 'active' : 'suspended';
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/members/${id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: nextIsActive }) })
      .then((r) => {
        if (!r.ok) throw r;
        setMembers(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
        showNotice(`Member berhasil ${nextIsActive ? 'diaktifkan' : 'diblokir'}.`, 'success');
      })
      .catch(() => showNotice('Gagal mengubah status member.', 'error'));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'suspended':
        return 'Diblokir';
      case 'pending':
        return 'Menunggu';
      default:
        return status;
    }
  };

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/members`)
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => { if (!mounted) return; setMembers(Array.isArray(data) ? data.map(normalizeMember) : []); })
      .catch(() => { if (!mounted) return; setMembers([]); })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 transition-colors duration-500 dark:text-slate-100 sm:px-6 md:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Manajemen Member</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">Kelola akun member dan status mereka</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-cyan-500">Total Member</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{members.length}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-emerald-500">Aktif</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{members.filter(m => m.status === 'active').length}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-rose-500">Diblokir</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{members.filter(m => m.status === 'suspended').length}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-violet-500">Total Investasi</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">Rp {members.reduce((sum, m) => sum + m.totalInvestment, 0).toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari username, nama, atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="suspended">Diblokir</option>
        </select>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-8 max-w-2xl w-full mx-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-slate-900 dark:text-white">Edit Member</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nama</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Telepon</label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="active">Aktif</option>
                  <option value="suspended">Diblokir</option>
                  <option value="pending">Menunggu</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => setShowEditForm(false)}
                className="flex-1 px-4 py-2 bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Balance Modal */}
      {showAddBalance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-8 max-w-md w-full mx-4">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">Tambah Saldo untuk @{balanceTarget?.username}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah (Rp)</label>
                <input
                  type="number"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan (opsional)</label>
                <input
                  type="text"
                  value={balanceNote}
                  onChange={(e) => setBalanceNote(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => setShowAddBalance(false)}
                className="flex-1 px-4 py-2 bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitAddBalance}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
              >
                Tambah Saldo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="admin-panel overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-white/10 bg-slate-950/90 text-white dark:bg-white/10">
              <th className="px-6 py-3 text-left text-sm font-bold">Username</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Nama Lengkap</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Email</th>
              <th className="px-6 py-3 text-right text-sm font-bold">Investasi Total</th>
              <th className="px-6 py-3 text-right text-sm font-bold">Profit</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Status</th>
              <th className="px-6 py-3 text-center text-sm font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMembers.map((member) => (
              <tr key={member.id} className="border-b border-white/10 transition duration-300 hover:-translate-y-px hover:bg-slate-50/80 dark:hover:bg-white/5">
                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">@{member.username}</td>
                <td className="px-6 py-4 text-slate-900 dark:text-white">{member.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{member.email}</td>
                <td className="px-6 py-4 text-right font-bold">Rp {member.totalInvestment.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-right font-bold text-emerald-500">Rp {member.totalProfit.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(member.status)}`}>
                    {getStatusLabel(member.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(member)}
                      className="rounded-xl bg-cyan-500/10 p-2 text-cyan-500 transition hover:-translate-y-0.5 hover:bg-cyan-500/20"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(member.id)}
                      className={`rounded-xl p-2 transition hover:-translate-y-0.5 ${member.status === 'active' ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                      title={member.status === 'active' ? 'Blokir' : 'Aktifkan'}
                    >
                      {member.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="rounded-xl bg-rose-500/10 p-2 text-rose-500 transition hover:-translate-y-0.5 hover:bg-rose-500/20"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenAddBalance(member)}
                      className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500 transition hover:-translate-y-0.5 hover:bg-emerald-500/20"
                      title="Tambah Saldo"
                    >
                      +
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {filteredMembers.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">
          <p>Tidak ada member yang ditemukan</p>
        </div>
      )}

      {filteredMembers.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-600">
            Menampilkan {(safeCurrentPage - 1) * itemsPerPage + 1} - {Math.min(safeCurrentPage * itemsPerPage, filteredMembers.length)} dari {filteredMembers.length} member
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <span className="text-sm text-gray-700">Halaman {safeCurrentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-50"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberListPage;
