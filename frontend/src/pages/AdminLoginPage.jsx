import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFA, setTwoFA] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/admin/login', { username, password, twoFA });

      localStorage.setItem('admin_token', response.data.access_token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.admin));

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 py-6" 
         style={{
           backgroundImage: 'url(data:image/svg+xml,%3Csvg width="1366" height="768" xmlns="http://www.w3.org/2000/svg"%3E%3Crect fill="%23333" width="1366" height="768"/%3E%3C/svg%3E)',
           backgroundColor: '#1a1a1a'
         }}>
      
      <div className="bg-gray-600/50 rounded-2xl border-2 border-gray-400 p-6 sm:p-10 w-full max-w-md backdrop-blur-sm">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-wider">
            <span className="font-light">OCTA</span>
            <span className="text-cyan-400">FX</span>
          </h1>
          <p className="text-gray-300 text-sm mt-3 sm:mt-4 font-semibold">Login Administrator</p>
        </div>

        {error && (
          <div className="bg-red-500/30 border border-red-500 text-red-200 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-300 text-gray-900 px-4 py-3 rounded-xl placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              required
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Kata Sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-300 text-gray-900 px-4 py-3 rounded-xl placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-600"
            >
              👁️
            </button>
          </div>

          <div>
            <input
              type="text"
              placeholder="2FA Goggle Authenticator Code"
              value={twoFA}
              onChange={(e) => setTwoFA(e.target.value)}
              className="w-full bg-gray-300 text-gray-900 px-4 py-3 rounded-xl placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-5 sm:mt-6">
          <a href="#" className="text-gray-300 hover:text-white text-sm">
            Forgot password?
          </a>
        </div>

        <div className="text-center mt-5 sm:mt-6 text-gray-400 text-[11px] sm:text-xs">
          Copyright © 2026 Magne-Rezeki-Syariah-manajemen.com, All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
