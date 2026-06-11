import React, { useState, useEffect, useRef } from 'react';
import { TransactionAPI } from '../api';
import { printReceipt, connectPrinter, isPrinterConnected } from '../escposPrinter';

export default function StepReceipt({ formType, name, studentId, studentDbId, department, cart, onReset }) {
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
        type:         formType.toUpperCase(),         
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