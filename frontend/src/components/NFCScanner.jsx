import { useEffect, useRef, useState } from 'react';

const DEBOUNCE_MS = 150;
const MIN_UID_LENGTH = 4;

export default function NFCScanner({ onScan, active = true }) {
  const [status, setStatus] = useState('idle');
  const bufferRef = useRef('');
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e) => {
  
      if (e.key === 'Enter') {
        const uid = bufferRef.current.trim().toUpperCase();
        if (uid.length >= MIN_UID_LENGTH) {
          fireScanned(uid);
        }
        bufferRef.current = '';
        clearTimeout(timerRef.current);
        return;
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const uid = bufferRef.current.trim().toUpperCase();
        if (uid.length >= MIN_UID_LENGTH) {
          fireScanned(uid);
        }
        bufferRef.current = '';
      }, DEBOUNCE_MS);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timerRef.current);
    };
  }, [active]);

  const fireScanned = async (uid) => {
    setStatus('scanning');
    try {
      const res = await fetch(`/api/tools/uid/${uid}`);
      if (!res.ok) throw new Error('Unknown tag');
      const tool = await res.json();
      onScan(tool);
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 1200);
    }
  };

  // Keep visual style from your original
  const ringColor = {
    idle:     'var(--gold-border)',
    scanning: 'rgba(190,183,0,0.5)',
    success:  'rgba(74,222,128,0.5)',
    error:    'rgba(248,113,113,0.5)',
  }[status];

  const coreColor = {
    idle:     'linear-gradient(135deg, var(--dark-blue), var(--accent-blue))',
    scanning: 'linear-gradient(135deg, var(--dark-khaki), var(--olive))',
    success:  'linear-gradient(135deg, #052e16, #166534)',
    error:    'linear-gradient(135deg, #450a0a, #991b1b)',
  }[status];

  const label = {
    idle:     'TAP TOOL TAG TO SCAN',
    scanning: 'READING TAG...',
    success:  'TAG DETECTED ✓',
    error:    'UNKNOWN TAG — NOT REGISTERED',
  }[status];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative', width: '180px', height: '180px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {[180, 140, 100].map((size, i) => (
          <div key={i} style={{
            position: 'absolute', width: `${size}px`, height: `${size}px`,
            borderRadius: '50%', border: `1px solid ${ringColor}`,
            animation: `nfcExpand 2.5s ease-out ${i * 0.5}s infinite`,
          }} />
        ))}
        <div style={{
          position: 'relative', zIndex: 2, width: '80px', height: '80px',
          borderRadius: '50%', background: coreColor,
          border: '2px solid var(--old-gold)',
          boxShadow: '0 0 24px var(--gold-glow), inset 0 0 20px rgba(11,26,53,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', transition: 'all 0.3s',
        }}>
          {status === 'success' ? '✓' : status === 'error' ? '✗' : '📡'}
        </div>
      </div>

      <p style={{
        fontFamily: "'Space Mono', monospace", fontSize: '11px', letterSpacing: '2px',
        color: status === 'success' ? 'var(--success)'
             : status === 'error'   ? 'var(--danger)'
             : 'var(--text-muted)',
        transition: 'color 0.3s',
      }}>
        {label}
      </p>

      {/* Status indicator — shows reader is listening */}
      <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        {active ? '⬤ USB reader listening' : '○ Scanner inactive'}
      </p>
    </div>
  );
}