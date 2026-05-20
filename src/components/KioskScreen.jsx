import React, { useState, useEffect } from 'react';

/* ─── Responsive CSS injected once into <head> ────────────────────────────── */
const KIOSK_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');

  /* ── Base (mobile-first: 320px+) ─────────────────── */
  .kiosk-page {
    min-height: calc(100vh - 56px);
    background: radial-gradient(ellipse at 50% 0%, rgba(11,26,53,0.85) 0%, #040400 60%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 16px 40px;
    gap: 20px;
    overflow-x: hidden;
  }

  .kiosk-left {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
  }

  .kiosk-body {
    width: 100%;
    max-width: 520px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Title */
  .kiosk-title {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    background: linear-gradient(135deg, #BEB700, #fff8a0, #989200);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-align: center;
    font-size: clamp(22px, 6vw, 64px);
    line-height: 1.1;
    margin: 0;
  }
  .kiosk-subtitle {
    color: #8A8460;
    letter-spacing: 2px;
    text-align: center;
    margin-top: 6px;
    font-size: clamp(10px, 2vw, 18px);
    font-family: 'DM Sans', sans-serif;
  }

  /* Mode toggle */
  .mode-toggle {
    display: flex;
    border: 1px solid rgba(190,183,0,0.3);
    border-radius: 10px;
    overflow: hidden;
    width: 100%;
    max-width: 360px;
  }
  .mode-btn {
    flex: 1;
    padding: clamp(10px, 2vw, 20px) 0;
    cursor: pointer;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    font-size: clamp(13px, 2.2vw, 22px);
    letter-spacing: 2px;
    text-transform: uppercase;
    border: none;
    transition: all 0.2s;
  }
  .mode-btn.active   { background: #BEB700; color: #040400; }
  .mode-btn.inactive { background: transparent; color: #8A8460; }

  /* NFC Zone */
  .nfc-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .nfc-zone {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width:  clamp(140px, 28vw, 280px);
    height: clamp(140px, 28vw, 280px);
  }
  .nfc-ring {
    position: absolute;
    border-radius: 50%;
    animation: nfcExpand 2.5s ease-out infinite;
  }
  .nfc-ring-1 { width:100%;  height:100%;  animation-delay:0s;   }
  .nfc-ring-2 { width:77%;   height:77%;   animation-delay:0.5s; }
  .nfc-ring-3 { width:55%;   height:55%;   animation-delay:1s;   }
  .nfc-core {
    position: relative;
    z-index: 2;
    width: 44%; height: 44%;
    border-radius: 50%;
    border: 2px solid #BEB700;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: clamp(20px, 4.5vw, 48px);
    transition: all 0.3s;
    box-shadow: 0 0 24px rgba(190,183,0,0.2), inset 0 0 20px rgba(11,26,53,0.8);
  }
  .nfc-label {
    font-family: 'Space Mono', monospace;
    font-size: clamp(9px, 1.4vw, 14px);
    letter-spacing: 2px;
    text-align: center;
    transition: color 0.3s;
  }
  .nfc-hint {
    font-size: clamp(8px, 1vw, 12px);
    color: rgba(138,132,96,0.6);
    font-style: italic;
    text-align: center;
  }

  /* Form card */
  .kiosk-form {
    width: 100%;
    background: linear-gradient(135deg, rgba(11,26,53,0.6), rgba(46,44,0,0.4));
    border: 1px solid rgba(190,183,0,0.3);
    border-radius: 14px;
    padding: clamp(16px, 3vw, 32px);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .form-row {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .form-group  { display: flex; flex-direction: column; gap: 6px; flex: 1; }
  .form-label  {
    font-family: 'Space Mono', monospace;
    font-size: clamp(9px, 1.1vw, 12px);
    letter-spacing: 2px;
    color: #8A8460;
    text-transform: uppercase;
  }
  .form-input {
    width: 100%;
    padding: clamp(10px, 1.8vw, 18px) clamp(12px, 2vw, 20px);
    background: rgba(0,0,0,0.4);
    border: 1px solid rgba(190,183,0,0.2);
    border-radius: 8px;
    color: #F5F0C0;
    font-family: 'Space Mono', monospace;
    font-size: clamp(12px, 1.8vw, 18px);
    outline: none;
    transition: border 0.2s, box-shadow 0.2s;
  }
  .form-input:focus {
    border-color: #BEB700;
    box-shadow: 0 0 0 3px rgba(190,183,0,0.12);
  }
  .form-input::placeholder { color: #8A8460; }

  /* Cart */
  .kiosk-cart {
    width: 100%;
    background: rgba(11,26,53,0.4);
    border: 1px solid rgba(26,58,107,0.5);
    border-radius: 14px;
    padding: clamp(14px, 2.5vw, 28px);
  }
  .cart-header {
    font-family: 'Rajdhani', sans-serif;
    font-size: clamp(12px, 1.6vw, 17px);
    font-weight: 700;
    letter-spacing: 2px;
    color: #93c5fd;
    text-transform: uppercase;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cart-badge {
    background: rgba(26,58,107,0.5);
    border: 1px solid rgba(59,130,246,0.3);
    border-radius: 20px;
    padding: 1px 9px;
    font-size: clamp(9px, 1.1vw, 12px);
    color: #93c5fd;
    font-family: 'Space Mono', monospace;
  }
  .cart-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: clamp(8px, 1.5vw, 16px) 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    gap: 10px;
    animation: fadeInUp 0.3s ease both;
  }
  .cart-item:last-child { border-bottom: none; }
  .cart-item-name {
    font-size: clamp(13px, 2vw, 20px);
    color: #F5F0C0;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
  }
  .cart-item-tag {
    font-family: 'Space Mono', monospace;
    font-size: clamp(9px, 1.1vw, 12px);
    color: #8A8460;
    margin-top: 2px;
  }
  .cart-remove {
    flex-shrink: 0;
    width:  clamp(28px, 4vw, 42px);
    height: clamp(28px, 4vw, 42px);
    border-radius: 6px;
    background: rgba(200,50,50,0.15);
    border: 1px solid rgba(200,50,50,0.3);
    color: #f87171;
    font-size: clamp(16px, 2.5vw, 26px);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  .cart-remove:hover { background: rgba(200,50,50,0.3); }
  .cart-empty {
    text-align: center;
    color: #8A8460;
    font-family: 'Space Mono', monospace;
    font-size: clamp(10px, 1.3vw, 14px);
    padding: clamp(12px, 2vw, 24px) 0;
  }

  /* Confirm button */
  .confirm-btn {
    width: 100%;
    padding: clamp(14px, 2.5vw, 24px);
    background: linear-gradient(135deg, #989200, #BEB700);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    font-size: clamp(14px, 2.4vw, 24px);
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #040400;
    box-shadow: 0 4px 20px rgba(190,183,0,0.2);
    transition: all 0.2s;
  }
  .confirm-btn:hover  { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(190,183,0,0.38); }
  .confirm-btn:active { transform: translateY(0); }

  /* Success screen */
  .kiosk-success {
    min-height: calc(100vh - 56px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 40px 24px;
    background: radial-gradient(ellipse at 50% 40%, rgba(11,26,53,0.9) 0%, #040400 70%);
    animation: fadeInUp 0.4s ease;
    text-align: center;
  }
  .success-icon  { font-size: clamp(56px, 12vw, 140px); }
  .success-title {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    letter-spacing: 4px;
    text-transform: uppercase;
    background: linear-gradient(135deg, #BEB700, #fff8a0, #989200);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: clamp(26px, 6vw, 72px);
    margin: 0;
  }
  .success-sub {
    color: #8A8460;
    font-size: clamp(11px, 2vw, 20px);
    letter-spacing: 2px;
    font-family: 'DM Sans', sans-serif;
  }
  .success-receipt {
    border: 1px solid rgba(190,183,0,0.3);
    border-radius: 14px;
    padding: clamp(16px, 3vw, 32px) clamp(20px, 4vw, 48px);
    background: rgba(11,26,53,0.4);
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 520px;
    width: 100%;
  }
  .receipt-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: clamp(12px, 1.6vw, 18px);
    color: #F5F0C0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding-bottom: 8px;
    gap: 16px;
    font-family: 'DM Sans', sans-serif;
  }
  .receipt-row:last-child { border-bottom: none; padding-bottom: 0; }
  .receipt-lbl {
    color: #8A8460;
    font-family: 'Space Mono', monospace;
    font-size: clamp(9px, 1.1vw, 12px);
    letter-spacing: 1px;
    flex-shrink: 0;
  }

  /* ── Tablet portrait (600px+) ─────────────────────── */
  @media (min-width: 600px) {
    .kiosk-page   { padding: 32px 32px 48px; gap: 24px; }
    .kiosk-body   { max-width: 580px; }
    .form-row     { flex-direction: row; }
  }

  /* ── Large tablet / vertical kiosk (900px+) ──────── */
  @media (min-width: 900px) {
    .kiosk-page   { padding: 40px 48px 60px; gap: 28px; }
    .kiosk-body   { max-width: 680px; }
    .mode-toggle  { max-width: 440px; }
  }

  /* ── Big-screen kiosk landscape (1200px+) ────────── */
  /* Like Jollibee / McD / KFC self-order terminals      */
  @media (min-width: 1200px) {
    .kiosk-page {
      flex-direction: row;
      align-items: flex-start;
      justify-content: center;
      padding: 56px 72px;
      gap: 64px;
      min-height: 100vh;
    }
    .kiosk-left {
      flex: 0 0 380px;
      position: sticky;
      top: 80px;
    }
    .kiosk-body {
      flex: 1;
      max-width: 580px;
    }
    .mode-toggle { max-width: 100%; }
  }

  /* ── 55"+ display wall / signage (1600px+) ────────── */
  @media (min-width: 1600px) {
    .kiosk-page   { gap: 96px; padding: 72px 100px; }
    .kiosk-left   { flex: 0 0 520px; }
    .kiosk-body   { max-width: 680px; }
    .kiosk-form,
    .kiosk-cart   { border-radius: 20px; }
    .confirm-btn  { border-radius: 16px; }
    .mode-toggle  { border-radius: 14px; }
  }
`;

function injectCSS(id, css) {
  if (document.getElementById(id)) return;
  const el = document.createElement('style');
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

/* ─── NFC Zone ────────────────────────────────────────────────────────────── */
function NFCZone({ status, onSimulate }) {
  const ringColor = {
    idle:     'rgba(190,183,0,0.3)',
    scanning: 'rgba(190,183,0,0.65)',
    success:  'rgba(74,222,128,0.55)',
    error:    'rgba(248,113,113,0.55)',
  }[status];

  const coreStyle = {
    background: {
      idle:     'linear-gradient(135deg,#0B1A35,#1A3A6B)',
      scanning: 'linear-gradient(135deg,#2E2C00,#989200)',
      success:  'linear-gradient(135deg,#052e16,#166534)',
      error:    'linear-gradient(135deg,#450a0a,#991b1b)',
    }[status],
  };

  const emoji = status === 'success' ? '✓' : status === 'error' ? '✗' : '📡';
  const label = { idle:'TAP TOOL TAG TO SCAN', scanning:'SCANNING...', success:'TAG DETECTED ✓', error:'ERROR — TRY AGAIN' }[status];
  const labelColor = status === 'success' ? '#4ade80' : status === 'error' ? '#f87171' : '#8A8460';

  return (
    <div className="nfc-wrapper">
      <div className="nfc-zone" onClick={onSimulate} title="Tap NFC tag here">
        {['nfc-ring-1','nfc-ring-2','nfc-ring-3'].map(cls => (
          <div key={cls} className={`nfc-ring ${cls}`} style={{ border:`1px solid ${ringColor}` }} />
        ))}
        <div className="nfc-core" style={coreStyle}>{emoji}</div>
      </div>
      <p className="nfc-label" style={{ color: labelColor }}>{label}</p>
      <p className="nfc-hint">Click ring to simulate · Web NFC API in production</p>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */
const TOOL_NAMES = ['Digital Multimeter','Oscilloscope Probe','Breadboard Kit','DC Power Supply','Function Generator','Soldering Iron','LCR Meter','Logic Analyzer'];

export default function KioskScreen() {
  const [mode,      setMode]      = useState('borrow');
  const [studentId, setStudentId] = useState('');
  const [section,   setSection]   = useState('');
  const [cart,      setCart]      = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [nfcStatus, setNfcStatus] = useState('idle');

  useEffect(() => { injectCSS('kiosk-css', KIOSK_CSS); }, []);

  const simulateScan = () => {
    if (nfcStatus === 'scanning') return;
    setNfcStatus('scanning');
    setTimeout(() => {
      const mock = {
        tagId:    'NFC-' + Math.random().toString(16).slice(2,6).toUpperCase(),
        toolId:   'TOOL-' + String(Math.floor(Math.random()*100)).padStart(3,'0'),
        toolName: TOOL_NAMES[Math.floor(Math.random() * TOOL_NAMES.length)],
      };
      setCart(prev => prev.find(t => t.tagId === mock.tagId) ? prev : [...prev, mock]);
      setNfcStatus('success');
      setTimeout(() => setNfcStatus('idle'), 1200);
    }, 900);
  };

  const removeItem = (tagId) => setCart(prev => prev.filter(t => t.tagId !== tagId));

  const handleConfirm = () => {
    if (!studentId.trim()) { alert('Please enter your Student ID.'); return; }
    if (!cart.length)       { alert('No tools scanned yet.'); return; }
    setConfirmed(true);
    // TODO: await fetch('/api/borrows', { method:'POST', body: JSON.stringify({studentId,section,cart,mode}) })
    setTimeout(() => { setConfirmed(false); setCart([]); setStudentId(''); setSection(''); }, 4000);
  };

  /* ── Success ── */
  if (confirmed) {
    return (
      <div className="kiosk-success">
        <div className="success-icon">{mode === 'borrow' ? '✅' : '🔄'}</div>
        <h2 className="success-title">{mode === 'borrow' ? 'Borrow Confirmed!' : 'Return Confirmed!'}</h2>
        <p className="success-sub">Receipt logged · Returning to kiosk shortly...</p>
        <div className="success-receipt">
          <div className="receipt-row"><span className="receipt-lbl">STUDENT</span><span>{studentId}</span></div>
          {section && <div className="receipt-row"><span className="receipt-lbl">SECTION</span><span>{section}</span></div>}
          {cart.map(t => (
            <div className="receipt-row" key={t.tagId}>
              <span className="receipt-lbl">{t.tagId}</span><span>{t.toolName}</span>
            </div>
          ))}
          <div className="receipt-row"><span className="receipt-lbl">TIME</span><span>{new Date().toLocaleTimeString()}</span></div>
        </div>
      </div>
    );
  }

  /* ── Kiosk ── */
  return (
    <div className="kiosk-page">

      {/* Left panel: branding + NFC + mode */}
      <div className="kiosk-left">
        <div>
          <h1 className="kiosk-title">Tool Borrowing Kiosk</h1>
          <p className="kiosk-subtitle">Electronics &amp; Instrumentation Lab · EIL-302</p>
        </div>

        <NFCZone status={nfcStatus} onSimulate={simulateScan} />

        <div className="mode-toggle">
          {['borrow','return'].map(m => (
            <button
              key={m}
              className={`mode-btn ${mode === m ? 'active' : 'inactive'}`}
              onClick={() => setMode(m)}
            >
              {m === 'borrow' ? '📥 Borrow' : '📤 Return'}
            </button>
          ))}
        </div>
      </div>

      {/* Right panel: form + cart + confirm */}
      <div className="kiosk-body">

        <div className="kiosk-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Student ID</label>
              <input className="form-input" placeholder="e.g. 2024-00123" value={studentId} onChange={e => setStudentId(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Subject / Section</label>
              <input className="form-input" placeholder="e.g. EE301 - 3A" value={section} onChange={e => setSection(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="kiosk-cart">
          <div className="cart-header">
            📦 Scanned Tools <span className="cart-badge">{cart.length}</span>
          </div>
          {cart.length === 0
            ? <div className="cart-empty">No tools scanned yet — tap a tag above</div>
            : cart.map(tool => (
                <div className="cart-item" key={tool.tagId}>
                  <div>
                    <div className="cart-item-name">{tool.toolName}</div>
                    <div className="cart-item-tag">TAG: {tool.tagId} · {tool.toolId}</div>
                  </div>
                  <button className="cart-remove" onClick={() => removeItem(tool.tagId)}>×</button>
                </div>
              ))
          }
        </div>

        <button className="confirm-btn" onClick={handleConfirm}>
          {mode === 'borrow' ? '✅ Confirm Borrow & Print Receipt' : '🔄 Confirm Return'}
        </button>
      </div>
    </div>
  );
}