import React, { useEffect, useState } from 'react';
import { Download, FileText, Users, Database, PlusCircle, FileSpreadsheet, ShieldCheck } from 'lucide-react';

const DownloadCenterPage = () => {
  const [downloadItems, setDownloadItems] = useState([]);
  const [fileRows, setFileRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL || '';
    Promise.all([
      fetch(`${base}/api/admin/download_items`).then(r => r.ok ? r.json() : []),
      fetch(`${base}/api/admin/files`).then(r => r.ok ? r.json() : [])
    ])
      .then(([items, files]) => {
        if (!mounted) return;
        setDownloadItems(Array.isArray(items) ? items : []);
        setFileRows(Array.isArray(files) ? files : []);
      })
      .catch(() => {
        if (!mounted) return;
        // No demo data: set empty lists so admin must rely on backend
        setDownloadItems([]);
        setFileRows([]);
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 transition-colors duration-500 dark:text-slate-100 sm:px-6 md:px-8 animate-fade-in-up">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/10 dark:text-cyan-300">
          <Download size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Download Center</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Unduh data, laporan, dan arsip sistem. Bukan unduhan aplikasi.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
          {downloadItems.map((item, idx) => {
          const Icon = item.icon || Users;
          const tone = item.tone || 'from-cyan-500/20 to-blue-500/20';
          return (
            <div key={idx} className={`rounded-3xl border border-white/10 bg-gradient-to-br ${tone} p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5`}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/90 text-white shadow-soft dark:bg-white/10">
                <Icon size={20} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
              <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-900">
                <FileSpreadsheet size={16} /> {item.action || 'Aksi'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-[28px] border border-white/10 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:bg-slate-950/70">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Daftar File</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">File terakhir yang siap diunduh oleh admin.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
            <ShieldCheck size={14} /> Aman untuk arsip internal
          </span>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 text-left text-slate-500 dark:border-white/10 dark:text-slate-300">
                <th className="px-4 py-3 font-semibold">Nama File</th>
                <th className="px-4 py-3 font-semibold">Tipe</th>
                <th className="px-4 py-3 font-semibold">Ukuran</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-6">Memuat...</td></tr>
              ) : fileRows.length === 0 ? (
                <tr><td className="px-4 py-6">Belum ada file.</td></tr>
              ) : (
                fileRows.map((file, idx) => (
                  <tr key={idx} className="border-b border-slate-200/70 transition hover:bg-slate-50/80 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">{file.name}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{file.type}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{file.size}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">{file.status}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <a href={file.url || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-500">
                        <FileText size={14} /> Unduh
                      </a>
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

export default DownloadCenterPage;