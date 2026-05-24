import { useEffect, useRef, useState } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const DEBOUNCE_MS     = 150;   // ms to wait after last keydown before firing
const MIN_UID_LENGTH  = 4;     // minimum UID length to be considered valid

/**
 * NFCScanner — listens for USB HID reader input (keyboard-emulation mode).
 *
 * Backend alignment:
 *   GET /api/tools/uid/{uid}
 *   → Returns ApiResponse<ToolResponse>
 *   → { success: true, data: { id, toolCode, name, category, status, tagUid, purchasePrice } }
 *
 * Props:
 *   onScan(tool)  — called with the full ToolResponse.data object on success
 *   active        — boolean; when false, scanner stops listening (e.g. during name input step)
 */
export default function NFCScanner({ onScan, active = true }) {
  const [status, setStatus] = useState('idle'); // idle | scanning | success | error
  const bufferRef = useRef('');
  const timerRef  = useRef(null);

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e) => {
      // USB HID readers send Enter when the full UID has been transmitted
      if (e.key === 'Enter') {
        const uid = bufferRef.current.trim().toUpperCase();
        if (uid.length >= MIN_UID_LENGTH) fireScanned(uid);
        bufferRef.current = '';
        clearTimeout(timerRef.current);
        return;
      }

      // Accumulate printable characters
      if (e.key.length === 1) bufferRef.current += e.key;

      // Debounce fallback — some readers don't send Enter
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const uid = bufferRef.current.trim().toUpperCase();
        if (uid.length >= MIN_UID_LENGTH) fireScanned(uid);
        bufferRef.current = '';
      }, DEBOUNCE_MS);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timerRef.current);
    };
  }, [active]);

  /**
   * Hit the backend, parse the ApiResponse<ToolResponse> envelope,
   * and pass data up to KioskScreen via onScan().
   *
   * ✅ FIXED: now correctly unwraps data.data (ApiResponse envelope)
   * ✅ FIXED: checks data.success before treating as valid tool
   */
  const fireScanned = async (uid) => {
    setStatus('scanning');
    try {
      const res  = await fetch(`/api/tools/uid/${uid}`);
      const body = await res.json(); // ApiResponse<ToolResponse>

      if (!res.ok || !body.success) {
        throw new Error(body.message || 'Unknown tag');
      }

      // body.data is the ToolResponse object
      const tool = body.data;

      // Guard: don't add borrowed/maintenance tools to cart
      if (tool.status === 'BORROWED') {
        throw new Error(`${tool.name} is already borrowed`);
      }
      if (tool.status === 'MAINTENANCE') {
        throw new Error(`${tool.name} is under maintenance`);
      }

      onScan(tool);   // passes ToolResponse up to KioskScreen cart
      setStatus('success');
    } catch (err) {
      console.warn('NFC scan error:', err.message);
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 1500);
    }
  };

  // ✅ FIXED: all colors now use light theme palette matching KioskScreen
  const ringColor = {
    idle:     '#E5E3DF',
    scanning: 'rgba(1,105,111,0.35)',
    success:  'rgba(67,122,34,0.35)',
    error:    'rgba(192,57,43,0.35)',
  }[status];

  const coreStyle = {
    idle: {
      background: '#FFFFFF',
      border: '2px solid #01696f',
      boxShadow: '0 0 0 4px rgba(1,105,111,0.08)',
    },
    scanning: {
      background: 'rgba(1,105,111,0.08)',
      border: '2px solid #01696f',
      boxShadow: '0 0 16px rgba(1,105,111,0.20)',
    },
    success: {
      background: 'rgba(67,122,34,0.10)',
      border: '2px solid #437a22',
      boxShadow: '0 0 16px rgba(67,122,34,0.20)',
    },
    error: {
      background: 'rgba(192,57,43,0.08)',
      border: '2px solid #C0392B',
      boxShadow: '0 0 16px rgba(192,57,43,0.15)',
    },
  }[status];

  const labelColor = {
    idle:     '#7A7974',
    scanning: '#01696f',
    success:  '#437a22',
    error:    '#C0392B',
  }[status];

  const label = {
    idle:     'TAP TOOL TAG TO SCAN',
    scanning: 'READING TAG...',
    success:  'TAG DETECTED ✓',
    error:    'UNKNOWN TAG — NOT REGISTERED',
  }[status];

  const icon = {
    idle:     '📡',
    scanning: '⟳',
    success:  '✓',
    error:    '✗',
  }[status];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
    }}>
      {/* Animated ring zone */}
      <div style={{
        position: 'relative', width: '180px', height: '180px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Pulsing rings */}
        {[180, 140, 100].map((size, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${size}px`, height: `${size}px`,
            borderRadius: '50%',
            border: `1.5px solid ${ringColor}`,
            // ✅ FIXED: animation name matches KioskScreen's nfcExpand keyframe
            animation: `nfcExpand 2.5s ease-out ${i * 0.5}s infinite`,
            transition: 'border-color 0.3s',
          }} />
        ))}

        {/* Core button */}
        <div style={{
          position: 'relative', zIndex: 2,
          width: '80px', height: '80px',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: status === 'scanning' ? '22px' : '28px',
          transition: 'all 0.3s',
          ...coreStyle,
        }}>
          {icon}
        </div>
      </div>

      {/* Status label */}
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: labelColor,
        transition: 'color 0.3s',
        margin: 0,
      }}>
        {label}
      </p>

      {/* Reader status pill — matches KioskScreen's k-nfc-pill style */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: active ? '#D4DFCC' : '#E5E3DF',
        color: active ? '#437a22' : '#7A7974',
        fontSize: '11px', fontWeight: 600,
        padding: '4px 12px', borderRadius: '999px',
        letterSpacing: '0.03em',
      }}>
        <div style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: active ? '#437a22' : '#BAB9B4',
          animation: active ? 'kdot 1.5s ease-in-out infinite' : 'none',
        }} />
        {active ? 'USB Reader Listening' : 'Scanner Inactive'}
      </div>
    </div>
  );
}
