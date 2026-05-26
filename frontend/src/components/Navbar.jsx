import React from 'react';

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 28px', height: '56px', background: '#FFFFFF',
    borderBottom: '1px solid #E5E3DF', position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  logo:       { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon:   { width: 30, height: 30, background: '#01696f', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 },
  logoText:   { fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '-0.2px', color: '#28251d' },
  logoAccent: { color: '#01696f' },
  tabs:       { display: 'flex', gap: 2, background: '#F0EDE6', borderRadius: 8, padding: 3 },
  userInfo:   { fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#7A7974', display: 'flex', alignItems: 'center', gap: 8 },
  onlineDot:  { width: 7, height: 7, borderRadius: '50%', background: '#437a22' },
  avatar:     { width: 28, height: 28, borderRadius: '50%', background: '#28251d', color: '#fff', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

function NavTab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 18px', borderRadius: 6,
      fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13,
      cursor: 'pointer', border: 'none',
      background: active ? '#FFFFFF' : 'transparent',
      color:      active ? '#28251d' : '#7A7974',
      boxShadow:  active ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
      transition: 'all 0.15s',
    }}>
      {label}
    </button>
  );
}
export default function Navbar({ activeScreen, onNavigate, user, isAdmin, onLogout }) {
  const initial = (user ?? 'A').charAt(0).toUpperCase();

  return (
    <nav style={styles.nav}>

      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>🔧</div>
        <span style={styles.logoText}>
          Tool<span style={styles.logoAccent}>Track</span>
        </span>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <NavTab label="Kiosk" active={activeScreen === 'kiosk'} onClick={() => onNavigate('kiosk')} />
        <NavTab label="Admin" active={activeScreen === 'admin' || activeScreen === 'login'} onClick={() => onNavigate('admin')} />
      </div>

      {/* User info / logout */}
      <div style={styles.userInfo}>
        {isAdmin ? (
          <>
            <div style={styles.onlineDot} />
            {user}
            <div style={styles.avatar}>{initial}</div>
            {/* ✅ Logout button */}
            <button
              onClick={onLogout}
              style={{
                padding: '4px 10px', background: 'transparent',
                border: '1px solid #E5E3DF', borderRadius: 6,
                fontSize: 11, cursor: 'pointer', color: '#7A7974',
                fontFamily: 'inherit',
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => onNavigate('admin')}
            style={{
              padding: '5px 14px', background: '#01696f', border: 'none',
              borderRadius: 6, fontSize: 12, cursor: 'pointer',
              color: '#fff', fontWeight: 600, fontFamily: 'inherit',
            }}
          >
            Admin Login
          </button>
        )}
      </div>
    </nav>
  );
}