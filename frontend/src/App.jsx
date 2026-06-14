import React, { useState } from 'react';
import Navbar       from './components/Navbar';
import KioskScreen  from './pages/KioskScreen';
import AdminScreen  from './pages/AdminScreen';
import LoginScreen  from './pages/LoginScreen';
import { setToken, clearToken, getToken } from './api';

export default function App() {
  const [screen,   setScreen]   = useState('kiosk');
  const [isAdmin,  setIsAdmin]  = useState(() => !!getToken());
  const [adminUser, setAdminUser] = useState(() => sessionStorage.getItem('admin_user') || '');

  const handleLogin = (token, username) => {
    setToken(token);
    sessionStorage.setItem('admin_user', username);
    setAdminUser(username);
    setIsAdmin(true);
    setScreen('admin');
  };

  const handleLogout = () => {
    clearToken();
    sessionStorage.removeItem('admin_user');
    setIsAdmin(false);
    setAdminUser('');
    setScreen('kiosk');
  };

  const handleNavigate = (dest) => {
    if (dest === 'admin' && !isAdmin) {
      setScreen('login');
      return;
    }
    setScreen(dest);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3EE', color: '#1A1A18' }}>
      <Navbar
        activeScreen={screen}
        onNavigate={handleNavigate}
        user={isAdmin ? adminUser : null}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      {screen === 'kiosk' && <KioskScreen onNavigate={handleNavigate} />}
      {screen === 'admin' && isAdmin && <AdminScreen onNavigate={handleNavigate} />}
      {screen === 'login' && <LoginScreen onLogin={handleLogin} />}
    </div>
  );
}