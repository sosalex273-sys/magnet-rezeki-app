import React, { useState, useEffect } from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import { useNotice } from '../../context/NoticeContext';

const BeritaPage = () => {
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotice } = useNotice();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ judul: '', konten: '', username: 'admin' });

  const handleAddBerita = async () => {
    if (formData.judul && formData.konten) {
      const base = import.meta.env.VITE_API_URL || '';
      if (editingId) {
        const payload = { judul: formData.judul, konten: formData.konten, username: formData.username };
        try {
          const res = await fetch(`${base}/api/admin/news/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Gagal update berita');
          setBerita((prev) => prev.map((b) => (b.id === editingId ? { ...b, ...payload, tgl: new Date().toISOString().slice(0, 19).replace('T', ' ') } : b)));
          setEditingId(null);
        } catch (e) {
          showNotice(e.message || 'Terjadi kesalahan saat update berita.', 'error');
          return;
        }
      } else {
        const payload = {
          username: 'admin',
          tgl: new Date().toISOString().slice(0, 19).replace('T', ' '),
          judul: formData.judul,
          konten: formData.konten,
          published: true
        };
        try {
          const res = await fetch(`${base}/api/admin/news`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const created = await res.json();
          if (!res.ok) throw new Error(created.error || 'Gagal tambah berita');
          setBerita((prev) => [...prev, created]);
        } catch (e) {
          showNotice(e.message || 'Terjadi kesalahan saat menambah berita.', 'error');
          return;
        }
      }
      setFormData({ judul: '', konten: '', username: 'admin' });
      setShowForm(false);
      showNotice(editingId ? 'Berita berhasil diperbarui.' : 'Berita berhasil ditambahkan.', 'success');
    }
  };

  const handleDeleteBerita = (id) => {
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/news/${id}`, { method: 'DELETE' })
      .then(r => {
        if (!r.ok) throw r;
        setBerita(prev => prev.filter(b => b.id !== id));
        showNotice('Berita berhasil dihapus.', 'success');
      })
      .catch(() => showNotice('Gagal menghapus berita.', 'error'));
  };

  const handleEditBerita = (b) => {
    setFormData({ judul: b.judul, konten: b.konten || '', username: 'admin' });
    setEditingId(b.id);
    setShowForm(true);
  };

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/news`).then(r => r.ok ? r.json() : Promise.reject(r)).then(data => { if (!mounted) return; setBerita(Array.isArray(data) ? data : []); }).catch(() => { if (!mounted) return; setBerita([]); }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 transition-colors duration-500 dark:text-slate-100 sm:px-6 md:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="text-2xl sm:text-3xl">💰</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Berita</h2>
      </div>

      {/* Add Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setFormData({ judul: '', konten: '', username: 'admin' });
              setEditingId(null);
            }
          }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-blue px-6 py-2.5 font-semibold text-white shadow-soft-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-glow"
        >
          <span>✓</span> Tambah Berita
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-3xl border border-white/70 bg-white/75 p-4 shadow-soft-xl backdrop-blur-lg transition-colors duration-500 dark:border-white/10 dark:bg-slate-900/75">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Judul Berita :</label>
            <input
              type="text"
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
              placeholder="Masukkan judul berita..."
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Konten :</label>
            <textarea
              value={formData.konten}
              onChange={(e) => setFormData({ ...formData, konten: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
              rows="4"
              placeholder="Masukkan konten berita..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddBerita}
              className="rounded-full bg-slate-900 px-6 py-2.5 font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {editingId ? 'UPDATE' : 'SAVE'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({ judul: '', konten: '', username: 'admin' });
                setEditingId(null);
              }}
              className="rounded-full border border-slate-200 bg-white px-6 py-2.5 font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Berita Table */}
      <div className="admin-panel overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-slate-950/90 text-white dark:bg-white/10">
              <th className="px-4 py-3 text-left font-bold">#</th>
              <th className="px-4 py-3 text-left font-bold">ID</th>
              <th className="px-4 py-3 text-left font-bold">Username</th>
              <th className="px-4 py-3 text-left font-bold">Tgl</th>
              <th className="px-4 py-3 text-left font-bold">Judul Berita</th>
              <th className="px-4 py-3 text-left font-bold">Published</th>
              <th className="px-4 py-3 text-left font-bold">Edit</th>
              <th className="px-4 py-3 text-center font-bold">Hapus</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6 text-slate-500">Memuat...</td></tr>
            ) : berita.length === 0 ? (
              <tr><td colSpan="8" className="px-4 py-6 text-center text-slate-500">Tidak ada berita</td></tr>
            ) : berita.map((b, idx) => (
              <tr key={b.id} className="border-b border-white/10 transition duration-300 hover:-translate-y-px hover:bg-slate-50/80 dark:hover:bg-white/5">
                <td className="px-4 py-3 text-center">{idx + 1}</td>
                <td className="px-4 py-3">{b.id}</td>
                <td className="px-4 py-3">{b.username}</td>
                <td className="px-4 py-3">{b.tgl}</td>
                <td className="px-4 py-3">{b.judul}</td>
                <td className="px-4 py-3">
                  {b.published && <span className="text-green-600 text-lg">✓</span>}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleEditBerita(b)}
                    className="text-cyan-500 transition hover:text-cyan-300"
                  >
                    <Edit2 size={18} />
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDeleteBerita(b.id)}
                    className="text-rose-500 transition hover:text-rose-300"
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

      {/* Pagination */}
      <div className="mt-6 text-center text-gray-600">
        [ 1 ]
      </div>
    </div>
  );
};

export default BeritaPage;
