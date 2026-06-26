import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowRightLeft, BadgeDollarSign, Clock3, KeyRound, Moon, ShieldCheck, Sparkles, Sun, Wallet, Users, FileText, Coins, ShieldAlert, TrendingUp } from 'lucide-react';
import AdminTopBar from '../components/AdminTopBar';
import InvestDepositPage from './admin/InvestDepositPage';
import KonfirmasiPembayaranPage from './admin/KonfirmasiPembayaranPage';
import FAQManagerPage from './admin/FAQManagerPage';
import BeritaPage from './admin/BeritaPage';
import TestimonialPage from './admin/TestimonialPage';
import BonusPage from './admin/BonusPage';
import ProfitMemberPage from './admin/ProfitMemberPage';
import MemberListPage from './admin/MemberListPage';
import DepositVerificationPage from './admin/DepositVerificationPage';
import InvestmentAssignmentPage from './admin/InvestmentAssignmentPage';
import KYCManagementPage from './admin/KYCManagementPage';
import DownloadCenterPage from './admin/DownloadCenterPage';
import AuditLogPage from './admin/AuditLogPage';
import WithdrawalManagementPage from './admin/WithdrawalManagementPage';

const AdminDashboard = () => {
  const [adminUser, setAdminUser] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('admin_user');
    if (userData) {
      try {
        setAdminUser(JSON.parse(userData));
      } catch (err) {
        console.warn('Ignored malformed `admin_user` in localStorage:', err);
        localStorage.removeItem('admin_user');
      }
    }

    const savedTheme = localStorage.getItem('admin_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextTheme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : (prefersDark ? 'dark' : 'light');
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/summary`).then(r => r.ok ? r.json() : Promise.reject(r)).then(data => { if (!mounted) return; setSummary(data); }).catch(() => { if (!mounted) return; setSummary(null); }).finally(() => mounted && setSummaryLoading(false));
    return () => { mounted = false; };
  }, []);

  const [counts, setCounts] = useState({ investments: 0, deposits: 0, profits: 0, bonuses: 0 });
  const [investmentsList, setInvestmentsList] = useState([]);
  const [depositsList, setDepositsList] = useState([]);
  const [profitsList, setProfitsList] = useState([]);
  const [bonusesList, setBonusesList] = useState([]);
  const [membersList, setMembersList] = useState([]);

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL || '';
    Promise.all([
      fetch(`${base}/api/admin/investments`).then(r => r.ok ? r.json() : []),
      fetch(`${base}/api/admin/deposits`).then(r => r.ok ? r.json() : []),
      fetch(`${base}/api/admin/profits`).then(r => r.ok ? r.json() : []),
      fetch(`${base}/api/admin/bonuses`).then(r => r.ok ? r.json() : []),
      fetch(`${base}/api/admin/members`).then(r => r.ok ? r.json() : [])
    ]).then(([investments, deposits, profits, bonuses, members]) => {
      if (!mounted) return;
      setInvestmentsList(Array.isArray(investments) ? investments : []);
      setDepositsList(Array.isArray(deposits) ? deposits : []);
      setProfitsList(Array.isArray(profits) ? profits : []);
      setBonusesList(Array.isArray(bonuses) ? bonuses : []);
      setMembersList(Array.isArray(members) ? members : []);
      setCounts({
        investments: Array.isArray(investments) ? investments.length : 0,
        deposits: Array.isArray(deposits) ? deposits.length : 0,
        profits: Array.isArray(profits) ? profits.length : 0,
        bonuses: Array.isArray(bonuses) ? bonuses.length : 0
      });
    }).catch(() => {
      if (!mounted) return;
      setCounts({ investments: 0, deposits: 0, profits: 0, bonuses: 0 });
      setInvestmentsList([]);
      setDepositsList([]);
      setProfitsList([]);
      setBonusesList([]);
      setMembersList([]);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('admin-theme');
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('admin_theme', theme);

    return () => {
      root.classList.remove('admin-theme');
      root.classList.remove('dark');
    };
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const shellTheme = theme === 'dark'
    ? 'bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-slate-50'
    : 'bg-[radial-gradient(circle_at_top_left,_rgba(91,125,255,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(0,212,255,0.14),_transparent_22%),linear-gradient(180deg,_#eef4ff_0%,_#f8fbff_48%,_#f4f7fb_100%)] text-slate-900';

  const heroStats = useMemo(() => ([
    { label: 'Aset Aktif', value: summary ? `Rp ${Number(summary.totalWallet || 0).toLocaleString('id-ID')}` : 'Memuat...', icon: ShieldCheck },
    { label: 'Total Users', value: summary ? String(summary.totalUsers || 0) : 'Memuat...', icon: Users },
    { label: 'Mode', value: theme === 'dark' ? 'Dark' : 'Light', icon: theme === 'dark' ? Moon : Sun }
  ]), [theme, summary]);

  const investColumns = ['Kategori', 'Nilai', 'Status', 'Aksi'];
  const investRows = [
    ['Deposit', summary ? `${counts.deposits} transaksi` : 'Memuat...', 'Siap', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Buka</button>],
    ['Profit', summary ? `${counts.profits} record` : 'Memuat...', 'Siap', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Buka</button>],
    ['Assignment', summary ? `${counts.investments} investasi` : 'Memuat...', 'Siap', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Buka</button>]
  ];

  const kycColumns = ['Jenis', 'Total', 'Status', 'Aksi'];
  const kycRows = [
    ['Submission', summary ? String((summary.kycPending || 0) + (summary.kycVerified || 0)) : 'Memuat...', 'Siap', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Buka</button>],
    ['Menunggu', summary ? String(summary.kycPending || 0) : 'Memuat...', 'Siap', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Buka</button>],
    ['Terverifikasi', summary ? String(summary.kycVerified || 0) : 'Memuat...', 'Siap', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Buka</button>]
  ];

  const settingColumns = ['Menu', 'Submenu', 'Status', 'Aksi'];
  const settingRows = [
    ['FAQ', 'Manage FAQ', 'Siap', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Buka</button>],
    ['Config', 'Site Settings', 'Siap', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Buka</button>],
    ['SEO', 'Metadata', 'Siap', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Buka</button>]
  ];

  const memberColumns = ['Menu', 'Status', 'Data', 'Aksi'];
  const memberRows = [
    ['List Member', 'Siap', summary ? `${summary.totalUsers || 0} user` : 'Memuat...', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Buka</button>],
    ['Testimonial', 'Siap', '—', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Buka</button>],
    ['Berita', 'Siap', '—', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Buka</button>]
  ];

  const bonusColumns = ['Area', 'Status', 'Data', 'Aksi'];
  const bonusRows = [
    ['Bonus Member', 'Siap', summary ? `Rp ${Number(summary.totalProfit || 0).toLocaleString('id-ID')}` : 'Memuat...', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Buka</button>],
    ['Pembagian', 'Siap', '—', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Buka</button>],
    ['Histori', 'Siap', '—', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Buka</button>]
  ];

  const ModulePage = ({ title, description, icon: Icon, accent, stats, columns, rows, footerNote, actionLabel }) => (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 transition-colors duration-500 dark:text-slate-100 sm:px-6 md:px-8 animate-fade-in-up">
      <div className="mb-6 flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-${accent}-500/10 text-${accent}-500 dark:bg-${accent}-400/10 dark:text-${accent}-300`}>
          <Icon size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div key={stat.label} className="admin-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-${stat.tone}-500/10 text-${stat.tone}-500 dark:bg-${stat.tone}-400/10 dark:text-${stat.tone}-300`}>
                  <StatIcon size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-[28px] border border-white/10 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:bg-slate-950/70">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title} Overview</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{footerNote}</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-900">
            <FileText size={14} /> {actionLabel}
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 text-left text-slate-500 dark:border-white/10 dark:text-slate-300">
                {columns.map((column) => (
                  <th key={column} className="px-4 py-3 font-semibold">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${title}-${index}`} className="border-b border-slate-200/70 transition hover:bg-slate-50/80 dark:border-white/5 dark:hover:bg-white/5">
                  {row.map((cell, cellIndex) => (
                    <td key={`${title}-${index}-${cellIndex}`} className={`px-4 py-4 ${cellIndex === row.length - 1 ? 'text-right' : ''}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const pinColumns = ['Member', 'Status PIN', 'Terakhir Reset', 'Aksi'];
  const pinRows = [
    ['@budi', <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">Aktif</span>, '2026-05-21 10:15', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Reset PIN</button>],
    ['@siti_rahma', <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-300">Perlu Verifikasi</span>, '2026-05-22 08:00', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Reset PIN</button>],
    ['@ahmad_irawan', <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-300">Diblokir</span>, '2026-05-18 12:30', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Reset PIN</button>]
  ];

  const tradeColumns = ['Pair', 'Arah', 'Nominal', 'Status', 'Aksi'];
  const tradeRows = (depositsList.length ? depositsList.slice(0, 3).map((d) => [
    d.pair || 'Deposit',
    d.type === 'sell' ? <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-300">SELL</span> : <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">BUY</span>,
    `Rp ${Number(d.amount || 0).toLocaleString('id-ID')}`,
    d.status || 'Menunggu',
    <button className="text-cyan-600 font-semibold dark:text-cyan-300">Lihat Detail</button>
  ]) : [
    ['-', 'Memuat...', 'Memuat...', 'Memuat...', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Lihat Detail</button>]
  ]);

  const rewardColumns = ['Member', 'Jenis Reward', 'Nilai', 'Status', 'Aksi'];
  const rewardRows = (bonusesList.length ? bonusesList.slice(0, 3).map((b) => [
    b.user_handle || b.user_id || '—',
    b.type || 'Bonus',
    `Rp ${Number(b.amount || 0).toLocaleString('id-ID')}`,
    b.status || 'Pending',
    <button className="text-cyan-600 font-semibold dark:text-cyan-300">Detail</button>
  ]) : [
    ['-', 'Memuat...', 'Memuat...', 'Memuat...', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Detail</button>]
  ]);

  const balanceColumns = ['Akun', 'Saldo', 'Masuk', 'Keluar', 'Aksi'];
  const balanceRows = (membersList.length ? membersList.slice(0, 3).map((m) => [
    m.username || m.name || `user_${m.id || ''}`,
    `Rp ${Number(m.wallet_balance || m.balance || 0).toLocaleString('id-ID')}`,
    `Rp ${Number(m.incoming || 0).toLocaleString('id-ID')}`,
    `Rp ${Number(m.outgoing || 0).toLocaleString('id-ID')}`,
    <button className="text-cyan-600 font-semibold dark:text-cyan-300">Kelola</button>
  ]) : [
    ['-', 'Memuat...', 'Memuat...', 'Memuat...', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Kelola</button>]
  ]);

  const adminColumns = ['Admin', 'Role', 'Last Login', 'Status', 'Aksi'];
  const adminRows = [
    ['admin', 'Super Admin', '2026-05-23 10:12', 'Aktif', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Ubah</button>],
    ['ops', 'Operations', '2026-05-22 18:40', 'Aktif', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Ubah</button>],
    ['audit', 'Auditor', '2026-05-20 09:05', 'Dibatasi', <button className="text-cyan-600 font-semibold dark:text-cyan-300">Ubah</button>]
  ];

  const DashboardHome = () => {
    const iconMenus = [
      { label: 'Invest', icon: '💰', path: 'invest/deposit' },
      { label: 'Profit', icon: '💰', path: 'invest/profit' },
      { label: 'Bonus', icon: '💰', path: 'bonus/member' },
      { label: 'Member Manager', icon: '👥', path: 'member/list' },
      { label: 'Testimonial', icon: '📋', path: 'member/testimonial' },
      { label: 'Berita', icon: '📋', path: 'member/berita' },
      { label: 'FAQ', icon: 'ℹ️', path: 'setting/faq' },
      { label: 'Konfirmasi', icon: '✓', path: 'kyc/confirm' },
      { label: 'Configuration', icon: '⚙️', path: 'setting/config' }
    ];

    return (
      <div className="relative min-h-screen overflow-hidden text-slate-900 transition-colors duration-500 dark:text-slate-100">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl animate-float dark:bg-cyan-400/10" />
          <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative min-h-screen px-4 py-6 pb-24 sm:px-6 md:px-8">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              <Sparkles size={14} /> Control Center
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Dashboard admin
            </h2>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
              <div className="rounded-3xl border border-white/70 bg-white/75 p-4 shadow-soft-xl backdrop-blur-lg transition-colors duration-500 dark:border-white/10 dark:bg-slate-900/70">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold sm:text-2xl">Quick Actions</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Akses cepat ke modul paling sering dipakai.</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Live
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-5">
                  {iconMenus.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigate(item.path)}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-xl dark:border-white/10 dark:bg-slate-950/60"
                      style={{ animationDelay: `${idx * 45}ms` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-cyan-400/0 to-blue-500/0 opacity-0 transition-opacity duration-300 group-hover:from-blue-500/10 group-hover:via-cyan-400/10 group-hover:to-transparent group-hover:opacity-100" />
                      <div className="relative flex flex-col items-start gap-3">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-blue text-2xl shadow-glow transition-transform duration-300 group-hover:scale-110">
                          {item.icon}
                        </span>
                        <span className="text-sm font-semibold leading-tight text-slate-700 transition-colors duration-300 group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white sm:text-base">
                          {item.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
              <div className="rounded-3xl border border-white/70 bg-slate-900/95 p-5 text-white shadow-soft-xl backdrop-blur-lg dark:border-white/10">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Admin Overview</p>
                    <h3 className="mt-1 text-lg font-bold">Selamat Datang</h3>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-white/10 shadow-glow animate-pulse-soft" />
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-2">
                    <span className="min-w-0 font-medium text-slate-300">Total Users</span>
                    <span className="break-words text-right text-white/90">{summary ? String(summary.totalUsers || 0) : 'Memuat...'}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-2">
                    <span className="min-w-0 font-medium text-slate-300">Total Wallet</span>
                    <span className="break-words text-right text-white/90">{summary ? `Rp ${Number(summary.totalWallet || 0).toLocaleString('id-ID')}` : 'Memuat...'}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-2">
                    <span className="min-w-0 font-medium text-slate-300">Total Deposits</span>
                    <span className="break-words text-right text-white/90">{summary ? `Rp ${Number(summary.totalDeposits || 0).toLocaleString('id-ID')}` : 'Memuat...'}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-2">
                    <span className="min-w-0 font-medium text-slate-300">Total Profit</span>
                    <span className="break-words text-right text-white/90">{summary ? `Rp ${Number(summary.totalProfit || 0).toLocaleString('id-ID')}` : 'Memuat...'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {heroStats.map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-soft backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/70">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-blue text-white shadow-glow">
                    <StatIcon size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{stat.label}</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const PlaceholderPage = ({ title }) => (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 dark:text-slate-100 sm:px-6 md:px-8">
      <div className="mx-auto max-w-4xl animate-fade-in-up rounded-[28px] border border-white/10 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:bg-slate-950/70">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          <Sparkles size={14} /> Module Preview
        </div>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">{title}</h2>
        <div className="mt-4 rounded-3xl border border-dashed border-slate-300/80 bg-white/60 p-5 sm:p-6 dark:border-white/10 dark:bg-white/5">
          <p className="text-slate-700 dark:text-slate-200">Content for {title} coming soon...</p>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Untuk sekarang, halaman ini diarahkan ke overview agar admin tetap bisa bekerja tanpa layar kosong.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/admin/dashboard" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-900">
              Kembali ke Admin Home
            </Link>
            <Link to="/admin/dashboard/member/list" className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15">
              Buka Member List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`admin-shell relative flex min-h-screen flex-col overflow-hidden transition-colors duration-500 ${shellTheme}`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-5rem] h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl animate-float" />
        <div className="absolute right-[-6rem] top-24 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl animate-float" style={{ animationDelay: '1.4s' }} />
        <div className="absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 border-b border-white/10 bg-white/5 px-4 py-3 backdrop-blur-2xl sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-black leading-tight tracking-tight sm:text-2xl">
              Administrator Area Magne-Rezeki-Syariah-manajemen.com
            </h1>
            <div className="mt-1 text-[11px] sm:text-xs text-slate-400">
              Selamat Datang, {adminUser?.name || 'Administrator'} | {new Date().toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-xl">
              <ShieldCheck size={14} /> Secure session
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-xl">
              <Activity size={14} /> Live admin
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1800px] px-3 pt-3 sm:px-4 lg:px-6">
        <AdminTopBar onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
      </div>

      <div className="relative z-10 flex-1 overflow-auto px-3 pb-6 pt-4 sm:px-4 lg:px-6">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/invest/deposit" element={<InvestDepositPage />} />
          <Route path="/invest/profit" element={<ProfitMemberPage />} />
          <Route path="/invest/assignment" element={<InvestmentAssignmentPage />} />
          <Route
            path="/invest/*"
            element={<ModulePage title="Invest Center" description="Ringkasan seluruh aktivitas investasi dan jalur cepat ke modul detail." icon={Coins} accent="emerald" stats={[{ label: 'Total Deposit', value: summary ? `Rp ${Number(summary.totalDeposits || 0).toLocaleString('id-ID')}` : 'Memuat...', icon: Wallet, tone: 'cyan' }, { label: 'Total Profit', value: summary ? `Rp ${Number(summary.totalProfit || 0).toLocaleString('id-ID')}` : 'Memuat...', icon: TrendingUp, tone: 'emerald' }, { label: 'Wallet Total', value: summary ? `Rp ${Number(summary.totalWallet || 0).toLocaleString('id-ID')}` : 'Memuat...', icon: ShieldCheck, tone: 'violet' }, { label: 'Users', value: summary ? String(summary.totalUsers || 0) : 'Memuat...', icon: Users, tone: 'amber' }]} columns={investColumns} rows={investRows} footerNote="Modul ini menjadi pintu masuk ke deposit, profit member, dan assignment investasi." actionLabel="Buka Invest" />} />

          <Route path="/kyc/confirm" element={<DepositVerificationPage />} />
          <Route path="/kyc/manage" element={<KYCManagementPage />} />
          <Route
            path="/kyc/*"
            element={<ModulePage title="KYC Center" description="Kelola verifikasi identitas, dokumen, dan status persetujuan member." icon={ShieldCheck} accent="amber" stats={[{ label: 'Submission', value: summary ? String((summary.kycPending || 0) + (summary.kycVerified || 0)) : 'Memuat...', icon: FileText, tone: 'cyan' }, { label: 'Menunggu', value: summary ? String(summary.kycPending || 0) : 'Memuat...', icon: Clock3, tone: 'amber' }, { label: 'Terverifikasi', value: summary ? String(summary.kycVerified || 0) : 'Memuat...', icon: ShieldCheck, tone: 'emerald' }, { label: 'Ditolak', value: summary ? String(summary.kycRejected || 0) : 'Memuat...', icon: ShieldAlert, tone: 'rose' }]} columns={kycColumns} rows={kycRows} footerNote="Gunakan halaman ini untuk masuk ke verifikasi dan manajemen dokumen KYC." actionLabel="Buka KYC" />} />

          <Route path="/setting/faq" element={<FAQManagerPage />} />
          <Route
            path="/setting/*"
            element={<ModulePage title="Settings" description="Akses cepat ke konfigurasi situs, FAQ, dan parameter operasional." icon={Sparkles} accent="slate" stats={[{ label: 'FAQ', value: 'Manage', icon: FileText, tone: 'cyan' }, { label: 'Config', value: 'Ready', icon: Sparkles, tone: 'violet' }, { label: 'Branding', value: 'Ready', icon: ShieldCheck, tone: 'emerald' }, { label: 'Meta', value: 'Ready', icon: Coins, tone: 'amber' }]} columns={settingColumns} rows={settingRows} footerNote="Semua pengaturan inti bisa diarahkan dari sini ke halaman detail yang sudah ada." actionLabel="Buka Setting" />} />

          <Route path="/member/list" element={<MemberListPage />} />
          <Route path="/member/testimonial" element={<TestimonialPage />} />
          <Route path="/member/berita" element={<BeritaPage />} />
          <Route
            path="/member/*"
            element={<ModulePage title="Member Center" description="Kelola member, testimoni, dan berita dalam satu jalur navigasi." icon={Users} accent="cyan" stats={[{ label: 'Member', value: summary ? String(summary.totalUsers || membersList.length || 0) : 'Memuat...', icon: Users, tone: 'emerald' }, { label: 'Testimoni', value: '—', icon: FileText, tone: 'violet' }, { label: 'Berita', value: '—', icon: Sparkles, tone: 'cyan' }, { label: 'Aktif', value: summary ? String(summary.totalUsers || membersList.length || 0) : 'Memuat...', icon: ShieldCheck, tone: 'amber' }]} columns={memberColumns} rows={memberRows} footerNote="Area ini menutup seluruh kebutuhan data member sebelum Supabase." actionLabel="Buka Member" />} />

          <Route path="/bonus/member" element={<BonusPage />} />
          <Route
            path="/bonus/*"
            element={<ModulePage title="Bonus Center" description="Pantau pembagian bonus, payout, dan log reward member." icon={BadgeDollarSign} accent="violet" stats={[{ label: 'Payout', value: String(counts.bonuses || 0), icon: BadgeDollarSign, tone: 'emerald' }, { label: 'Pending', value: String(bonusesList.filter(b => (b.status||'').toLowerCase() === 'pending').length || 0), icon: Clock3, tone: 'amber' }, { label: 'Histori', value: String(bonusesList.length || 0), icon: FileText, tone: 'cyan' }, { label: 'Member', value: summary ? String(summary.totalUsers || 0) : 'Memuat...', icon: Users, tone: 'violet' }]} columns={bonusColumns} rows={bonusRows} footerNote="Submenu bonus sekarang punya overview jelas, bukan halaman kosong." actionLabel="Buka Bonus" />} />

          <Route
            path="/pin/*"
            element={<ModulePage title="PIN Management" description="Pantau status PIN, reset akses, dan keamanan akun member." icon={KeyRound} accent="amber" stats={[{ label: 'PIN Aktif', value: summary ? String(summary.totalUsers || membersList.length || 0) : 'Memuat...', icon: KeyRound, tone: 'amber' }, { label: 'Reset Hari Ini', value: '0', icon: Clock3, tone: 'cyan' }, { label: 'Terkunci', value: '0', icon: ShieldAlert, tone: 'rose' }, { label: 'Verifikasi', value: '0', icon: Users, tone: 'emerald' }]} columns={pinColumns} rows={pinRows} footerNote="Gunakan halaman ini untuk mengontrol reset PIN dan status keamanan member." actionLabel="Ekspor PIN" />} />
          <Route
            path="/trade/*"
            element={<ModulePage title="Trade Center" description="Lihat ringkasan transaksi trading, arah order, dan status eksekusi." icon={ArrowRightLeft} accent="emerald" stats={[{ label: 'Trade Aktif', value: String(depositsList.length || 0), icon: ArrowRightLeft, tone: 'emerald' }, { label: 'Profit Hari Ini', value: summary ? `Rp ${Number(summary.totalProfit || 0).toLocaleString('id-ID')}` : 'Memuat...', icon: BadgeDollarSign, tone: 'cyan' }, { label: 'Pending', value: String(depositsList.filter(d => (d.status||'').toLowerCase() === 'pending').length || 0), icon: Clock3, tone: 'amber' }, { label: 'Selesai', value: String(depositsList.filter(d => (d.status||'').toLowerCase() === 'done' || (d.status||'').toLowerCase() === 'completed').length || 0), icon: Coins, tone: 'violet' }]} columns={tradeColumns} rows={tradeRows} footerNote="Transaksi yang masih berjalan dan histori eksekusi trading tampil di sini." actionLabel="Sync Trade" />} />
          <Route
            path="/reward/*"
            element={<ModulePage title="Reward Center" description="Kelola bonus, referral, dan reward yang sudah maupun belum dibayarkan." icon={BadgeDollarSign} accent="violet" stats={[{ label: 'Reward Pending', value: String(bonusesList.filter(b => (b.status||'').toLowerCase() === 'pending').length || 0), icon: Clock3, tone: 'amber' }, { label: 'Reward Paid', value: String(bonusesList.filter(b => (b.status||'').toLowerCase() === 'paid').length || 0), icon: BadgeDollarSign, tone: 'emerald' }, { label: 'Total Distribusi', value: `Rp ${Number(bonusesList.reduce((s, b) => s + (Number(b.amount) || 0), 0)).toLocaleString('id-ID')}`, icon: Coins, tone: 'cyan' }, { label: 'Member Aktif', value: summary ? String(summary.totalUsers || 0) : 'Memuat...', icon: Users, tone: 'violet' }]} columns={rewardColumns} rows={rewardRows} footerNote="Data reward dipakai untuk validasi payout dan audit distribusi." actionLabel="Proses Reward" />} />
          <Route path="/balance/withdrawal" element={<WithdrawalManagementPage />} />
          <Route
            path="/balance/*"
            element={<ModulePage title="Balance Control" description="Monitor wallet saldo, masuk-keluar dana, dan transfer antar akun." icon={Wallet} accent="cyan" stats={[{ label: 'Total Saldo', value: summary ? `Rp ${Number(summary.totalWallet || 0).toLocaleString('id-ID')}` : 'Memuat...', icon: Wallet, tone: 'cyan' }, { label: 'Deposit Total', value: summary ? `Rp ${Number(summary.totalDeposits || 0).toLocaleString('id-ID')}` : 'Memuat...', icon: BadgeDollarSign, tone: 'emerald' }, { label: 'Withdrawal', value: summary ? `Rp ${Number(summary.totalWithdrawals || 0).toLocaleString('id-ID')}` : 'Memuat...', icon: ArrowRightLeft, tone: 'rose' }, { label: 'Transfer', value: String(counts.investments || 0), icon: FileText, tone: 'violet' }]} columns={balanceColumns} rows={balanceRows} footerNote="Semua perubahan saldo dan perpindahan dana dipantau dari dashboard ini." actionLabel="Rekap Saldo" />} />
          <Route path="/download/*" element={<DownloadCenterPage />} />
          <Route path="/admin/logs" element={<AuditLogPage />} />
          <Route
            path="/admin/*"
            element={<ModulePage title="Admin Control" description="Kelola akun admin, audit akses, dan keamanan operasional." icon={ShieldCheck} accent="slate" stats={[{ label: 'Admin Aktif', value: '3', icon: Users, tone: 'emerald' }, { label: 'Login Hari Ini', value: '19', icon: Clock3, tone: 'cyan' }, { label: 'Audit Log', value: '248', icon: FileText, tone: 'violet' }, { label: 'Policy Lock', value: 'ON', icon: ShieldCheck, tone: 'slate' }]} columns={adminColumns} rows={adminRows} footerNote="Area ini dipakai untuk kontrol akses dan manajemen admin internal." actionLabel="Audit Admin" />} />
          <Route path="*" element={<PlaceholderPage title="Page" />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;