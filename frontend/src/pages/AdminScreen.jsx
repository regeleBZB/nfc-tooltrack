import React, { useState } from 'react';

// ✅ FIXED: All dark theme CSS variables replaced with KioskScreen light palette:
//   #F5F3EE  bg, #FFFFFF surface, #28251d ink, #7A7974 muted,
//   #01696f  teal accent, #437a22 green, #C0392B red, #E5E3DF border

// ── Light-theme design tokens (mirrors KioskScreen palette) ──────────────────
const T = {
  bg:         '#F5F3EE',
  surface:    '#FFFFFF',
  surface2:   '#F0EDE6',
  border:     '#E5E3DF',
  border2:    'rgba(0,0,0,0.15)',
  ink:        '#28251d',
  ink2:       '#7A7974',
  ink3:       '#BAB9B4',
  teal:       '#01696f',
  tealBg:     '#CEDCD8',
  green:      '#437a22',
  greenBg:    '#D4DFCC',
  amber:      '#B45309',
  amberBg:    '#FEF3DC',
  red:        '#C0392B',
  redBg:      '#FEECEB',
  blue:       '#1D4ED8',
  blueBg:     '#EEF3FD',
  tagBg:      '#E8E4DC',
};

// ── Reusable components ──────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: '16px 18px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Accent bar top */}
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
        fontFamily: "'Inter', sans-serif", fontSize: 32,
        fontWeight: 700, color: accent || T.ink, lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: T.ink2, marginTop: 5 }}>{sub}</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, letterSpacing: '1.2px',
      textTransform: 'uppercase', color: T.ink2, marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  // ✅ FIXED: light-mode badge colors (no dark rgba)
  const map = {
    AVAILABLE: { bg: T.greenBg,  color: T.green },
    Available: { bg: T.greenBg,  color: T.green },
    BORROWED:  { bg: T.amberBg,  color: T.amber },
    Borrowed:  { bg: T.amberBg,  color: T.amber },
    OVERDUE:   { bg: T.redBg,    color: T.red   },
    Overdue:   { bg: T.redBg,    color: T.red   },
    MAINTENANCE:{ bg: T.blueBg,  color: T.blue  },
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

function RoleBadge({ role }) {
  const map = {
    Admin:      { bg: T.blueBg,  color: T.blue  },
    Instructor: { bg: T.amberBg, color: T.amber  },
    Student:    { bg: T.tagBg,   color: T.ink2   },
  };
  const c = map[role] || { bg: T.tagBg, color: T.ink2 };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 20,
      fontSize: 10, fontWeight: 600, background: c.bg, color: c.color,
    }}>
      {role}
    </span>
  );
}

function TagChip({ uid }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 7px',
      background: T.tagBg, borderRadius: 4,
      fontFamily: 'monospace', fontSize: 10, color: T.ink2,
    }}>
      {uid}
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
        color: T.ink, fontSize: 12,
        fontFamily: "'Inter', sans-serif", outline: 'none', width: 130,
      }}
    />
  );
}

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

// ── Mock data (replace with API calls) ───────────────────────────────────────
// ✅ BACKEND NOTE: status values match ToolStatus enum (AVAILABLE/BORROWED/MAINTENANCE/RETIRED)
const INIT_TOOLS = [
  { id: 1, toolCode: 'MM-001', name: 'Digital Multimeter',  tagUid: 'NFC-A3F7', status: 'BORROWED'   },
  { id: 2, toolCode: 'OS-002', name: 'Oscilloscope Probe',  tagUid: 'NFC-B2C1', status: 'AVAILABLE'  },
  { id: 3, toolCode: 'FG-003', name: 'Function Generator',  tagUid: 'NFC-D4E9', status: 'OVERDUE'    },
  { id: 4, toolCode: 'BB-004', name: 'Breadboard Kit',      tagUid: 'NFC-F1A2', status: 'AVAILABLE'  },
  { id: 5, toolCode: 'PS-005', name: 'DC Power Supply',     tagUid: 'NFC-G9B3', status: 'BORROWED'   },
];

// ✅ BACKEND NOTE: students map to Student entity (name, qrCode, section)
const INIT_STUDENTS = [
  { id: 1, name: 'Reyes, Maria',    qrCode: '2024-00421', section: 'EE301-3A', role: 'Student'    },
  { id: 2, name: 'Santos, Luis',    qrCode: '2023-01182', section: 'EE205-2B', role: 'Student'    },
  { id: 3, name: 'Prof. Dela Cruz', qrCode: 'INS-0042',   section: 'N/A',      role: 'Instructor' },
  { id: 4, name: 'Admin User',      qrCode: 'ADM-001',    section: 'N/A',      role: 'Admin'      },
];

// ✅ BACKEND NOTE: feed maps to Transaction entity (type, student, tool, transactedAt)
const FEED = [
  { type: 'borrow',  text: 'Reyes, Maria borrowed Digital Multimeter',   tagUid: 'NFC-A3F7', time: 'Today · 09:42 AM · EE301-3A' },
  { type: 'return',  text: 'Santos, Luis returned Breadboard Kit',        tagUid: 'NFC-F1A2', time: 'Today · 09:31 AM · EE205-2B' },
  { type: 'overdue', text: 'Cruz, Ana — Function Generator overdue 2d',   tagUid: 'NFC-D4E9', time: 'Due · May 15 · EE301-3A'    },
  { type: 'borrow',  text: 'Gomez, R. borrowed DC Power Supply',          tagUid: 'NFC-G9B3', time: 'Today · 08:55 AM · EE402-4A' },
  { type: 'return',  text: 'Torres, J. returned Oscilloscope Probe',      tagUid: 'NFC-B2C1', time: 'Today · 08:20 AM · EE205-2B' },
];

const feedDotColor = { borrow: T.amber, return: T.green, overdue: T.red };

// ── Main AdminScreen ──────────────────────────────────────────────────────────
export default function AdminScreen() {
  const [tools,      setTools]      = useState(INIT_TOOLS);
  const [students,   setStudents]   = useState(INIT_STUDENTS);
  const [toolSearch, setToolSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [newTool,    setNewTool]    = useState({ toolCode: '', name: '', tagUid: '' });

  // ── Tool CRUD (wire to backend later) ───────────────────────────────────────
  const addTool = async () => {
    if (!newTool.toolCode || !newTool.name) return;
    // TODO: POST /api/tools → { toolCode, name }
    // TODO: POST /api/tags/register → { uid: newTool.tagUid, toolId: response.id }
    setTools(prev => [...prev, {
      id: Date.now(), ...newTool, status: 'AVAILABLE',
    }]);
    setNewTool({ toolCode: '', name: '', tagUid: '' });
  };

  const removeTool = async (id) => {
    // TODO: DELETE /api/tools/:id
    setTools(prev => prev.filter(t => t.id !== id));
  };

  const removeStudent = async (id) => {
    // TODO: DELETE /api/students/:id  (actually deactivates, not hard delete)
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  // ── Filtered lists ───────────────────────────────────────────────────────────
  const filteredTools = tools.filter(t =>
    t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
    t.toolCode.toLowerCase().includes(toolSearch.toLowerCase()) ||
    (t.tagUid || '').toLowerCase().includes(toolSearch.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    s.qrCode.toLowerCase().includes(userSearch.toLowerCase())
  );

  // ── Stats (will come from GET /api/admin/dashboard) ──────────────────────────
  const available = tools.filter(t => t.status === 'AVAILABLE').length;
  const borrowed  = tools.filter(t => t.status === 'BORROWED').length;
  const overdue   = tools.filter(t => t.status === 'OVERDUE').length;

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      background: T.bg,
      padding: '24px 28px',
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Tools"      value={tools.length}    sub={`${available} available`}    accent={T.ink}  />
        <StatCard label="Borrowed"         value={borrowed}        sub={`${overdue} overdue`}         accent={T.amber}/>
        <StatCard label="Active Students"  value={students.length} sub={`${students.filter(s=>s.role==='Instructor').length} instructors`} accent={T.blue} />
        <StatCard label="Today's Scans"    value="12"              sub="since 8:00 AM"                accent={T.green}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>

        {/* ── LEFT COLUMN ── */}
        <div>

          {/* Tool Inventory */}
          <SectionLabel>Tool Inventory</SectionLabel>
          <Panel>
            <PanelHead title="All Tools">
              <SearchInput
                placeholder="Search tools…"
                value={toolSearch}
                onChange={e => setToolSearch(e.target.value)}
              />
            </PanelHead>

            {/* Add tool row */}
            {/* ✅ BACKEND: toolCode maps to Tool.toolCode, tagUid maps to Tag.uid */}
            <div style={{
              padding: '12px 16px', display: 'flex', gap: 8,
              borderBottom: `1px solid ${T.border}`, background: T.surface2,
            }}>
              <input
                placeholder="Code (e.g. TW-001)"
                value={newTool.toolCode}
                onChange={e => setNewTool(p => ({ ...p, toolCode: e.target.value }))}
                style={{ width: 120, padding: '7px 10px', border: `1px solid ${T.border2}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}
              />
              <input
                placeholder="Tool name"
                value={newTool.name}
                onChange={e => setNewTool(p => ({ ...p, name: e.target.value }))}
                style={{ flex: 1, padding: '7px 10px', border: `1px solid ${T.border2}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}
              />
              <input
                placeholder="NFC Tag UID"
                value={newTool.tagUid}
                onChange={e => setNewTool(p => ({ ...p, tagUid: e.target.value }))}
                style={{ width: 110, padding: '7px 10px', border: `1px solid ${T.border2}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}
              />
              <button
                onClick={addTool}
                style={{
                  padding: '7px 14px', background: T.teal, border: 'none',
                  borderRadius: 6, color: '#fff', fontWeight: 700, fontSize: 12,
                  cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
                }}
              >
                + Add
              </button>
            </div>

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
                {filteredTools.map(tool => (
                  <tr key={tool.id} style={{ cursor: 'default' }}>
                    <td style={{ ...td, fontFamily: 'monospace', fontSize: 11, color: T.ink2 }}>{tool.toolCode}</td>
                    <td style={{ ...td, fontWeight: 500 }}>{tool.name}</td>
                    <td style={td}><TagChip uid={tool.tagUid || '—'} /></td>
                    <td style={td}><StatusBadge status={tool.status} /></td>
                    <td style={td}>
                      <button
                        onClick={() => removeTool(tool.id)}
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
          </Panel>

          {/* Student / User Management */}
          {/* ✅ BACKEND NOTE: "Users" here = Student entity, not AppUser */}
          <SectionLabel>Student Management</SectionLabel>
          <Panel>
            <PanelHead title="Registered Students">
              <SearchInput
                placeholder="Search students…"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </PanelHead>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>QR / ID</th>
                  <th style={th}>Section</th>
                  <th style={th}>Role</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => (
                  <tr key={s.id}>
                    <td style={{ ...td, fontWeight: 500 }}>{s.name}</td>
                    <td style={{ ...td, fontFamily: 'monospace', fontSize: 11 }}>{s.qrCode}</td>
                    <td style={{ ...td, color: T.ink2 }}>{s.section}</td>
                    <td style={td}><RoleBadge role={s.role} /></td>
                    <td style={td}>
                      <button
                        onClick={() => removeStudent(s.id)}
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
          </Panel>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div>

          {/* Live Activity Feed */}
          {/* ✅ BACKEND: GET /api/transactions?size=10&sort=transactedAt,desc */}
          <SectionLabel>Live Activity</SectionLabel>
          <Panel>
            <PanelHead title="Recent Transactions">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 10, fontWeight: 600, color: T.green,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', background: T.green,
                  animation: 'kdot 1.5s ease-in-out infinite',
                }} />
                LIVE
              </div>
            </PanelHead>
            <div>
              {FEED.map((item, i) => (
                <div key={i} style={{
                  padding: '11px 16px',
                  borderBottom: i < FEED.length - 1 ? `1px solid ${T.border}` : 'none',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', marginTop: 3, flexShrink: 0,
                    background: feedDotColor[item.type] || T.ink2,
                  }} />
                  <div>
                    <div style={{ fontSize: 12, color: T.ink, lineHeight: 1.5 }}>
                      {item.text} <TagChip uid={item.tagUid} />
                    </div>
                    <div style={{
                      fontFamily: 'monospace', fontSize: 10, color: T.ink2, marginTop: 2,
                    }}>
                      {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Quick Actions */}
          <SectionLabel>Quick Actions</SectionLabel>
          {[
            { icon: '📋', label: 'Export Borrow Report',    sub: 'Download CSV of all transactions', color: T.blueBg  },
            { icon: '📡', label: 'Register New NFC Tag',    sub: 'Link a tag UID to a tool',          color: T.tealBg  },
            { icon: '🔔', label: 'Send Overdue Reminders',  sub: 'Notify students with overdue tools', color: T.redBg   },
          ].map((btn, i) => (
            <button key={i} style={{
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

          {/* Printer Mode toggle */}
          {/* ✅ BACKEND: POST /api/admin/printer/mode?mode=USB|BLUETOOTH */}
          <SectionLabel style={{ marginTop: 8 }}>Printer</SectionLabel>
          <Panel>
            <PanelHead title="Printer Mode" />
            <div style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
              {['USB', 'BLUETOOTH'].map(mode => (
                <button key={mode} style={{
                  flex: 1, padding: '8px', borderRadius: 6, border: `1px solid ${T.border}`,
                  background: T.surface2, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 12, fontWeight: 500, color: T.ink,
                }}>
                  {mode === 'USB' ? '🖨 USB' : '📶 Bluetooth'}
                </button>
              ))}
            </div>
          </Panel>

        </div>
      </div>
    </div>
  );
}
