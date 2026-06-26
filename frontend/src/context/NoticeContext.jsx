import React, { createContext, useContext, useState, useCallback } from 'react';
import AdminNotice from '../components/admin/AdminNotice';

const NoticeContext = createContext();

export const useNotice = () => {
  const context = useContext(NoticeContext);
  if (!context) {
    throw new Error('useNotice must be used within a NoticeProvider');
  }
  return context;
};

export const NoticeProvider = ({ children }) => {
  const [notice, setNotice] = useState({ type: '', text: '' });

  const showNotice = useCallback((text, type = 'info') => {
    setNotice({ text, type });
  }, []);

  const hideNotice = useCallback(() => {
    setNotice({ text: '', type: '' });
  }, []);

  return (
    <NoticeContext.Provider value={{ showNotice, hideNotice }}>
      {children}
      {notice.text && (
        <div className="fixed top-4 right-4 z-[100] w-full max-w-sm pointer-events-none">
          <div className="pointer-events-auto">
            <AdminNotice notice={notice} onClose={hideNotice} />
          </div>
        </div>
      )}
    </NoticeContext.Provider>
  );
};
