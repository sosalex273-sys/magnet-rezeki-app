import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { ChevronDown, Menu as MenuIcon, X, Moon, Sun, Sparkles } from 'lucide-react';

const AdminTopBar = ({ onLogout, theme = 'dark', onToggleTheme }) => {
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const refs = useRef({});
  const [dropdownPos, setDropdownPos] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (expandedMenu) {
      const el = refs.current[expandedMenu];
      if (el) {
        const r = el.getBoundingClientRect();
        setDropdownPos({ top: r.bottom + window.scrollY, left: r.left + window.scrollX });
      }
    } else {
      setDropdownPos(null);
    }
  }, [expandedMenu]);

  const menus = {
    home: { label: 'Home', path: '/pandu/dashboard' },
    setting: {
      label: 'Setting',
      submenu: [
        { label: 'Konfigurasi', path: '/pandu/dashboard/setting/config' },
        { label: 'Header/Banner Manager', path: '/pandu/dashboard/setting/header' },
        { label: 'Menu Manager', path: '/pandu/dashboard/setting/menu' },
        { label: 'News Manager', path: '/pandu/dashboard/setting/news' },
        { label: 'FAQ Manager', path: '/pandu/dashboard/setting/faq' },
        { label: 'Content', path: '/pandu/dashboard/setting/content' }
      ]
    },
    kyc: {
      label: 'KYC',
      submenu: [
        { label: 'KYC', path: '/pandu/dashboard/kyc/list' },
        { label: 'Konfirmasi Pembayaran', path: '/pandu/dashboard/kyc/confirm' },
        { label: 'Contact Member', path: '/pandu/dashboard/kyc/contact' }
      ]
    },
    pin: {
      label: 'PIN',
      submenu: [
        { label: 'Data PIN Register', path: '/pandu/dashboard/pin/data' },
        { label: 'Generate PIN Register', path: '/pandu/dashboard/pin/generate' },
        { label: 'Order PIN Register', path: '/pandu/dashboard/pin/order' }
      ]
    },
    member: {
      label: 'Member',
      submenu: [
        { label: 'All Member', path: '/pandu/dashboard/member/list' },
        { label: 'Add Member', path: '/pandu/dashboard/member/add' },
        { label: 'Testimonial', path: '/pandu/dashboard/member/testimonial' },
        { label: 'Email Validation', path: '/pandu/dashboard/member/email' }
      ]
    },
    invest: {
      label: 'Invest',
      submenu: [
        { label: 'Investment', path: '/pandu/dashboard/invest/list' },
        { label: 'Add Invest', path: '/pandu/dashboard/invest/add' },
        { label: 'Data Invest', path: '/pandu/dashboard/invest/data' },
        { label: 'Data Profit', path: '/pandu/dashboard/invest/profit' },
        { label: 'Add Profit User Invest', path: '/pandu/dashboard/invest/add-profit' }
      ]
    },
    trade: {
      label: 'Trade',
      submenu: [
        { label: 'Stake', path: '/pandu/dashboard/trade/stake' },
        { label: 'Data Trade', path: '/pandu/dashboard/trade/data' }
      ]
    },
    bonus: {
      label: 'Bonus',
      submenu: [
        { label: 'Bonus Member', path: '/pandu/dashboard/bonus/member' },
        { label: 'Add Bonus', path: '/pandu/dashboard/bonus/add' }
      ]
    },
    reward: {
      label: 'Reward',
      submenu: [
        { label: 'Withdrawal Reward', path: '/pandu/dashboard/reward/withdrawal' },
        { label: 'Add Reward', path: '/pandu/dashboard/reward/add' }
      ]
    },
    balance: {
      label: 'Balance',
      submenu: [
        { label: 'Wallet Balance', path: '/pandu/dashboard/balance/wallet' },
        { label: 'List Add Balance', path: '/pandu/dashboard/balance/add-list' },
        { label: 'List Withdrawal', path: '/pandu/dashboard/balance/withdrawal' },
        { label: 'List Transfer', path: '/pandu/dashboard/balance/transfer' }
      ]
    },
    download: {
      label: 'Download',
      submenu: [
        { label: 'Download Member', path: '/pandu/dashboard/download/member' },
        { label: 'Tambah Download Member', path: '/pandu/dashboard/download/add' },
        { label: 'Data Download', path: '/pandu/dashboard/download/data' }
      ]
    },
    admin: {
      label: 'Admin',
      submenu: [
        { label: 'Change Password', path: '/pandu/dashboard/admin/password' },
        { label: 'Admin Manager', path: '/pandu/dashboard/admin/manager' }
      ]
    }
  };

  const menuOrder = ['home', 'setting', 'kyc', 'pin', 'member', 'invest', 'trade', 'bonus', 'reward', 'balance', 'download', 'admin'];
  const isDark = theme === 'dark';

  return (
    <div className={`relative overflow-hidden rounded-[28px] border shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition-colors duration-500 ${isDark ? 'border-white/10 bg-slate-950/70 text-white' : 'border-slate-200/80 bg-white/80 text-slate-900'}`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute -right-10 top-0 h-24 w-24 rounded-full blur-3xl ${isDark ? 'bg-cyan-400/15' : 'bg-blue-400/15'}`} />
      </div>

      <div className="relative z-10 flex flex-col gap-3 px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 p-1 shadow-glow">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Navigation</div>
              <div className="text-sm font-semibold">Admin Control Bar</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition duration-300 hover:-translate-y-0.5 ${isDark ? 'border-white/10 bg-white/10 hover:bg-white/15' : 'border-slate-200 bg-slate-100 hover:bg-slate-200'}`}
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
                {isDark ? 'Light' : 'Dark'}
              </button>
            )}

            <button
              onClick={onLogout}
              className="rounded-full bg-gradient-blue px-4 py-2 text-xs font-semibold text-white shadow-soft-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-glow"
            >
              Logout
            </button>
          </div>
        </div>

        <div className={`max-w-full flex items-center gap-2 rounded-[22px] border px-2 py-2 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
        <button
          className={`md:hidden p-2 rounded-xl transition ${isDark ? 'bg-white/10 hover:bg-white/15' : 'bg-slate-200 hover:bg-slate-300'}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <MenuIcon size={18} />}
        </button>

        <div className={`flex items-center gap-2 flex-nowrap overflow-x-auto pb-1 scrollbar-thin ${mobileOpen ? 'flex-col absolute left-0 top-full w-full rounded-[24px] border border-white/10 p-3 z-50 shadow-[0_24px_80px_rgba(15,23,42,0.3)] backdrop-blur-2xl' : 'flex-row'} ${isDark ? 'scrollbar-thumb-slate-600 scrollbar-track-slate-900' : 'scrollbar-thumb-slate-300 scrollbar-track-slate-100'} ${isDark ? 'bg-slate-950/95' : 'bg-white/95'}`}>
          {menuOrder.map((key) => {
            const menu = menus[key];
            return (
              <div key={key} className="relative shrink-0" ref={(el) => { refs.current[key] = el; }}>
                {menu.submenu ? (
                  <button
                    onClick={() => toggleMenu(key)}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] sm:text-sm font-semibold transition duration-300 shadow-sm hover:-translate-y-0.5 ${
                      expandedMenu === key
                        ? 'bg-gradient-blue text-white shadow-glow'
                        : isDark
                          ? 'bg-white/10 hover:bg-white/15 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                    }`}
                  >
                    {menu.label}
                    <ChevronDown size={14} className="inline-block ml-1" />
                  </button>
                ) : (
                  <Link
                    to={menu.path}
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-[12px] sm:text-sm font-semibold transition duration-300 hover:-translate-y-0.5 ${isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
                  >
                    {menu.label}
                  </Link>
                )}
              </div>
            );
          })}
          <div className="ml-auto shrink-0" />
        </div>
        </div>
      </div>

      {/* Dropdown rendered into portal to avoid clipping from overflow containers */}
      {expandedMenu && dropdownPos && menus[expandedMenu] && (
        ReactDOM.createPortal(
          <div style={{ position: 'absolute', top: dropdownPos.top + 'px', left: dropdownPos.left + 'px', zIndex: 9999 }}>
            <div className={`min-w-[220px] overflow-hidden rounded-2xl border shadow-[0_20px_60px_rgba(15,23,42,0.18)] ${isDark ? 'border-white/10 bg-slate-950/95 text-white' : 'border-slate-200 bg-white text-slate-900'}`}>
              {menus[expandedMenu].submenu.map((subitem, idx) => (
                <Link
                  key={idx}
                  to={subitem.path}
                  onClick={() => setExpandedMenu(null)}
                  className={`block px-4 py-3 text-[13px] whitespace-nowrap transition ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                >
                  {subitem.label}
                </Link>
              ))}
            </div>
          </div>,
          document.body
        )
      )}
    </div>
  );
};

export default AdminTopBar;
