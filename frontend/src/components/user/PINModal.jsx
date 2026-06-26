import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { useNotice } from '../../context/NoticeContext';

const PINModal = ({ isOpen, onClose, userId, mode = 'verify', onSuccess }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotice } = useNotice();

  const handleSubmit = async () => {
    if (pin.length !== 6) {
      showNotice('PIN harus 6 digit.', 'warning');
      return;
    }

    setLoading(true);
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const endpoint = mode === 'set' ? '/api/user/pin/set' : '/api/user/pin/verify';
    
    try {
      const res = await fetch(`${base}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, pin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
      
      showNotice(data.message, 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showNotice(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-slate-900 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Lock size={20} /> {mode === 'set' ? 'Atur PIN' : 'Verifikasi PIN'}
          </h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <input
          type="password"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
          className="mb-4 w-full rounded border p-3 text-center text-2xl tracking-widest outline-none focus:border-emerald-500"
          placeholder="000000"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Konfirmasi'}
        </button>
      </div>
    </div>
  );
};

export default PINModal;
