import React, { useState, useEffect, useRef } from 'react';
import NFCScanner from '../components/NFCScanner';
import { TransactionAPI } from '../api';
import StepIdentity from '../components/StepIdentity';
import StepReceipt from '../components/StepReceipt';
import { printReceipt, connectPrinter, isPrinterConnected } from '../escposPrinter';


const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

.k-root { min-height: calc(100vh - 56px); background: #f7f6f2; font-family: 'Inter', sans-serif; color: #28251d; }
.k-topbar { background: #fff; border-bottom: 1px solid #e5e3df; padding: 14px 32px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 56px; z-index: 50; }
.k-topbar-left { display: flex; align-items: center; gap: 12px; }
.k-lab-name { font-weight: 700; font-size: 15px; color: #28251d; }
.k-lab-sub  { font-size: 12px; color: #7a7974; }
.k-nfc-pill { display: flex; align-items: center; gap: 6px; background: #d4dfcc; color: #437a22; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 999px; letter-spacing: .03em; }
.k-nfc-dot  { width: 7px; height: 7px; border-radius: 50%; background: #437a22; animation: kdot 1.5s ease-in-out infinite; }
@keyframes kdot { 0%,100%{opacity:1} 50%{opacity:.3} }

.k-steps { display: flex; align-items: center; padding: 0 32px; background: #fff; border-bottom: 1px solid #e5e3df; }
.k-step  { display: flex; align-items: center; gap: 8px; padding: 12px 20px; font-size: 12px; font-weight: 600; color: #bab9b4; border-bottom: 3px solid transparent; transition: all .2s; white-space: nowrap; }
.k-step.active { color: #01696f; border-bottom-color: #01696f; }
.k-step.done   { color: #437a22; }
.k-step-num    { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; background: #e5e3df; color: #bab9b4; flex-shrink: 0; }
.k-step.active .k-step-num { background: #01696f; color: #fff; }
.k-step.done   .k-step-num { background: #437a22; color: #fff; }
.k-sep { width: 24px; height: 1px; background: #e5e3df; flex-shrink: 0; }

.k-body { max-width: 1100px; margin: 0 auto; padding: 36px 32px 80px; }
.k-section-title { font-size: 22px; font-weight: 700; color: #28251d; margin-bottom: 6px; }
.k-section-sub   { font-size: 14px; color: #7a7974; margin-bottom: 28px; }

/* Welcome */
.k-start { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: calc(100vh - 160px); text-align: center; gap: 28px; }
.k-start-badge { display: inline-flex; align-items: center; gap: 6px; background: #cedcd8; color: #01696f; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 999px; letter-spacing: .06em; text-transform: uppercase; }
.k-start h1 { font-size: clamp(28px,4vw,52px); font-weight: 700; line-height: 1.15; color: #28251d; max-width: 700px; }
.k-start p  { font-size: clamp(14px,1.8vw,18px); color: #7a7974; max-width: 500px; line-height: 1.7; }
.k-start-actions { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
.k-start-card { background: #fff; border: 2px solid #e5e3df; border-radius: 16px; padding: 32px 28px; width: 220px; display: flex; flex-direction: column; align-items: center; gap: 14px; cursor: pointer; transition: all .2s; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
.k-start-card:hover { border-color: #01696f; background: #f0f7f6; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(1,105,111,.12); }
.k-start-card-icon  { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 30px; }
.k-start-card-title { font-weight: 700; font-size: 16px; }
.k-start-card-desc  { font-size: 12px; color: #7a7974; line-height: 1.5; text-align: center; }
.k-start-card-tag   { font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 999px; letter-spacing: .04em; }

/* Tool layout */
.k-tool-layout { display: grid; grid-template-columns: 220px 1fr 280px; gap: 20px; align-items: start; }
.k-sidebar { background: #fff; border: 1px solid #e5e3df; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 4px; }
.k-sidebar-label { font-size: 10px; font-weight: 700; color: #bab9b4; text-transform: uppercase; letter-spacing: .08em; padding: 4px 8px 10px; }

.k-tool-panel { background: #fff; border: 1px solid #e5e3df; border-radius: 14px; overflow: hidden; }
.k-tool-panel-header { padding: 14px 18px; border-bottom: 1px solid #e5e3df; display: flex; align-items: center; justify-content: space-between; background: #f9f8f5; }
.k-tool-panel-title  { font-size: 12px; font-weight: 700; color: #7a7974; text-transform: uppercase; letter-spacing: .06em; }
.k-nfc-active { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: #437a22; }

.k-cart-panel  { background: #fff; border: 1px solid #e5e3df; border-radius: 14px; overflow: hidden; position: sticky; top: 120px; }
.k-cart-header { padding: 14px 18px; background: #f9f8f5; border-bottom: 1px solid #e5e3df; display: flex; align-items: center; justify-content: space-between; }
.k-cart-title  { font-size: 13px; font-weight: 700; color: #28251d; }
.k-cart-count  { font-size: 11px; font-weight: 700; color: #01696f; background: #cedcd8; padding: 2px 8px; border-radius: 999px; }
.k-cart-body   { padding: 14px; display: flex; flex-direction: column; gap: 8px; min-height: 120px; }
.k-cart-empty  { text-align: center; color: #bab9b4; font-size: 12px; padding: 24px 0; }
.k-cart-item   { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #f9f8f5; border: 1px solid #e5e3df; border-radius: 8px; font-size: 12px; animation: fadeUp .2s ease; }
@keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
.k-cart-item-icon { width: 30px; height: 30px; background: #f0ede8; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.k-cart-item-name { font-weight: 600; flex: 1; }
.k-cart-item-id   { color: #bab9b4; font-size: 11px; }
.k-cart-remove    { color: #C0392B; font-size: 16px; line-height: 1; padding: 2px 4px; border-radius: 4px; background: none; border: none; cursor: pointer; }
.k-cart-footer { padding: 0 14px 14px; }

/* Receipt */
.k-receipt-layout  { display: grid; grid-template-columns: 1fr auto; gap: 48px; align-items: start; max-width: 860px; }
.k-receipt-tabs    { display: flex; gap: 8px; margin-bottom: 24px; }
.k-receipt-tab     { padding: 8px 18px; border-radius: 8px; font-size: 12px; font-weight: 700; border: 1.5px solid #e5e3df; background: #f9f8f5; color: #7a7974; cursor: pointer; transition: all .18s; }
.k-receipt-tab.active { background: #cedcd8; color: #01696f; border-color: #01696f; }
.k-receipt-summary { background: #f9f8f5; border: 1px solid #e5e3df; border-radius: 12px; padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; }
.k-receipt-row     { display: flex; justify-content: space-between; font-size: 13px; padding-bottom: 8px; border-bottom: 1px solid #e5e3df; }
.k-receipt-row:last-child { border-bottom: none; padding-bottom: 0; }
.k-receipt-lbl { color: #7a7974; }
.k-receipt-val { font-weight: 600; }
.k-thermal { background: #fff; color: #111; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.9; box-shadow: 0 4px 24px rgba(0,0,0,.12); width: 280px; flex-shrink: 0; position: relative; border-top: 4px solid #000; }
.k-thermal::after { content: ''; display: block; height: 10px; background: repeating-linear-gradient(-45deg,#fff 0,#fff 4px,transparent 4px,transparent 8px); position: absolute; bottom: -10px; left: 0; right: 0; }
.k-thermal-top    { padding: 12px 14px 0; }
.k-thermal-center { text-align: center; margin-bottom: 8px; }
.k-thermal-logo   { font-weight: 900; font-size: 13px; letter-spacing: 2px; }
.k-thermal-sub    { font-size: 10px; letter-spacing: 1px; }
.k-thermal-hr     { border: none; border-top: 1px dashed #999; margin: 8px 0; }
.k-thermal-row    { display: flex; justify-content: space-between; gap: 8px; padding: 0 14px; }
.k-thermal-bold   { font-weight: 700; }
.k-thermal-items  { padding: 0 14px; }
.k-thermal-black  { background: #000; color: #fff; padding: 10px 14px; margin-top: 6px; font-family: 'Courier New', monospace; font-size: 11px; }
.k-tb-title { font-weight: 900; font-size: 12px; letter-spacing: 1px; text-align: center; margin-bottom: 6px; border-bottom: 1px solid #555; padding-bottom: 4px; }
.k-tb-row { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
.k-tb-lbl { color: #aaa; }
.k-tb-val { color: #fff; font-weight: 700; }
.k-tb-blank { border-bottom: 1px solid #555; display: inline-block; min-width: 90px; height: 14px; }
.k-sig-row  { display: flex; gap: 16px; margin-top: 8px; padding-top: 6px; border-top: 1px solid #333; }
.k-sig-field{ flex: 1; display: flex; flex-direction: column; gap: 4px; align-items: center; }
.k-sig-lbl  { font-size: 9px; color: #aaa; letter-spacing: .08em; text-transform: uppercase; }
.k-sig-line { width: 100%; border-bottom: 1px solid #666; height: 28px; }
.k-thermal-footer { text-align: center; font-size: 10px; color: #555; line-height: 1.6; padding: 8px 14px 14px; }

.k-print-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; }
.k-print-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 24px; background: #01696f; color: #fff; font-size: 15px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer; transition: all .2s; }
.k-print-btn:hover { background: #0c4e54; }
.k-print-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.k-new-tx-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 20px; background: #f9f8f5; color: #7a7974; font-size: 13px; font-weight: 600; border: 1.5px solid #e5e3df; border-radius: 8px; cursor: pointer; }

.k-btn-primary   { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: #01696f; color: #fff; font-size: 15px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer; transition: all .2s; font-family: 'Inter', sans-serif; }
.k-btn-primary:hover { background: #0c4e54; }
.k-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.k-btn-secondary { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: #fff; color: #28251d; font-size: 14px; font-weight: 600; border: 1.5px solid #e5e3df; border-radius: 10px; cursor: pointer; font-family: 'Inter', sans-serif; }
.k-btn-secondary:hover { background: #f9f8f5; border-color: #01696f; color: #01696f; }
.k-btn-row { display: flex; gap: 12px; align-items: center; margin-top: 28px; }
.k-hint { display: inline-flex; align-items: center; gap: 6px; background: #f0ede8; color: #7a7974; font-size: 11px; padding: 5px 12px; border-radius: 999px; margin-top: 12px; }

.k-error-box { background: #FEECEB; border: 1px solid rgba(192,57,43,0.2); color: #C0392B; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 16px; }
.k-loading { display: flex; align-items: center; gap: 8px; color: #7a7974; font-size: 13px; }

@media (max-width: 900px) {
  .k-tool-layout { grid-template-columns: 1fr; }
  .k-cart-panel  { position: static; }
  .k-receipt-layout { grid-template-columns: 1fr; }
}
`;

function injectCSS(id, css) {
  if (document.getElementById(id)) return;
  const el = document.createElement('style');
  el.id = id; el.textContent = css;
  document.head.appendChild(el);
}

const STEPS = ['Form Type', 'Identity', 'Select Tools', 'Receipt'];

function StepBar({ current }) {
  return (
    <div className="k-steps">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`k-step ${i === current ? 'active' : i < current ? 'done' : ''}`}>
            <div className="k-step-num">{i < current ? '✓' : i + 1}</div>
            {s}
          </div>
          {i < STEPS.length - 1 && <div className="k-sep" />}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── Welcome screen ─────────────────────────────────────────────────────────── */
function WelcomeScreen({ onStart }) {
  return (
    <div className="k-body">
      <div className="k-start">
        <div className="k-start-badge">📡 NFC Tool Tracking · EIL-302</div>
        <h1>Welcome to the<br />AMT Lab Tool Kiosk</h1>
        <p>Borrow or return lab tools quickly using NFC tags. Select what you need to do to get started.</p>
        <div className="k-start-actions">
          <div className="k-start-card" onClick={() => onStart('borrow')}>
            <div className="k-start-card-icon" style={{ background: '#cedcd8' }}>📥</div>
            <div className="k-start-card-title">Borrow Tools</div>
            <div className="k-start-card-desc">Scan tools you need for your lab session</div>
            <span className="k-start-card-tag" style={{ background: '#cedcd8', color: '#01696f' }}>↔ Borrow &amp; Return</span>
          </div>
          <div className="k-start-card" onClick={() => onStart('purchase')}>
            <div className="k-start-card-icon" style={{ background: '#fef3dc' }}>🛒</div>
            <div className="k-start-card-title">Purchase Request</div>
            <div className="k-start-card-desc">Request consumables or supplies to purchase</div>
            <span className="k-start-card-tag" style={{ background: '#fef3dc', color: '#B45309' }}>🛒 Request Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 0: Form type ──────────────────────────────────────────────────────── */
function StepFormType({ formType, setFormType, onNext, onBack }) {
  return (
    <div className="k-body">
      <div className="k-section-title">Select Transaction Type</div>
      <div className="k-section-sub">Choose what you'd like to do today.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 480 }}>
        {[
          { id: 'borrow',   icon: '📥', title: 'Borrow',          desc: 'Take tools for your lab session'  },
          { id: 'purchase', icon: '🛒', title: 'Purchase Request', desc: 'Request consumables or supplies'  },
        ].map(opt => (
          <div
            key={opt.id}
            className={`k-start-card ${formType === opt.id ? 'active' : ''}`}
            onClick={() => setFormType(opt.id)}
            style={{
              borderColor: formType === opt.id ? '#01696f' : undefined,
              background:  formType === opt.id ? '#cedcd8' : undefined,
            }}
          >
            <div className="k-start-card-icon" style={{ background: '#f0ede8' }}>{opt.icon}</div>
            <div className="k-start-card-title">{opt.title}</div>
            <div className="k-start-card-desc">{opt.desc}</div>
          </div>
        ))}
      </div>
      <div className="k-btn-row">
        <button className="k-btn-secondary" onClick={onBack}>← Back</button>
        <button className="k-btn-primary"   onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}

/* ─── Step 2: Tools ──────────────────────────────────────────────────────────── */
function StepTools({ cart, setCart, onNext, onBack }) {
  const [lastScanned, setLastScanned] = useState(null);

  const handleScan = (tool) => {
    setLastScanned(tool.id);
    setCart(prev =>
      prev.find(t => t.id === tool.id)
        ? prev
        : [...prev, { ...tool, icon: '🔧' }]
    );
    setTimeout(() => setLastScanned(null), 2000);
  };

  return (
    <div className="k-body">
      <div className="k-section-title">Scan Tool Tags</div>
      <div className="k-section-sub">Tap each tool's NFC tag to the USB reader — it appears in your cart automatically.</div>

      <div className="k-tool-layout">
        {/* NFC Scanner zone */}
        <div style={{ background: '#fff', border: '1px solid #e5e3df', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7a7974', textTransform: 'uppercase', letterSpacing: '.08em' }}>NFC Reader</div>
          <NFCScanner onScan={handleScan} active={true} />
          {lastScanned && (
            <div style={{ background: '#d4dfcc', color: '#437a22', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600 }}>
              ✓ Tool added to cart!
            </div>
          )}
        </div>

        <div className="k-tool-panel">
          <div className="k-tool-panel-header">
            <span className="k-tool-panel-title">🔧 Scanned Tools</span>
            <span className="k-nfc-active"><span className="k-nfc-dot" />NFC Active</span>
          </div>
          {cart.length === 0
            ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#bab9b4', fontSize: 13 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📡</div>
                No tools scanned yet.<br />Tap a tool tag to the reader.
              </div>
            )
            : (
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cart.map(tool => (
                  <div
                    key={tool.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px',
                      background:   lastScanned === tool.id ? '#d4dfcc' : '#f9f8f5',
                      border:       `1px solid ${lastScanned === tool.id ? '#437a22' : '#e5e3df'}`,
                      borderRadius: 10, transition: 'all .3s',
                    }}
                  >
                    <span style={{ fontSize: 22 }}>🔧</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{tool.name}</div>
                      <div style={{ fontSize: 11, color: '#7a7974' }}>{tool.toolCode} · {tool.category || 'Tool'}</div>
                    </div>
                    <button className="k-cart-remove" onClick={() => setCart(p => p.filter(t => t.id !== tool.id))}>×</button>
                  </div>
                ))}
              </div>
            )
          }
          <div style={{ padding: '0 16px 14px' }}>
            <div className="k-hint">ℹ Tap a tag again to remove it, or click × above</div>
          </div>
        </div>

        <div className="k-cart-panel">
          <div className="k-cart-header">
            <span className="k-cart-title">Cart</span>
            <span className="k-cart-count">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
          </div>
          <div className="k-cart-body">
            {cart.length === 0
              ? <div className="k-cart-empty">Scan a tool to add it</div>
              : cart.map(t => (
                <div className="k-cart-item" key={t.id}>
                  <div className="k-cart-item-icon">🔧</div>
                  <span className="k-cart-item-name">{t.name}</span>
                  <span className="k-cart-item-id">{t.toolCode}</span>
                  <button className="k-cart-remove" onClick={() => setCart(p => p.filter(x => x.id !== t.id))}>×</button>
                </div>
              ))
            }
          </div>
          <div className="k-cart-footer">
            <button
              className="k-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={onNext}
              disabled={cart.length === 0}
            >
              Confirm &amp; Continue →
            </button>
          </div>
        </div>
      </div>

      <div className="k-btn-row">
        <button className="k-btn-secondary" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}

/* ─── Step 3: Receipt ────────────────────────────────────────────────────────── */
function StepReceipt({ formType, name, studentId, studentDbId, department, cart, onReset }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [txData,     setTxData]     = useState(null);
  const [error,      setError]      = useState('');
  const [printed,    setPrinted]    = useState(false);
  const [printMsg,   setPrintMsg]   = useState('');
  const [printerReady, setPrinterReady] = useState(false);
  const [tab,        setTab]        = useState(formType === 'purchase' ? 'purchase' : 'borrow');


  const submittedRef = useRef(false);

  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    submitTransaction();
  }, []);

  useEffect(() => { isPrinterConnected().then(setPrinterReady); }, []);

  const submitTransaction = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        type:         formType.toUpperCase(),          // "BORROW" | "PURCHASE"
        borrowerName: name,
        studentId:    studentDbId || null,             // Long — DB id from Student entity
        toolIds:      cart.map(t => t.id),             // array of tool IDs
        notes:        department ? `Department: ${department}` : null,
      };

      const res = await TransactionAPI.create(payload);
      setTxData(res.data);
      setSubmitted(true);
      printReceipt(res.data).catch(err =>
        setPrintMsg(err.message || 'Could not print. Tap "Connect Printer", then Reprint.'));
    } catch (err) {
      setError(err.message || 'Failed to submit transaction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // One-time printer authorization. MUST be a user gesture (button click) —
  // WebUSB requires that for the device chooser. After this, Chrome remembers
  // the printer for this site and auto-print needs no further taps.
  const handleConnect = async () => {
    setPrintMsg('');
    try {
      await connectPrinter();
      setPrinterReady(true);
      if (txData) await printReceipt(txData);   // print the receipt on screen now
    } catch (err) {
      setPrintMsg(err.message || 'Could not connect to the printer.');
    }
  };

  // Reprint = rebuild the ESC/POS bytes and push them over WebUSB. No backend
  // call, no window.print() (which would rasterize the page onto a 58mm
  // text-only head).
  const handlePrint = async () => {
    if (!txData) return;
    setPrinted(true);
    setPrintMsg('');
    try {
      await printReceipt(txData);
    } catch (err) {
      setPrintMsg(err.message || 'Print failed — check the printer connection.');
    } finally {
      setTimeout(() => setPrinted(false), 3000);
    }
  };

  if (submitting) {
    return (
      <div className="k-body" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⟳</div>
        <div className="k-section-title">Submitting Transaction...</div>
        <div style={{ color: '#7a7974' }}>Saving to database and printing receipt...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="k-body" style={{ maxWidth: 480 }}>
        <div className="k-section-title">Something went wrong</div>
        <div className="k-error-box">{error}</div>
        <div className="k-btn-row">
          <button
            className="k-btn-secondary"
            onClick={() => { submittedRef.current = true; submitTransaction(); }}
          >
            Try Again
          </button>
          <button className="k-btn-secondary" onClick={onReset}>Start Over</button>
        </div>
      </div>
    );
  }

  const receiptNumber = txData?.receiptNumber || '—';

  return (
    <div className="k-body">
      <div className="k-section-title">
        {submitted ? '✓ Transaction Recorded' : 'Confirm & Print Receipt'}
      </div>
      <div className="k-section-sub">
        {submitted ? `Receipt #${receiptNumber} — saved to database.` : 'Review your transaction.'}
      </div>

      <div className="k-receipt-tabs">
        <button className={`k-receipt-tab ${tab === 'borrow'   ? 'active' : ''}`} onClick={() => setTab('borrow')}>🔧 Borrower Receipt</button>
        <button className={`k-receipt-tab ${tab === 'purchase' ? 'active' : ''}`} onClick={() => setTab('purchase')}>🛒 Purchase Receipt</button>
      </div>

      <div className="k-receipt-layout">
        <div>
          <div className="k-receipt-summary">
            <div className="k-receipt-row"><span className="k-receipt-lbl">Receipt #</span><span className="k-receipt-val" style={{ color: '#01696f' }}>{receiptNumber}</span></div>
            <div className="k-receipt-row"><span className="k-receipt-lbl">Student</span><span className="k-receipt-val">{name}</span></div>
            <div className="k-receipt-row"><span className="k-receipt-lbl">Student ID</span><span className="k-receipt-val">{studentId}</span></div>
            <div className="k-receipt-row"><span className="k-receipt-lbl">Department</span><span className="k-receipt-val">{department || '—'}</span></div>
            <div className="k-receipt-row"><span className="k-receipt-lbl">Date</span><span className="k-receipt-val">{dateStr}</span></div>
            <div className="k-receipt-row"><span className="k-receipt-lbl">Time In</span><span className="k-receipt-val">{timeStr}</span></div>
            <div className="k-receipt-row" style={{ borderBottom: 'none' }}>
              <span className="k-receipt-lbl">Total Items</span>
              <span className="k-receipt-val" style={{ color: '#01696f' }}>{cart.length}</span>
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cart.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: '#f9f8f5', border: '1px solid #e5e3df', borderRadius: 8, fontSize: 13 }}>
                <span style={{ fontSize: 18 }}>🔧</span>
                <span style={{ fontWeight: 600, flex: 1 }}>{t.name}</span>
                <span style={{ color: '#bab9b4', fontFamily: 'monospace', fontSize: 11 }}>{t.toolCode}</span>
              </div>
            ))}
          </div>

          <div className="k-print-actions">
            {!printerReady && (
              <button className="k-print-btn" onClick={handleConnect}>
                🔌 Connect Printer
              </button>
            )}
            <button className="k-print-btn" onClick={handlePrint} disabled={printed}>
              {printed ? '✓ Printed!' : '🖨 Reprint Receipt'}
            </button>
            <button className="k-new-tx-btn" onClick={onReset}>↺ New Transaction</button>
            <div className="k-hint" style={{ alignSelf: 'flex-start' }}>
              {printerReady
                ? 'ℹ Receipt prints automatically over USB when the transaction is saved.'
                : 'ℹ Tap “Connect Printer” once to authorize the USB printer on this tablet.'}
            </div>
            {printMsg && (
              <div className="k-error-box" style={{ marginTop: 4, marginBottom: 0 }}>{printMsg}</div>
            )}
          </div>
        </div>
        {tab === 'borrow' ? (
          <div className="k-thermal">
            <div className="k-thermal-top">
              <div className="k-thermal-center">
                <div className="k-thermal-logo">AIR LINK AMT LAB</div>
                <div className="k-thermal-sub">TOOL BORROWER RECEIPT</div>
              </div>
              <hr className="k-thermal-hr" />
              <div className="k-thermal-row"><span>Receipt:</span><span className="k-thermal-bold">{receiptNumber}</span></div>
              <div className="k-thermal-row"><span>Student:</span><span className="k-thermal-bold">{name}</span></div>
              <div className="k-thermal-row"><span>ID:</span><span className="k-thermal-bold">{studentId}</span></div>
              <div className="k-thermal-row"><span>Date:</span><span>{dateStr}</span></div>
              <div className="k-thermal-row"><span>Time In:</span><span>{timeStr}</span></div>
              <hr className="k-thermal-hr" />
              <div className="k-thermal-items">
                <div className="k-thermal-bold" style={{ marginBottom: 4 }}>TOOLS BORROWED:</div>
                {cart.map((t, i) => <div key={t.id}>{i + 1}. {t.name} ({t.toolCode})</div>)}
              </div>
              <hr className="k-thermal-hr" />
              <div className="k-thermal-row"><span className="k-thermal-bold">Total Items:</span><span className="k-thermal-bold">{cart.length}</span></div>
            </div>
            <div className="k-thermal-black">
              <div className="k-tb-title">⬛ TIME-OUT &amp; RETURN LOG</div>
              <div className="k-tb-row"><span className="k-tb-lbl">Time Out:</span><span className="k-tb-val"><span className="k-tb-blank" /></span></div>
              <div className="k-tb-row"><span className="k-tb-lbl">All Returned:</span><span className="k-tb-val">☐ Yes &nbsp;☐ No</span></div>
              <div className="k-sig-row">
                <div className="k-sig-field"><div className="k-sig-line" /><div className="k-sig-lbl">Borrower's Signature</div></div>
                <div className="k-sig-field"><div className="k-sig-line" /><div className="k-sig-lbl">Lab In-charge</div></div>
              </div>
            </div>
            <div className="k-thermal-footer">Return all tools before leaving.<br />*** KEEP THIS RECEIPT ***</div>
          </div>
        ) : (
          <div className="k-thermal" style={{ borderTopColor: '#964219' }}>
            <div className="k-thermal-top">
              <div className="k-thermal-center">
                <div className="k-thermal-logo">AIR LINK AMT LAB</div>
                <div className="k-thermal-sub">PURCHASE REQUEST FORM</div>
              </div>
              <hr className="k-thermal-hr" />
              <div className="k-thermal-row"><span>Receipt:</span><span className="k-thermal-bold">{receiptNumber}</span></div>
              <div className="k-thermal-row"><span>Requested by:</span><span className="k-thermal-bold">{name}</span></div>
              <div className="k-thermal-row"><span>Date:</span><span>{dateStr}</span></div>
              <hr className="k-thermal-hr" />
              <div className="k-thermal-items">
                {cart.map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                    <span style={{ flex: 1 }}>{t.name}</span><span>1 pc</span>
                  </div>
                ))}
              </div>
              <hr className="k-thermal-hr" />
              <div className="k-thermal-row"><span className="k-thermal-bold">Total Items:</span><span className="k-thermal-bold">{cart.length}</span></div>
            </div>
            <div className="k-thermal-black">
              <div className="k-tb-title">⬛ PURCHASE APPROVAL LOG</div>
              <div className="k-tb-row"><span className="k-tb-lbl">Status:</span><span className="k-tb-val">☐ Approved &nbsp;☐ Pending</span></div>
              <div className="k-sig-row">
                <div className="k-sig-field"><div className="k-sig-line" /><div className="k-sig-lbl">Requestor's Sig.</div></div>
                <div className="k-sig-field"><div className="k-sig-line" /><div className="k-sig-lbl">Lab In-charge</div></div>
              </div>
            </div>
            <div className="k-thermal-footer">Submit to department for procurement.<br />*** OFFICIAL PURCHASE REQUEST ***</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Root KioskScreen ───────────────────────────────────────────────────────── */
export default function KioskScreen() {
  useEffect(() => { injectCSS('kiosk-css-v3', CSS); }, []);

  const [appStep,     setAppStep]     = useState('welcome');
  const [formType,    setFormType]    = useState('borrow');
  const [name,        setName]        = useState('');
  const [studentId,   setStudentId]   = useState('');
  const [studentDbId, setStudentDbId] = useState(null);
  const [department,  setDepartment]  = useState('');
  const [cart,        setCart]        = useState([]);

  const reset = () => {
    setAppStep('welcome');
    setFormType('borrow');
    setName('');
    setStudentId('');
    setStudentDbId(null);
    setDepartment('');
    setCart([]);
  };

  const stepIndex = { step0: 0, step1: 1, step2: 2, step3: 3 }[appStep] ?? -1;

  return (
    <div className="k-root">
      {appStep !== 'welcome' && (
        <div className="k-topbar">
          <div className="k-topbar-left">
            <div>
              <div className="k-lab-name">🔧 AMT Lab — Tool Inventory</div>
              <div className="k-lab-sub">Electronics &amp; Instrumentation Lab · EIL-302</div>
            </div>
          </div>
          <div className="k-nfc-pill"><div className="k-nfc-dot" />NFC Reader Active</div>
        </div>
      )}

      {appStep !== 'welcome' && <StepBar current={stepIndex} />}

      {appStep === 'welcome' && (
        <WelcomeScreen onStart={(type) => { setFormType(type); setAppStep('step0'); }} />
      )}

      {appStep === 'step0' && (
        <StepFormType
          formType={formType}
          setFormType={setFormType}
          onNext={() => setAppStep('step1')}
          onBack={() => setAppStep('welcome')}
        />
      )}

      {/* ↓ Uses the imported StepIdentity (camera + USB-wand QR scanning lives there) */}
      {appStep === 'step1' && (
        <StepIdentity
          name={name}               setName={setName}
          studentId={studentId}     setStudentId={setStudentId}
          studentDbId={studentDbId} setStudentDbId={setStudentDbId}
          department={department}   setDepartment={setDepartment}
          onNext={() => setAppStep('step2')}
          onBack={() => setAppStep('step0')}
        />
      )}

      {appStep === 'step2' && (
        <StepTools
          cart={cart}
          setCart={setCart}
          onNext={() => setAppStep('step3')}
          onBack={() => setAppStep('step1')}
        />
      )}

      {appStep === 'step3' && (
        <StepReceipt
          formType={formType}
          name={name}
          studentId={studentId}
          studentDbId={studentDbId}
          department={department}
          cart={cart}
          onReset={reset}
        />
      )}
    </div>
  );
}