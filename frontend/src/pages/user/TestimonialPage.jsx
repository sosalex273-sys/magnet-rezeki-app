import React, { useEffect, useState } from 'react';

const TestimonialPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/testimonials`)
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => { if (!mounted) return; setItems(Array.isArray(data) ? data : []); })
      .catch(() => { if (!mounted) return; setItems([]); })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 pb-24 animate-fade-in">
      <div className="max-w-3xl">
        <h2 className="text-2xl md:text-4xl font-bold text-dark-900 dark:text-white mb-2">Testimoni</h2>
        <p className="text-sm md:text-base text-dark-600 dark:text-white/70">Apa kata pengguna kami.</p>

        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="text-sm text-dark-600">Memuat testimoni…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-dark-600">Belum ada testimoni.</p>
          ) : (
            items.map((it, i) => (
              <div key={i} className="bg-white dark:bg-dark-900/70 p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                <p className="text-sm md:text-base text-dark-700 dark:text-white/80 leading-relaxed">“{it.text || it.message}”</p>
                <p className="mt-4 font-semibold text-dark-900 dark:text-white">— {it.name || it.author}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TestimonialPage;
