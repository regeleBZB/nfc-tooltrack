import React, { useState, useEffect, useCallback } from 'react';
import { ToolAPI, TagAPI, StudentAPI, TransactionAPI, AdminAPI } from '../api';

const T = {
  bg: '#F5F3EE', surface: '#FFFFFF', surface2: '#F0EDE6',
  border: '#E5E3DF', border2: 'rgba(0,0,0,0.15)',
  ink: '#28251d', ink2: '#7A7974', ink3: '#BAB9B4',
  teal: '#01696f', tealBg: '#CEDCD8',
  green: '#437a22', greenBg: '#D4DFCC',
  amber: '#B45309', amberBg: '#FEF3DC',
  red: '#C0392B', redBg: '#FEECEB',
  blue: '#1D4ED8', blueBg: '#EEF3FD',
  tagBg: '#E8E4DC',
};

// ── Reusable UI ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent, loading }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent || T.ink, borderRadius: '12px 12px 0 0' }} />
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: T.ink2, marginBottom: 8, marginTop: 3 }}>{label}</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 700, color: loading ? T.ink3 : (accent || T.ink), lineHeight: 1 }}>
        {loading ? '—' : value}
      </div>
      <div style={{ fontSize: 11, color: T.ink2, marginTop: 5 }}>{sub}</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: T.ink2, marginBottom: 10 }}>{children}</div>;
}

function StatusBadge({ status }) {
  const map = { AVAILABLE: { bg: T.greenBg, color: T.green }, Available: { bg: T.greenBg, color: T.green }, BORROWED: { bg: T.amberBg, color: T.amber }, Borrowed: { bg: T.amberBg, color: T.amber }, OVERDUE: { bg: T.redBg, color: T.red }, MAINTENANCE: { bg: T.blueBg, color: T.blue } };
  const c = map[status] || { bg: T.tagBg, color: T.ink2 };
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: c.bg, color: c.color }}>{status}</span>;
}

function RoleBadge({ role }) {
  const map = { Admin: { bg: T.blueBg, color: T.blue }, Instructor: { bg: T.amberBg, color: T.amber }, Student: { bg: T.tagBg, color: T.ink2 } };
  const c = map[role] || { bg: T.tagBg, color: T.ink2 };
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: c.bg, color: c.color }}>{role}</span>;
}

function TagChip({ uid }) {
  return <span style={{ display: 'inline-block', padding: '2px 7px', background: T.tagBg, borderRadius: 4, fontFamily: 'monospace', fontSize: 10, color: T.ink2 }}>{uid || '—'}</span>;
}

function Panel({ children }) {
  return <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>{children}</div>;
}

function PanelHead({ title, children }) {
  return (
    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.surface2 }}>
      <span style={{ fontWeight: 700, fontSize: 13, color: T.ink }}>{title}</span>
      {children}
    </div>
  );
}

function SearchInput({ placeholder, value, onChange }) {
  return <input placeholder={placeholder} value={value} onChange={onChange} style={{ padding: '5px 10px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, color: T.ink, fontSize: 12, outline: 'none', width: 130 }} />;
}

const th = { padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: T.ink2, borderBottom: `1px solid ${T.border}`, background: T.surface2 };
const td = { padding: '10px 14px', borderBottom: `1px solid ${T.border}`, fontSize: 12, color: T.ink, verticalAlign: 'middle' };

// ── Add Tool Modal ─────────────────────────────────────────────────────────────
function AddToolModal({ onClose, onAdd }) {
  const [form, setForm]       = useState({ toolCode: '', name: '', category: '', tagUid: '', purchasePrice: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    if (!form.toolCode || !form.name) { setError('Tool code and name are required.'); return; }
    setLoading(true); setError('');
    try {
      // ✅ WIRED: POST /api/tools
      const toolRes = await ToolAPI.create({
        toolCode:      form.toolCode.toUpperCase(),
        name:          form.name,
        category:      form.category || null,
        purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : null,
      });
      const newTool = toolRes.data;

      // ✅ WIRED: POST /api/tags/register (if UID provided)
      if (form.tagUid.trim()) {
        await TagAPI.register(form.tagUid.trim().toUpperCase(), newTool.id);
      }

      onAdd(newTool);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add tool.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, padding: 28, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: T.ink }}>Add New Tool</div>
            <div style={{ fontSize: 11, color: T.ink2, marginTop: 2 }}>Register a tool and link its NFC tag</div>
          </div>
          <button onClick={onClose} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: T.ink2 }}>×</button>
        </div>

        {[
          { label: 'Tool Code *',      key: 'toolCode',      placeholder: 'e.g. TW-001'              },
          { label: 'Tool Name *',      key: 'name',          placeholder: 'e.g. Torque Wrench'        },
          { label: 'Category',         key: 'category',      placeholder: 'e.g. Wrench, Measuring'    },
          { label: 'NFC Tag UID',      key: 'tagUid',        placeholder: 'e.g. 04A3F2C1'             },
          { label: 'Purchase Price ₱', key: 'purchasePrice', placeholder: 'e.g. 1500.00', type: 'number' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.ink2, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
            <input
              type={f.type || 'text'}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', border: `1px solid ${T.border2}`, borderRadius: 8, fontSize: 13, color: T.ink, background: T.surface, outline: 'none', boxSizing: 'border-box', fontFamily: f.key === 'tagUid' ? 'monospace' : 'inherit' }}
            />
          </div>
        ))}

        <div style={{ background: T.tealBg, borderRadius: 8, padding: '8px 12px', fontSize: 11, color: T.teal, marginBottom: 16, display: 'flex', gap: 8 }}>
          <span>📡</span>
          <span>Get the UID by plugging in the USB reader, opening Notepad, and tapping the tag.</span>
        </div>

        {error && <div style={{ background: T.redBg, color: T.red, borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 14 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, cursor: 'pointer', color: T.ink, fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ padding: '9px 20px', background: T.teal, border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#fff', fontWeight: 600, fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Adding...' : 'Add Tool'}
          </button>
        </div>
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
  const [printerMode,  setPrinterMode]  = useState('USB');
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  // ── Load data from backend ─────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [toolsRes, studentsRes, txRes, dashRes] = await Promise.all([
        // ✅ WIRED: GET /api/tools?size=100
        ToolAPI.getAll({ size: 100 }),
        // ✅ WIRED: GET /api/students?size=100
        StudentAPI.getAll({ size: 100 }),
        // ✅ WIRED: GET /api/transactions?size=10&sort=transactedAt,desc
        TransactionAPI.getAll({ size: 10 }),
        // ✅ WIRED: GET /api/admin/dashboard
        AdminAPI.getDashboard(),
      ]);
      setTools(toolsRes.data?.content     || []);
      setStudents(studentsRes.data?.content || []);
      setTransactions(txRes.data?.content   || []);
      setDashboard(dashRes.data);
      if (dashRes.data?.printerMode) setPrinterMode(dashRes.data.printerMode);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Tool actions ──────────────────────────────────────────────────────────
  const handleAddTool = (newTool) => {
    setTools(p => [newTool, ...p]);
    setShowAddModal(false);
  };

  const handleRemoveTool = async (id) => {
    if (!window.confirm('Remove this tool?')) return;
    try {
      // ✅ WIRED: DELETE /api/tools/:id
      await ToolAPI.delete(id);
      setTools(p => p.filter(t => t.id !== id));
    } catch (err) {
      alert('Could not remove tool: ' + err.message);
    }
  };

  // ── Student actions ───────────────────────────────────────────────────────
  const handleRemoveStudent = async (id) => {
    if (!window.confirm('Deactivate this student?')) return;
    try {
      // ✅ WIRED: DELETE /api/students/:id
      await StudentAPI.deactivate(id);
      setStudents(p => p.filter(s => s.id !== id));
    } catch (err) {
      alert('Could not remove student: ' + err.message);
    }
  };

  // ── Printer mode ──────────────────────────────────────────────────────────
  const switchPrinterMode = async (mode) => {
    try {
      // ✅ WIRED: POST /api/admin/printer/mode?mode=USB|BLUETOOTH
      await AdminAPI.switchPrinterMode(mode);
      setPrinterMode(mode);
    } catch (err) {
      alert('Could not switch printer mode: ' + err.message);
    }
  };

  // ── Filtered lists ─────────────────────────────────────────────────────────
  const filteredTools    = tools.filter(t =>
    !toolSearch || t.name?.toLowerCase().includes(toolSearch.toLowerCase()) || t.toolCode?.toLowerCase().includes(toolSearch.toLowerCase())
  );
  const filteredStudents = students.filter(s =>
    !userSearch || s.name?.toLowerCase().includes(userSearch.toLowerCase()) || s.qrCode?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // ── Feed color ─────────────────────────────────────────────────────────────
  const feedDotColor = (type) => ({ BORROW: T.amber, PURCHASE: T.blue, RETURN: T.green }[type] || T.ink2);

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: T.bg, padding: '24px 28px', fontFamily: "'Inter', sans-serif" }}>

      {error && (
        <div style={{ background: T.redBg, color: T.red, borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13 }}>
          {error} — <button onClick={loadAll} style={{ color: T.red, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}>Retry</button>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard loading={loading} label="Total Tools"     value={dashboard?.totalTools}        sub={`${dashboard?.availableTools ?? '—'} available`}    accent={T.ink}  />
        <StatCard loading={loading} label="Borrowed"        value={dashboard?.borrowedTools}      sub={`${dashboard?.overdueBorrows ?? '—'} overdue`}       accent={T.amber}/>
        <StatCard loading={loading} label="Active Students" value={dashboard?.totalStudents}      sub="registered borrowers"                                accent={T.blue} />
        <StatCard loading={loading} label="Today's Scans"   value={dashboard?.todayTransactions}  sub="transactions today"                                  accent={T.green}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>

        {/* ── LEFT ── */}
        <div>
          <SectionLabel>Tool Inventory</SectionLabel>
          <Panel>
            <PanelHead title={`All Tools (${tools.length})`}>
              <div style={{ display: 'flex', gap: 8 }}>
                <SearchInput placeholder="Search tools…" value={toolSearch} onChange={e => setToolSearch(e.target.value)} />
                <button onClick={() => setShowAddModal(true)} style={{ padding: '5px 14px', background: T.teal, border: 'none', borderRadius: 6, color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                  + Add Tool
                </button>
              </div>
            </PanelHead>

            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: T.ink2, fontSize: 13 }}>Loading tools...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr><th style={th}>Code</th><th style={th}>Tool</th><th style={th}>NFC Tag</th><th style={th}>Status</th><th style={th}></th></tr>
                </thead>
                <tbody>
                  {filteredTools.length === 0 ? (
                    <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: T.ink3, padding: 24 }}>No tools yet — click + Add Tool</td></tr>
                  ) : filteredTools.map(tool => (
                    <tr key={tool.id}>
                      <td style={{ ...td, fontFamily: 'monospace', fontSize: 11, color: T.ink2 }}>{tool.toolCode}</td>
                      <td style={{ ...td, fontWeight: 500 }}>{tool.name}</td>
                      <td style={td}><TagChip uid={tool.tagUid} /></td>
                      <td style={td}><StatusBadge status={tool.status} /></td>
                      <td style={td}>
                        <button onClick={() => handleRemoveTool(tool.id)} style={{ padding: '3px 10px', border: `1px solid rgba(192,57,43,0.2)`, borderRadius: 5, fontSize: 11, cursor: 'pointer', color: T.red, background: 'transparent', fontFamily: 'inherit' }}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>

          <SectionLabel>Student Management</SectionLabel>
          <Panel>
            <PanelHead title={`Registered Students (${students.length})`}>
              <SearchInput placeholder="Search students…" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            </PanelHead>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: T.ink2, fontSize: 13 }}>Loading students...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr><th style={th}>Name</th><th style={th}>QR / ID</th><th style={th}>Section</th><th style={th}></th></tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr><td colSpan={4} style={{ ...td, textAlign: 'center', color: T.ink3, padding: 24 }}>No students registered yet</td></tr>
                  ) : filteredStudents.map(s => (
                    <tr key={s.id}>
                      <td style={{ ...td, fontWeight: 500 }}>{s.name}</td>
                      <td style={{ ...td, fontFamily: 'monospace', fontSize: 11 }}>{s.qrCode}</td>
                      <td style={{ ...td, color: T.ink2 }}>{s.section || '—'}</td>
                      <td style={td}>
                        <button onClick={() => handleRemoveStudent(s.id)} style={{ padding: '3px 10px', border: `1px solid rgba(192,57,43,0.2)`, borderRadius: 5, fontSize: 11, cursor: 'pointer', color: T.red, background: 'transparent', fontFamily: 'inherit' }}>
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

        {/* ── RIGHT ── */}
        <div>
          <SectionLabel>Live Activity</SectionLabel>
          <Panel>
            <PanelHead title="Recent Transactions">
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 600, color: T.green }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, animation: 'kdot 1.5s ease-in-out infinite' }} />
                LIVE
              </div>
            </PanelHead>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: T.ink2, fontSize: 13 }}>Loading...</div>
            ) : transactions.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: T.ink3, fontSize: 13 }}>No transactions yet</div>
            ) : (
              <div>
                {transactions.map((tx, i) => (
                  <div key={tx.id} style={{ padding: '11px 16px', borderBottom: i < transactions.length - 1 ? `1px solid ${T.border}` : 'none', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 3, flexShrink: 0, background: feedDotColor(tx.type) }} />
                    <div>
                      <div style={{ fontSize: 12, color: T.ink, lineHeight: 1.5 }}>
                        <strong>{tx.student?.name || tx.borrowerName || 'Walk-in'}</strong>
                        {' '}{tx.type === 'BORROW' ? 'borrowed' : tx.type === 'RETURN' ? 'returned' : 'requested'}{' '}
                        {tx.items?.length} item{tx.items?.length !== 1 ? 's' : ''}
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 10, color: T.ink2, marginTop: 2 }}>
                        {tx.receiptNumber} · {tx.transactedAt ? new Date(tx.transactedAt).toLocaleString('en-PH', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <SectionLabel>Quick Actions</SectionLabel>
          {[
            { icon: '🖥', label: 'Go to Kiosk',           sub: 'Switch to student kiosk view',       color: T.tealBg,  action: () => onNavigate('kiosk')         },
            { icon: '📡', label: 'Register NFC Tag',      sub: 'Link a scanned UID to a tool',        color: T.greenBg, action: () => setShowAddModal(true)       },
            { icon: '🔄', label: 'Refresh Data',          sub: 'Reload tools and transactions',       color: T.blueBg,  action: loadAll                           },
            { icon: '🔔', label: 'Check Overdue',         sub: `${dashboard?.overdueBorrows ?? 0} borrows overdue`, color: T.redBg, action: async () => {
              try {
                const res = await TransactionAPI.getOverdue(24);
                alert(`${res.data?.length ?? 0} overdue borrowers found.\nCheck the transactions list for details.`);
              } catch { alert('Could not fetch overdue data.'); }
            }},
          ].map((btn, i) => (
            <button key={i} onClick={btn.action} style={{ width: '100%', padding: '11px 14px', marginBottom: 8, borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = T.surface2}
              onMouseLeave={e => e.currentTarget.style.background = T.surface}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: btn.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{btn.icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.ink }}>{btn.label}</div>
                <div style={{ fontSize: 11, color: T.ink2, marginTop: 1 }}>{btn.sub}</div>
              </div>
            </button>
          ))}

          <SectionLabel style={{ marginTop: 8 }}>Printer</SectionLabel>
          <Panel>
            <PanelHead title="Printer Mode" />
            <div style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
              {['USB', 'BLUETOOTH'].map(mode => (
                <button key={mode} onClick={() => switchPrinterMode(mode)} style={{ flex: 1, padding: 8, borderRadius: 6, border: `1px solid ${printerMode === mode ? T.teal : T.border}`, background: printerMode === mode ? T.tealBg : T.surface2, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: printerMode === mode ? 700 : 500, color: printerMode === mode ? T.teal : T.ink, transition: 'all 0.15s' }}>
                  {mode === 'USB' ? '🖨 USB' : '📶 Bluetooth'}
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {showAddModal && <AddToolModal onClose={() => setShowAddModal(false)} onAdd={handleAddTool} />}

      <style>{`@keyframes kdot { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  );
}