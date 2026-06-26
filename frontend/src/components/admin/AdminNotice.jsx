import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const styles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-cyan-200 bg-cyan-50 text-cyan-800'
};

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info
};

const AdminNotice = ({ notice, onClose, autoDismissMs = 4000 }) => {
  useEffect(() => {
    if (!notice?.text || !onClose || autoDismissMs <= 0) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [notice?.text, onClose, autoDismissMs]);

  if (!notice?.text) return null;
  const type = notice.type || 'info';
  const Icon = icons[type] || Info;

  return (
    <div className={`mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 ${styles[type] || styles.info}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{notice.text}</p>
      <button onClick={onClose} className="opacity-80 transition hover:opacity-100" aria-label="Tutup notifikasi">
        <X size={16} />
      </button>
    </div>
  );
};

export default AdminNotice;
