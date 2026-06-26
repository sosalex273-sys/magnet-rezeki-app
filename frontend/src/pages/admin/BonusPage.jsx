import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useNotice } from '../../context/NoticeContext';

const BonusPage = () => {
  const [selectedDate, setSelectedDate] = useState('2024-05-01');
  const [bonuses, setBonuses] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotice } = useNotice();

  const [searchMember, setSearchMember] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ user_id: '', amount: '', description: '' });

  const handleAddBonus = async () => {
    const base = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${base}/api/admin/bonuses/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Gagal menambah bonus');
      showNotice('Bonus berhasil ditambahkan.', 'success');
      setShowAddModal(false);
      setFormData({ user_id: '', amount: '', description: '' });
      fetchBonuses();
    } catch (err) {
      showNotice(err.message, 'error');
    }
  };

  const fetchBonuses = () => {
    setLoading(true);
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/bonuses`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setBonuses(Array.isArray(data) ? data : []))
      .catch(() => setBonuses([]))
      .finally(() => setLoading(false));
  };

  const filteredBonuses = bonuses.filter((bonus) => {
    const q = searchMember.toLowerCase();
    return (
      (bonus.user_id && bonus.user_id.toLowerCase().includes(q)) ||
      (bonus.description && bonus.description.toLowerCase().includes(q))
    );
  });

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredBonuses.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedBonuses = filteredBonuses.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const handleDeleteBonus = (id) => {
    if (!window.confirm('Hapus bonus ini?')) return;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/bonuses/${id}`, { method: 'DELETE' })
      .then((r) => { if (!r.ok) throw r; setBonuses(prev => prev.filter(b => String(b.id) !== String(id))); })
      .catch(() => setBonuses(prev => prev.filter(b => String(b.id) !== String(id))));
  };

  const fetchMembers = () => {
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/members`)
      .then(r => r.ok ? r.json() : [])
      .then(setMembers)
      .catch(console.error);
  };

  useEffect(() => {
    fetchBonuses();
    fetchMembers();
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 transition-colors duration-500 dark:text-slate-100 sm:px-6 md:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl sm:text-3xl">💰</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Bonus</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-full bg-emerald-600 px-4 py-2 font-bold text-white transition hover:bg-emerald-700"
        >
          + Tambah Bonus
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-white shadow-xl border border-gray-200 dark:border-white/10">
            <h2 className="mb-4 text-xl font-bold">Tambah Bonus Manual</h2>
            <select
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              className="mb-3 w-full max-w-full truncate rounded-xl border border-gray-300 dark:border-white/10 p-3 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-cyan-400"
            >
              <option value="">-- Pilih Member --</option>
              {members.map(m => {
                const label = `${m.name || m.username} (${m.email})`;
                const shortLabel = label.length > 35 ? label.substring(0, 35) + '...' : label;
                return (
                  <option key={m.id} value={m.id}>{shortLabel}</option>
                );
              })}
            </select>
            <input
              type="number"
              placeholder="Jumlah (Rp)"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="mb-3 w-full rounded-xl border border-gray-300 dark:border-white/10 p-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-cyan-400"
            />
            <input
              type="text"
              placeholder="Deskripsi"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mb-4 w-full rounded-xl border border-gray-300 dark:border-white/10 p-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-cyan-400"
            />
            <div className="flex gap-2 mt-2">
              <button onClick={() => setShowAddModal(false)} className="flex-1 rounded-xl bg-gray-200 dark:bg-white/10 py-3 font-bold text-slate-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20 transition">Batal</button>
              <button onClick={handleAddBonus} className="flex-1 rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="admin-card mb-6 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Pilih Tanggal Bonus :
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 min-w-[150px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
              />
              <div className="flex w-full sm:w-auto gap-2">
                <button className="flex-1 sm:flex-none rounded-full bg-gradient-blue px-4 py-2.5 font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-glow">
                  Lihat
                </button>
                <button className="flex-1 sm:flex-none rounded-full bg-gradient-blue px-4 py-2.5 font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-glow text-xs sm:text-sm whitespace-nowrap">
                  Lihat Semua
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Cari :
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
                placeholder="Cari member..."
              />
              <button className="rounded-full border border-slate-200 bg-white px-6 py-2.5 font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 whitespace-nowrap">
                Cari Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section - Mobile Friendly Scroll */}
      <div className="admin-panel overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-slate-950/90 text-white dark:bg-white/10">
              <th className="px-4 py-2 text-left font-bold">#</th>
              <th className="px-4 py-2 text-left font-bold">Tanggal</th>
              <th className="px-4 py-2 text-left font-bold">User ID</th>
              <th className="px-4 py-2 text-left font-bold">Deskripsi</th>
              <th className="px-4 py-2 text-right font-bold">Jumlah</th>
              <th className="px-4 py-2 text-center font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBonuses.map((bonus, index) => (
              <tr key={bonus.id || index} className="border-b border-white/10 transition duration-300 hover:-translate-y-px hover:bg-slate-50/80 dark:hover:bg-white/5">
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">{bonus.created_at ? new Date(bonus.created_at).toLocaleString('id-ID') : '-'}</td>
                <td className="px-4 py-3 text-cyan-500">
                  {members.find(m => m.id === bonus.user_id)?.name || bonus.user_id}
                </td>
                <td className="px-4 py-3">{bonus.description}</td>
                <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">Rp {Number(bonus.amount || 0).toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDeleteBonus(bonus.id)}
                    className="inline-flex text-rose-500 transition hover:text-rose-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBonuses.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Menampilkan {(safeCurrentPage - 1) * itemsPerPage + 1} - {Math.min(safeCurrentPage * itemsPerPage, filteredBonuses.length)} dari {filteredBonuses.length} bonus
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

      {filteredBonuses.length === 0 && (
        <div className="mt-4 rounded-3xl border border-white/70 bg-white/75 p-8 text-center text-slate-500 shadow-soft-xl backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/75 dark:text-slate-400">
          <p>Tidak ada data bonus</p>
        </div>
      )}
    </div>
  );
};

export default BonusPage;
