import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ToolAPI, TagAPI, StudentAPI, TransactionAPI, AdminAPI } from '../api';
import BorrowedToolsPanel from '../components/BorrowedToolsPanel';

const T = {
  bg:      '#F5F3EE',
  surface: '#FFFFFF',
  surface2:'#F0EDE6',
  border:  '#E5E3DF',
  border2: 'rgba(0,0,0,0.15)',
  ink:     '#28251d',
  ink2:    '#7A7974',
  ink3:    '#BAB9B4',
  teal:    '#01696f',
  tealBg:  '#CEDCD8',
  green:   '#437a22',
  greenBg: '#D4DFCC',
  amber:   '#B45309',
  amberBg: '#FEF3DC',
  red:     '#C0392B',
  redBg:   '#FEECEB',
  blue:    '#1D4ED8',
  blueBg:  '#EEF3FD',
  tagBg:   '#E8E4DC',
};

// ── Table styles ──────────────────────────────────────────────────────────────
const th = {
  padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600,
  letterSpacing: '1px', textTransform: 'uppercase', color: T.ink2,
  borderBottom: `1px solid ${T.border}`, background: T.surface2,
};
const td = {
  padding: '10px 14px', borderBottom: `1px solid ${T.border}`,
  fontSize: 12, color: T.ink, verticalAlign: 'middle',
};


function StatCard({ label, value, sub, accent, loading }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: '16px 18px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: accent || T.ink, borderRadius: '12px 12px 0 0',
      }} />
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.8px',
        textTransform: 'uppercase', color: T.ink2, marginBottom: 8, marginTop: 3,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 700,
        color: loading ? T.ink3 : (accent || T.ink), lineHeight: 1,
      }}>
        {loading ? '—' : (value ?? '—')}
      </div>
      <div style={{ fontSize: 11, color: T.ink2, marginTop: 5 }}>{sub}</div>
    </div>
  );
}

function SectionLabel({ children, style: extraStyle }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, letterSpacing: '1.2px',
      textTransform: 'uppercase', color: T.ink2, marginBottom: 10,
      ...extraStyle,
    }}>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    AVAILABLE:   { bg: T.greenBg, color: T.green },
    BORROWED:    { bg: T.amberBg, color: T.amber },
    OVERDUE:     { bg: T.redBg,   color: T.red   },
    MAINTENANCE: { bg: T.blueBg,  color: T.blue  },
    RETIRED:     { bg: T.tagBg,   color: T.ink2  },
  };
  const c = map[status] || { bg: T.tagBg, color: T.ink2 };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 20,
      fontSize: 10, fontWeight: 600, background: c.bg, color: c.color,
    }}>
      {status}
    </span>
  );
}

function TagChip({ uid }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 7px', background: T.tagBg,
      borderRadius: 4, fontFamily: 'monospace', fontSize: 10, color: T.ink2,
    }}>
      {uid || '—'}
    </span>
  );
}

function Panel({ children }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 12, overflow: 'hidden', marginBottom: 16,
    }}>
      {children}
    </div>
  );
}

function PanelHead({ title, children }) {
  return (
    <div style={{
      padding: '12px 16px', borderBottom: `1px solid ${T.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: T.surface2,
    }}>
      <span style={{ fontWeight: 700, fontSize: 13, color: T.ink }}>{title}</span>
      {children}
    </div>
  );
}

function SearchInput({ placeholder, value, onChange }) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        padding: '5px 10px', background: T.surface,
        border: `1px solid ${T.border}`, borderRadius: 6,
        color: T.ink, fontSize: 12, outline: 'none', width: 130,
      }}
    />
  );
}

function AddToolModal({ onClose, onAdd }) {
  const [form,        setForm]        = useState({ toolCode: '', name: '', category: '', tagUid: '', purchasePrice: '' });
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [scanStatus,  setScanStatus]  = useState('idle'); // idle | scanning | captured
  const [scanMessage, setScanMessage] = useState('');

  const bufferRef   = useRef('');
  const timerRef    = useRef(null);
  const lastKeyTime = useRef(0);

  // ── NFC HID auto-capture ─────────────────────────────────────────────────
  // The USB reader fires keystrokes < 80ms apart — humans type > 100ms apart.
  // We intercept scanner bursts globally and fill the tagUid field.
  useEffect(() => {
    const handleKeyDown = (e) => {
      const now           = Date.now();
      const timeSinceLast = now - lastKeyTime.current;
      lastKeyTime.current = now;

      const active        = document.activeElement;
      const isOtherInput  = active &&
        (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') &&
        active.dataset.nfcfield !== 'true';

      // Detect scanner burst: chars arrive < 80ms apart
      const isScannerBurst = timeSinceLast < 80;

      // If the user is typing in a normal field (not NFC field), only
      // intercept if it looks like a scanner burst.
      if (isOtherInput && !isScannerBurst) return;

      if (e.key === 'Enter') {
        const uid = bufferRef.current.trim().toUpperCase();
        if (uid.length >= 4) {
          setForm(p => ({ ...p, tagUid: uid }));
          setScanStatus('captured');
          setScanMessage(`UID captured: ${uid}`);
          setTimeout(() => setScanStatus('idle'), 4000);
        }
        bufferRef.current = '';
        clearTimeout(timerRef.current);
        return;
      }

      if (e.key.length === 1) {
        // Only start buffering on the first char if it looks like a scanner burst
        if (bufferRef.current.length === 0 && !isScannerBurst) return;
        bufferRef.current += e.key;
        setScanStatus('scanning');
      }

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const uid = bufferRef.current.trim().toUpperCase();
        if (uid.length >= 4) {
          setForm(p => ({ ...p, tagUid: uid }));
          setScanStatus('captured');
          setScanMessage(`UID captured: ${uid}`);
          setTimeout(() => setScanStatus('idle'), 4000);
        }
        bufferRef.current = '';
      }, 150);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timerRef.current);
    };
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.toolCode.trim() || !form.name.trim()) {
      setError('Tool code and name are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // POST /api/tools
      const toolRes = await ToolAPI.create({
        toolCode:      form.toolCode.trim().toUpperCase(),
        name:          form.name.trim(),
        category:      form.category.trim() || null,
        purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : null,
      });
      const newTool = toolRes.data;

      // POST /api/tags/register — only if a UID was captured or typed
      if (form.tagUid.trim()) {
        await TagAPI.register(form.tagUid.trim().toUpperCase(), newTool.id);
        newTool.tagUid = form.tagUid.trim().toUpperCase(); // show in table immediately
      }

      onAdd(newTool);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add tool. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  // ── Scan zone visual state ────────────────────────────────────────────────
  const zoneColors = {
    idle:     { bg: '#F9F8F5',              border: '#D5D3CE', color: T.ink2  },
    scanning: { bg: 'rgba(1,105,111,0.06)', border: T.teal,   color: T.teal  },
    captured: { bg: T.greenBg,              border: T.green,   color: T.green },
  };
  const zone = zoneColors[scanStatus];
  const zoneIcon  = { idle: '📡', scanning: '⟳', captured: '✓' }[scanStatus];
  const zoneLabel = {
    idle:     'Tap your NFC tag on the USB reader — UID fills automatically',
    scanning: 'Reading tag...',
    captured: scanMessage,
  }[scanStatus];

  const fieldStyle = (key) => ({
    width: '100%', padding: '9px 12px',
    border: `1.5px solid ${key === 'tagUid' && form.tagUid ? T.green : T.border2}`,
    borderRadius: 8, fontSize: 13,
    color: key === 'tagUid' && form.tagUid ? T.green : T.ink,
    background: key === 'tagUid' && form.tagUid ? '#F0F7EC' : T.surface,
    outline: 'none', boxSizing: 'border-box',
    fontFamily: key === 'tagUid' ? 'monospace' : "'Inter', sans-serif",
    letterSpacing: key === 'tagUid' ? '0.06em' : 'normal',
    transition: 'all 0.2s',
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.surface, borderRadius: 16, padding: 28,
          width: 440, maxHeight: '92vh', overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          border: `1px solid ${T.border}`,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: T.ink }}>Add New Tool</div>
            <div style={{ fontSize: 11, color: T.ink2, marginTop: 3 }}>Register a tool and link its NFC tag</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: T.surface2, border: `1px solid ${T.border}`,
              borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
              fontSize: 18, color: T.ink2, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
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
            style={fieldStyle('toolCode')}
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
            style={fieldStyle('name')}
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
            style={fieldStyle('category')}
          />
        </div>

        {/* NFC Tag UID — auto-capture zone */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.ink2, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            NFC Tag UID
          </label>

          {/* Scan zone indicator */}
          <div style={{
            background: zone.bg, border: `1.5px dashed ${zone.border}`,
            borderRadius: 10, padding: '12px 16px', marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 12,
            transition: 'all 0.25s', cursor: 'default',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 9, flexShrink: 0,
              background: scanStatus === 'captured'
                ? 'rgba(67,122,34,0.15)'
                : scanStatus === 'scanning'
                  ? 'rgba(1,105,111,0.12)'
                  : '#EDEAE4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, transition: 'all 0.25s',
            }}>
              {zoneIcon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: zone.color, transition: 'color 0.2s' }}>
                {scanStatus === 'captured' ? 'Tag captured!' : scanStatus === 'scanning' ? 'Reading...' : 'Auto-scan active'}
              </div>
              <div style={{ fontSize: 11, color: zone.color, opacity: 0.75, marginTop: 2, lineHeight: 1.4 }}>
                {zoneLabel}
              </div>
            </div>
            {scanStatus === 'scanning' && (
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.teal, animation: 'pulse 1s ease-in-out infinite' }} />
            )}
          </div>

          {/* Manual UID input */}
          <input
            type="text"
            data-nfcfield="true"
            placeholder="Auto-filled on scan — or type manually"
            value={form.tagUid}
            onChange={e => {
              setForm(p => ({ ...p, tagUid: e.target.value.toUpperCase() }));
              if (e.target.value) { setScanStatus('captured'); setScanMessage(`UID: ${e.target.value.toUpperCase()}`); }
              else setScanStatus('idle');
            }}
            style={fieldStyle('tagUid')}
          />

          {/* UID status row */}
          {form.tagUid ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.green }}>
                ✓ UID ready — will be registered to this tool
              </span>
              <button
                onClick={() => { setForm(p => ({ ...p, tagUid: '' })); setScanStatus('idle'); setScanMessage(''); }}
                style={{ fontSize: 11, color: T.red, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Clear
              </button>
            </div>
          ) : (
            <div style={{ fontSize: 11, color: T.ink3, marginTop: 5 }}>
              Optional — you can register the tag later
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
            style={fieldStyle('purchasePrice')}
          />
        </div>

        {/* How-to tip */}
        <div style={{
          background: T.tealBg, borderRadius: 8, padding: '10px 14px',
          fontSize: 11, color: T.teal, marginBottom: 16,
          display: 'flex', gap: 10, alignItems: 'flex-start', lineHeight: 1.5,
        }}>
          <span style={{ flexShrink: 0 }}>💡</span>
          <span>
            <strong>How to scan:</strong> Keep this modal open, plug in the USB reader,
            then tap the NFC tag to the reader. The UID fills automatically.
            You can also get the UID by opening Notepad and tapping the tag first.
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: T.redBg, color: T.red, borderRadius: 8,
            padding: '9px 12px', fontSize: 12, marginBottom: 14,
          }}>
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px', background: T.surface2,
              border: `1px solid ${T.border}`, borderRadius: 8,
              fontSize: 13, cursor: 'pointer', color: T.ink, fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '9px 22px',
              background: loading ? T.ink2 : T.teal,
              border: 'none', borderRadius: 8, fontSize: 13,
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#fff', fontWeight: 600, fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Adding...' : '+ Add Tool'}
          </button>
        </div>

        <style>{`
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        `}</style>
      </div>
    </div>
  );
}

// ── Main AdminScreen ──────────────────────────────────────────────────────────
export default function AdminScreen({ onNavigate }) {

  // ── State ─────────────────────────────────────────────────────────────────
  const [tools,        setTools]        = useState([]);
  const [students,     setStudents]     = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [dashboard,    setDashboard]    = useState(null);
  const [toolSearch,   setToolSearch]   = useState('');
  const [userSearch,   setUserSearch]   = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  // ── Load all data from backend ─────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [toolsRes, studentsRes, txRes, dashRes] = await Promise.all([
        ToolAPI.getAll({ size: 100 }),                    // GET /api/tools?size=100
        StudentAPI.getAll({ size: 100 }),                 // GET /api/students?size=100
        TransactionAPI.getAll({ size: 10 }),              // GET /api/transactions?size=10
        AdminAPI.getDashboard(),                          // GET /api/admin/dashboard
      ]);
      setTools(toolsRes.data?.content         || []);
      setStudents(studentsRes.data?.content   || []);
      setTransactions(txRes.data?.content     || []);
      setDashboard(dashRes.data);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount + auto-refresh every 30 seconds
  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, [loadAll]);

  // ── Tool actions ──────────────────────────────────────────────────────────
  const handleAddTool = (newTool) => {
    setTools(p => [newTool, ...p]);
    // Refresh dashboard counts
    AdminAPI.getDashboard().then(r => setDashboard(r.data)).catch(() => {});
  };

  const handleRemoveTool = async (id) => {
    if (!window.confirm('Retire this tool? It will be hidden from the inventory, but its borrow history is kept.')) return;
    try {
      await ToolAPI.delete(id);                            // retires server-side (sets RETIRED)
      setTools(p => p.filter(t => t.id !== id));            // hide immediately
      AdminAPI.getDashboard().then(r => setDashboard(r.data)).catch(() => {});
    } catch (err) {
      alert('Could not retire tool: ' + err.message);
    }
  };

  // ── Student actions ───────────────────────────────────────────────────────
  const handleRemoveStudent = async (id) => {
    if (!window.confirm('Deactivate this student?')) return;
    try {
      await StudentAPI.deactivate(id);                   // DELETE /api/students/:id
      setStudents(p => p.filter(s => s.id !== id));
    } catch (err) {
      alert('Could not deactivate student: ' + err.message);
    }
  };

  // ── Filtered lists ─────────────────────────────────────────────────────────
  const filteredTools = tools.filter(t =>
    t.status !== 'RETIRED' &&
    (!toolSearch ||
      t.name?.toLowerCase().includes(toolSearch.toLowerCase()) ||
      t.toolCode?.toLowerCase().includes(toolSearch.toLowerCase()) ||
      (t.tagUid || '').toLowerCase().includes(toolSearch.toLowerCase()))
  );

  const filteredStudents = students.filter(s =>
    !userSearch ||
    s.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    (s.qrCode || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (s.section || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  // ── Transaction feed dot color ────────────────────────────────────────────
  const feedDotColor = (type) =>
    ({ BORROW: T.amber, PURCHASE: T.blue, RETURN: T.green }[type] || T.ink2);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)', background: T.bg,
      padding: '24px 28px', fontFamily: "'Inter', sans-serif",
    }}>

      {/* Global error banner */}
      {error && (
        <div style={{
          background: T.redBg, color: T.red, borderRadius: 8,
          padding: '10px 16px', marginBottom: 16, fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>{error}</span>
          <button
            onClick={loadAll}
            style={{ color: T.red, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline', fontFamily: 'inherit' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard
          loading={loading} label="Total Tools"
          value={dashboard?.totalTools}
          sub={`${dashboard?.availableTools ?? '—'} available`}
          accent={T.ink}
        />
        <StatCard
          loading={loading} label="Borrowed"
          value={dashboard?.borrowedTools}
          sub={`${dashboard?.overdueBorrows ?? '—'} overdue`}
          accent={T.amber}
        />
        <StatCard
          loading={loading} label="Active Students"
          value={dashboard?.totalStudents}
          sub="registered borrowers"
          accent={T.blue}
        />
        <StatCard
          loading={loading} label="Today's Scans"
          value={dashboard?.todayTransactions}
          sub="transactions today"
          accent={T.green}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>

        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div>

          {/* Tool Inventory */}
          <SectionLabel>Tool Inventory</SectionLabel>
          <Panel>
            <PanelHead title={`All Tools (${filteredTools.length})`}>
              <div style={{ display: 'flex', gap: 8 }}>
                <SearchInput
                  placeholder="Search tools…"
                  value={toolSearch}
                  onChange={e => setToolSearch(e.target.value)}
                />
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    padding: '5px 14px', background: T.teal, border: 'none',
                    borderRadius: 6, color: '#fff', fontWeight: 600,
                    fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                    fontFamily: 'inherit',
                  }}
                >
                  + Add Tool
                </button>
              </div>
            </PanelHead>

            {loading ? (
              <div style={{ padding: 28, textAlign: 'center', color: T.ink2, fontSize: 13 }}>
                Loading tools...
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Code</th>
                    <th style={th}>Tool</th>
                    <th style={th}>NFC Tag</th>
                    <th style={th}>Status</th>
                    <th style={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTools.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ ...td, textAlign: 'center', color: T.ink3, padding: 28 }}>
                        {toolSearch ? 'No tools match your search' : 'No tools yet — click + Add Tool'}
                      </td>
                    </tr>
                  ) : filteredTools.map(tool => (
                    <tr key={tool.id} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = T.surface2}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ ...td, fontFamily: 'monospace', fontSize: 11, color: T.ink2 }}>
                        {tool.toolCode}
                      </td>
                      <td style={{ ...td, fontWeight: 500 }}>{tool.name}</td>
                      <td style={td}><TagChip uid={tool.tagUid} /></td>
                      <td style={td}><StatusBadge status={tool.status} /></td>
                      <td style={td}>
                        <button
                          onClick={() => handleRemoveTool(tool.id)}
                          style={{
                            padding: '3px 10px', border: `1px solid rgba(192,57,43,0.2)`,
                            borderRadius: 5, fontSize: 11, cursor: 'pointer',
                            color: T.red, background: 'transparent', fontFamily: 'inherit',
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>

          {/* Student Management */}
          <SectionLabel>Student Management</SectionLabel>
          <Panel>
            <PanelHead title={`Registered Students (${students.length})`}>
              <SearchInput
                placeholder="Search students…"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </PanelHead>

            {loading ? (
              <div style={{ padding: 28, textAlign: 'center', color: T.ink2, fontSize: 13 }}>
                Loading students...
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Name</th>
                    <th style={th}>QR / ID</th>
                    <th style={th}>Section</th>
                    <th style={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ ...td, textAlign: 'center', color: T.ink3, padding: 28 }}>
                        {userSearch ? 'No students match your search' : 'No students registered yet'}
                      </td>
                    </tr>
                  ) : filteredStudents.map(s => (
                    <tr key={s.id}
                      onMouseEnter={e => e.currentTarget.style.background = T.surface2}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ ...td, fontWeight: 500 }}>{s.name}</td>
                      <td style={{ ...td, fontFamily: 'monospace', fontSize: 11 }}>{s.qrCode}</td>
                      <td style={{ ...td, color: T.ink2 }}>{s.section || '—'}</td>
                      <td style={td}>
                        <button
                          onClick={() => handleRemoveStudent(s.id)}
                          style={{
                            padding: '3px 10px', border: `1px solid rgba(192,57,43,0.2)`,
                            borderRadius: 5, fontSize: 11, cursor: 'pointer',
                            color: T.red, background: 'transparent', fontFamily: 'inherit',
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
        <div>

          {/* Live Activity Feed */}
          <SectionLabel>Live Activity</SectionLabel>
          <Panel>
            <PanelHead title="Recent Transactions">
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 600, color: T.green }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', background: T.green,
                  animation: 'kdot 1.5s ease-in-out infinite',
                }} />
                LIVE
              </div>
            </PanelHead>

            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: T.ink2, fontSize: 13 }}>
                Loading...
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ padding: 28, textAlign: 'center', color: T.ink3, fontSize: 13 }}>
                No transactions yet — complete a kiosk borrow to see activity here
              </div>
            ) : (
              <div>
                {transactions.map((tx, i) => (
                  <div
                    key={tx.id}
                    style={{
                      padding: '11px 16px',
                      borderBottom: i < transactions.length - 1 ? `1px solid ${T.border}` : 'none',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      marginTop: 4, flexShrink: 0,
                      background: feedDotColor(tx.type),
                    }} />
                    <div>
                      <div style={{ fontSize: 12, color: T.ink, lineHeight: 1.5 }}>
                        <strong>{tx.student?.name || tx.borrowerName || 'Walk-in'}</strong>
                        {' '}
                        {tx.type === 'BORROW'   ? 'borrowed'   :
                         tx.type === 'RETURN'   ? 'returned'   :
                         tx.type === 'PURCHASE' ? 'requested'  : tx.type?.toLowerCase()}
                        {' '}
                        <strong>{tx.items?.length ?? 0}</strong> item{(tx.items?.length ?? 0) !== 1 ? 's' : ''}
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 10, color: T.ink2, marginTop: 2 }}>
                        {tx.receiptNumber}
                        {tx.transactedAt
                          ? ' · ' + new Date(tx.transactedAt).toLocaleString('en-PH', {
                              hour: '2-digit', minute: '2-digit',
                              month: 'short', day: 'numeric',
                            })
                          : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Quick Actions */}
          <SectionLabel>Quick Actions</SectionLabel>
          {[
            {
              icon: '🖥',
              label: 'Go to Kiosk',
              sub: 'Switch to student kiosk view',
              color: T.tealBg,
              action: () => onNavigate('kiosk'),
            },
            {
              icon: '📡',
              label: 'Register NFC Tag',
              sub: 'Open Add Tool modal to link a tag',
              color: T.greenBg,
              action: () => setShowAddModal(true),
            },
            {
              icon: '🔄',
              label: 'Refresh Data',
              sub: 'Reload all tools and transactions',
              color: T.blueBg,
              action: loadAll,
            },
            {
              icon: '🔔',
              label: 'Check Overdue',
              sub: `${dashboard?.overdueBorrows ?? 0} borrow${(dashboard?.overdueBorrows ?? 0) !== 1 ? 's' : ''} overdue`,
              color: T.redBg,
              action: async () => {
                try {
                  const res = await TransactionAPI.getOverdue(24);
                  const count = res.data?.length ?? 0;
                  alert(
                    count > 0
                      ? `${count} overdue borrower${count !== 1 ? 's' : ''} found.\nCheck the transactions list for details.`
                      : 'No overdue borrows in the last 24 hours.'
                  );
                } catch {
                  alert('Could not fetch overdue data.');
                }
              },
            },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              style={{
                width: '100%', padding: '11px 14px', marginBottom: 8,
                borderRadius: 8, border: `1px solid ${T.border}`,
                background: T.surface, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.surface2}
              onMouseLeave={e => e.currentTarget.style.background = T.surface}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: btn.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
              }}>
                {btn.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.ink }}>{btn.label}</div>
                <div style={{ fontSize: 11, color: T.ink2, marginTop: 1 }}>{btn.sub}</div>
              </div>
            </button>
          ))}

        </div>
      </div>

      {/* ── Returns & Tracking (full width) ───────────────────────────────── */}
      <div style={{ marginTop: 24 }}>
        <BorrowedToolsPanel onReturned={loadAll} />
      </div>

      {/* Add Tool Modal */}
      {showAddModal && (
        <AddToolModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddTool}
        />
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes kdot { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>
    </div>
  );
}