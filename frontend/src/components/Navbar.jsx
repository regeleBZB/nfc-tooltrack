import React from 'react';

// ✅ FIXED: All dark/gold CSS variables replaced with light theme tokens
// that match KioskScreen's existing white palette (#F5F3EE, #01696f, #28251d)

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    height: '56px',
    // ✅ FIXED: was dark-blue gradient → now clean white surface
    background: '#FFFFFF',
    borderBottom: '1px solid #E5E3DF',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },

  logoIcon: {
    width: '30px',
    height: '30px',
    // ✅ FIXED: uses teal accent from KioskScreen (#01696f)
    background: '#01696f',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    flexShrink: 0,
  },

  logoText: {
    // ✅ FIXED: was gold Rajdhani → now dark ink matching KioskScreen headings
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: '15px',
    letterSpacing: '-0.2px',
    color: '#28251d',
  },

  logoAccent: {
    color: '#01696f',
  },

  tabs: {
    display: 'flex',
    gap: '2px',
    background: '#F0EDE6',
    borderRadius: '8px',
    padding: '3px',
  },

  userInfo: {
    // ✅ FIXED: was Space Mono muted → now Inter, matches KioskScreen body text
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: '#7A7974',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  onlineDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#437a22',
    // ✅ FIXED: kept green dot for "online" status, matches KioskScreen NFC pill
  },

  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#28251d',
    color: '#fff',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

function NavTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 18px',
        borderRadius: '6px',
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        fontSize: '13px',
        letterSpacing: '0',
        cursor: 'pointer',
        border: 'none',
        // ✅ FIXED: active tab = white card lifted on light gray rail
        // was gold glow on dark background
        background: active ? '#FFFFFF' : 'transparent',
        color: active ? '#28251d' : '#7A7974',
        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

export default function Navbar({ activeScreen, onNavigate, user }) {
  // Derive avatar initial from user email
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

      {/* Navigation tabs */}
      <div style={styles.tabs}>
        <NavTab
          label="Kiosk"
          active={activeScreen === 'kiosk'}
          onClick={() => onNavigate('kiosk')}
        />
        <NavTab
          label="Admin"
          active={activeScreen === 'admin'}
          onClick={() => onNavigate('admin')}
        />
      </div>

      {/* User info */}
      <div style={styles.userInfo}>
        <div style={styles.onlineDot} />
        {user ?? 'admin@school.edu'}
        <div style={styles.avatar}>{initial}</div>
      </div>

    </nav>
  );
}
