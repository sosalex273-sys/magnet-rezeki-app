import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState({ balance: 0, virtual_balance: 0, total_profit: 0 });
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    // Ambil token dari localStorage untuk otentikasi
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      // Ambil data terbaru dari backend
      // Kita perlu cara mengambil userId. Biasanya dari decode token atau simpan di localStorage.
      // Karena kita ingin hapus ketergantungan data user di localStorage, kita coba ambil user_id dari data yang tersisa atau backend memberikan endpoint /api/me.
      // Untuk sementara, kita pakai userId dari localStorage yang diset saat login, tapi data di-fetch ulang.
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = savedUser.id;

      if (!userId) {
         setLoading(false);
         return;
      }
      
      const res = await api.get(`/api/users/${userId}`);
      
      setUser(res.data);
      // HAPUS: localStorage.setItem('user', JSON.stringify(res.data)); 
      
      const walletRes = await api.get(`/api/wallet/${userId}`);
      setWallet(walletRes.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user, wallet, loading, refreshUser: fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};
