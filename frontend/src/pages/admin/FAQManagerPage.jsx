import React, { useState, useEffect } from 'react';
import { Trash2, Edit2 } from 'lucide-react';

const FAQManagerPage = () => {
  const [faqList, setFaqList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ question: '', answer: '' });

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/faqs`)
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => { if (!mounted) return; setFaqList(Array.isArray(data) ? data : []); })
      .catch(() => {
        if (!mounted) return;
        setFaqList([]);
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  const handleAddFAQ = async () => {
    if (!formData.question || !formData.answer) return;
    const base = import.meta.env.VITE_API_URL || '';
    try {
      if (editingId) {
        const res = await fetch(`${base}/api/admin/faqs/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        if (res.ok) {
          setFaqList((prev) => prev.map(f => f.id === editingId ? { ...f, ...formData } : f));
        } else {
          throw new Error('Gagal update FAQ');
        }
      } else {
        const res = await fetch(`${base}/api/admin/faqs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        if (res.ok) {
          const created = await res.json();
          setFaqList((prev) => [...prev, created]);
        } else {
          throw new Error('Gagal tambah FAQ');
        }
      }
    } catch (e) {
      alert(e.message || 'Terjadi kesalahan saat menyimpan FAQ');
    }

    setFormData({ question: '', answer: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleDeleteFAQ = async (id) => {
    const base = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${base}/api/admin/faqs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFaqList((prev) => prev.filter(f => f.id !== id));
        return;
      }
    } catch (e) {
      // ignore
    }
    setFaqList((prev) => prev.filter(f => f.id !== id));
  };

  const handleEditFAQ = (faq) => {
    setFormData({ question: faq.question, answer: faq.answer });
    setEditingId(faq.id);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 transition-colors duration-500 dark:text-slate-100 sm:px-6 md:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="text-2xl sm:text-3xl">📋</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">FAQ Manager</h2>
      </div>

      {/* Add Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setFormData({ question: '', answer: '' });
              setEditingId(null);
            }
          }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-blue px-6 py-2.5 font-semibold text-white shadow-soft-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-glow"
        >
          <span>✓</span> Tambah FAQ
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-3xl border border-white/70 bg-white/75 p-4 shadow-soft-xl backdrop-blur-lg transition-colors duration-500 dark:border-white/10 dark:bg-slate-900/75">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Question :</label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
              rows="2"
              placeholder="Masukkan pertanyaan..."
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Answer :</label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
              rows="4"
              placeholder="Masukkan jawaban..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddFAQ}
              className="rounded-full bg-slate-900 px-6 py-2.5 font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {editingId ? 'UPDATE' : 'SAVE'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({ question: '', answer: '' });
                setEditingId(null);
              }}
              className="rounded-full border border-slate-200 bg-white px-6 py-2.5 font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* FAQ List Table */}
      <div className="admin-panel overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-slate-950/90 text-white dark:bg-white/10">
              <th className="px-4 py-3 text-left font-bold">ID</th>
              <th className="px-4 py-3 text-left font-bold">Question</th>
              <th className="px-4 py-3 text-left font-bold">Published</th>
              <th className="px-4 py-3 text-left font-bold">Action</th>
              <th className="px-4 py-3 text-center font-bold">Delete</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6">Memuat…</td></tr>
            ) : faqList.map((faq) => (
              <tr key={faq.id} className="border-b border-white/10 transition duration-300 hover:-translate-y-px hover:bg-slate-50/80 dark:hover:bg-white/5">
                <td className="px-4 py-3 font-semibold">{faq.id}</td>
                <td className="px-4 py-3 text-blue-600">
                  <button className="underline transition hover:text-cyan-300">
                    {faq.question}
                  </button>
                </td>
                <td className="px-4 py-3">
                  {faq.published && <span className="text-green-600 text-lg">✓</span>}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleEditFAQ(faq)}
                    className="inline-flex gap-2 text-cyan-500 transition hover:text-cyan-300"
                  >
                    <Edit2 size={18} />
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDeleteFAQ(faq.id)}
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

      {/* Pagination */}
      <div className="mt-6 text-center text-gray-600">
        [ 1 ]
      </div>
    </div>
  );
};

export default FAQManagerPage;
