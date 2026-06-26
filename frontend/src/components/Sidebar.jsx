import React, { useState } from 'react';
import {
  Home,
  Settings,
  FileText,
  TrendingUp,
  Wallet,
  Users,
  HelpCircle,
  Newspaper,
  MessageSquare,
  Download,
  LogOut,
  ChevronDown,
  BarChart3,
  Zap
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isActive = (path) => location.pathname.includes(path);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    // { icon: TrendingUp, label: 'Investasi', path: '/dashboard/investments' }, // Disembunyikan sementara
    { icon: Wallet, label: 'Deposit', path: '/dashboard/deposit' },
    { icon: BarChart3, label: 'Wallet', path: '/dashboard/wallet' },
    { icon: Zap, label: 'Withdraw', path: '/dashboard/withdraw' },
    {
      icon: Settings,
      label: 'Setting',
      submenu: [
        { label: 'Profil', path: '/dashboard/settings' },
        { label: 'Security', path: '/dashboard/security' }
      ]
    },
    { icon: FileText, label: 'KYC', path: '/dashboard/kyc' },
    { icon: HelpCircle, label: 'FAQ', path: '/dashboard/faq' },
    { icon: Newspaper, label: 'News', path: '/dashboard/news' },
    { icon: MessageSquare, label: 'Testimonial', path: '/dashboard/testimonial' },
    // { icon: Download, label: 'Download', path: '/dashboard/download' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 h-screen w-72 bg-blue-50 dark:bg-dark-950/85 border-r border-gray-200 dark:border-white/10 backdrop-blur-xl overflow-y-auto flex-col z-40">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain drop-shadow-glow" />
            <div>
              <h2 className="font-bold text-dark-900 dark:text-white text-lg leading-tight">Magnet</h2>
              <p className="text-xs text-dark-600 dark:text-white/50">Rezeki Syariah</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 mx-4 my-4 rounded-xl bg-blue-100 dark:bg-dark-900/70 border border-gray-200 dark:border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-blue flex items-center justify-center shadow-glow">
              <span className="text-sm">👤</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark-900 dark:text-white truncate">User</p>
              <p className="text-xs text-dark-600 dark:text-white/50 truncate">Member</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive(item.label)
                        ? 'bg-primary-600 text-white shadow-soft'
                        : 'text-dark-600 dark:text-white/70 hover:bg-white/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${expandedMenus[item.label] ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedMenus[item.label] && (
                    <div className="ml-4 mt-1 space-y-1 animate-fade-in">
                      {item.submenu.map((subitem, subindex) => (
                        <Link
                          key={subindex}
                          to={subitem.path}
                          className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isActive(subitem.path)
                                ? 'bg-primary-600 text-white shadow-soft'
                                : 'text-dark-600 dark:text-white/60 hover:bg-white/5 dark:hover:bg-white/5'
                            }`}>
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive(item.path)
                      ? 'bg-primary-600 text-white shadow-soft'
                      : 'text-dark-600 dark:text-white/70 hover:bg-white/5 dark:hover:bg-white/5'
                  }`}
                >
                  <item.icon size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-fast group"
          >
            <LogOut size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay - handled by mobile menu in TopBar */}
    </>
  );
};

export default Sidebar;
