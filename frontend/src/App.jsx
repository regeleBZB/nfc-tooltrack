import React, { useState } from 'react';
import Navbar      from './components/Navbar';
import KioskScreen from './pages/KioskScreen';
import AdminScreen from './pages/AdminScreen';

export default function App() {

  const [screen, setScreen] = useState('kiosk');

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3EE', color: '#1A1A18' }}>
      <Navbar
        activeScreen={screen}
        onNavigate={setScreen}
        user="admin@school.edu"
      />
      {screen === 'kiosk' && <KioskScreen />}
      {screen === 'admin' && <AdminScreen />}
    </div>
  );
}
