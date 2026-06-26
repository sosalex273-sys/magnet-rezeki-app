import React, { useMemo, useState, useEffect } from 'react';
import { ArrowDownRight, ArrowUpRight, CandlestickChart, Clock3, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import api from '../../utils/api';

const TradePage = () => {
  const [market, setMarket] = useState('ETH/BTC');
  const [side, setSide] = useState('buy');
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState('1x');

  const markets = ['ETH/BTC', 'BTC/USDT', 'XRP/USDT', 'SOL/USDT'];
  const [positions, setPositions] = useState([]);
  const [tradingBalance, setTradingBalance] = useState(0);
  const [plToday, setPlToday] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) return;
      try {
        const parsedUser = JSON.parse(rawUser);
        const userId = parsedUser?.id;
        if (!userId) return;

        const [walletRes, txRes] = await Promise.all([
          api.get(`/api/wallet/${userId}`),
          api.get(`/api/transactions/${userId}`)
        ]);

        const wallet = walletRes.data || {};
        const tx = Array.isArray(txRes.data) ? txRes.data : [];

        if (!mounted) return;
        setTradingBalance(Number(wallet.virtual_balance || wallet.balance || 0));
        const tradePositions = tx.filter(t => t.type === 'trade' || t.type === 'position');
        setPositions(tradePositions);
        const pl = tradePositions.reduce((s, p) => s + (Number(p.pnl || 0) || 0), 0);
        setPlToday(pl);
      } catch (err) {
        console.warn('Failed to load trading data', err);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const summary = [
    { label: 'Saldo Trading', value: `Rp ${tradingBalance.toLocaleString('id-ID')}`, icon: Wallet, tone: 'text-cyan-600' },
    { label: 'Open Position', value: String(positions.length || 0), icon: CandlestickChart, tone: 'text-emerald-600' },
    { label: 'P/L Hari Ini', value: `Rp ${plToday.toLocaleString('id-ID')}`, icon: TrendingUp, tone: 'text-violet-600' },
    { label: 'Resiko Terkontrol', value: 'AMAN', icon: ShieldCheck, tone: 'text-amber-600' }
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`Order ${side.toUpperCase()} ${market} sebesar ${amount || '0'} dengan leverage ${leverage} berhasil dibuat.`);
  };

  return (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 transition-colors duration-500 dark:text-slate-100 sm:px-6 md:px-8 animate-fade-in-up">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-300">
          <CandlestickChart size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Trade</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Kelola posisi trading, pantau performa, dan buat order baru.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="admin-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className={`mt-2 text-2xl font-bold text-slate-900 dark:text-white ${item.tone}`}>{item.value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-current/10 ${item.tone}`}>
                  <Icon size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:bg-slate-950/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Posisi Aktif</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Ringkasan order dan performa posisi berjalan.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
              <Clock3 size={14} /> Live market
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 text-left text-slate-500 dark:border-white/10 dark:text-slate-300">
                  <th className="px-4 py-3 font-semibold">Pair</th>
                  <th className="px-4 py-3 font-semibold">Arah</th>
                  <th className="px-4 py-3 font-semibold">Entry</th>
                  <th className="px-4 py-3 font-semibold">P/L</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => (
                  <tr key={position.pair} className="border-b border-slate-200/70 transition hover:bg-slate-50/80 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">{position.pair}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${position.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-rose-500/10 text-rose-600 dark:text-rose-300'}`}>
                        {position.side === 'BUY' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {position.side}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{position.entry}</td>
                    <td className={`px-4 py-4 font-semibold ${position.pnl.startsWith('+') ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>{position.pnl}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{position.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {positions.length === 0 && (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                Belum ada posisi trading aktif. Akun baru mulai dari saldo 0 sampai admin menambah dana atau order dibuat.
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/10 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:bg-slate-950/70">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Buat Order Baru</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Form ini siap dipasangkan ke API saat Supabase aktif.</p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Market</label>
              <select value={market} onChange={(event) => setMarket(event.target.value)} className="form-select w-full">
                {markets.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Arah</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setSide('buy')} className={`rounded-2xl border px-4 py-3 font-semibold transition ${side === 'buy' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200'}`}>
                  BUY
                </button>
                <button type="button" onClick={() => setSide('sell')} className={`rounded-2xl border px-4 py-3 font-semibold transition ${side === 'sell' ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-300' : 'border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200'}`}>
                  SELL
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Nominal</label>
              <input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" placeholder="Contoh: 1000000" className="form-input w-full" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Leverage</label>
              <select value={leverage} onChange={(event) => setLeverage(event.target.value)} className="form-select w-full">
                <option>1x</option>
                <option>2x</option>
                <option>3x</option>
                <option>5x</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full px-5 py-3 font-bold">Buat Order</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradePage;