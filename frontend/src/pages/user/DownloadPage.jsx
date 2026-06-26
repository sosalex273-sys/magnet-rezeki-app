import React, { useEffect, useState } from 'react';
import { Download, FileText, ShieldCheck, BookOpen, Sparkles } from 'lucide-react';

const DownloadPage = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/downloads`)
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => { if (!mounted) return; setLinks(Array.isArray(data) ? data : []); })
      .catch(() => { if (!mounted) return; setLinks([]); })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 transition-colors duration-500 dark:text-slate-100 sm:px-6 md:px-8 animate-fade-in">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/10 dark:text-cyan-300">
            <Download size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl md:text-4xl">Download Center</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">Pusat unduhan dokumen, panduan, dan file pendukung platform.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {loading ? (
            <p className="text-sm text-slate-600">Memuat dokumen…</p>
          ) : links.length === 0 ? (
            <p className="text-sm text-slate-600">Tidak ada dokumen tersedia.</p>
          ) : (
            links.map((item, idx) => {
              const Icon = item.icon ? item.icon : BookOpen;
              const href = item.href || item.url || '#';
              return (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-[28px] border border-white/10 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(15,23,42,0.14)] dark:bg-slate-950/70"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white transition group-hover:scale-105 dark:bg-white dark:text-slate-900">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{item.label || item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description || item.summary}</p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-700 transition group-hover:bg-cyan-500/15 dark:text-cyan-300">
                    <Sparkles size={14} /> Unduh file
                  </div>
                </a>
              );
            })
          )}
        </div>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <p className="text-sm leading-7 text-slate-300">
            Halaman ini sekarang dipakai untuk dokumen operasional dan panduan pengguna, bukan unduhan APK.
            Jika nanti ada file nyata dari backend atau Supabase, tombol di atas bisa diarahkan langsung ke file tersebut.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
