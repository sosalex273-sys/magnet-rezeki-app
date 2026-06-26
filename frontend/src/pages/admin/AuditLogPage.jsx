import React, { useEffect, useState } from 'react';

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    try {
      const res = await fetch(`${base}/api/admin/logs`);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 transition-colors duration-500 dark:text-slate-100 sm:px-6 md:px-8 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-slate-600">Riwayat tindakan administrator</p>
      </div>

      {loading ? (
        <p>Memuat log...</p>
      ) : (
        <div className="admin-panel overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b bg-slate-950/90 text-white">
                <th className="px-4 py-2 text-left">Waktu</th>
                <th className="px-4 py-2 text-left">Aksi</th>
                <th className="px-4 py-2 text-left">Admin ID</th>
                <th className="px-4 py-2 text-left">Target User</th>
                <th className="px-4 py-2 text-left">Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2 text-sm">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 font-bold text-cyan-700">{log.action}</td>
                  <td className="px-4 py-2 text-xs">{log.admin_id}</td>
                  <td className="px-4 py-2 text-xs">{log.target_user_id || '-'}</td>
                  <td className="px-4 py-2 text-sm">
                    <pre className="text-xs">{JSON.stringify(log.details)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
