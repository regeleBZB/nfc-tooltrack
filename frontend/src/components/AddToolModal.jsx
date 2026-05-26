

import { useState, useEffect, useRef } from 'react';
import { ToolAPI, TagAPI } from '../api';

const T = {
  bg: '#F5F3EE', surface: '#FFFFFF', surface2: '#F0EDE6',
  border: '#E5E3DF', border2: 'rgba(0,0,0,0.15)',
  ink: '#28251d', ink2: '#7A7974', ink3: '#BAB9B4',
  teal: '#01696f', tealBg: '#CEDCD8',
  green: '#437a22', greenBg: '#D4DFCC',
  red: '#C0392B', redBg: '#FEECEB',
  tagBg: '#E8E4DC',
};

const SCAN_DEBOUNCE_MS = 150;  // max ms between chars from the reader
const MIN_UID_LENGTH   = 4;    // minimum valid UID length

export function AddToolModal({ onClose, onAdd }) {
  const [form,        setForm]        = useState({ toolCode: '', name: '', category: '', tagUid: '', purchasePrice: '' });
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [scanStatus,  setScanStatus]  = useState('idle'); // idle | scanning | captured | error
  const [scanMessage, setScanMessage] = useState('');

  // ── NFC scan buffer (same pattern as NFCScanner.jsx) ──────────────────────
  const bufferRef   = useRef('');
  const timerRef    = useRef(null);
  const lastKeyTime = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const now = Date.now();
      const timeSinceLast = now - lastKeyTime.current;
      lastKeyTime.current = now;

      // If the active element is a text input that isn't the UID field,
      // don't intercept — let the user type normally in other fields.
      const active = document.activeElement;
      const isOtherInput = active &&
        (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') &&
        active.dataset.nfcfield !== 'true';

      // Detect scanner: chars arriving very fast (< 80ms apart)
      // Human typing is usually > 100ms between keystrokes.
      const isScannerBurst = timeSinceLast < 80;

      if (isOtherInput && !isScannerBurst) return;

      if (e.key === 'Enter') {
        const uid = bufferRef.current.trim().toUpperCase();
        if (uid.length >= MIN_UID_LENGTH) {
          setForm(p => ({ ...p, tagUid: uid }));
          setScanStatus('captured');
          setScanMessage(`UID captured: ${uid}`);
          setTimeout(() => setScanStatus('idle'), 3000);
        }
        bufferRef.current = '';
        clearTimeout(timerRef.current);
        return;
      }

      if (e.key.length === 1) {
        // Only start buffering if this looks like a scanner burst
        if (bufferRef.current.length === 0 && !isScannerBurst) return;
        bufferRef.current += e.key;
        setScanStatus('scanning');
      }

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const uid = bufferRef.current.trim().toUpperCase();
        if (uid.length >= MIN_UID_LENGTH) {
          setForm(p => ({ ...p, tagUid: uid }));
          setScanStatus('captured');
          setScanMessage(`UID captured: ${uid}`);
          setTimeout(() => setScanStatus('idle'), 3000);
        }
        bufferRef.current = '';
      }, SCAN_DEBOUNCE_MS);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timerRef.current);
    };
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.toolCode || !form.name) {
      setError('Tool code and name are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // POST /api/tools
      const toolRes = await ToolAPI.create({
        toolCode:      form.toolCode.toUpperCase(),
        name:          form.name,
        category:      form.category || null,
        purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : null,
      });
      const newTool = toolRes.data;

      // POST /api/tags/register (only if UID was provided)
      if (form.tagUid.trim()) {
        await TagAPI.register(form.tagUid.trim().toUpperCase(), newTool.id);
        newTool.tagUid = form.tagUid.trim().toUpperCase(); // attach for table display
      }

      onAdd(newTool);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add tool. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // ── Scan zone indicator ────────────────────────────────────────────────────
  const scanZoneBg = {
    idle:     '#F9F8F5',
    scanning: 'rgba(1,105,111,0.06)',
    captured: '#D4DFCC',
    error:    '#FEECEB',
  }[scanStatus];

  const scanZoneBorder = {
    idle:     '#E5E3DF',
    scanning: '#01696f',
    captured: '#437a22',
    error:    '#C0392B',
  }[scanStatus];

  const scanZoneColor = {
    idle:     '#7A7974',
    scanning: '#01696f',
    captured: '#437a22',
    error:    '#C0392B',
  }[scanStatus];

  const scanIcon  = { idle: '📡', scanning: '⟳', captured: '✓', error: '✗' }[scanStatus];
  const scanLabel = {
    idle:     'Tap tag on USB reader — UID fills automatically',
    scanning: 'Reading tag...',
    captured: scanMessage,
    error:    'Scan failed — try again',
  }[scanStatus];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.surface, borderRadius: 16, padding: 28,
          width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: `1px solid ${T.border}`, maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: T.ink }}>Add New Tool</div>
            <div style={{ fontSize: 11, color: T.ink2, marginTop: 2 }}>Register a tool and link its NFC tag</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: T.ink2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            ×
          </button>
        </div>

        {/* Tool Code */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.ink2, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tool Code *
          </label>
          <input
            type="text"
            placeholder="e.g. TW-001"
            value={form.toolCode}
            onChange={e => setForm(p => ({ ...p, toolCode: e.target.value }))}
            style={{ width: '100%', padding: '9px 12px', border: `1px solid ${T.border2}`, borderRadius: 8, fontSize: 13, color: T.ink, background: T.surface, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Tool Name */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.ink2, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tool Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Torque Wrench"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            style={{ width: '100%', padding: '9px 12px', border: `1px solid ${T.border2}`, borderRadius: 8, fontSize: 13, color: T.ink, background: T.surface, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.ink2, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Category
          </label>
          <input
            type="text"
            placeholder="e.g. Wrench, Measuring, Power Tool"
            value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            style={{ width: '100%', padding: '9px 12px', border: `1px solid ${T.border2}`, borderRadius: 8, fontSize: 13, color: T.ink, background: T.surface, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* NFC Tag UID — the key field */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.ink2, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            NFC Tag UID
          </label>

          {/* Auto-capture scan zone */}
          <div style={{
            background: scanZoneBg,
            border: `1.5px dashed ${scanZoneBorder}`,
            borderRadius: 10, padding: '14px 16px', marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 12,
            transition: 'all 0.2s', cursor: 'default',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: scanStatus === 'captured' ? '#D4DFCC' : scanStatus === 'scanning' ? 'rgba(1,105,111,0.1)' : '#F0EDE6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0, transition: 'all 0.2s',
            }}>
              {scanIcon}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: scanZoneColor, transition: 'color 0.2s' }}>
                {scanStatus === 'captured' ? 'Tag captured!' : 'Auto-scan zone'}
              </div>
              <div style={{ fontSize: 11, color: scanZoneColor, opacity: 0.8, marginTop: 2 }}>
                {scanLabel}
              </div>
            </div>
          </div>

          {/* Manual UID input — also shows captured value */}
          <input
            type="text"
            data-nfcfield="true"
            placeholder="e.g. 04A3F2C1 — or tap tag above"
            value={form.tagUid}
            onChange={e => setForm(p => ({ ...p, tagUid: e.target.value.toUpperCase() }))}
            style={{
              width: '100%', padding: '9px 12px',
              border: `1.5px solid ${form.tagUid ? '#437a22' : T.border2}`,
              borderRadius: 8, fontSize: 13,
              color: form.tagUid ? '#437a22' : T.ink,
              background: form.tagUid ? '#F0F7EC' : T.surface,
              outline: 'none', boxSizing: 'border-box',
              fontFamily: 'monospace', letterSpacing: '0.05em',
              transition: 'all 0.2s',
            }}
          />
          {form.tagUid && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>
              <span style={{ fontSize: 11, color: '#437a22', fontWeight: 600 }}>
                ✓ UID ready to register
              </span>
              <button
                onClick={() => { setForm(p => ({ ...p, tagUid: '' })); setScanStatus('idle'); }}
                style={{ fontSize: 11, color: T.red, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Purchase Price */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.ink2, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Purchase Price ₱
          </label>
          <input
            type="number"
            placeholder="e.g. 1500.00"
            value={form.purchasePrice}
            onChange={e => setForm(p => ({ ...p, purchasePrice: e.target.value }))}
            style={{ width: '100%', padding: '9px 12px', border: `1px solid ${T.border2}`, borderRadius: 8, fontSize: 13, color: T.ink, background: T.surface, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* How-to hint */}
        <div style={{
          background: T.tealBg, borderRadius: 8, padding: '10px 14px',
          fontSize: 11, color: T.teal, marginBottom: 16,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ flexShrink: 0 }}>💡</span>
          <div>
            <strong>How to scan:</strong> Keep this modal open, plug in the USB reader,
            then tap the NFC tag to the reader. The UID auto-fills instantly.
            You can also type it manually if you know it from the Notepad test.
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: T.redBg, color: T.red, borderRadius: 8, padding: '9px 12px', fontSize: 12, marginBottom: 14 }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '9px 20px', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, cursor: 'pointer', color: T.ink, fontFamily: 'inherit' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '9px 22px', background: loading ? T.ink2 : T.teal,
              border: 'none', borderRadius: 8, fontSize: 13,
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#fff', fontWeight: 600, fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Adding...' : '+ Add Tool'}
          </button>
        </div>
      </div>
    </div>
  );
}