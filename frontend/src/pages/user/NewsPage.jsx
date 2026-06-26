import React, { useEffect, useState } from 'react';

const NewsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/news`)
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => { if (!mounted) return; setPosts(Array.isArray(data) ? data : []); })
      .catch(() => { if (!mounted) return; setPosts([]); })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 pb-24 animate-fade-in">
      <div className="max-w-4xl">
        <h2 className="text-2xl md:text-4xl font-bold text-dark-900 dark:text-white mb-2">News</h2>
        <p className="text-sm md:text-base text-dark-600 dark:text-white/70">Berita dan pengumuman terbaru.</p>

        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="text-sm text-dark-600">Memuat berita…</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-dark-600">Belum ada berita.</p>
          ) : (
            posts.map((p, i) => (
              <article key={i} className="bg-white dark:bg-dark-900/70 p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <h3 className="text-base md:text-lg font-semibold text-dark-900 dark:text-white leading-snug">{p.title || p.heading}</h3>
                  <time className="text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-white/10 dark:text-white/70">{p.date || p.published_at}</time>
                </div>
                <p className="mt-3 text-sm md:text-base text-dark-700 dark:text-white/80 leading-relaxed">{p.body || p.content}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
