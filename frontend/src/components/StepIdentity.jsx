import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { StudentAPI } from '../api';

const QR_REGION_ID = 'qr-camera-region';

const DEPARTMENTS = [
  { id: 'BSAMT', label: 'BS Aircraft Engineering' },
  { id: 'BSIT',  label: 'BS Information Technology'          },
  { id: 'BSCS',  label: 'BS Computer Science'                },
  { id: 'BSEE',  label: 'BS Electrical Engineering'          },
  { id: 'BSECE', label: 'BS Electronics Engineering'         },
  { id: 'BSME',  label: 'BS Mechanical Engineering'          },
  { id: 'BSIE',  label: 'BS Industrial Engineering'          },
  { id: 'BST',   label: 'BS Tourism'                         },
  { id: 'BSHM',  label: 'BS Hospitality Management'          },
  { id: 'BSN',   label: 'BS Nursing'                         },
  { id: 'BSED',  label: 'BS Education'                       },
  { id: 'BSBA',  label: 'BS Business Administration'         },
];

const S = {
  root: {
    maxWidth: 780,
    margin: '0 auto',
    padding: '36px 24px 80px',
    fontFamily: "'Inter', sans-serif",
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: '#28251d',
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    color: '#7A7974',
    marginBottom: 32,
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: 24,
    alignItems: 'start',
  },
  card: {
    background: '#fff',
    border: '1.5px solid #E5E3DF',
    borderRadius: 14,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#BAB9B4',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#7A7974',
    marginBottom: 6,
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #E5E3DF',
    borderRadius: 8,
    fontSize: 14,
    color: '#28251d',
    background: '#F9F8F5',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, background 0.2s',
  },
  inputFilled: {
    borderColor: '#01696f',
    background: '#fff',
  },
  select: {
    appearance: 'none',
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237A7974' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: 36,
  },
  verified: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#D4DFCC',
    border: '1.5px solid #437a22',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 600,
    color: '#437a22',
  },
  orDivider: {
    fontSize: 12,
    fontWeight: 700,
    color: '#BAB9B4',
    letterSpacing: '0.08em',
    textAlign: 'center',
    paddingTop: 60,
    userSelect: 'none',
  },
  // QR scan zone (idle placeholder)
  qrZone: {
    border: '1.5px dashed',
    borderRadius: 10,
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    cursor: 'default',
    transition: 'all 0.25s',
    minHeight: 120,
    justifyContent: 'center',
  },
  qrIcon: {
    fontSize: 36,
    lineHeight: 1,
  },
  qrMain: {
    fontSize: 13,
    fontWeight: 600,
    textAlign: 'center',
  },
  qrSub: {
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.75,
    lineHeight: 1.5,
  },
  studentIdBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#EEF3FD',
    border: '1px solid rgba(29,78,216,0.2)',
    borderRadius: 6,
    padding: '4px 10px',
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: 700,
    color: '#1D4ED8',
    letterSpacing: '0.04em',
  },
  hint: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#F0EDE6',
    color: '#7A7974',
    fontSize: 11,
    padding: '6px 12px',
    borderRadius: 999,
    marginTop: 4,
  },
  errorBox: {
    background: '#FEECEB',
    color: '#C0392B',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 12,
    lineHeight: 1.5,
  },
  btnRow: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  btnBack: {
    padding: '12px 24px',
    background: '#fff',
    border: '1.5px solid #E5E3DF',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    color: '#28251d',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnNext: {
    padding: '12px 28px',
    background: '#01696f',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  },
  btnNextDisabled: {
    background: '#BAB9B4',
    cursor: 'not-allowed',
  },
};


const QR_STATES = {
  idle: {
    border: '#D5D3CE',
    bg: '#F9F8F5',
    color: '#7A7974',
    icon: '▣',
    main: 'Tap “Use Camera” to scan your ID',
    sub:  'Or use a USB QR wand / type manually',
  },
  scanning: {
    border: '#01696f',
    bg: 'rgba(1,105,111,0.05)',
    color: '#01696f',
    icon: '⟳',
    main: 'Reading QR code...',
    sub:  'Hold still',
  },
  found: {
    border: '#437a22',
    bg: '#F0F7EC',
    color: '#437a22',
    icon: '✓',
    main: 'Student found!',
    sub:  'Details filled automatically',
  },
  notfound: {
    border: '#B45309',
    bg: '#FEF3DC',
    color: '#B45309',
    icon: '⚠',
    main: 'Student not in system',
    sub:  'Student ID pre-filled — complete remaining fields manually',
  },
  error: {
    border: '#C0392B',
    bg: '#FEECEB',
    color: '#C0392B',
    icon: '✗',
    main: 'Scan failed',
    sub:  'Try again or type manually',
  },
};

export default function StepIdentity({
  name, setName,
  studentId, setStudentId,
  studentDbId, setStudentDbId,
  department, setDepartment,
  onNext, onBack,
}) {
  const [qrState,    setQrState]    = useState('idle');
  const [qrError,    setQrError]    = useState('');
  const [qrLoading,  setQrLoading]  = useState(false);

  // Camera scanning — OFF by default; opens only when the button is tapped.
  const [cameraOn,   setCameraOn]   = useState(false);
  const [camError,   setCamError]   = useState('');
  const html5QrRef = useRef(null);

  const bufferRef   = useRef('');
  const timerRef    = useRef(null);
  const lastKeyRef  = useRef(0);
  const nameRef     = useRef(null);


  // ── USB QR wand (keyboard-wedge) — runs in parallel, unchanged ──────────────
  useEffect(() => {
    const onKey = (e) => {
      const now  = Date.now();
      const diff = now - lastKeyRef.current;
      lastKeyRef.current = now;

      const active = document.activeElement;
      const isNameField = active === nameRef.current;
      const isBurst     = diff < 80;

      if (isNameField && !isBurst && bufferRef.current.length === 0) return;

      if (e.key === 'Enter') {
        const raw = bufferRef.current.trim();
        if (raw.length >= 3) handleQrScanned(raw);
        bufferRef.current = '';
        clearTimeout(timerRef.current);
        return;
      }

      if (e.key.length === 1) {
        if (bufferRef.current.length === 0 && !isBurst) return;
        bufferRef.current += e.key;
        if (bufferRef.current.length === 1) setQrState('scanning');
      }

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const raw = bufferRef.current.trim();
        if (raw.length >= 3) handleQrScanned(raw);
        bufferRef.current = '';
      }, 150);
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(timerRef.current);
    };
  }, []);


  // ── Camera lifecycle — the #qr-camera-region div is ALWAYS in the DOM (just
  //    shown/hidden), so html5-qrcode and React never fight over the same node.
  //    Needs: `npm i html5-qrcode`, served over HTTPS or localhost.
  useEffect(() => {
    if (!cameraOn) return;
    let cancelled = false;

    const scanner = new Html5Qrcode(QR_REGION_ID, { verbose: false });
    html5QrRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 200, height: 200 }, aspectRatio: 1.0 },
      (decodedText) => {
        if (cancelled) return;
        handleQrScanned(decodedText);   // reuse existing autofill logic
        setCameraOn(false);             // stop after first good scan
      },
      () => {}                          // per-frame "no code" — ignore
    ).catch((err) => {
      if (cancelled) return;
      setCamError(
        (err && err.message) ||
        'Cannot access camera. Allow camera permission, and make sure the kiosk is served over HTTPS or localhost.'
      );
      setCameraOn(false);
    });

    return () => {
      cancelled = true;
      const s = html5QrRef.current;
      html5QrRef.current = null;
      // Stop the scanner; the region div stays mounted so React won't remove
      // nodes out from under html5-qrcode (that was the white-screen crash).
      if (s) s.stop().then(() => s.clear()).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOn]);


  const handleQrScanned = async (raw) => {

    const scannedId = raw.toUpperCase();
    setQrLoading(true);
    setQrError('');
    setStudentId(scannedId);

    try {
      const res     = await StudentAPI.getByQr(scannedId);
      const student = res.data;
      setName(student.name);
      setStudentDbId(student.id);
      if (student.section) setDepartment(student.section);

      setQrState('found');
      setTimeout(() => setQrState('idle'), 4000);
    } catch (err) {
      setStudentDbId(null);
      setQrState('notfound');
      setQrError('');
      setTimeout(() => setQrState('idle'), 5000);
    } finally {
      setQrLoading(false);
    }
  };

  const canContinue = name.trim().length >= 2 && studentId.trim().length >= 3;

  const qr = QR_STATES[qrState];

  return (
    <div style={S.root}>
      <div style={S.title}>Verify Your Identity</div>
      <div style={S.sub}>
        Scan your Student ID QR code with the camera, use a USB QR wand, or type your details manually.
      </div>

      <div style={S.grid}>


        <div style={S.card}>
          <div style={S.cardLabel}>
            <span>🖥</span> Type Your Details
          </div>

          <div>
            <label style={S.fieldLabel}>Full Name *</label>
            <input
              ref={nameRef}
              type="text"
              placeholder="e.g. Juan Dela Cruz"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ ...S.input, ...(name ? S.inputFilled : {}) }}
              onFocus={e  => e.target.style.borderColor = '#01696f'}
              onBlur={e   => e.target.style.borderColor = name ? '#01696f' : '#E5E3DF'}
            />
          </div>

          <div>
            <label style={S.fieldLabel}>Student ID *</label>
            <input
              type="text"
              placeholder="e.g. 3-2020-0328"
              value={studentId}
              onChange={e => setStudentId(e.target.value.toUpperCase())}
              style={{
                ...S.input,
                ...(studentId ? S.inputFilled : {}),
                fontFamily: 'monospace',
                letterSpacing: '0.04em',
              }}
              onFocus={e  => e.target.style.borderColor = '#01696f'}
              onBlur={e   => e.target.style.borderColor = studentId ? '#01696f' : '#E5E3DF'}
            />
            {studentId && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={S.studentIdBadge}>#{studentId}</span>
                {studentDbId && (
                  <span style={{ fontSize: 11, color: '#437a22', fontWeight: 600 }}>
                    ✓ Registered student
                  </span>
                )}
              </div>
            )}
          </div>
          <div>
            <label style={S.fieldLabel}>Department *</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              style={{
                ...S.input,
                ...S.select,
                ...(department ? S.inputFilled : {}),
              }}
              onFocus={e  => e.target.style.borderColor = '#01696f'}
              onBlur={e   => e.target.style.borderColor = department ? '#01696f' : '#E5E3DF'}
            >
              <option value="">Select department...</option>
              {DEPARTMENTS.map(d => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Verified pill */}
          {canContinue && department && (
            <div style={S.verified}>
              <span>✓</span>
              <span>Identity confirmed — ready to continue</span>
            </div>
          )}
        </div>
        <div style={S.orDivider}>OR</div>
        <div style={S.card}>
          <div style={S.cardLabel}>
            <span>📷</span> Scan Student QR Code
          </div>

          <div
            id={QR_REGION_ID}
            style={{
              display: cameraOn ? 'block' : 'none',
              width: '100%',
              maxWidth: 260,
              margin: '0 auto',
              borderRadius: 10,
              overflow: 'hidden',
              background: '#000',
            }}
          />

          {cameraOn ? (
            <button
              style={{ ...S.btnBack, width: '100%', textAlign: 'center' }}
              onClick={() => setCameraOn(false)}
            >
              ■ Stop Camera
            </button>
          ) : (
            <>
              <div style={{ ...S.qrZone, borderColor: qr.border, background: qr.bg }}>
                <div style={{ ...S.qrIcon, color: qr.color }}>{qr.icon}</div>
                <div style={{ ...S.qrMain, color: qr.color }}>{qr.main}</div>
                <div style={{ ...S.qrSub,  color: qr.color }}>{qr.sub}</div>
                {(qrState === 'found' || qrState === 'notfound') && studentId && (
                  <div style={S.studentIdBadge}>#{studentId}</div>
                )}
              </div>
              <button
                style={{ ...S.btnNext, width: '100%', textAlign: 'center' }}
                onClick={() => { setCamError(''); setCameraOn(true); }}
              >
                📷 Use Camera to Scan
              </button>
            </>
          )}

          {camError && <div style={S.errorBox}>{camError}</div>}

          {qrState === 'notfound' && (
            <div style={S.errorBox}>
              Student ID <strong>{studentId}</strong> is not registered in the system.
              Your ID has been pre-filled — please complete your name and department.
            </div>
          )}

          <div style={S.hint}>
            <span>ℹ</span>
            <span>No camera? A USB QR wand still works — just plug in and scan.</span>
          </div>
          <div style={{
            background: '#CEDCD8',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 11,
            color: '#01696f',
            lineHeight: 1.6,
          }}>
            <strong>📋 Where to find the QR code:</strong><br />
            Look at the back of your Student ID card — the QR code is labeled <em>"STUDENT ID QR CODE"</em> at the bottom right.
          </div>
        </div>
      </div>

      <div style={S.btnRow}>
        <button style={S.btnBack} onClick={onBack}>← Back</button>
        <button
          style={{
            ...S.btnNext,
            ...(canContinue ? {} : S.btnNextDisabled),
          }}
          onClick={canContinue ? onNext : undefined}
          disabled={!canContinue}
        >
          Continue →
        </button>
        {!canContinue && (
          <span style={{ fontSize: 12, color: '#BAB9B4' }}>
            {!name.trim() ? 'Enter your full name' :
             !studentId.trim() ? 'Enter your Student ID' :
             'Select your department'}
          </span>
        )}
      </div>
    </div>
  );
}