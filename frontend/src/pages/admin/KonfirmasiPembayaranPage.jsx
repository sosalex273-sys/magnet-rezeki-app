import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

const KonfirmasiPembayaranPage = () => {
  const [month, setMonth] = useState('Mei');
  const [year, setYear] = useState('2017');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchMember, setSearchMember] = useState('');

  const normalizePayment = (payment, index) => ({
    id: payment.id,
    no: payment.no || index + 1,
    tgl: payment.tgl || payment.created_at || '-',
    username: payment.username || payment.user_id || '-',
    nama: payment.nama || payment.name || '-',
    jenis: payment.jenis || payment.type || '-',
    jumlah: Number(payment.jumlah ?? payment.amount ?? 0),
    tujuan: payment.tujuan || payment.reference || '-',
    info: payment.info || payment.notes || '-',
    foto: payment.foto || payment.photo || null,
    status: payment.status || 'pending'
  });

  const handleDeletePayment = (id) => {
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/payments/${id}`, { method: 'DELETE' }).then(r => { if (!r.ok) throw r; setPayments(prev => prev.filter(p => p.id !== id)); }).catch(() => setPayments(prev => prev.filter(p => p.id !== id)));
  };

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/payments`).then(r => r.ok ? r.json() : Promise.reject(r)).then(data => { if (!mounted) return; setPayments(Array.isArray(data) ? data.map(normalizePayment) : []); }).catch(() => { if (!mounted) return; setPayments([]); }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const filteredPayments = payments.filter((payment) => String(payment.username || '').toLowerCase().includes(searchMember.toLowerCase()));

  return (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 transition-colors duration-500 dark:text-slate-100 sm:px-6 md:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="text-2xl sm:text-3xl">📋</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Konfirmasi Pembayaran</h2>
      </div>

      {/* Filter Section */}
      <div className="mb-6 rounded-3xl border border-white/70 bg-white/75 p-4 shadow-soft-xl backdrop-blur-lg transition-colors duration-500 dark:border-white/10 dark:bg-slate-900/75">
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Bulan : 
            </label>
            <div className="flex gap-2">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
              >
                <option>Januari</option>
                <option>Februari</option>
                <option>Maret</option>
                <option>April</option>
                <option>Mei</option>
                <option>Juni</option>
                <option>Juli</option>
                <option>Agustus</option>
                <option>September</option>
                <option>Oktober</option>
                <option>November</option>
                <option>Desember</option>
              </select>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
              >
                <option>2017</option>
                <option>2018</option>
                <option>2019</option>
                <option>2020</option>
                <option>2021</option>
                <option>2022</option>
                <option>2023</option>
                <option>2024</option>
                <option>2025</option>
                <option>2026</option>
              </select>
              <button className="rounded-full bg-gradient-blue px-4 py-2.5 font-semibold text-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-glow">
                LIHAT TANGGAL
              </button>
              <button className="rounded-full bg-gradient-blue px-4 py-2.5 font-semibold text-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-glow">
                LIHAT SEMUA
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Lihat Periode :
            </label>
            <div className="flex gap-2">
              <input type="date" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white" />
              <span className="px-2 py-2 text-slate-500 dark:text-slate-400">sampai</span>
              <input type="date" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white" />
              <button className="rounded-full bg-gradient-blue px-4 py-2.5 font-semibold text-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-glow">
                LIHAT PERIODE
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <label className="block px-2 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Cari Member :
          </label>
          <input
            type="text"
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
          />
          <button className="rounded-full border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
            CARI
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-panel overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-slate-950/90 text-white dark:bg-white/10">
              <th className="px-4 py-3 text-left font-bold">#</th>
              <th className="px-4 py-3 text-left font-bold">Tgl</th>
              <th className="px-4 py-3 text-left font-bold">Username</th>
              <th className="px-4 py-3 text-left font-bold">Nama</th>
              <th className="px-4 py-3 text-left font-bold">Jenis</th>
              <th className="px-4 py-3 text-left font-bold">Jumlah</th>
              <th className="px-4 py-3 text-left font-bold">Tujuan</th>
              <th className="px-4 py-3 text-left font-bold">Info</th>
              <th className="px-4 py-3 text-left font-bold">Foto</th>
              <th className="px-4 py-3 text-center font-bold">Delete</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">Memuat...</td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  Tidak ada data pembayaran
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-white/10 transition duration-300 hover:-translate-y-px hover:bg-slate-50/80 dark:hover:bg-white/5">
                  <td className="px-4 py-3">{payment.no}</td>
                  <td className="px-4 py-3">{payment.tgl}</td>
                  <td className="px-4 py-3">{payment.username}</td>
                  <td className="px-4 py-3">{payment.nama}</td>
                  <td className="px-4 py-3">{payment.jenis}</td>
                  <td className="px-4 py-3">{payment.jumlah}</td>
                  <td className="px-4 py-3">{payment.tujuan}</td>
                  <td className="px-4 py-3">{payment.info}</td>
                  <td className="px-4 py-3">
                    {payment.foto && <img src={payment.foto} alt="foto" className="w-8 h-8" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="text-rose-500 transition hover:text-rose-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default KonfirmasiPembayaranPage;
