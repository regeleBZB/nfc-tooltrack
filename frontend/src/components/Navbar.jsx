import React from 'react';

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: '56px',
    background: 'linear-gradient(90deg, var(--dark-blue), var(--dark-khaki))',
    borderBottom: '1px solid var(--gold-border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 700,
    fontSize: '18px',
    letterSpacing: '3px',
    color: 'var(--old-gold)',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--old-gold)',
    boxShadow: '0 0 8px var(--old-gold)',
    animation: 'pulse 2s infinite',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
  },
  userInfo: {
    fontFamily: "'Space Mono', monospace",
    fontSize: '11px',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  onlineDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#4CAF50',
    boxShadow: '0 0 6px #4CAF50',
  },
};

function NavTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 20px',
        borderRadius: '4px',
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 600,
        fontSize: '13px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        cursor: 'pointer',
        border: active ? '1px solid var(--gold-border)' : '1px solid transparent',
        background: active ? 'var(--gold-glow)' : 'transparent',
        color: active ? 'var(--old-gold)' : 'var(--text-muted)',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );
}

export default function Navbar({ activeScreen, onNavigate, user }) {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <div style={styles.logoDot} />
        ToolTrack NFC
      </div>

      <div style={styles.tabs}>
        <NavTab label="Kiosk"     active={activeScreen === 'kiosk'}     onClick={() => onNavigate('kiosk')} />
        <NavTab label="Admin"     active={activeScreen === 'admin'}     onClick={() => onNavigate('admin')} />
        <NavTab label="Dashboard" active={activeScreen === 'dashboard'} onClick={() => onNavigate('dashboard')} />
      </div>

      <div style={styles.userInfo}>
        <div style={styles.onlineDot} />
        {user ?? 'admin@school.edu'}
      </div>
    </nav>
  );
}
