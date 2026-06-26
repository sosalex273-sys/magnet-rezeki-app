import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import api from '../utils/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      {/* Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Card Container */}
        <div className="animate-fade-in-down">
          {/* Header Section */}
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-32 h-32 mb-4">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-glow" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Selamat Datang
            </h1>
            <p className="text-slate-400 text-base">
              Kelola investasi syariah Anda dengan percaya diri
            </p>
          </div>

          {/* Form Card */}
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl border border-slate-700/50 p-6 md:p-8 shadow-2xl transition-colors duration-300">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 animate-fade-in">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="anda@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-400 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 cursor-pointer accent-primary-500"
                  />
                  <span className="text-slate-300 group-hover:text-white transition-colors">
                    Ingat saya
                  </span>
                </label>
                <Link
                  to="#"
                  className="text-slate-400 hover:text-primary-400 transition-colors"
                >
                  Lupa password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl group flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sedang login...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Login Sekarang</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-700"></div>
              <span className="text-slate-500 text-xs font-medium">Atau</span>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
            </div>

            {/* Register Link */}
            <Link
              to="/register"
              className="w-full px-4 py-3 rounded-lg border border-slate-600 hover:border-primary-500 bg-slate-800/30 hover:bg-slate-800/60 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Buat Akun Baru</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center text-slate-400 text-xs">
            <p>
              Dengan login, Anda menyetujui{' '}
              <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors underline">
                Syarat & Ketentuan
              </a>{' '}
              kami
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
