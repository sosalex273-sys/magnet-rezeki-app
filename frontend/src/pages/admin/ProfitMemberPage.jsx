import React, { useEffect, useState } from 'react';
import { useNotice } from '../../context/NoticeContext';

const ProfitMemberPage = () => {
  const [profits, setProfits] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotice } = useNotice();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ user_id: '', amount: '', description: '' });

  const handleAddProfit = async () => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    try {
      const res = await fetch(`${base}/api/admin/profits/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Gagal menambah profit');
      showNotice('Profit berhasil ditambahkan.', 'success');
      setShowAddModal(false);
      setFormData({ user_id: '', amount: '', description: '' });
      fetchProfits();
    } catch (err) {
      showNotice(err.message, 'error');
    }
  };

  const fetchProfits = () => {
    setLoading(true);
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    fetch(`${base}/api/admin/profits`)
      .then((r) => r.ok ? r.json() : [])
      .then(setProfits)
      .finally(() => setLoading(false));
  };

  const fetchMembers = () => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    fetch(`${base}/api/admin/members`)
      .then((r) => r.ok ? r.json() : [])
      .then(setMembers)
      .catch(console.error);
  };

  useEffect(() => {
    fetchProfits();
    fetchMembers();
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 transition-colors duration-500 dark:text-slate-100 sm:px-6 md:px-8 animate-fade-in-up">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl sm:text-3xl">📈</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Manajemen Profit</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-full bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700"
        >
          + Tambah Profit
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-white shadow-xl border border-gray-200 dark:border-white/10">
            <h2 className="mb-4 text-xl font-bold">Tambah Profit</h2>
            <select
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              className="mb-3 w-full max-w-full truncate rounded-xl border border-gray-300 dark:border-white/10 p-3 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
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
              className="mb-3 w-full rounded-xl border border-gray-300 dark:border-white/10 p-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="Deskripsi"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mb-4 w-full rounded-xl border border-gray-300 dark:border-white/10 p-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2 mt-2">
              <button onClick={() => setShowAddModal(false)} className="flex-1 rounded-xl bg-gray-200 dark:bg-white/10 py-3 font-bold text-slate-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20 transition">Batal</button>
              <button onClick={handleAddProfit} className="flex-1 rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-slate-600">Memuat...</p>
      ) : (
        <div className="mt-4 admin-panel overflow-x-auto custom-scrollbar">
          {profits.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400 p-4">Tidak ada data profit</p>
          ) : (
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/90 text-white dark:bg-white/10 text-left">
                  <th className="px-4 py-3 font-bold">Member</th>
                  <th className="px-4 py-3 font-bold text-right">Jumlah</th>
                  <th className="px-4 py-3 font-bold">Deskripsi</th>
                </tr>
              </thead>
              <tbody>
                {profits.map((p) => (
                  <tr key={p.id} className="border-b border-white/10 transition duration-300 hover:-translate-y-px hover:bg-slate-50/80 dark:hover:bg-white/5">
                    <td className="px-4 py-3 text-emerald-500 font-medium">
                      {members.find(m => m.id === p.user_id)?.name || p.user_id}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">Rp {Number(p.amount || 0).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfitMemberPage;
