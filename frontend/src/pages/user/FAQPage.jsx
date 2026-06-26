import React, { useEffect, useState } from 'react';

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/faqs`)
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => { if (!mounted) return; setFaqs(Array.isArray(data) ? data : []); })
      .catch(() => {
        if (!mounted) return;
        setFaqs([
          { q: 'Bagaimana cara membuka akun?', a: 'Klik tombol Daftar dan lengkapi formulir pendaftaran.' },
          { q: 'Berapa minimal investasi?', a: 'Minimal investasi mulai dari Rp50.000.' },
          { q: 'Bagaimana proses penarikan dana?', a: 'Ajukan request withdraw pada halaman Withdraw, tim kami akan memproses.' }
        ]);
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 pb-24 animate-fade-in">
      <div className="max-w-3xl">
        <h2 className="text-2xl md:text-4xl font-bold text-dark-900 dark:text-white mb-2">FAQ</h2>
        <p className="text-sm md:text-base text-dark-600 dark:text-white/70">Pertanyaan umum seputar layanan kami.</p>
      </div>

      <div className="mt-6 space-y-4 max-w-3xl">
        {loading ? (
          <p className="text-sm text-dark-600">Memuat FAQ…</p>
        ) : faqs.length === 0 ? (
          <p className="text-sm text-dark-600">Belum ada FAQ tersedia.</p>
        ) : (
          faqs.map((f, i) => (
            <div key={i} className="bg-white dark:bg-dark-900/70 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-white/10 shadow-sm">
              <h4 className="text-base md:text-lg font-semibold text-dark-900 dark:text-white leading-snug">{f.question || f.q}</h4>
              <p className="text-sm md:text-base text-dark-600 dark:text-white/70 mt-3 leading-relaxed">{f.answer || f.a}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FAQPage;
