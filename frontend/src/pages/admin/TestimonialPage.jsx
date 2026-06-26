import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { useNotice } from '../../context/NoticeContext';

const TestimonialPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotice } = useNotice();

  const [formData, setFormData] = useState({ username: '', judul: '', gambar: '' });
  const [showForm, setShowForm] = useState(false);

  const handleCreateTestimonial = async () => {
    if (!formData.username || !formData.judul) {
      showNotice('Username dan judul wajib diisi.', 'warning');
      return;
    }

    const base = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${base}/api/admin/testimonials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambah testimonial');

      setTestimonials((prev) => [data, ...prev]);
      setFormData({ username: '', judul: '', gambar: '' });
      setShowForm(false);
      showNotice('Testimonial berhasil ditambahkan.', 'success');
    } catch (err) {
      showNotice(`Gagal menambah testimonial: ${err.message || err}`, 'error');
    }
  };

  const handleDeleteTestimonial = (id) => {
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/testimonials/${id}`, { method: 'DELETE' })
      .then((r) => {
        if (!r.ok) throw r;
        setTestimonials(prev => prev.filter(t => t.id !== id));
        showNotice('Testimonial berhasil dihapus.', 'success');
      })
      .catch(() => showNotice('Gagal menghapus testimonial.', 'error'));
  };

  const handleTogglePublish = (id) => {
    const next = testimonials.map(t => t.id === id ? { ...t, published: !t.published } : t);
    setTestimonials(next);
    const updated = next.find(t => t.id === id);
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/testimonials/${id}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: updated.published }) })
      .catch(() => showNotice('Status publish belum tersimpan ke server.', 'warning'));
  };

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/testimonials`).then(r => r.ok ? r.json() : Promise.reject(r)).then(data => { if (!mounted) return; setTestimonials(Array.isArray(data) ? data : []); }).catch(() => { if (!mounted) return; setTestimonials([]); }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 transition-colors duration-500 dark:text-slate-100 sm:px-6 md:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="text-2xl sm:text-3xl">💰</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Testimonial Manager</h2>
      </div>

      {/* Add Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-gradient-blue px-6 py-2.5 font-semibold text-white shadow-soft-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-glow"
        >
          Tambah Testimonial
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-3xl border border-white/70 bg-white/75 p-4 shadow-soft-xl backdrop-blur-lg transition-colors duration-500 dark:border-white/10 dark:bg-slate-900/75">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Username :</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
              placeholder="Masukkan username..."
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Judul :</label>
            <input
              type="text"
              value={formData.judul}
              onChange={(e) => setFormData((prev) => ({ ...prev, judul: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
              placeholder="Masukkan judul testimonial..."
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Gambar :</label>
            <input
              type="text"
              value={formData.gambar}
              onChange={(e) => setFormData((prev) => ({ ...prev, gambar: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
              placeholder="URL gambar (opsional)"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={handleCreateTestimonial} className="rounded-full bg-slate-900 px-6 py-2.5 font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
              SAVE
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({ username: '', judul: '', gambar: '' });
              }}
              className="rounded-full border border-slate-200 bg-white px-6 py-2.5 font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Testimonial Table */}
      <div className="admin-panel overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-slate-950/90 text-white dark:bg-white/10">
              <th className="px-4 py-3 text-left font-bold">#</th>
              <th className="px-4 py-3 text-left font-bold">Username</th>
              <th className="px-4 py-3 text-left font-bold">Tgl</th>
              <th className="px-4 py-3 text-left font-bold">Gambar</th>
              <th className="px-4 py-3 text-left font-bold">Judul</th>
              <th className="px-4 py-3 text-left font-bold">Published</th>
              <th className="px-4 py-3 text-left font-bold">Edit</th>
              <th className="px-4 py-3 text-center font-bold">Hapus</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6 text-slate-500">Memuat...</td></tr>
            ) : testimonials.length === 0 ? (
              <tr><td colSpan="8" className="px-4 py-6 text-center text-slate-500">Tidak ada testimonial</td></tr>
            ) : testimonials.map((t, idx) => (
              <tr key={t.id} className="border-b border-white/10 transition duration-300 hover:-translate-y-px hover:bg-slate-50/80 dark:hover:bg-white/5">
                <td className="px-4 py-3 text-center">{idx + 1}</td>
                <td className="px-4 py-3">{t.username}</td>
                <td className="px-4 py-3">{t.tgl || t.created_at}</td>
                <td className="px-4 py-3">
                  <img
                    src={t.gambar || t.image_url || 'https://via.placeholder.com/64x64?text=No+Image'}
                    alt="testimonial"
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="px-4 py-3">{t.judul || t.title}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleTogglePublish(t.id)}
                    className={`${t.published ? 'text-rose-500' : 'text-emerald-500'} text-lg transition hover:scale-110`}
                  >
                    {t.published ? <X size={18} /> : <Check size={18} />}
                  </button>
                </td>
                <td className="px-4 py-3">
                    <button className="text-cyan-500 transition hover:text-cyan-300">
                    <Edit2 size={18} />
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDeleteTestimonial(t.id)}
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

export default TestimonialPage;
