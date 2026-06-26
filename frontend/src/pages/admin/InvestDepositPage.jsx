import React, { useState, useEffect } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';

const InvestDepositPage = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInvoice, setSearchInvoice] = useState('');

  const normalizeDeposit = (item) => ({
    id: item.id,
    kode: item.kode || item.code || String(item.id || '-').slice(0, 8),
    tanggal: item.tanggal || item.date || item.created_at || '-',
    expired: item.expired || '-',
    username: item.username || item.user_id || '-',
    paket: item.paket || item.plan || '-',
    confirm: item.confirm || item.reference || '-',
    status: item.status || 'pending'
  });

  const filteredDeposits = deposits.filter((deposit) => {
    const q = searchInvoice.toLowerCase();
    return (
      String(deposit.username || '').toLowerCase().includes(q) ||
      String(deposit.kode || '').toLowerCase().includes(q) ||
      String(deposit.paket || '').toLowerCase().includes(q)
    );
  });

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredDeposits.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedDeposits = filteredDeposits.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const handleDeleteDeposit = (id) => {
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/deposits/${id}`, { method: 'DELETE' })
      .then((r) => { if (!r.ok) throw r; setDeposits(prev => prev.filter(d => d.id !== id)); })
      .catch(() => setDeposits(prev => prev.filter(d => d.id !== id)));
  };

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/deposits`).then(r => r.ok ? r.json() : Promise.reject(r)).then(data => { if (!mounted) return; setDeposits(Array.isArray(data) ? data.map(normalizeDeposit) : []); }).catch(() => { if (!mounted) return; setDeposits([]); }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 transition-colors duration-500 dark:text-slate-100 sm:px-6 md:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="text-2xl sm:text-3xl">💰</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Invest Deposit</h2>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Cari Member / Invoice / Angka Unik:"
          value={searchInvoice}
          onChange={(e) => setSearchInvoice(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
        />
        <button className="rounded-full border border-slate-200 bg-white px-6 py-2.5 font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
          CARI
        </button>
      </div>

      {/* Table */}
      <div className="admin-panel overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-slate-950/90 text-white dark:bg-white/10">
              <th className="px-4 py-3 text-left font-bold">Kode</th>
              <th className="px-4 py-3 text-left font-bold">Tanggal</th>
              <th className="px-4 py-3 text-left font-bold">Expired</th>
              <th className="px-4 py-3 text-left font-bold">Username</th>
              <th className="px-4 py-3 text-left font-bold">Paket</th>
              <th className="px-4 py-3 text-left font-bold">Confirm</th>
              <th className="px-4 py-3 text-left font-bold">Status</th>
              <th className="px-4 py-3 text-center font-bold">Del</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDeposits.map((deposit) => (
              <tr key={deposit.id} className="border-b border-white/10 transition duration-300 hover:-translate-y-px hover:bg-slate-50/80 dark:hover:bg-white/5">
                <td className="px-4 py-3 cursor-pointer text-cyan-500 underline transition hover:text-cyan-300">{deposit.kode}</td>
                <td className="px-4 py-3">{deposit.tanggal}</td>
                <td className="px-4 py-3">{deposit.expired}</td>
                <td className="px-4 py-3 text-rose-500">{deposit.username}</td>
                <td className="px-4 py-3">{deposit.paket}</td>
                <td className="px-4 py-3">{deposit.confirm}</td>
                <td className="px-4 py-3">
                  <button className="rounded-full bg-gradient-blue px-4 py-1.5 font-semibold text-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-glow">
                    {deposit.status}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDeleteDeposit(deposit.id)}
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
      </div>

      {filteredDeposits.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-600">
            Menampilkan {(safeCurrentPage - 1) * itemsPerPage + 1} - {Math.min(safeCurrentPage * itemsPerPage, filteredDeposits.length)} dari {filteredDeposits.length} deposit
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

      {filteredDeposits.length === 0 && (
        <div className="mt-4 rounded-3xl border border-white/70 bg-white/75 p-8 text-center text-slate-500 shadow-soft-xl backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/75 dark:text-slate-400">
          <p>Tidak ada data deposit</p>
        </div>
      )}
    </div>
  );
};

export default InvestDepositPage;
