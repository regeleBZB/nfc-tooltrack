import React, { useState } from 'react';
import './styles/globals.css';
import Navbar      from './components/Navbar';
import KioskScreen from './pages/KioskScreen';
import AdminScreen from './pages/AdminScreen';

export default function App() {
  const [screen, setScreen] = useState('admin');

  return (
    <>
      <Navbar
        activeScreen={screen}
        onNavigate={setScreen}
        user="admin@school.edu"
      />

      {screen === 'kiosk' && <KioskScreen />}
      {screen === 'admin' && <AdminScreen />}
    </>
  );
}