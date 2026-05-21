import React, { useState, useEffect } from 'react';

export default function NFCScanner({ onScan, mode }) {
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | scanning | success | error

  // Simulate a scan for demo purposes
  // Replace this with real Web NFC API in production
  const simulateScan = () => {
    setScanning(true);
    setStatus('scanning');
    setTimeout(() => {
      const mockTag = {
        tagId: 'NFC-' + Math.random().toString(16).slice(2, 6).toUpperCase(),
        toolId: 'TOOL-' + Math.floor(Math.random() * 100),
        toolName: ['Digital Multimeter', 'Oscilloscope Probe', 'Breadboard Kit', 'DC Power Supply'][
          Math.floor(Math.random() * 4)
        ],
      };
      onScan(mockTag);
      setStatus('success');
      setTimeout(() => { setStatus('idle'); setScanning(false); }, 1200);
    }, 1000);
  };

  // Real Web NFC API — uncomment when running on HTTPS + Chrome Android
  /*
  const startNFC = async () => {
    if (!('NDEFReader' in window)) {
      alert('Web NFC is not supported on this device/browser.');
      return;
    }
    try {
      const reader = new NDEFReader();
      await reader.scan();
      setStatus('scanning');
      reader.onreading = ({ serialNumber, message }) => {
        const tagId = serialNumber;
        onScan({ tagId });
        setStatus('success');
        setTimeout(() => setStatus('idle'), 1200);
      };
      reader.onreadingerror = () => setStatus('error');
    } catch (err) {
      console.error('NFC Error:', err);
      setStatus('error');
    }
  };
  */

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
    scanning: 'SCANNING...',
    success:  'TAG DETECTED ✓',
    error:    'SCAN ERROR — TRY AGAIN',
  }[status];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      {/* NFC Ring zone */}
      <div
        onClick={simulateScan}
        title="Click to simulate NFC scan"
        style={{
          position: 'relative',
          width: '180px',
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {/* Animated rings */}
        {[180, 140, 100].map((size, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              border: `1px solid ${ringColor}`,
              animation: `nfcExpand 2.5s ease-out ${i * 0.5}s infinite`,
            }}
          />
        ))}

        {/* Core button */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: coreColor,
            border: `2px solid var(--old-gold)`,
            boxShadow: `0 0 24px var(--gold-glow), inset 0 0 20px rgba(11,26,53,0.8)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            transition: 'all 0.3s',
          }}
        >
          {status === 'success' ? '✓' : status === 'error' ? '✗' : '📡'}
        </div>
      </div>

      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: '11px',
        color: status === 'success' ? 'var(--success)'
             : status === 'error'   ? 'var(--danger)'
             : 'var(--text-muted)',
        letterSpacing: '2px',
        transition: 'color 0.3s',
      }}>
        {label}
      </p>

      <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        (Click ring to simulate scan · replace with Web NFC API for production)
      </p>
    </div>
  );
}
