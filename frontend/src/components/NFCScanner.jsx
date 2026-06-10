import { useEffect, useRef, useState } from 'react';
import { ToolAPI } from '../api';

const DEBOUNCE_MS    = 120;   // finalize this long after the last char
const MIN_UID_LENGTH = 4;
const BURST_MS       = 80;    // reader chars arrive < 80ms apart; humans type slower

export default function NFCScanner({ onScan, active = true }) {
  const [status,  setStatus]  = useState('idle');
  const [message, setMessage] = useState('');
  const bufferRef  = useRef('');
  const timerRef   = useRef(null);
  const lastKeyRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    // Finalize the current buffer into a single clean UID lookup.
    const finalize = () => {
      clearTimeout(timerRef.current);
      const raw = bufferRef.current;
      // Strip anything that isn't a tag character (stray spaces, control keys, etc.)
      const uid = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      bufferRef.current = '';

      // TEMPORARY DEBUG — shows exactly what the reader produced.
      // If `raw` differs from `uid`, the reader is sending junk characters.
      console.log('[NFCScanner] raw:', JSON.stringify(raw), '→ uid:', JSON.stringify(uid));

      if (uid.length >= MIN_UID_LENGTH) fireScanned(uid);
    };

    const handleKeyDown = (e) => {
      const now     = Date.now();
      const isBurst = (now - lastKeyRef.current) < BURST_MS;
      lastKeyRef.current = now;

      if (e.key === 'Enter') {
        finalize();
        return;
      }

      if (e.key.length === 1) {
        // A non-burst keystroke starts a NEW scan — drop any stale leftover
        // so an earlier stray char can't prepend onto this UID.
        if (!isBurst) bufferRef.current = '';
        bufferRef.current += e.key;
        setStatus('scanning');
      }

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(finalize, DEBOUNCE_MS);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const fireScanned = async (uid) => {
    setStatus('scanning');
    setMessage('');
    try {
      const res  = await ToolAPI.getByUid(uid); // GET /api/tools/uid/{uid}
      const tool = res.data;

      if (tool.status === 'BORROWED') {
        throw new Error(`${tool.name} is already borrowed`);
      }
      if (tool.status === 'MAINTENANCE') {
        throw new Error(`${tool.name} is under maintenance`);
      }

      onScan(tool);
      setStatus('success');
      setMessage(tool.name);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Unknown tag — not registered');
    } finally {
      setTimeout(() => { setStatus('idle'); setMessage(''); }, 2000);
    }
  };

  const ringColor = {
    idle:     '#E5E3DF',
    scanning: 'rgba(1,105,111,0.35)',
    success:  'rgba(67,122,34,0.35)',
    error:    'rgba(192,57,43,0.35)',
  }[status];

  const coreStyle = {
    idle:     { background: '#FFFFFF', border: '2px solid #01696f', boxShadow: '0 0 0 4px rgba(1,105,111,0.08)' },
    scanning: { background: 'rgba(1,105,111,0.08)', border: '2px solid #01696f', boxShadow: '0 0 16px rgba(1,105,111,0.20)' },
    success:  { background: 'rgba(67,122,34,0.10)', border: '2px solid #437a22', boxShadow: '0 0 16px rgba(67,122,34,0.20)' },
    error:    { background: 'rgba(192,57,43,0.08)', border: '2px solid #C0392B', boxShadow: '0 0 16px rgba(192,57,43,0.15)' },
  }[status];

  const labelColor = { idle: '#7A7974', scanning: '#01696f', success: '#437a22', error: '#C0392B' }[status];

  const label = {
    idle:     'TAP TOOL TAG TO SCAN',
    scanning: 'READING TAG...',
    success:  message ? `✓ ${message}` : 'TAG DETECTED ✓',
    error:    message || 'UNKNOWN TAG — NOT REGISTERED',
  }[status];

  const icon = { idle: '📡', scanning: '⟳', success: '✓', error: '✗' }[status];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative', width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {[180, 140, 100].map((size, i) => (
          <div key={i} style={{
            position: 'absolute', width: size, height: size, borderRadius: '50%',
            border: `1.5px solid ${ringColor}`,
            animation: `nfcExpand 2.5s ease-out ${i * 0.5}s infinite`,
            transition: 'border-color 0.3s',
          }} />
        ))}
        <div style={{
          position: 'relative', zIndex: 2, width: 80, height: 80, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: status === 'scanning' ? 22 : 28, transition: 'all 0.3s',
          ...coreStyle,
        }}>
          {icon}
        </div>
      </div>

      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: labelColor, transition: 'color 0.3s', margin: 0, textAlign: 'center', maxWidth: 220 }}>
        {label}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: active ? '#D4DFCC' : '#E5E3DF', color: active ? '#437a22' : '#7A7974', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 999 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: active ? '#437a22' : '#BAB9B4', animation: active ? 'kdot 1.5s ease-in-out infinite' : 'none' }} />
        {active ? 'USB Reader Listening' : 'Scanner Inactive'}
      </div>
    </div>
  );
}