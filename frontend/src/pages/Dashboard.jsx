import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { TrendingUp, DollarSign, Zap, AlertCircle, BarChart3 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import api from '../utils/api';
import { PhotoPreviewProvider } from '../context/PhotoPreviewContext';
import GlobalPhotoModal from '../components/GlobalPhotoModal';

import InvestmentPlansPage from './user/InvestmentPlansPage';
import DepositPage from './user/DepositPage';
import WalletPage from './user/WalletPage';
import WithdrawalPage from './user/WithdrawalPage';
import ProfileSettingsPage from './user/ProfileSettingsPage';
import KYCPage from './user/KYCPage';
import FAQPage from './user/FAQPage';
import NewsPage from './user/NewsPage';
import TestimonialPage from './user/TestimonialPage';
import DownloadPage from './user/DownloadPage';
import TradePage from './user/TradePage';
import MarketOverview from '../components/user/MarketOverview';

const DashboardHome = () => {
  const { user, wallet, loading } = useUser();
  const [todayProfit, setTodayProfit] = React.useState(0);

  React.useEffect(() => {
    if (user?.id) {
      api.get(`/api/transactions/${user.id}`)
        .then(res => {
          const today = new Date().toISOString().split('T')[0];
          const profitToday = res.data
            .filter(t => t.type === 'profit' && t.created_at.startsWith(today))
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);
          setTodayProfit(profitToday);
        })
        .catch(err => console.error(err));
    }
  }, [user?.id]);

  if (loading) {
    return <div className="p-8 text-white">Memuat dashboard...</div>;
  }

  const kycStatus = user?.kyc?.status || 'pending';
  const kycLabel = kycStatus === 'verified' ? 'Terverifikasi' : kycStatus === 'rejected' ? 'Ditolak' : 'Belum diverifikasi';
  const kycTone = kycStatus === 'verified' ? 'badge-success' : kycStatus === 'rejected' ? 'badge-danger' : 'badge-warning';

  return (
    <div className="px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-4 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-1 sm:mb-2">Dashboard Anda</h2>
        <p className="text-sm sm:text-base text-dark-600 dark:text-white/60">Kelola dan pantau investasi syariah Anda secara real-time</p>
      </div>

      {/* Alert Banner */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-dark-900/70 border-l-4 border-primary-600 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-dark-900 dark:text-white">Akun siap digunakan</h4>
          <p className="text-sm text-dark-600 dark:text-white/60 mt-1">Pantau saldo dan investasi Anda dari sini.</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="card bg-white border-gray-200 dark:bg-dark-900/70 dark:border-white/10 p-4 sm:p-6 group hover:shadow-soft-xl transition-all duration-200">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-dark-600 dark:text-white/60 mb-1">Saldo Utama</p>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400">Rp {(wallet?.balance || 0).toLocaleString('id-ID')}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card bg-white border-gray-200 dark:bg-dark-900/70 dark:border-white/10 p-4 sm:p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 sm:w-24 sm:h-24 bg-[#12b76a]/10 rounded-full blur-2xl group-hover:bg-[#12b76a]/20 transition-all duration-500"></div>
          <p className="text-xs sm:text-sm font-medium text-dark-600 dark:text-white/60 mb-1 relative z-10">Total Profit</p>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold animate-pulse drop-shadow-[0_2px_8px_rgba(18,183,106,0.3)] relative z-10" style={{ color: '#12b76a' }}>Rp {(wallet?.total_profit || 0).toLocaleString('id-ID')}</h3>
        </div>
        
        <div className="card bg-white border-gray-200 dark:bg-dark-900/70 dark:border-white/10 p-4 sm:p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 sm:w-24 sm:h-24 bg-[#12b76a]/10 rounded-full blur-2xl group-hover:bg-[#12b76a]/20 transition-all duration-500"></div>
          <p className="text-xs sm:text-sm font-medium text-dark-600 dark:text-white/60 mb-1 relative z-10">Profit Hari Ini</p>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold animate-pulse drop-shadow-[0_2px_8px_rgba(18,183,106,0.3)] relative z-10" style={{ color: '#12b76a' }}>Rp {todayProfit.toLocaleString('id-ID')}</h3>
        </div>
      </div>

      {/* Mobile Stats UI (Custom Design) */}
      <div className="md:hidden flex flex-col gap-3">
        <div className="bg-primary-600 rounded-lg p-3 relative overflow-hidden shadow-soft">
          <p className="text-white/90 text-[11px] font-medium mb-2">Saldo Utama</p>
          <div className="bg-[#0a0f1c] rounded-full py-2 px-4 mr-10 relative flex items-center">
            <span className="text-white font-bold text-sm">Rp {(wallet?.balance || 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <DollarSign className="text-white/90" size={24} />
          </div>
        </div>

        <div className="bg-emerald-500 rounded-lg p-3 relative overflow-hidden shadow-soft">
          <p className="text-white/90 text-[11px] font-medium mb-2">Total Profit</p>
          <div className="bg-[#0a0f1c] rounded-full py-2 px-4 mr-10 relative flex items-center">
            <span className="text-emerald-400 font-bold text-sm">Rp {(wallet?.total_profit || 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <TrendingUp className="text-white/90" size={24} />
          </div>
        </div>
        
        <div className="bg-cyan-500 rounded-lg p-3 relative overflow-hidden shadow-soft">
          <p className="text-white/90 text-[11px] font-medium mb-2">Profit Hari Ini</p>
          <div className="bg-[#0a0f1c] rounded-full py-2 px-4 mr-10 relative flex items-center">
            <span className="text-cyan-400 font-bold text-sm">Rp {todayProfit.toLocaleString('id-ID')}</span>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <BarChart3 className="text-white/90" size={24} />
          </div>
        </div>
        
        {/* Bottom Half-Width Cards */}
        <div className="flex gap-3 mt-1">
          <div className="bg-[#0f172a] rounded-lg p-3 relative overflow-hidden flex-1 border border-white/5 shadow-soft">
            <p className="text-white font-bold text-sm mb-0.5 truncate">{kycLabel}</p>
            <p className="text-white/60 text-[10px]">Status KYC</p>
            <div className="absolute -bottom-6 -right-6 w-14 h-14 bg-blue-500 rotate-45 transform opacity-90"></div>
            <div className="absolute bottom-1.5 right-1.5 z-10">
              <AlertCircle className="text-white" size={14} />
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-lg p-3 relative overflow-hidden flex-1 border border-white/5 shadow-soft">
            <p className="text-emerald-400 font-bold text-sm mb-0.5 truncate">{(wallet?.total_profit || 0) > 0 ? 'Aktif' : 'Pasif'}</p>
            <p className="text-white/60 text-[10px]">Status Akun</p>
            <div className="absolute -bottom-6 -right-6 w-14 h-14 bg-emerald-500 rotate-45 transform opacity-90"></div>
            <div className="absolute bottom-1.5 right-1.5 z-10">
              <Zap className="text-white" size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats & Market */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Market Overview (Real-time) */}
        <div className="lg:col-span-2">
          <MarketOverview />
        </div>

        {/* Account Details & Status */}
        <div className="space-y-4 sm:space-y-6">
          <div className="card bg-white border-gray-200 dark:bg-dark-900/70 dark:border-white/10 p-4 sm:p-6">
            <h4 className="text-sm font-medium text-dark-600 dark:text-white/60 mb-3">Detail Saldo</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-500">Tersedia</span>
                <span className="font-bold text-dark-900 dark:text-white">Rp {(wallet?.balance || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-500">Bonus</span>
                <span className="font-bold animate-pulse drop-shadow-[0_2px_5px_rgba(18,183,106,0.2)]" style={{ color: '#12b76a' }}>Rp 0</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-white/5">
                <span className="text-sm font-bold text-dark-900 dark:text-white">Total Profit</span>
                <span className="font-bold animate-pulse drop-shadow-[0_2px_5px_rgba(18,183,106,0.2)]" style={{ color: '#12b76a' }}>Rp {(wallet?.total_profit || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div className="card bg-white border-gray-200 dark:bg-dark-900/70 dark:border-white/10 p-4 sm:p-6">
            <h4 className="text-sm font-medium text-dark-600 dark:text-white/60 mb-3">Status KYC</h4>
            <div className="flex items-center justify-between">
              <span className={`badge ${kycTone} py-1 px-3 sm:py-1.5 sm:px-4 text-[10px] sm:text-xs`}>{kycLabel}</span>
              <Link to="/dashboard/kyc" className="text-[10px] sm:text-xs text-primary-500 hover:underline">Detail</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="card bg-white border-gray-200 dark:bg-dark-900/70 dark:border-white/10 p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-bold text-dark-900 dark:text-white mb-3 sm:mb-4">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            {/* <Link to="/dashboard/investments" className="btn-primary text-sm py-2.5 flex items-center justify-center gap-1">Investasi</Link> */}
            <Link to="/dashboard/deposit" className="btn-secondary text-sm py-2.5 flex items-center justify-center gap-1">Deposit</Link>
            <Link to="/dashboard/wallet" className="btn-secondary text-sm py-2.5 flex items-center justify-center gap-1">Wallet</Link>
            <Link to="/dashboard/withdraw" className="btn-secondary text-sm py-2.5 flex items-center justify-center gap-1">Withdraw</Link>
          </div>
        </div>
        <div className="card bg-white border-gray-200 dark:bg-dark-900/70 dark:border-white/10 p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-bold text-dark-900 dark:text-white mb-3 sm:mb-4">Status Akun</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-dark-600">KYC Status</span>
              <span className={`badge ${kycTone} text-[10px] sm:text-xs py-1 px-3 sm:py-1.5 sm:px-4`}>{kycLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentPage = () => <div className="p-8 text-white">Payment Page</div>;
const PlaceholderPage = ({ title }) => <div className="p-8 text-white">Page {title} coming soon</div>;

const Dashboard = () => {
  const { user, refreshUser } = useUser();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    refreshUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <PhotoPreviewProvider>
      <div className="flex h-screen bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:to-dark-900">
        <Sidebar onLogout={handleLogout} />
        <div className="flex-1 flex flex-col md:ml-72">
          <TopBar user={user} onLogout={handleLogout} />
          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/investments" element={<InvestmentPlansPage />} />
              <Route path="/deposit" element={<DepositPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/withdraw" element={<WithdrawalPage />} />
              <Route path="/settings" element={<ProfileSettingsPage />} />
              <Route path="/profile" element={<ProfileSettingsPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/kyc" element={<KYCPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/testimonial" element={<TestimonialPage />} />
              <Route path="/download" element={<DownloadPage />} />
              <Route path="/trade" element={<TradePage />} />
              <Route path="*" element={<PlaceholderPage title="Page" />} />
            </Routes>
          </div>
        </div>
        <GlobalPhotoModal />
      </div>
    </PhotoPreviewProvider>
  );
};

export default Dashboard;
