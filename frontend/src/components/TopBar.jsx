import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, Bell, Menu, X, ChevronDown, Sun, Moon, Home, TrendingUp, Wallet, BarChart3, Zap, FileText, HelpCircle, Newspaper, MessageSquare, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

const TopBar = ({ user: propUser, onLogout }) => {
  const { user, wallet } = useUser();
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const userName = user?.name || propUser?.name || 'User';
  const userEmail = user?.email || propUser?.email || 'user@example.com';

  return (
    <>
      {/* Desktop TopBar */}
      <div className="hidden md:flex h-20 bg-blue-50 dark:bg-dark-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 px-8 items-center justify-between sticky top-0 z-30">
        {/* Left Side - Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
            Welcome back, <span className="text-gradient">{userName.split(' ')[0]}</span>
          </h1>
          <p className="text-sm text-dark-600 dark:text-white/60 mt-0.5">Kelola investasi syariah Anda</p>
        </div>

        {/* Right Side - Balance & Actions */}
        <div className="flex items-center gap-6">
          {/* Balance Card */}
          <div className="px-4 py-2 rounded-lg bg-blue-100 dark:bg-dark-900/70 border border-gray-200 dark:border-white/10 backdrop-blur-sm hover:bg-blue-200 dark:hover:bg-dark-800/80 transition-all duration-200">
            <div className="flex items-center gap-2">
              <span className="text-dark-600 dark:text-white/60 text-sm">Saldo Utama</span>
              <span className="text-dark-900 dark:text-white font-semibold">
                Rp {(wallet?.balance || 0).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-lg bg-blue-100 dark:bg-dark-900/70 border border-gray-200 dark:border-white/10 text-dark-600 dark:text-white/70 hover:text-dark-900 dark:hover:text-white hover:bg-blue-200 dark:hover:bg-dark-800/80 transition-all duration-200 group relative"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun size={20} className="group-hover:scale-110 transition-transform" />
            ) : (
              <Moon size={20} className="group-hover:scale-110 transition-transform" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2.5 rounded-lg bg-blue-100 dark:bg-dark-900/70 border border-gray-200 dark:border-white/10 text-dark-600 dark:text-white/70 hover:text-dark-900 dark:hover:text-white hover:bg-blue-200 dark:hover:bg-dark-800/80 transition-all duration-200 group relative">
            <Bell size={20} className="group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent-cyan rounded-full animate-pulse"></span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-white/10"></div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 dark:bg-dark-900/70 border border-gray-200 dark:border-white/10 hover:bg-blue-200 dark:hover:bg-dark-800/80 transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-blue flex items-center justify-center shadow-soft overflow-hidden">
                {user?.avatar_url || user?.avatar ? (
                  <img src={user.avatar_url || user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User size={16} className="text-white" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-dark-900 dark:text-white">{userName}</p>
                <p className="text-xs text-dark-600 dark:text-white/50">Member</p>
              </div>
              <ChevronDown
                size={16}
                className={`text-dark-600 dark:text-white/50 transition-transform duration-fast ${showProfile ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white border-gray-200 dark:bg-dark-900/95 dark:border-white/10 rounded-lg shadow-soft-xl backdrop-blur-xl overflow-hidden animate-fade-in z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10">
                  <p className="text-sm font-semibold text-dark-900 dark:text-white">{userName}</p>
                  <p className="text-xs text-dark-600 dark:text-white/60">{userEmail}</p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button onClick={() => { navigate('/dashboard/profile'); setShowProfile(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-dark-600 dark:text-white/70 hover:text-dark-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-fast group">
                    <User size={18} className="group-hover:text-gradient transition-colors" />
                    <span className="text-sm font-medium">My Profile</span>
                  </button>
                  <button onClick={() => { navigate('/dashboard/settings?tab=password'); setShowProfile(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-dark-600 dark:text-white/70 hover:text-dark-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-fast group">
                    <Settings size={18} className="group-hover:text-gradient transition-colors" />
                    <span className="text-sm font-medium">Settings (Password)</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 dark:border-white/10 p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-fast group"
                  >
                    <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile TopBar */}
      <div className="md:hidden flex h-14 bg-blue-50 dark:bg-dark-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 px-3 items-center justify-between sticky top-0 z-30">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain shrink-0" />
          <div className="leading-tight min-w-0">
            <p className="text-[11px] font-bold text-dark-900 dark:text-white truncate">Magnet</p>
            <p className="text-[10px] text-dark-600 dark:text-white/50 truncate">Rezeki</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-blue-100 dark:bg-dark-900/70 text-dark-600 dark:text-white/70 hover:bg-blue-200 dark:hover:bg-dark-800/80 transition-all"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="p-1.5 rounded-lg bg-blue-100 dark:bg-dark-900/70 text-dark-600 dark:text-white/70 hover:bg-blue-200 dark:hover:bg-dark-800/80 transition-all">
            <Bell size={16} />
          </button>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-1.5 rounded-lg bg-blue-100 dark:bg-dark-900/70 text-dark-600 dark:text-white/70 hover:bg-blue-200 dark:hover:bg-dark-800/80 transition-all"
          >
            {showMobileMenu ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-blue-50 dark:bg-dark-950/85 border-r border-gray-200 dark:border-white/10 backdrop-blur-xl overflow-y-auto flex flex-col z-50 p-3">
            <div className="mb-3 flex items-center justify-between">
              {/* User Profile Info in Mobile Menu */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-blue flex items-center justify-center shadow-soft overflow-hidden">
                  {user?.avatar_url || user?.avatar ? (
                    <img src={user.avatar_url || user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User size={20} className="text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-dark-900 dark:text-white text-sm truncate">{user?.name || 'User'}</h2>
                  <p className="text-[11px] text-dark-600 dark:text-white/50 truncate">Member</p>
                </div>
              </div>
              <button onClick={() => setShowMobileMenu(false)} className="p-1.5 rounded-md">
                <X size={16} />
              </button>
            </div>

            <nav className="space-y-1">
              <Link to="/dashboard" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-600 dark:text-white/70 hover:bg-white/5 dark:hover:bg-white/5">
                <Home size={16} /> <span>Dashboard</span>
              </Link>
              {/* <Link to="/dashboard/investments" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-600 dark:text-white/70 hover:bg-white/5 dark:hover:bg-white/5">
                <TrendingUp size={16} /> <span>Investasi</span>
              </Link> */}
              <Link to="/dashboard/deposit" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-600 dark:text-white/70 hover:bg-white/5 dark:hover:bg-white/5">
                <Wallet size={16} /> <span>Deposit</span>
              </Link>
              <Link to="/dashboard/wallet" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-600 dark:text-white/70 hover:bg-white/5 dark:hover:bg-white/5">
                <BarChart3 size={16} /> <span>Wallet</span>
              </Link>
              <Link to="/dashboard/withdraw" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-600 dark:text-white/70 hover:bg-white/5 dark:hover:bg-white/5">
                <Zap size={16} /> <span>Withdraw</span>
              </Link>
              <Link to="/dashboard/kyc" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-600 dark:text-white/70 hover:bg-white/5 dark:hover:bg-white/5">
                <FileText size={16} /> <span>KYC</span>
              </Link>
              <Link to="/dashboard/settings?tab=password" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-600 dark:text-white/70 hover:bg-white/5 dark:hover:bg-white/5">
                <Settings size={16} /> <span>Settings</span>
              </Link>
              <Link to="/dashboard/profile" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-600 dark:text-white/70 hover:bg-white/5 dark:hover:bg-white/5">
                <User size={16} /> <span>Profile</span>
              </Link>
              <Link to="/dashboard/faq" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-600 dark:text-white/70 hover:bg-white/5 dark:hover:bg-white/5">
                <HelpCircle size={16} /> <span>FAQ</span>
              </Link>
              <Link to="/dashboard/news" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-600 dark:text-white/70 hover:bg-white/5 dark:hover:bg-white/5">
                <Newspaper size={16} /> <span>News</span>
              </Link>
              <Link to="/dashboard/testimonial" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-600 dark:text-white/70 hover:bg-white/5 dark:hover:bg-white/5">
                <MessageSquare size={16} /> <span>Testimonial</span>
              </Link>
              {/* <Link to="/dashboard/download" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-600 dark:text-white/70 hover:bg-white/5 dark:hover:bg-white/5">
                <Download size={16} /> <span>Download</span>
              </Link> */}
            </nav>

            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/10">
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-500/10 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
